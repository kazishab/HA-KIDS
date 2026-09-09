// ============= PATTERN GAME =============

let patternGameState = {
    currentQuestion: 0,
    score: 0,
    questions: [],
    mode: 'easy'
};

function initPatternGame(mode) {
    patternGameState.mode = mode;
    patternGameState.currentQuestion = 0;
    patternGameState.score = 0;
    generatePatternQuestions();
    renderPatternQuestion();
}

function generatePatternQuestions() {
    patternGameState.questions = [
        {
            question: '2, 4, 6, 8, ?',
            options: ['10', '12', '9', '7'],
            answer: '10'
        },
        {
            question: '1, 1, 2, 3, 5, ?',
            options: ['8', '7', '6', '9'],
            answer: '8'
        },
        {
            question: '5, 10, 15, 20, ?',
            options: ['25', '24', '23', '22'],
            answer: '25'
        },
        {
            question: '3, 6, 12, 24, ?',
            options: ['48', '47', '46', '45'],
            answer: '48'
        },
        {
            question: '100, 90, 80, 70, ?',
            options: ['60', '50', '40', '30'],
            answer: '60'
        },
        {
            question: '2, 3, 5, 8, 13, ?',
            options: ['21', '20', '19', '18'],
            answer: '21'
        },
        {
            question: '1, 4, 9, 16, 25, ?',
            options: ['36', '35', '34', '33'],
            answer: '36'
        },
        {
            question: '2, 10, 18, 26, ?',
            options: ['34', '33', '32', '31'],
            answer: '34'
        }
    ];

    // Shuffle questions
    patternGameState.questions = patternGameState.questions.sort(() => Math.random() - 0.5);
}

function renderPatternQuestion() {
    const container = document.getElementById('patternGameContainer');
    
    if (patternGameState.currentQuestion >= patternGameState.questions.length) {
        endGame();
        return;
    }

    const question = patternGameState.questions[patternGameState.currentQuestion];

    container.innerHTML = `
        <div class="pattern-question">
            <h3>${question.question}</h3>
        </div>
        <div class="pattern-options">
            ${question.options.map(option => `
                <div class="pattern-option" onclick="selectPatternOption('${option}', '${question.answer}')">
                    ${option}
                </div>
            `).join('')}
        </div>
    `;
}

function selectPatternOption(selected, correct) {
    const options = document.querySelectorAll('.pattern-option');
    let isCorrect = selected === correct;

    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        if (opt.textContent.trim() === selected) {
            if (isCorrect) {
                opt.classList.add('correct');
                playSound('correct');
                updateScore(10);
            } else {
                opt.classList.add('incorrect');
                playSound('wrong');
            }
        }
        if (opt.textContent.trim() === correct && selected !== correct) {
            opt.classList.add('correct');
        }
    });

    setTimeout(() => {
        patternGameState.currentQuestion++;
        renderPatternQuestion();
    }, 1200);
}
