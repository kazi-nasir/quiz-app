document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const homeTab = document.getElementById('home-tab');
    const questionSetsTab = document.getElementById('question-sets-tab');
    const quizTab = document.getElementById('quiz-tab');
    // Add this line
    const quizCounterTab = document.getElementById('quiz-counter-tab');

    homeTab.addEventListener('click', (e) => {
        e.preventDefault();
        loadHomeContent(content);
    });

    questionSetsTab.addEventListener('click', (e) => {
        e.preventDefault();
        loadQuestionSetsContent(content);
    });

    quizTab.addEventListener('click', (e) => {
        e.preventDefault();
        loadQuizConfig(content);
    });

    // Add this block
    quizCounterTab.addEventListener('click', (e) => {
        e.preventDefault();
        createQuizCounter(content);
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
    loadHomeContent(content);

    // Load question sets from localStorage
    loadQuestionSetsFromLocalStorage();
});