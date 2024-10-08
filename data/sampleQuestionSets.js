const questionSets = [
    { id: generateGUID(), 
        title: "General Knowledge", 
        questions: [
            {
                id: generateGUID(),
                name: "What is the capital of France?",
                options: [
                {
                    id: generateGUID(),
                    name: "Paris",
                    isCorrect: true
                },
                {
                    id: generateGUID(),
                    name: "London",
                    isCorrect: false
                }],
                note: "This is a sample question for general knowledge."
            },
            {
                id: generateGUID(),
                name: "What is the capital of Germany?",
                options: [
                {
                    id: generateGUID(),
                    name: "Berlin",
                    isCorrect: true
                },
                {
                    id: generateGUID(),
                    name: "Paris",
                    isCorrect: false
                }],
                note: "This is a sample question for general knowledge."
            }
        ], 
        note: "This is a sample question set for general knowledge.",
        tags: ["trivia", "mixed"]
    }
];
