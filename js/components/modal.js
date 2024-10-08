function showModal(content, onClose) {
    const modalHtml = `
        <div id="modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-3xl w-full">
                ${content}
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function closeModal() {
        modal.remove();
        if (onClose) onClose();
    }

    return closeModal;
}
