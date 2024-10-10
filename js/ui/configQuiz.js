function loadQuizConfig(content) {
    const questionSetOptions = generateQuestionSetOptions();

    content.innerHTML = generateQuizConfigHTML(questionSetOptions);

    const elements = {
        form: document.getElementById('quizConfigForm'),
        questionSetsSelect: document.getElementById('questionSets'),
        questionSetConfigs: document.getElementById('questionSetConfigs'),
        useTimerCheckbox: document.getElementById('useTimer'),
        timeLimitContainer: document.getElementById('timeLimitContainer'),
        timeLimitInput: document.getElementById('timeLimit'),
        timeLimitNumber: document.getElementById('timeLimitNumber')
    };

    setupEventListeners(elements);
}

function generateQuestionSetOptions() {
    return questionSets.map(set => 
        `<option value="${set.id}" data-question-count="${set.questions.length}">${set.title} (${set.questions.length} questions)</option>`
    ).join('');
}

function generateQuizConfigHTML(questionSetOptions) {
    return `
        <h2 class="text-2xl font-bold mb-4">Configure Quiz</h2>
        <form id="quizConfigForm" class="space-y-4">
            <div>
                <label for="questionSets" class="block mb-2">Question Sets:</label>
                <select id="questionSets" name="questionSets" multiple class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                    ${questionSetOptions}
                </select>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple sets</p>
            </div>
            <div id="questionSetConfigs"></div>
            <div class="mt-6">
                <label for="useTimer" class="inline-flex items-center cursor-pointer">
                    <div class="relative">
                        <input type="checkbox" id="useTimer" name="useTimer" class="sr-only" checked>
                        <div class="block bg-gray-600 w-14 h-8 rounded-full"></div>
                        <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                    </div>
                    <span class="ml-3 text-lg font-medium">Enable Timer</span>
                </label>
            </div>
            <div id="timeLimitContainer" class="mt-4">
                <label for="timeLimit" class="block mb-2 text-lg font-medium">Time Limit:</label>
                <div class="flex items-center space-x-4">
                    <input type="range" id="timeLimit" name="timeLimit" min="1" max="180" value="5" class="w-2/3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" required>
                    <input type="number" id="timeLimitNumber" min="1" max="180" value="5" class="w-20 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                    <span class="text-xl font-bold">min</span>
                </div>
            </div>
            <div class="mt-6 flex justify-center">
                <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 animate-gentle-pulse">
                    Start Quiz
                </button>
            </div>
        </form>
    `;
}

function setupEventListeners(elements) {
    const { questionSetsSelect, questionSetConfigs, useTimerCheckbox, timeLimitContainer, timeLimitInput, timeLimitNumber, form } = elements;

    questionSetsSelect.addEventListener('change', () => updateQuestionSetConfigs(questionSetsSelect, questionSetConfigs));
    useTimerCheckbox.addEventListener('change', () => toggleTimerVisibility(useTimerCheckbox, timeLimitContainer, timeLimitInput, timeLimitNumber));
    timeLimitInput.addEventListener('input', () => syncTimeInputs(timeLimitInput, timeLimitNumber));
    timeLimitNumber.addEventListener('input', () => syncTimeInputs(timeLimitNumber, timeLimitInput));
    form.addEventListener('submit', handleQuizConfigSubmit);
}

function toggleTimerVisibility(checkbox, container, ...inputs) {
    container.style.display = checkbox.checked ? 'block' : 'none';
    inputs.forEach(input => input.required = checkbox.checked);
}

function syncTimeInputs(source, target) {
    target.value = source.value;
}

function updateQuestionSetConfigs(select, configsContainer) {
    const selectedOptions = Array.from(select.selectedOptions);
    
    configsContainer.innerHTML = selectedOptions.map(generateQuestionSetConfigHTML).join('');

    selectedOptions.forEach(option => setupQuestionSetInputListeners(option, configsContainer));
}

function generateQuestionSetConfigHTML(option) {
    return `
        <div class="mt-4 p-4 border rounded dark:border-gray-600">
            <h3 class="font-bold mb-2">${option.text}</h3>
            <div class="flex items-center space-x-2">
                <input type="number" name="questionCount_${option.value}" min="1" max="${option.dataset.questionCount}" class="w-1/4 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Number">
                <span>or</span>
                <input type="number" name="questionPercent_${option.value}" min="1" max="100" class="w-1/4 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" placeholder="%">
                <span>of questions</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Max: ${option.dataset.questionCount} questions</p>
        </div>
    `;
}

