// ============= SUDOKU GAME =============

let sudokuGameState = {
    grid: [],
    solution: [],
    selected: null,
    puzzleSize: 4,
    difficulty: 'easy'
};

function initSudokuGame(mode) {
    sudokuGameState.difficulty = mode === 'easy' ? 'easy' : 'medium';
    sudokuGameState.puzzleSize = 4;
    
    // Generate 4x4 Sudoku
    generateSudokuPuzzle();
    renderSudokuGame();
}

function generateSudokuPuzzle() {
    const size = 4;
    
    // Create solution grid
    sudokuGameState.solution = [];
    for (let i = 0; i < size; i++) {
        sudokuGameState.solution[i] = [];
        for (let j = 0; j < size; j++) {
            sudokuGameState.solution[i][j] = ((i * 2 + Math.floor(j / 2)) % 4) + 1;
        }
    }

    // Shuffle rows and columns
    for (let i = 0; i < 10; i++) {
        const row1 = Math.floor(Math.random() * size);
        const row2 = Math.floor(Math.random() * size);
        [sudokuGameState.solution[row1], sudokuGameState.solution[row2]] = 
        [sudokuGameState.solution[row2], sudokuGameState.solution[row1]];
    }

    // Create puzzle by removing numbers
    sudokuGameState.grid = sudokuGameState.solution.map(row => [...row]);
    
    const removeCount = sudokuGameState.difficulty === 'easy' ? 6 : 8;
    for (let i = 0; i < removeCount; i++) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        sudokuGameState.grid[row][col] = 0;
    }
}

function renderSudokuGame() {
    const container = document.getElementById('sudokuGameContainer');
    container.innerHTML = '';

    const gridContainer = document.createElement('div');
    gridContainer.className = 'sudoku-grid';

    for (let box = 0; box < 4; box++) {
        const boxEl = document.createElement('div');
        boxEl.className = 'sudoku-box';

        const boxRow = Math.floor(box / 2) * 2;
        const boxCol = (box % 2) * 2;

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                const row = boxRow + i;
                const col = boxCol + j;
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.id = `sudoku-${row}-${col}`;

                if (sudokuGameState.grid[row][col] !== 0) {
                    cell.textContent = sudokuGameState.grid[row][col];
                    cell.classList.add('filled');
                } else {
                    cell.textContent = '';
                    cell.addEventListener('click', () => selectSudokuCell(row, col));
                }

                boxEl.appendChild(cell);
            }
        }

        gridContainer.appendChild(boxEl);
    }

    container.appendChild(gridContainer);

    // Add number pad
    const padContainer = document.createElement('div');
    padContainer.style.display = 'grid';
    padContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    padContainer.style.gap = '10px';
    padContainer.style.marginTop = '30px';
    padContainer.style.maxWidth = '200px';
    padContainer.style.margin = '30px auto 0';

    for (let i = 1; i <= 4; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.padding = '15px';
        btn.style.fontSize = '18px';
        btn.style.fontWeight = 'bold';
        btn.style.border = '2px solid #6366f1';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        btn.style.background = 'white';
        btn.style.color = '#6366f1';
        btn.addEventListener('click', () => enterSudokuNumber(i));
        padContainer.appendChild(btn);
    }

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.padding = '15px';
    clearBtn.style.fontSize = '14px';
    clearBtn.style.fontWeight = 'bold';
    clearBtn.style.border = '2px solid #ef4444';
    clearBtn.style.borderRadius = '8px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.background = 'white';
    clearBtn.style.color = '#ef4444';
    clearBtn.style.gridColumn = '1 / -1';
    clearBtn.addEventListener('click', () => clearSudokuCell());
    padContainer.appendChild(clearBtn);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Check';
    submitBtn.style.padding = '15px';
    submitBtn.style.fontSize = '14px';
    submitBtn.style.fontWeight = 'bold';
    submitBtn.style.border = 'none';
    submitBtn.style.borderRadius = '8px';
    submitBtn.style.cursor = 'pointer';
    submitBtn.style.background = '#10b981';
    submitBtn.style.color = 'white';
    submitBtn.style.gridColumn = '1 / -1';
    submitBtn.style.marginTop = '10px';
    submitBtn.addEventListener('click', checkSudokuSolution);
    padContainer.appendChild(submitBtn);

    container.appendChild(padContainer);
}

function selectSudokuCell(row, col) {
    // Deselect previous
    if (sudokuGameState.selected) {
        const prevCell = document.getElementById(`sudoku-${sudokuGameState.selected.row}-${sudokuGameState.selected.col}`);
        if (prevCell) prevCell.style.background = 'white';
    }

    sudokuGameState.selected = { row, col };
    const cell = document.getElementById(`sudoku-${row}-${col}`);
    if (cell) {
        cell.style.background = '#e0e7ff';
        playSound('click');
    }
}

function enterSudokuNumber(num) {
    if (!sudokuGameState.selected) return;

    const { row, col } = sudokuGameState.selected;
    sudokuGameState.grid[row][col] = num;
    const cell = document.getElementById(`sudoku-${row}-${col}`);
    if (cell) {
        cell.textContent = num;
    }
    playSound('click');
}

function clearSudokuCell() {
    if (!sudokuGameState.selected) return;

    const { row, col } = sudokuGameState.selected;
    sudokuGameState.grid[row][col] = 0;
    const cell = document.getElementById(`sudoku-${row}-${col}`);
    if (cell) {
        cell.textContent = '';
    }
}

function checkSudokuSolution() {
    // Check if grid matches solution
    const size = sudokuGameState.puzzleSize;
    let isCorrect = true;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (sudokuGameState.grid[i][j] !== sudokuGameState.solution[i][j]) {
                isCorrect = false;
                break;
            }
        }
        if (!isCorrect) break;
    }

    if (isCorrect) {
        playSound('correct');
        updateScore(50);
        alert('Correct! You solved the Sudoku!');
        setTimeout(() => {
            endGame();
        }, 500);
    } else {
        playSound('wrong');
        alert('Some numbers are wrong. Try again!');
    }
}
