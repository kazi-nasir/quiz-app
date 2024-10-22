function loadHomeContent(content) {
    content.innerHTML = `
        <div class="flex flex-col items-center">
            <h1 class="text-4xl font-bold mb-6 animate-fade-in">Welcome to Quiz App</h1>
            <p class="mb-6 text-lg text-gray-700 animate-slide-in-right">Your personal platform for creating and taking quizzes!</p>
            
            <div class="flex gap-4 mb-6">
                <button id="startGuideBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 animate-pulse">
                    Start Guide
                </button>
                <button id="quickStartBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    Quick Start Quiz
                </button>
            </div>

            <div id="guideContent" class="hidden mt-8 w-full max-w-2xl">
                <h2 class="text-3xl font-semibold mb-4 animate-fade-in">How to Use This App</h2>
                <ol class="list-decimal list-inside space-y-3">
                    <li class="guide-item list-item-hover p-4 bg-white rounded-lg shadow-sm">
                        <strong>Create a Question Set:</strong>
                        <p class="text-sm text-gray-600">You can add questions, set tags, and provide notes for each set.</p>
                    </li>
                    <li class="guide-item list-item-hover p-4 bg-white rounded-lg shadow-sm">
                        <strong>Edit Existing Sets:</strong>
                        <p class="text-sm text-gray-600">You can change the title, tags, and questions.</p>
                    </li>
                    <li class="guide-item list-item-hover p-4 bg-white rounded-lg shadow-sm">
                        <strong>Take a Quiz:</strong>
                        <p class="text-sm text-gray-600">Answer the questions and see your results at the end!</p>
                    </li>
                    <li class="guide-item list-item-hover p-4 bg-white rounded-lg shadow-sm">
                        <strong>Track Your Progress:</strong>
                        <p class="text-sm text-gray-600">Consider using a notebook or a digital note-taking app to jot down your results.</p>
                    </li>
                    <li class="guide-item list-item-hover p-4 bg-white rounded-lg shadow-sm">
                        <strong>Import/Export Question Sets:</strong>
                        <p class="text-sm text-gray-600">This feature allows you to share your sets with others!</p>
                    </li>
                </ol>
            </div>
            
            <div id="quickStartContent" class="hidden mt-8 animate-fade-in">
                <h3 class="text-2xl font-semibold mb-4">Quick Start Demo Quiz</h3>
                <p class="text-gray-600 mb-4">Try out a sample quiz to get familiar with the interface!</p>
                <button id="startDemoQuizBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                    Start Demo Quiz
                </button>
            </div>
        </div>
        <br>
    `;

    const startGuideBtn = document.getElementById('startGuideBtn');
    const quickStartBtn = document.getElementById('quickStartBtn');
    const guideContent = document.getElementById('guideContent');
    const quickStartContent = document.getElementById('quickStartContent');
    const guideItems = document.querySelectorAll('.guide-item');

    // Guide button click handler with sequential animation
    startGuideBtn.addEventListener('click', () => {
        guideContent.classList.remove('hidden');
        quickStartContent.classList.add('hidden');
        startGuideBtn.classList.add('hidden');
        
        // Animate guide items sequentially
        guideItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 200); // 200ms delay between each item
        });
    });

    // Quick Start button click handler
    quickStartBtn.addEventListener('click', () => {
        quickStartContent.classList.remove('hidden');
        guideContent.classList.add('hidden');
        startGuideBtn.classList.remove('hidden');
    });

    // Demo quiz button handler
    const startDemoQuizBtn = document.getElementById('startDemoQuizBtn');
    if (startDemoQuizBtn) {
        startDemoQuizBtn.addEventListener('click', () => {
            if (questionSets.length > 0) {
                const firstQuestionSet = questionSets[0]; // Get the first question set
                startQuiz({
                    questionSets: [{ id: firstQuestionSet.id, count: firstQuestionSet.questions.length }],
                    useTimer: true,
                    timeLimit: 5
                });
            } else {
                alert('No question sets available for the demo quiz.');
            }
        });
    }

    // Add hover effect for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.05)';
            button.style.transition = 'transform 0.3s ease';
        });
        button.addEventListener('mouseout', () => {
            button.style.transform = 'scale(1)';
        });
    });

    // Add scroll-triggered animations for guide items
    function checkScroll() {
        guideItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const isVisible = rect.top <= window.innerHeight - 100;
            
            if (isVisible) {
                item.classList.add('visible');
            }
        });
    }

    // Listen for scroll events
    window.addEventListener('scroll', checkScroll);
    // Initial check
    checkScroll();
}
