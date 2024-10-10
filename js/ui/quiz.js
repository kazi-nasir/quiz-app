let currentQuiz = null;
let currentQuestionIndex = 0;
let timer = null;

function startQuiz(quizConfig) {
    const quizHtml = `
        <div id="quizContainer" class="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
            <header class="bg-green-500 text-white p-4 flex justify-between items-center">
                <h1 class="text-2xl font-bold">Quiz in Progress</h1>
                <div id="quizTimer" class="text-xl font-semibold"></div>
            </header>
            <main class="flex-grow p-8 overflow-y-auto">
                <div id="questionContainer" class="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <!-- Questions will be dynamically inserted here -->
                </div>
            </main>
            <footer class="bg-gray-100 dark:bg-gray-800 p-4 flex justify-between items-center">
                <button id="prevQuestion" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Previous</button>
                <span id="questionProgress" class="text-lg font-semibold">Question 1 of X</span>
                <button id="nextQuestion" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Next</button>
            </footer>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', quizHtml);

    const quizContainer = document.getElementById('quizContainer');
    const questionContainer = document.getElementById('questionContainer');
    const prevButton = document.getElementById('prevQuestion');
    const nextButton = document.getElementById('nextQuestion');
    const progressSpan = document.getElementById('questionProgress');
    const timerDisplay = document.getElementById('quizTimer');

    let currentQuestionIndex = 0;
    let quizQuestions = [];
    let userAnswers = [];
    let quizTimer;

    function loadQuizQuestions() {
        quizQuestions = prepareQuiz(quizConfig);
        if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
            showToast('Error: No questions available', 'error');
            return;
        }
        userAnswers = new Array(quizQuestions.length).fill(null);
        displayQuestion();
        updateQuestionProgress();
    }

    function displayQuestion() {
        if (currentQuestionIndex >= quizQuestions.length) {
            finishQuiz();
            return;
        }

        const question = quizQuestions[currentQuestionIndex];
        if (!question) {
            console.error('Question not found:', currentQuestionIndex, quizQuestions);
            showToast('Error: Question not found', 'error');
            return;
        }

        console.log('Current question:', question); // Debugging line

        questionContainer.innerHTML = `
            <h2 class="text-xl font-bold mb-4">${question.name || 'Question text missing'}</h2>
            <div class="space-y-3">
                ${(question.options || []).map((option, i) => `
                    <label class="flex items-center p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="${question.isMultiSelect ? 'checkbox' : 'radio'}" 
                               name="question${currentQuestionIndex}" 
                               value="${i}"
                               class="mr-3"
                               ${userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex].includes(i.toString()) ? 'checked' : ''}>
                        <span>${option.name || 'Option text missing'}</span>
                    </label>
                `).join('')}
            </div>
        `;

        // Debugging: Log the generated HTML
        console.log('Generated question HTML:', questionContainer.innerHTML);
    }

    function updateQuestionProgress() {
        progressSpan.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
        prevButton.disabled = currentQuestionIndex === 0;
        nextButton.textContent = currentQuestionIndex === quizQuestions.length - 1 ? 'Finish' : 'Next';
    }

    function saveCurrentAnswers() {
        const selectedOptions = Array.from(questionContainer.querySelectorAll('input:checked')).map(input => input.value);
        userAnswers[currentQuestionIndex] = selectedOptions;
    }

    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            saveCurrentAnswers();
            currentQuestionIndex--;
            displayQuestion();
            updateQuestionProgress();
        }
    });

    nextButton.addEventListener('click', () => {
        saveCurrentAnswers();
        if (currentQuestionIndex < quizQuestions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
            updateQuestionProgress();
        } else {
            finishQuiz();
        }
    });

    function startTimer() {
        if (quizConfig.useTimer) {
            const endTime = Date.now() + quizConfig.timeLimit * 60 * 1000;
            quizTimer = setInterval(() => {
                const timeLeft = endTime - Date.now();
                if (timeLeft <= 0) {
                    clearInterval(quizTimer);
                    showTimesUpPopup();
                } else {
                    const minutes = Math.floor(timeLeft / 60000);
                    const seconds = Math.floor((timeLeft % 60000) / 1000);
                    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    
                    if (minutes === 0) {
                        timerDisplay.classList.add('last-minute');
                    } else {
                        timerDisplay.classList.remove('last-minute');
                    }
                }
            }, 1000);
        } else {
            timerDisplay.textContent = 'No time limit';
        }
    }

    function showTimesUpPopup() {
        const popupHtml = `
            <div id="timesUpPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center animate-fade-in">
                    <h2 class="text-2xl font-bold mb-4">Time's Up!</h2>
                    <p class="mb-6">Your time for the quiz has expired.</p>
                    <button id="finishQuizBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Finish Quiz
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHtml);
        document.getElementById('finishQuizBtn').addEventListener('click', () => {
            document.getElementById('timesUpPopup').remove();
            finishQuiz();
        });
    }

    function finishQuiz() {
        clearInterval(quizTimer);
        saveCurrentAnswers();
        const results = calculateResults();
        displayResults(results);
        quizContainer.remove();
        showToast('Quiz completed!', 'success');
    }

    function calculateResults() {
        return quizQuestions.map((question, index) => {
            const userAnswer = userAnswers[index] || [];
            const correctAnswers = question.options
                .map((option, i) => option.isCorrect ? i.toString() : null)
                .filter(i => i !== null);
            
            const isCorrect = question.isMultiSelect
                ? userAnswer.length === correctAnswers.length &&
                  userAnswer.every(answer => correctAnswers.includes(answer))
                : userAnswer.length === 1 && correctAnswers.includes(userAnswer[0]);
            
            return { question, userAnswer, correctAnswers, isCorrect };
        });
    }

    function displayResults(results) {
        const correctCount = results.filter(result => result.isCorrect).length;
        const totalQuestions = results.length;
        const percentage = Math.round((correctCount / totalQuestions) * 100);

        const resultsHtml = `
            <div id="quizResults" class="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col p-8 overflow-auto">
                <h2 class="text-2xl font-bold mb-4">Quiz Results</h2>
                <p class="text-xl mb-4">You scored ${correctCount} out of ${totalQuestions} (${percentage}%)</p>
                <div class="space-y-4">
                    ${results.map((result, index) => `
                        <div class="border p-4 rounded-lg ${result.isCorrect ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}">
                            <p class="font-bold">${index + 1}. ${result.question.name}</p>
                            <p>Your answer: ${result.userAnswer.map(id => result.question.options[Number(id)].name).join(', ') || 'No answer'}</p>
                            <p>Correct answer: ${result.correctAnswers.map(id => result.question.options[id].name).join(', ')}</p>
                        </div>
                    `).join('')}
                </div>
                <button id="closeResults" class="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', resultsHtml);
        document.getElementById('closeResults').addEventListener('click', () => {
            document.getElementById('quizResults').remove();
        });
    }

    loadQuizQuestions();
    startTimer();
}

// Make sure to expose the startQuiz function to the global scope
window.startQuiz = startQuiz;

function prepareQuiz(quizConfig) {
    let allQuestions = [];
    quizConfig.questionSets.forEach(set => {
        const fullSet = questionSets.find(qs => qs.id === set.id);
        if (fullSet) {
            const questionCount = set.count || Math.ceil((set.percent / 100) * fullSet.questions.length);
            const shuffledQuestions = shuffleArray(fullSet.questions).slice(0, questionCount);
            allQuestions = allQuestions.concat(shuffledQuestions);
        }
    });
    console.log('Prepared questions:', allQuestions); // Debugging line
    return shuffleArray(allQuestions);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}