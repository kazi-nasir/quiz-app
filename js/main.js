document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const tabs = ['home', 'question-sets'];

    // Tab switching
    tabs.forEach(tab => {
        const element = document.getElementById(`${tab}-tab`);
        element.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent(tab);
        });
    });

    setupDarkMode();
    // Remove this line: setupImportExport();

    // Make loadContent globally accessible
    window.loadContent = function(tab) {
        switch (tab) {
            case 'home':
                loadHomeContent(content);
                break;
            case 'question-sets':
                loadQuestionSetsContent(content);
                break;
        }
    }

    // Load home content by default
    loadContent('home');
});