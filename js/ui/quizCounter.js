let chart; // Move this declaration to the top level of the file

function createQuizCounter(container) {
    let questionNumber = 1;
    let correct = 0;
    let incorrect = 0;
    let history = [];

    const counterHTML = `
        <div class="max-w-6xl mx-auto">
            <h2 class="text-3xl font-bold mb-6 text-center">Manual Quiz Counter</h2>
            <div class="quiz-counter bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md flex flex-col md:flex-row">
                <div class="w-full md:w-1/2 pr-0 md:pr-4 mb-6 md:mb-0">
                    <!-- Counter section -->
                    <div class="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
                        <h3 class="text-2xl font-bold mb-4">Question No: <span id="questionNumber" class="text-blue-500">${questionNumber}</span></h3>
                        <div class="flex flex-col space-y-4 mb-6">
                            <button id="correctBtn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                                Mark Correct
                            </button>
                            <button id="incorrectBtn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                                Mark Incorrect
                            </button>
                        </div>
                        <div class="mb-6 text-lg text-center">
                            <p>Correct Answers: <span id="correctCount" class="font-bold text-green-500">${correct}</span></p>
                            <p>Incorrect Answers: <span id="incorrectCount" class="font-bold text-red-500">${incorrect}</span></p>
                        </div>
                        <div class="text-center">
                            <button id="undoBtn" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg mb-6 transition duration-300">
                                Undo Last Answer
                            </button>
                        </div>
                    </div>
                    <!-- Statistics section -->
                    <div class="text-center">
                        <h4 class="font-bold text-xl mb-2">Quiz Statistics:</h4>
                        <p>Total Questions Answered: <span id="totalQuestions" class="font-bold">0</span></p>
                        <p>Correct Answer Percentage: <span id="correctPercentage" class="font-bold text-blue-500">0%</span></p>
                        <div class="mt-4">
                            <canvas id="performanceChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-1/2 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-gray-300 dark:border-gray-600 pt-6 md:pt-0 mt-6 md:mt-0">
                    <h4 class="font-bold text-xl mb-2">Answer History:</h4>
                    <div class="history-filter mb-4">
                        <button id="filterAll" class="filter-btn active">All</button>
                        <button id="filterCorrect" class="filter-btn">Correct</button>
                        <button id="filterIncorrect" class="filter-btn">Incorrect</button>
                    </div>
                    <div class="mb-4">
                        <input type="text" id="historySearch" placeholder="Search history..." class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    </div>
                    <ul id="historyList" class="list-none overflow-y-auto max-h-96 w-full"></ul>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = counterHTML;

    const questionNumberEl = document.getElementById('questionNumber');
    const correctCountEl = document.getElementById('correctCount');
    const incorrectCountEl = document.getElementById('incorrectCount');
    const historyListEl = document.getElementById('historyList');
    const totalQuestionsEl = document.getElementById('totalQuestions');
    const correctPercentageEl = document.getElementById('correctPercentage');
    const historySearchEl = document.getElementById('historySearch');
    const filterAllBtn = document.getElementById('filterAll');
    const filterCorrectBtn = document.getElementById('filterCorrect');
    const filterIncorrectBtn = document.getElementById('filterIncorrect');

    let currentFilter = 'all';

    function initChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Correct Percentage',
                    data: [],
                    borderColor: function(context) {
                        const index = context.dataIndex;
                        const value = context.dataset.data[index];
                        const previousValue = context.dataset.data[index - 1];
                        
                        if (index === 0 || value === previousValue) return 'rgb(75, 192, 192)';
                        return value > previousValue ? 'rgb(75, 192, 75)' : 'rgb(192, 75, 75)';
                    },
                    segment: {
                        borderColor: function(context) {
                            return context.p0.parsed.y <= context.p1.parsed.y ? 
                                'rgb(75, 192, 75)' : 'rgb(192, 75, 75)';
                        },
                    },
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Replace the existing click event listener with this:
        document.getElementById('performanceChart').addEventListener('click', () => openChartModal(chart));
    }

    function updateChart() {
        const totalQuestions = correct + incorrect;
        const correctPercentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

        chart.data.labels.push(totalQuestions);
        chart.data.datasets[0].data.push(correctPercentage);
        chart.update();
    }

    function updateDisplay() {
        questionNumberEl.textContent = questionNumber;
        correctCountEl.textContent = correct;
        incorrectCountEl.textContent = incorrect;
        totalQuestionsEl.textContent = correct + incorrect;
        correctPercentageEl.textContent = ((correct / (correct + incorrect)) * 100).toFixed(2) + '%';

        const searchTerm = historySearchEl.value.toLowerCase();
        const filteredHistory = history.filter(item => {
            const matchesSearch = item.questionNumber.toString().includes(searchTerm) ||
                (item.isCorrect ? 'correct' : 'incorrect').includes(searchTerm);
            const matchesFilter = currentFilter === 'all' ||
                (currentFilter === 'correct' && item.isCorrect) ||
                (currentFilter === 'incorrect' && !item.isCorrect);
            return matchesSearch && matchesFilter;
        });

        historyListEl.innerHTML = filteredHistory.map(item => `
            <li class="${item.isCorrect ? 'text-green-500' : 'text-red-500'} mb-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                Question ${item.questionNumber}: ${item.isCorrect ? 'Correct' : 'Incorrect'}
            </li>
        `).join('');

        // Scroll to the bottom of the history list
        historyListEl.scrollTop = historyListEl.scrollHeight;

        updateChart();
    }

    function addToHistory(isCorrect) {
        history.push({ questionNumber, isCorrect });
        questionNumber++;
        isCorrect ? correct++ : incorrect++;
        updateDisplay();
    }

    document.getElementById('correctBtn').addEventListener('click', () => addToHistory(true));
    document.getElementById('incorrectBtn').addEventListener('click', () => addToHistory(false));

    document.getElementById('undoBtn').addEventListener('click', () => {
        if (history.length > 0) {
            const lastAction = history.pop();
            questionNumber--;
            lastAction.isCorrect ? correct-- : incorrect--;
            updateDisplay();
        }
    });

    historySearchEl.addEventListener('input', updateDisplay);

    filterAllBtn.addEventListener('click', () => {
        currentFilter = 'all';
        updateFilterButtons();
        updateDisplay();
    });

    filterCorrectBtn.addEventListener('click', () => {
        currentFilter = 'correct';
        updateFilterButtons();
        updateDisplay();
    });

    filterIncorrectBtn.addEventListener('click', () => {
        currentFilter = 'incorrect';
        updateFilterButtons();
        updateDisplay();
    });

    function updateFilterButtons() {
        [filterAllBtn, filterCorrectBtn, filterIncorrectBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`filter${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`).classList.add('active');
    }

    initChart();

    updateDisplay();
}

function openChartModal(chartInstance) {
    console.log('Opening chart modal');
    
    const modalContent = `
        <h3 class="text-2xl font-bold mb-4">Performance Chart</h3>
        <div style="height: 400px;">
            <canvas id="modalChart"></canvas>
        </div>
    `;

    showModal(modalContent, () => {
        console.log('Modal closed');
    });

    setTimeout(() => {
        const modalCanvas = document.getElementById('modalChart');
        if (!modalCanvas) {
            console.error('Modal canvas not found');
            return;
        }

        const modalCtx = modalCanvas.getContext('2d');
        new Chart(modalCtx, {
            type: 'line',
            data: {
                labels: chartInstance.data.labels,
                datasets: [{
                    label: chartInstance.data.datasets[0].label,
                    data: [...chartInstance.data.datasets[0].data],
                    borderColor: function(context) {
                        const index = context.dataIndex;
                        const value = context.dataset.data[index];
                        const previousValue = context.dataset.data[index - 1];
                        
                        if (index === 0 || value === previousValue) return 'rgb(75, 192, 192)';
                        return value > previousValue ? 'rgb(75, 192, 75)' : 'rgb(192, 75, 75)';
                    },
                    segment: {
                        borderColor: function(context) {
                            return context.p0.parsed.y <= context.p1.parsed.y ? 
                                'rgb(75, 192, 75)' : 'rgb(192, 75, 75)';
                        },
                    },
                    tension: chartInstance.data.datasets[0].tension
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        console.log('Modal chart created');
    }, 100);
}
