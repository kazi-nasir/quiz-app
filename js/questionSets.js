function addQuestionSet(set) {
    questionSets.push(set);
}

function updateQuestionSet(updatedSet) {
    const index = questionSets.findIndex(set => set.id === updatedSet.id);
    if (index !== -1) {
        questionSets[index] = updatedSet;
    }
}

function deleteQuestionSet(id) {
    const index = questionSets.findIndex(set => set.id === id);
    if (index !== -1) {
        questionSets.splice(index, 1);
    }
}
