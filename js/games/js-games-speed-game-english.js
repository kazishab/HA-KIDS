// ============= SPEED GAME =============

let speedGameState = {
    currentQuestion: 0,
    score: 0,
    questions: [],
    answering: false,
    timeLimit: 5
};

function initSpeedGame(mode) {
    speedGameState.answering = false;
    speedGameState.currentQuestion = 0;
    speedGameState.score = 0;
    speedGameState.timeLimit = mode === 'easy' ? 7 : 5;
    generateSpeedQuestions();
    renderSpeedQuestion();
}

function generateSpeedQuestions() {
    const animalQuestions = [
        { emoji: '🍎', correct: 'Apple', options: ['Apple', 'Orange', 'Grape', 'Banana'] },
        { emoji: '🌻', correct: 'Flower', options: ['Flower', 'Leaf', 'Stem', 'Root'] },
        { emoji: '🚗', correct: 'Car', options: ['Car', 'Bus', 'Train', 'Plane'] },
        { emoji: '🏠', correct: 'House', options: ['House', 'School', 'Hospital', 'Office'] },
        { emoji: '📚', correct: 'Book', options: ['Book', 'Paper', 'Pen', 'Notebook'] },
        { emoji: '⚽', correct: 'Ball', options: ['Ball', 'Bat', 'Wall', 'Field'] },
        { emoji: '🌙', correct: 'Moon', options: ['Moon', 'Star', 'Sun', 'Cloud'] },
        { emoji: '🌊', correct: 'Water', options: ['Water', 'Salt', 'Sand', 'Fish'] },
        { emoji: '🎨', correct: 'Paint', options: ['Paint', 'Brush', 'Canvas', 'Draw'] },
        { emoji: '🎵', correct: 'Music', options: ['Music', 'Song', 'Instrument', 'Dance'] }
    ];

    speedGameState.questions = animalQuestions.sort(() => Math.random() - 0.5);
}

function renderSpeedQuestion() {
    const container = document.getElementById('speedGameContainer');
    
    if (speedGameState.currentQuestion >= speedGameState.questions.length) {
        endGame();
        return;
    }

    const question = speedGameState.questions[speedGameState.currentQuestion];
    const options = question.options.sort(() => Math.random() - 0.5);

    speedGameState.answering = true;
    let countdown = speedGameState.timeLimit;

    container.innerHTML = `
        <div class="speed-question">
            <div class="speed-image">${question.emoji}</div>
        </div>
        <div style="font-size: 24px; font-weight: bold; color: #6366f1; margin: 20px 0;">
            What is it? <span id="speedCountdown">${countdown}s</span>
        </div>
        <div class="speed-options">
            ${options.map(option => `
                <div class="speed-option" onclick="selectSpeedOption('${option}', '${question.correct}')">
                    ${option}
                </div>
            `).join('')}
        </div>
    `;

    // Countdown timer
    const countdownInterval = setInterval(() => {
        countdown--;
        const countdownEl = document.getElementById('speedCountdown');
        if (countdownEl) {
            countdownEl.textContent = `${countdown}s`;
        }

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            if (speedGameState.answering) {
                speedGameState.answering = false;
                playSound('wrong');
                setTimeout(() => {
                    speedGameState.currentQuestion++;
                    renderSpeedQuestion();
                }, 500);
            }
        }
    }, 1000);

    speedGameState.currentCountdownInterval = countdownInterval;
}

function selectSpeedOption(selected, correct) {
    if (!speedGameState.answering) return;

    speedGameState.answering = false;
    clearInterval(speedGameState.currentCountdownInterval);

    const options = document.querySelectorAll('.speed-option');
    let isCorrect = selected === correct;

    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        if (opt.textContent.trim() === selected) {
            if (isCorrect) {
                opt.style.background = '#10b981';
                opt.style.color = 'white';
                opt.style.borderColor = '#10b981';
                playSound('correct');
                updateScore(15);
            } else {
                opt.style.background = '#ef4444';
                opt.style.color = 'white';
                opt.style.borderColor = '#ef4444';
                playSound('wrong');
            }
        }
        if (opt.textContent.trim() === correct && selected !== correct) {
            opt.style.background = '#10b981';
            opt.style.color = 'white';
            opt.style.borderColor = '#10b981';
        }
    });

    setTimeout(() => {
        speedGameState.currentQuestion++;
        renderSpeedQuestion();
    }, 1000);
}
