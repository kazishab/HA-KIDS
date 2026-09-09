// ============= MEMORY GAME =============

let memoryGameState = {
    cards: [],
    flipped: [],
    matched: 0,
    difficulty: 'easy',
    gridSize: 4
};

function initMemoryGame(mode) {
    memoryGameState.mode = mode;
    
    // Set difficulty based on game mode
    if (mode === 'computer') {
        memoryGameState.difficulty = 'medium';
        memoryGameState.gridSize = 4;
    } else {
        memoryGameState.difficulty = 'easy';
        memoryGameState.gridSize = 4;
    }

    setupMemoryCards();
    renderMemoryGame();
}

function setupMemoryCards() {
    const emojis = ['🍎', '🍌', '🍒', '🍊', '🍉', '🍓', '🥝', '🍇'];
    const pairs = emojis.slice(0, (memoryGameState.gridSize * memoryGameState.gridSize) / 2);
    
    memoryGameState.cards = [...pairs, ...pairs]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
            id: index,
            emoji: emoji,
            flipped: false,
            matched: false
        }));

    memoryGameState.flipped = [];
    memoryGameState.matched = 0;
}

function renderMemoryGame() {
    const container = document.getElementById('memoryGameContainer');
    const gridSize = memoryGameState.gridSize;
    
    container.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = `memory-grid grid-${gridSize}`;
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    grid.style.maxWidth = `${gridSize * 80 + (gridSize - 1) * 10}px`;

    memoryGameState.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'memory-card';
        
        if (card.matched) {
            cardEl.classList.add('matched');
            cardEl.textContent = card.emoji;
            cardEl.style.opacity = '0.3';
        } else if (card.flipped) {
            cardEl.classList.add('flipped');
            cardEl.textContent = card.emoji;
        } else {
            cardEl.textContent = '?';
        }

        cardEl.addEventListener('click', () => flipMemoryCard(card.id));
        grid.appendChild(cardEl);
    });

    container.appendChild(grid);
}

function flipMemoryCard(cardId) {
    const card = memoryGameState.cards[cardId];

    // Already matched or flipped
    if (card.matched || card.flipped || memoryGameState.flipped.length >= 2) {
        return;
    }

    playSound('click');
    card.flipped = true;
    memoryGameState.flipped.push(cardId);

    renderMemoryGame();

    if (memoryGameState.flipped.length === 2) {
        setTimeout(checkMemoryMatch, 800);
    }
}

function checkMemoryMatch() {
    const [id1, id2] = memoryGameState.flipped;
    const card1 = memoryGameState.cards[id1];
    const card2 = memoryGameState.cards[id2];

    if (card1.emoji === card2.emoji) {
        // Match found
        playSound('correct');
        card1.matched = true;
        card2.matched = true;
        memoryGameState.matched += 2;
        updateScore(10);

        // Check if game is won
        if (memoryGameState.matched === memoryGameState.cards.length) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    } else {
        // No match
        playSound('wrong');
        card1.flipped = false;
        card2.flipped = false;
    }

    memoryGameState.flipped = [];
    renderMemoryGame();
}
