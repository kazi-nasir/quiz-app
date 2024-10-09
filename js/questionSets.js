function addQuestionSet(...sets) {
    questionSets.push(...sets);
}

function updateQuestionSet(updatedSet) {
    const index = questionSets.findIndex(set => set.id === updatedSet.id);
    if (index !== -1) {
        questionSets[index] = {
            ...questionSets[index],
            ...updatedSet,
            note: updatedSet.note || questionSets[index].note,
            questions: updatedSet.questions.map(q => ({
                ...q,
                note: q.note || ''
            }))
        };

        // Update in localStorage if it exists
        const storedSets = JSON.parse(localStorage.getItem('questionSets')) || [];
        const storedIndex = storedSets.findIndex(set => set.id === updatedSet.id);
        if (storedIndex !== -1) {
            storedSets[storedIndex] = questionSets[index];
            localStorage.setItem('questionSets', JSON.stringify(storedSets));
        }
    }
}

function deleteQuestionSet(id) {
    const index = questionSets.findIndex(set => set.id === id);
    if (index !== -1) {
        questionSets.splice(index, 1);
        
        // Remove from localStorage if it exists
        const storedSets = JSON.parse(localStorage.getItem('questionSets')) || [];
        const storedIndex = storedSets.findIndex(set => set.id === id);
        if (storedIndex !== -1) {
            storedSets.splice(storedIndex, 1);
            localStorage.setItem('questionSets', JSON.stringify(storedSets));
        }
    }
}

function saveQuestionSetToLocalStorage(set) {
    const storedSets = JSON.parse(localStorage.getItem('questionSets')) || [];
    const index = storedSets.findIndex(s => s.id === set.id);
    if (index !== -1) {
        storedSets[index] = set;
    } else {
        storedSets.push(set);
    }
    localStorage.setItem('questionSets', JSON.stringify(storedSets));
}

function loadQuestionSetsFromLocalStorage() {
    const storedSets = localStorage.getItem('questionSets');
    if (storedSets) {
        questionSets.push(...JSON.parse(storedSets));
    }
}

// Export these functions
window.saveQuestionSetToLocalStorage = saveQuestionSetToLocalStorage;
window.loadQuestionSetsFromLocalStorage = loadQuestionSetsFromLocalStorage;
