// ============= GLOBAL VARIABLES =============
let currentGame = null;
let currentGameMode = null;
let gameScore = 0;
let gameTimer = 0;
let gameTimerInterval = null;
let soundEnabled = true;
let musicEnabled = true;

// ============= INITIALIZATION =============
window.addEventListener('load', () => {
    setTimeout(() => {
        hideSplashScreen();
    }, 2000);

    // Load settings
    soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    
    document.getElementById('soundToggle').checked = soundEnabled;
    document.getElementById('musicToggle').checked = musicEnabled;

    // Settings event listeners
    document.getElementById('soundToggle').addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
        localStorage.setItem('soundEnabled', soundEnabled);
    });

    document.getElementById('musicToggle').addEventListener('change', (e) => {
        musicEnabled = e.target.checked;
        localStorage.setItem('musicEnabled', musicEnabled);
    });

    // Navigation buttons
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
    document.getElementById('settingsBtn').addEventListener('click', showSettings);

    // Room code input - only numbers
    document.getElementById('roomCodeInput').addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
});

// ============= SCREEN NAVIGATION =============
function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
}

function showScreen(screenId) {
    hideAllScreens();
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

function showMainApp() {
    document.getElementById('splashScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    showScreen('homeScreen');
}

function hideSplashScreen() {
    setTimeout(() => {
        showMainApp();
    }, 500);
}

function goHome() {
    stopGameTimer();
    currentGame = null;
    currentGameMode = null;
    gameScore = 0;
    showScreen('homeScreen');
}

// ============= GAME SELECTION =============
function selectGame(gameType) {
    currentGame = gameType;
    startGame('solo');
}

// ============= GAME STARTING =============
function startGame(mode) {
    gameScore = 0;
    gameTimer = 0;
    currentGameMode = mode;

    const gameScreenMap = {
        'memory': 'memoryGameScreen',
        'pattern': 'patternGameScreen',
        'speed': 'speedGameScreen',
        'sudoku': 'sudokuGameScreen'
    };

    const screenId = gameScreenMap[currentGame];
    if (!screenId) return;

    showScreen(screenId);
    startGameTimer();

    // Initialize game based on type
    if (currentGame === 'memory') {
        initMemoryGame(mode);
    } else if (currentGame === 'pattern') {
        initPatternGame(mode);
    } else if (currentGame === 'speed') {
        initSpeedGame(mode);
    } else if (currentGame === 'sudoku') {
        initSudokuGame(mode);
    }
}

function exitGame() {
    if (confirm('Exit game?')) {
        stopGameTimer();
        currentGame = null;
        currentGameMode = null;
        gameScore = 0;
        showScreen('homeScreen');
    }
}

// ============= TIMER =============
function startGameTimer() {
    gameTimer = 0;
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    
    gameTimerInterval = setInterval(() => {
        gameTimer++;
        updateTimerDisplay();
    }, 1000);
}

function stopGameTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
}

function updateTimerDisplay() {
    const timerElements = document.querySelectorAll('[id$="Timer"]');
    timerElements.forEach(el => {
        el.textContent = `Time: ${gameTimer}s`;
    });
}

function updateScore(points) {
    gameScore += points;
    const scoreElements = document.querySelectorAll('[id$="Score"]');
    scoreElements.forEach(el => {
        el.textContent = `Score: ${gameScore}`;
    });
}

// ============= GAME OVER =============
async function endGame() {
    stopGameTimer();
    
    // Save score to Firebase
    await saveGameScore(currentGame, gameScore, currentGameMode, gameTimer);

    // Show game over screen
    document.getElementById('finalScore').textContent = gameScore;
    showScreen('gameOverScreen');

    // Reset for next game
    gameScore = 0;
}

// ============= LEADERBOARD =============
async function showLeaderboard() {
    showScreen('leaderboardScreen');
    
    const leaderboardContent = document.getElementById('leaderboardContent');
    leaderboardContent.innerHTML = '<p>Loading...</p>';

    try {
        // Get top scores from all games
        const games = ['memory', 'pattern', 'speed', 'sudoku'];
        let allScores = [];

        for (const game of games) {
            const scores = await getGameLeaderboard(game, 5);
            scores.forEach(score => {
                allScores.push({
                    game: game,
                    ...score
                });
            });
        }

        // Sort by score
        allScores.sort((a, b) => b.score - a.score);
        allScores = allScores.slice(0, 20);

        if (allScores.length === 0) {
            leaderboardContent.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No scores yet</p>';
            return;
        }

        leaderboardContent.innerHTML = allScores.map((item, index) => {
            let rank = '🏅';
            if (index === 0) rank = '🥇';
            else if (index === 1) rank = '🥈';
            else if (index === 2) rank = '🥉';

            const gameNames = {
                'memory': 'Memory',
                'pattern': 'Pattern',
                'speed': 'Speed',
                'sudoku': 'Sudoku'
            };

            return `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">${rank}</div>
                    <div class="leaderboard-info">
                        <div>${gameNames[item.game]}</div>
                    </div>
                    <div class="leaderboard-score">${item.score}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Leaderboard error:', error);
        leaderboardContent.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Error loading leaderboard</p>';
    }
}

// ============= SETTINGS =============
function showSettings() {
    showScreen('settingsScreen');
}

function clearAllData() {
    if (confirm('Are you sure? This cannot be undone!')) {
        localStorage.clear();
        alert('All data cleared!');
        goHome();
    }
}

// ============= SOUND EFFECTS =============
function playSound(type) {
    if (!soundEnabled) return;

    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'correct') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'wrong') {
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'click') {
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }
}
