function showModal(content, onClose) {
    const modalHtml = `
        <div id="modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-3xl w-full relative">
                ${content}
                <button id="closeModalBtn" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('closeModalBtn');

    function closeModal() {
        modal.remove();
        if (onClose) onClose();
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    closeBtn.addEventListener('click', closeModal);

    return closeModal;
}
