// Piece definitions with colors and square counts
const PIECES = [
    { squares: 1, color: '#993399', name: '1-Square' },    
    { squares: 2, color: '#ff6666', name: '2-Square Line' },    
    { squares: 3, color: '#ffff4d', name: '3-Square Line' },    
    { squares: 3, color: '#ff9900', name: '3-Square Corner' },    
    { squares: 4, color: '#66ff33', name: '4-Square Line' },    
    { squares: 4, color: '#0066ff', name: '4-Square Square' },    
    { squares: 4, color: '#cc00ff', name: '4-Square J' },    
    { squares: 4, color: '#9900ff', name: '4-Square L' },    
    { squares: 4, color: '#006600', name: '4-Square T' },    
    { squares: 4, color: '#00ffcc', name: '4-Square Z' },    
    { squares: 4, color: '#000099', name: '4-Square S' }     
];

// Define pieces in 3D array - 1st dimension piece number (1-11), 2nd dimension set of coordinates starting at (0,0), 3rd dimension possible rotations
const PIECES_LIST = [
    [[0, 0]], // 1: 1 square piece
    [[0, 0], [1, 0]], // 2: 2 square piece
    [[0, 0], [1, 0], [2, 0]], // 3: 3 square line piece
    [[0, 0], [1, 0], [0, 1]], // 4: 3 square corner piece
    [[0, 0], [1, 0], [2, 0], [3, 0]], // 5: 4 square line piece
    [[0, 0], [1, 0], [0, 1], [1, 1]], // 6: 4 square square piece
    [[0, 0], [1, 0], [2, 0], [2, 1]], // 7: 4 square J shape
    [[0, 0], [1, 0], [2, 0], [0, 1]], // 8: 4 square L shape
    [[0, 0], [1, 0], [2, 0], [1, 1]], // 9: 4 square T shape
    [[0, 0], [1, 0], [1, 1], [2, 1]], // 10: 4 square Z shape
    [[0, 0], [0, 1], [1, 1], [1, 2]] // 11: 4 square S shape
];

// Create piece selectors
function initializePuzzle() {
    const piecesSelection = document.getElementById('piecesSelection');
    const board = document.getElementById('board');

    // Create board cells
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.classList.add('board-cell');
        board.appendChild(cell);
    }

    // Create piece selectors
    PIECES.forEach((piece, index) => {
        const pieceSelector = document.createElement('div');
        pieceSelector.classList.add('piece-selector');

        // Create canvas to show piece shape
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        canvas.classList.add('piece-canvas');
        drawPiece(canvas, PIECES_LIST[index], piece.color);

        // Create label for piece
        const label = document.createElement('div');
        label.textContent = piece.name;

        // Create number input for piece count
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.max = Math.floor(16 / piece.squares);
        input.value = 0;
        input.id = `piece-${index + 1}`;
        input.setAttribute('title', `Max: ${Math.floor(16 / piece.squares)}`);

        pieceSelector.appendChild(canvas);
        pieceSelector.appendChild(label);
        pieceSelector.appendChild(input);
        piecesSelection.appendChild(pieceSelector);
    });
}

// Draw piece on canvas
function drawPiece(canvas, pieceCoords, color) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.strokeStyle = 'black';

    const scale = 25; // Scale factor for drawing
    const offsetX = 50 - (Math.max(...pieceCoords.map(coord => coord[0])) + 1) * scale / 2;
    const offsetY = 50 - (Math.max(...pieceCoords.map(coord => coord[1])) + 1) * scale / 2;

    pieceCoords.forEach(coord => {
        ctx.fillRect(
            offsetX + coord[0] * scale, 
            offsetY + coord[1] * scale, 
            scale - 1, 
            scale - 1
        );
        ctx.strokeRect(
            offsetX + coord[0] * scale, 
            offsetY + coord[1] * scale, 
            scale - 1, 
            scale - 1
        );
    });
}

