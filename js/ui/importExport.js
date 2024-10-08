function setupImportExport() {
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', showImportModal);
    }
}

function showImportModal() {
    const modalHtml = `
            <div id="importModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-3xl w-full">
                    <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Import Question Sets</h3>
                    <div id="dropZone" class="border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 mb-4 text-center cursor-pointer">
                        <p>Drag and drop your JSON files here</p>
                        <p>or</p>
                        <label for="fileInput" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block cursor-pointer">
                            Browse Files
                        </label>
                        <input type="file" id="fileInput" accept=".json" multiple class="hidden">
                    </div>
                    <div id="fileList" class="mb-4"></div>
                    <div class="mb-4">
                        <label for="jsonInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or paste JSON data here:</label>
                        <textarea id="jsonInput" rows="6" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                    </div>
                    <div class="flex justify-end space-x-4">
                        <button id="cancelImport" class="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white font-bold py-2 px-4 rounded transition duration-300">
                            Cancel
                        </button>
                        <button id="saveImport" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                            Import
                        </button>
                    </div>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const jsonInput = document.getElementById('jsonInput');
    const fileList = document.getElementById('fileList');
    const cancelBtn = document.getElementById('cancelImport');
    const saveBtn = document.getElementById('saveImport');

    let filesToImport = [];

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('bg-gray-100', 'dark:bg-gray-700');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('bg-gray-100', 'dark:bg-gray-700');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-gray-100', 'dark:bg-gray-700');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        filesToImport = Array.from(files);
        updateFileList();
    }

    function updateFileList() {
        fileList.innerHTML = filesToImport.map((file, index) => `
                <div class="flex justify-between items-center mb-2">
                    <span>${file.name}</span>
                    <button class="text-red-500 hover:text-red-600" onclick="removeFile(${index})">Remove</button>
                </div>
            `).join('');
    }

    window.removeFile = (index) => {
        filesToImport.splice(index, 1);
        updateFileList();
    };

    cancelBtn.addEventListener('click', () => {
        document.getElementById('importModal').remove();
    });

    saveBtn.addEventListener('click', () => {
        let importedSets = [];

        // Process files
        const filePromises = filesToImport.map(file => readFileAsJson(file));

        // Process JSON input
        if (jsonInput.value.trim()) {
            try {
                const jsonData = JSON.parse(jsonInput.value);
                importedSets = importedSets.concat(jsonData);
            } catch (error) {
                showToast('Invalid JSON data in text input', 'error');
                return;
            }
        }

        // Process all data
        Promise.all(filePromises)
            .then(results => {
                results.forEach(result => {
                    importedSets = importedSets.concat(result);
                });

                const validSets = importedSets.flatMap(set => {
                    if (Array.isArray(set)) {
                        return set.filter(validateImportedData);
                    } else {
                        return validateImportedData(set) ? [set] : [];
                    }
                });

                if (validSets.length > 0) {
                    // Update the existing questionSets array instead of reassigning
                    questionSets.push(...validSets);
                    document.getElementById('importModal').remove();
                    loadContent('question-sets');
                    showToast(`${validSets.length} question set(s) imported successfully`);
                } else {
                    showToast('No valid question sets found', 'error');
                }
            })
            .catch(error => {
                showToast('Error processing files', 'error');
                console.error(error);
            });
    });
}

function exportQuestionSet(id) {
    const set = questionSets.find(s => s.id === id);
    const jsonString = JSON.stringify(set, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${set.title.replace(/\s+/g, '_')}_question_set.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Question set exported successfully');
}

function readFileAsJson(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

function validateImportedData(data) {
    // If data is an array, validate each item
    if (Array.isArray(data)) {
        return data.every(item => validateSingleSet(item));
    }
    // If data is a single object, validate it
    return validateSingleSet(data);
}

function validateSingleSet(set) {
    if (!set.id || !set.title || !Array.isArray(set.questions) || !Array.isArray(set.tags)) {
        return false;
    }

    for (const question of set.questions) {
        if (!question.id || !question.name || !Array.isArray(question.options)) {
            return false;
        }

        if (question.options.length < 2) {
            return false;
        }

        let hasCorrectAnswer = false;
        for (const option of question.options) {
            if (!option.id || !option.name || typeof option.isCorrect !== 'boolean') {
                return false;
            }
            if (option.isCorrect) {
                hasCorrectAnswer = true;
            }
        }

        if (!hasCorrectAnswer) {
            return false;
        }
    }

    return true;
}
