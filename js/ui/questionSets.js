function loadQuestionSetsContent(contentElement) {
    contentElement.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Question Sets</h2>
            <div class="flex space-x-2">
                <button id="importBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    Import
                </button>
                <button id="addNewSetBtn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Set
                </button>
            </div>
        </div>
        <div class="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4">
            <div class="flex-grow mb-4 md:mb-0">
                <input type="text" id="searchInput" placeholder="Search question sets..." 
                       class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div class="flex-shrink-0">
                <select id="tagFilter" class="w-full md:w-auto px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">All Tags</option>
                    ${generateTagOptions()}
                </select>
            </div>
        </div>
        <div id="questionSetGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${generateQuestionSetCards()}
        </div>
    `;
    setupSearchAndFilter();
    setupAddNewSet();
    setupEditAndDeleteButtons();
    setupImportExport();
}

function generateTagOptions() {
    const allTags = [...new Set(questionSets.flatMap(set => set.tags))];
        return allTags.map(tag => `<option value="${tag}">${tag}</option>`).join('');
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
        const tagFilter = document.getElementById('tagFilter');
        const questionSetGrid = document.getElementById('questionSetGrid');

        function updateDisplay() {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedTag = tagFilter.value;

            const filteredSets = questionSets.filter(set => 
                (set.title.toLowerCase().includes(searchTerm) || set.tags.some(tag => tag.toLowerCase().includes(searchTerm))) &&
                (selectedTag === '' || set.tags.includes(selectedTag))
            );

            questionSetGrid.innerHTML = generateQuestionSetCards(filteredSets);
        }

        searchInput.addEventListener('input', updateDisplay);
        tagFilter.addEventListener('change', updateDisplay);
}

function setupAddNewSet() {
    const addNewSetBtn = document.getElementById('addNewSetBtn');
    addNewSetBtn.addEventListener('click', () => {
        const newSetForm = `
            <div id="newSetForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
                    <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Question Set</h3>
                    <form id="questionSetForm">
                        <div class="mb-4">
                            <label for="setTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Set Title</label>
                            <input type="text" id="setTitle" name="setTitle" required
                                   class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        </div>
                        <div class="mb-4">
                            <label for="setTags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
                            <input type="text" id="setTags" name="setTags"
                                   class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        </div>
                        <div class="flex justify-end space-x-4">
                            <button type="button" id="cancelNewSet" class="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white font-bold py-2 px-4 rounded transition duration-300">
                                Cancel
                            </button>
                            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                                Create Set
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', newSetForm);
        
        const form = document.getElementById('questionSetForm');
        const cancelBtn = document.getElementById('cancelNewSet');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('setTitle').value;
            const tags = document.getElementById('setTags').value.split(',').map(tag => tag.trim());
            
            const newSet = {
                id: generateGUID(),
                title: title,
                questions: [],
                tags: tags
            };
            
            questionSets.push(newSet);
            document.getElementById('newSetForm').remove();
            loadContent('question-sets');
            showToast('Question set created successfully');
        });
        
        cancelBtn.addEventListener('click', () => {
            document.getElementById('newSetForm').remove();
        });
    });
}

function generateQuestionSetCards(sets = questionSets) {
    return sets.map((set) => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 relative">
                <div class="absolute top-2 right-2 flex space-x-2">
                    <button class="text-blue-500 hover:text-blue-600 edit-set" data-id="${set.id}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="text-red-500 hover:text-red-600 delete-set" data-id="${set.id}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
                <h3 class="text-xl font-semibold mb-2">${set.title}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">${set.questions.length} questions</p>
                <div class="mb-4">
                    ${set.tags.map(tag => `
                        <span class="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2 mb-2">#${tag}</span>
                    `).join('')}
                </div>
                <div class="flex flex-col items-center space-y-2">
                    <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm w-full">
                        Take Quiz
                    </button>
                    <div class="flex justify-center space-x-2 w-full">
                        <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm flex-1 flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            View
                        </button>
                        <button class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-sm flex-1 flex items-center justify-center export-set" data-id="${set.id}">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Export
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
}

function setupEditAndDeleteButtons() {
    const editButtons = document.querySelectorAll('.edit-set');
    const deleteButtons = document.querySelectorAll('.delete-set');

    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('.edit-set').dataset.id;
            editQuestionSet(id);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('.delete-set').dataset.id;
            deleteQuestionSet(id);
        });
    });

    const exportButtons = document.querySelectorAll('.export-set');
    exportButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('.export-set').dataset.id;
            exportQuestionSet(id);
        });
    });
}