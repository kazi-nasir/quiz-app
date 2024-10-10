function viewQuestionSet(setId) {
    const set = questionSets.find(s => s.id === setId);
    if (!set) {
        showToast('Question set not found', 'error');
        return;
    }

    const modalContent = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">${set.title}</h2>
            <label class="flex items-center cursor-pointer">
                <span class="mr-2 text-sm text-gray-700 dark:text-gray-300">Show All Answers</span>
                <div class="relative">
                    <input type="checkbox" id="toggleAllAnswers" class="sr-only">
                    <div class="block bg-gray-600 w-14 h-8 rounded-full"></div>
                    <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                </div>
            </label>
        </div>
        <div class="max-h-[60vh] overflow-y-auto">
            ${set.questions.map((q, index) => `
                <div class="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div class="flex justify-between items-center">
                        <h3 class="font-bold mb-2">${index + 1}. ${q.name}</h3>
                        <button class="edit-question-btn text-blue-500 hover:text-blue-600" data-question-id="${q.id}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="mt-2">
                        <label class="flex items-center cursor-pointer">
                            <div class="relative">
                                <input type="checkbox" class="sr-only toggle-answer">
                                <div class="block bg-gray-600 w-10 h-6 rounded-full"></div>
                                <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                            </div>
                            <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Show Answer</span>
                        </label>
                    </div>
                    <ul class="list-disc pl-5 answer-list hidden mt-2">
                        ${q.options.map(opt => `
                            <li class="${opt.isCorrect ? 'text-green-600 dark:text-green-400 font-semibold' : ''}">${opt.name}</li>
                        `).join('')}
                    </ul>
                    ${q.note ? `<p class="mt-2 text-sm text-gray-600 dark:text-gray-400 note hidden">Note: ${q.note}</p>` : ''}
                </div>
            `).join('')}
        </div>
        <div class="mt-4 flex justify-end">
            <button id="closeViewModal" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Close
            </button>
        </div>
    `;

    const closeModal = showModal(modalContent);

    document.getElementById('closeViewModal').addEventListener('click', closeModal);

    const toggleAllAnswers = document.getElementById('toggleAllAnswers');
    const answerLists = document.querySelectorAll('.answer-list');
    const notes = document.querySelectorAll('.note');
    const toggleAnswers = document.querySelectorAll('.toggle-answer');

    toggleAllAnswers.addEventListener('change', function() {
        const showAll = this.checked;
        answerLists.forEach(list => list.classList.toggle('hidden', !showAll));
        notes.forEach(note => note.classList.toggle('hidden', !showAll));
        toggleAnswers.forEach(toggle => toggle.checked = showAll);
    });

    toggleAnswers.forEach((toggle, index) => {
        toggle.addEventListener('change', function() {
            answerLists[index].classList.toggle('hidden', !this.checked);
            if (notes[index]) notes[index].classList.toggle('hidden', !this.checked);
        });
    });

    // Add event listeners for edit buttons
    const editButtons = document.querySelectorAll('.edit-question-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const questionId = this.dataset.questionId;
            closeModal();
            editQuestionSet(setId, questionId);
        });
    });
}

// Make the function globally accessible
window.viewQuestionSet = viewQuestionSet;
