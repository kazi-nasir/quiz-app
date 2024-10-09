function editQuestionSet(id) {
    const set = questionSets.find(s => s.id === id);
    const editForm = `
        <div id="editSetForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-3xl w-full">
                    <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Edit Question Set</h3>
                    <form id="editQuestionSetForm">
                        <div class="mb-4">
                            <label for="editSetTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Set Title</label>
                            <input type="text" id="editSetTitle" name="editSetTitle" value="${set.title}" required
                                   class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        </div>
                        <div class="mb-4">
                            <label for="editSetTags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
                            <input type="text" id="editSetTags" name="editSetTags" value="${set.tags.join(', ')}"
                                   class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        </div>
                        <div class="mb-4">
                            <label for="editSetNote" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Set Note</label>
                            <textarea id="editSetNote" name="editSetNote" rows="3"
                                      class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">${set.note || ''}</textarea>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold mb-2">Questions</h4>
                            <div id="questionsList">
                                ${generateQuestionsList(set.questions)}
                            </div>
                        </div>
                        <div class="mt-4">
                            <button type="button" id="addQuestionBtn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                Add Question
                            </button>
                        </div>
                        <div class="flex justify-end space-x-4 mt-4">
                            <button type="button" id="cancelEditSet" class="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white font-bold py-2 px-4 rounded transition duration-300">
                                Cancel
                            </button>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', editForm);
    
    const form = document.getElementById('editQuestionSetForm');
    const cancelBtn = document.getElementById('cancelEditSet');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('editSetTitle').value;
        const tags = document.getElementById('editSetTags').value.split(',').map(tag => tag.trim());
        const note = document.getElementById('editSetNote').value;
        const questions = getQuestionsFromForm();
        
        // Validation
        if (!title.trim()) {
            showToast('Please enter a title for the question set', 'error');
            return;
        }
        
        if (questions.length === 0) {
            showToast('Please add at least one question', 'error');
            return;
        }
        
        for (const question of questions) {
            if (!question.name.trim()) {
                showToast('Please enter a name for all questions', 'error');
                return;
            }
            if (question.options.length < 2) {
                showToast('Each question must have at least two options', 'error');
                return;
            }
            if (!question.options.some(option => option.isCorrect)) {
                showToast('Each question must have at least one correct answer', 'error');
                return;
            }
            for (const option of question.options) {
                if (!option.name.trim()) {
                    showToast('Please enter a name for all options', 'error');
                    return;
                }
            }
        }
        
        set.title = title;
        set.tags = tags;
        set.note = note;
        set.questions = questions;
        
        updateQuestionSet(set);
        document.getElementById('editSetForm').remove();
        window.loadContent('question-sets'); // Use the global loadContent function
        showToast('Question set updated successfully');
    });
    
    cancelBtn.addEventListener('click', () => {
        document.getElementById('editSetForm').remove();
    });

    addQuestionBtn.addEventListener('click', () => {
        addNewQuestion();
    });

    setupQuestionListeners();
}

function generateQuestionsList(questions) {
    return questions.map((question) => `
        <div class="question-item mb-4 p-4 border rounded-md" data-id="${question.id}">
            <div class="flex justify-between items-center mb-2">
                <input type="text" name="question-${question.id}" value="${question.name}" placeholder="Question" 
                       class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <button type="button" class="delete-question ml-2 text-red-500 hover:text-red-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
            <div class="mb-2">
                <textarea name="question-note-${question.id}" placeholder="Question note" rows="2"
                          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">${question.note || ''}</textarea>
            </div>
            <div class="options-list">
                ${generateOptionsList(question.options)}
            </div>
            <button type="button" class="add-option mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm">
                Add Option
            </button>
        </div>
    `).join('');
}

function generateOptionsList(options) {
    return options.map((option) => `
            <div class="option-item flex items-center mb-2" data-id="${option.id}">
                <input type="text" name="option-${option.id}" value="${option.name}" placeholder="Option" 
                       class="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <label class="ml-2">
                    <input type="checkbox" name="correct-${option.id}" ${option.isCorrect ? 'checked' : ''}>
                    Correct
                </label>
                <button type="button" class="delete-option ml-2 text-red-500 hover:text-red-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        `).join('');
}

function setupQuestionListeners() {
    const questionsList = document.getElementById('questionsList');
        
        questionsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-question') || e.target.closest('.delete-question')) {
                e.target.closest('.question-item').remove();
                showToast('Question deleted', 'success');
            } else if (e.target.classList.contains('add-option') || e.target.closest('.add-option')) {
                const questionItem = e.target.closest('.question-item');
                addNewOption(questionItem);
            } else if (e.target.classList.contains('delete-option') || e.target.closest('.delete-option')) {
                const optionItem = e.target.closest('.option-item');
                const questionItem = optionItem.closest('.question-item');
                const optionsCount = questionItem.querySelectorAll('.option-item').length;
                
                if (optionsCount > 2) {
                    optionItem.remove();
                    showToast('Option deleted', 'success');
                } else {
                    showToast('A question must have at least two options', 'error');
                }
            }
        });
}

function addNewOption(questionItem) {
    const optionsList = questionItem.querySelector('.options-list');
        const newOptionId = generateGUID();
        
        const newOptionHtml = `
            <div class="option-item flex items-center mb-2" data-id="${newOptionId}">
                <input type="text" name="option-${newOptionId}" placeholder="Option" 
                       class="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <label class="ml-2">
                    <input type="checkbox" name="correct-${newOptionId}">
                    Correct
                </label>
                <button type="button" class="delete-option ml-2 text-red-500 hover:text-red-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        `;
        optionsList.insertAdjacentHTML('beforeend', newOptionHtml);
        showToast('New option added', 'success');
}

function addNewQuestion() {
    const questionsList = document.getElementById('questionsList');
    const newQuestionId = generateGUID();
    const newQuestionHtml = `
        <div class="question-item mb-4 p-4 border rounded-md" data-id="${newQuestionId}">
            <div class="flex justify-between items-center mb-2">
                <input type="text" name="question-${newQuestionId}" placeholder="Question" 
                       class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <button type="button" class="delete-question ml-2 text-red-500 hover:text-red-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
            <div class="mb-2">
                <textarea name="question-note-${newQuestionId}" placeholder="Question note" rows="2"
                          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
            <div class="options-list"></div>
            <button type="button" class="add-option mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm">
                Add Option
            </button>
        </div>
    `;
    questionsList.insertAdjacentHTML('beforeend', newQuestionHtml);
    
    // Add two options by default
    const newQuestionItem = questionsList.lastElementChild;
    addNewOption(newQuestionItem);
    addNewOption(newQuestionItem);

    showToast('New question added', 'success');
}

function getQuestionsFromForm() {
    const questions = [];
        const questionItems = document.querySelectorAll('.question-item');
        
        questionItems.forEach((item) => {
            const questionId = item.dataset.id;
            const questionName = item.querySelector(`input[name="question-${questionId}"]`).value;
            const questionNote = item.querySelector(`textarea[name="question-note-${questionId}"]`).value;
            const options = [];
            const optionItems = item.querySelectorAll('.option-item');
            
            optionItems.forEach((optionItem) => {
                const optionId = optionItem.dataset.id;
                const optionName = optionItem.querySelector(`input[name="option-${optionId}"]`).value;
                const isCorrect = optionItem.querySelector(`input[name="correct-${optionId}"]`).checked;
                options.push({ id: optionId, name: optionName, isCorrect: isCorrect });
            });
            
            questions.push({ id: questionId, name: questionName, note: questionNote, options: options });
        });
        
        return questions;
}