function setupQuestionSetInputListeners(option, configsContainer) {
    const countInput = configsContainer.querySelector(`input[name="questionCount_${option.value}"]`);
    const percentInput = configsContainer.querySelector(`input[name="questionPercent_${option.value}"]`);
    const maxQuestions = parseInt(option.dataset.questionCount);

    countInput.addEventListener('input', () => handleQuestionInputChange(countInput, percentInput, maxQuestions));
    percentInput.addEventListener('input', () => handleQuestionInputChange(percentInput, countInput, maxQuestions, true));
}

function handleQuestionInputChange(activeInput, inactiveInput, maxQuestions, isPercent = false) {
    if (activeInput.value) {
        inactiveInput.value = '';
        inactiveInput.disabled = true;
        validateQuestionInput(activeInput, maxQuestions, isPercent);
    } else {
        inactiveInput.disabled = false;
    }
}

function validateQuestionInput(input, maxQuestions, isPercent) {
    const value = parseInt(input.value);
    const calculatedCount = isPercent ? Math.ceil((value / 100) * maxQuestions) : value;
    
    if (calculatedCount > maxQuestions) {
        showToast(`Maximum ${maxQuestions} questions${isPercent ? ' (100%)' : ''} allowed for this set.`, 'warning');
        input.value = isPercent ? 100 : maxQuestions;
    }
}

function handleQuizConfigSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const quizConfig = buildQuizConfig(formData);

    if (!validateQuizConfig(quizConfig)) return;

    console.log('Quiz configuration:', quizConfig);
    showToast('Starting quiz...', 'success');
    startQuiz(quizConfig);  // Change this line
}

function buildQuizConfig(formData) {
    const selectedSets = formData.getAll('questionSets');
    const useTimer = formData.get('useTimer') === 'on';
    const timeLimit = useTimer ? parseInt(formData.get('timeLimit')) : null;

    if (selectedSets.length === 0) {
        showToast('Please select at least one question set.', 'error');
        return;
    }

    if (useTimer && (timeLimit < 1 || timeLimit > 180)) {
        showToast('Time limit must be between 1 and 180 minutes.', 'error');
        return;
    }

    const quizConfig = {
        questionSets: selectedSets.map(setId => {
            const count = formData.get(`questionCount_${setId}`);
            const percent = formData.get(`questionPercent_${setId}`);
            const optionElement = document.querySelector(`option[value="${setId}"]`);
            const maxQuestions = optionElement ? parseInt(optionElement.dataset.questionCount) : 0;
            return {
                id: setId,
                count: count ? parseInt(count) : null,
                percent: percent ? parseInt(percent) : null,
                maxQuestions: maxQuestions
            };
        }),
        useTimer: useTimer,
        timeLimit: timeLimit
    };

    return quizConfig;
}

function validateQuizConfig(quizConfig) {
    const validationResults = quizConfig.questionSets.map(set => {
        const hasCount = set.count !== null;
        const hasPercent = set.percent !== null;
        const isValid = (hasCount && !hasPercent) || (!hasCount && hasPercent);
        const questionCount = hasCount ? set.count : (hasPercent ? Math.ceil((set.percent / 100) * set.maxQuestions) : 0);
        const exceedsMax = questionCount > set.maxQuestions;
        return {
            isValid,
            questionCount,
            exceedsMax,
            setId: set.id
        };
    });

    const invalidSets = validationResults.filter(result => !result.isValid || result.questionCount === 0 || result.exceedsMax);

    if (invalidSets.length > 0) {
        const errorMessages = invalidSets.map(set => {
            const setTitle = document.querySelector(`option[value="${set.setId}"]`).textContent;
            if (!set.isValid) {
                return `"${setTitle}": Provide either count or percentage, not both`;
            } else if (set.questionCount === 0) {
                return `"${setTitle}": No questions selected`;
            } else if (set.exceedsMax) {
                return `"${setTitle}": Selected questions (${set.questionCount}) exceed the maximum (${quizConfig.questionSets.find(s => s.id === set.setId).maxQuestions})`;
            }
        });
        showToast(`Please correct the following:\n${errorMessages.join('\n')}`, 'error');
        return false;
    }

    return true;
}

// Export the loadQuizConfig function
window.loadQuizConfig = loadQuizConfig;