// Solve puzzle function
function solvePuzzle() {
    const resultDiv = document.getElementById('result');
    const board = document.getElementById('board');
    const pieces = [];

    // Collect piece counts
    for (let i = 1; i <= 11; i++) {
        const input = document.getElementById(`piece-${i}`);
        const count = parseInt(input.value);
        
        // Add piece to array multiple times based on count
        for (let j = 0; j < count; j++) {
            pieces.push(i);
        }
    }

    try {
        // Call original packingPuzzle function
        const solution = packingPuzzle(pieces);

        // Clear previous solution
        board.childNodes.forEach(cell => {
            cell.style.backgroundColor = 'white';
        });

        // If solution is all zeros, puzzle is unsolvable
        if (solution.every(row => row.every(cell => cell === 0))) {
            resultDiv.textContent = 'Puzzle is unsolvable with the given pieces!';
            resultDiv.style.color = 'red';
            return;
        }

        // Display solution
        solution.forEach((row, rowIndex) => {
            row.forEach((pieceType, colIndex) => {
                const cellIndex = rowIndex * 4 + colIndex;
                const cell = board.childNodes[cellIndex];
                
                if (pieceType > 0) {
                    cell.style.backgroundColor = PIECES[pieceType - 1].color;
                }
            });
        });

        resultDiv.textContent = 'Puzzle solved!';
        resultDiv.style.color = 'green';

    } catch (error) {
        resultDiv.textContent = error.message;
        resultDiv.style.color = 'red';
    }
}

function packingPuzzle(pieces) {
    // Check if input is null or empty
    if (!pieces || pieces.length === 0) throw new Error("no pieces!");

    // Initialise board
    let board = Array(4).fill().map(() => Array(4).fill(0));

    // Initialise count array to count how many of each piece (index 0 will be unused for ease of use and no need for +/-1 everywhere)
    let count = Array(12).fill(0);
    for (let piece of pieces) count[piece]++;

    // Check if puzzle is solvable
    if (solve(board, count)) return board;

    return Array(4).fill().map(() => Array(4).fill(0));
}

// Function to solve the board
function solve(board, count) {
    // Check if all pieces used and board full
    if (isBoardFull(board) && areAllPiecesUsed(count)) return true;

    // Iterate over piece types
    for (let pieceType = 1; pieceType <= 11; pieceType++) {
        // If no piece types left, skip to next
        if (count[pieceType] === 0) continue;

        // Iterate over possible rotations
        for (let rotation = 0; rotation < 4; rotation++) {
            let rotatedPiece = rotatePiece(PIECES_LIST[pieceType - 1], rotation);

            // Iterate over board
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    // Try placing piece at row,col
                    if (isPlaceable(board, rotatedPiece, row, col)) {
                        placePiece(board, rotatedPiece, row, col, pieceType);
                        count[pieceType]--;

                        // Recursively solve
                        if (solve(board, count)) return true;

                        // Backtracking
                        removePiece(board, rotatedPiece, row, col);
                        count[pieceType]++;
                    }
                }
            }
        }
    }

    return false;
}

// Function to check if board is full
function isBoardFull(board) {
    for (let row of board) {
        for (let cell of row) if (cell === 0) return false;
    }
    return true;
}

// Function to check if all pieces are used
function areAllPiecesUsed(count) {
    for (let c of count) if (c > 0) return false;
    return true;
}

// Function to check if we can place piece on board
function isPlaceable(board, piece, row, col) {
    // Iterate over coordinations of piece
    for (let coord of piece) {
        // Get row and col relative to placing point
        let relRow = row + coord[0];
        let relCol = col + coord[1];
        // Check pos doesn't go out of board and that the pos on board is empty
        if (relRow < 0 || relRow >= 4 || relCol < 0 || relCol >= 4 || board[relRow][relCol] !== 0) return false;
    }
    return true;
}

// Function to update board with placing a piece
function placePiece(board, piece, row, col, pieceID) {
    // Iterate over coordinations of piece
    for (let coord of piece) {
        // Get row and col relative to placing point
        let relRow = row + coord[0];
        let relCol = col + coord[1];
        // Place pieceID on relative coordinates
        board[relRow][relCol] = pieceID;
    }
}

// Function to remove piece (for naming mostly - it's basically placing a "0" piece)
function removePiece(board, piece, row, col) {
    placePiece(board, piece, row, col, 0);
}

// Function to rotate piece
function rotatePiece(piece, rotation) {
    let rotated = new Array(piece.length);

    // Iterate through piece
    for (let i = 0; i < piece.length; i++) {
        let x = piece[i][0];
        let y = piece[i][1];

        // Check which rotation is required and save corresponding x, y
        if (rotation === 0) rotated[i] = [x, y];
        else if (rotation === 1) rotated[i] = [-y, x];
        else if (rotation === 2) rotated[i] = [-x, -y];
        else rotated[i] = [y, -x];
    }
    return rotated;
}