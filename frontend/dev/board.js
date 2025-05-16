// First, we define functions to create the board, get the pieces from a defined position,
// and render them on the board
const initialPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

function createBoard(files, ranks) {
    const board = document.querySelector('.chess-board');
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.id = files[j] + ranks[i];
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'light-square' : 'dark-square');
            board.appendChild(square);
        }
    }
}

function transposeStringMatrix(str) {
    const size = 8; // Since it's an 8x8 matrix
  
    // Convert the string into an 8x8 2D array
    let matrix = [];
    for (let i = 0; i < size; i++) {
      matrix.push(str.slice(i * size, (i + 1) * size));
    }
  
    // Create the transposed matrix
    let transposed = '';
    for (let col = 0; col < size; col++) {
      for (let row = 0; row < size; row++) {
        transposed += matrix[row][col];
      }
    }
  
    return transposed;
}

function getPieceClass(pieceCode) {
    let pieceType;
    let skipChars = 0;
    if (isInt(pieceCode)){
        pieceType = Number(pieceCode);
    }
    else {
        switch(pieceCode) {
            case 'p': pieceType = 'black-pawn'; break;
            case 'r': pieceType = 'black-rook'; break;
            case 'n': pieceType = 'black-knight'; break;
            case 'b': pieceType = 'black-bishop'; break;
            case 'q': pieceType = 'black-queen'; break;
            case 'k': pieceType = 'black-king'; break;
            case 'P': pieceType = 'white-pawn'; break;
            case 'R': pieceType = 'white-rook'; break;
            case 'N': pieceType = 'white-knight'; break;
            case 'B': pieceType = 'white-bishop'; break;
            case 'Q': pieceType = 'white-queen'; break;
            case 'K': pieceType = 'white-king'; break;
            default: pieceType = '';
        }
    }
    return `${pieceType}`;
}

function isInt(value) {
    var x;
    if (isNaN(value)) {
      return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}

function renderBoard(files, ranks, position) {
    // Place pieces according to the position
    const setup = position.replaceAll("/", "");
    const squares = ranks.flatMap(item1 => files.map(item2 => item2 + item1));
    let j = 0;
    for (let i = 0; i<64;) {
        const square = document.createElement("div");
        square.id = squares[j];
        const squareElement = document.getElementById(square.id);
        piece = setup[i];
        pieceCode = getPieceClass(piece);
        if (isInt(pieceCode)) {
            j += Number(pieceCode)-1;
        }
        // console.log(piece, i, j, pieceCode, square.id)

        // console.log(piece, square.id, i);
        const pieceElement = document.createElement('div');
        pieceElement.className = 'piece ' + pieceCode;
        try {
            squareElement.appendChild(pieceElement);            
        }
        catch (TypeError){
            break
        }
        i++; j++;
    }

    // console.log(squares)
}

// Global variable to track the current board position
let currentPosition = { ...initialPosition };

// Variables to track drag operations
let draggedPiece = null;
let sourceSquare = null;

// Set up event listeners for drag and drop
function setupDragAndDrop() {
    // Add event listeners to all squares
    document.querySelectorAll('.square').forEach(square => {
        // When a drag starts on a piece
        square.addEventListener('mousedown', function(e) {
            const pieceElement = square.querySelector('.piece');
            if (pieceElement) {
                draggedPiece = pieceElement;
                sourceSquare = square.id;
                
                // Visual feedback
                setTimeout(() => {
                    pieceElement.style.opacity = '0.25';
                }, 0);
                
                // Prevent default drag image
                e.preventDefault();
            }
        });

        // When mouse enters a square during dragging
        square.addEventListener('dragover', function(e) {
            if (draggedPiece) {
                e.preventDefault(); // Allow drop
            }
        });

        // When a piece is dropped on a square
        square.addEventListener('mouseup', function() {
            if (draggedPiece && sourceSquare) {
                const targetSquare = square.id;
                
                // Only process if dropping on a different square
                if (sourceSquare !== targetSquare) {
                    makeMove(sourceSquare, targetSquare);
                }
                
                // Reset drag state
                draggedPiece.style.opacity = '1';
                draggedPiece = null;
                sourceSquare = null;
            }
        });
    });

    // Handle case when mouse is released outside a square
    document.addEventListener('mouseup', function() {
        if (draggedPiece) {
            draggedPiece.style.opacity = '1';
            draggedPiece = null;
            sourceSquare = null;
        }
    });
}

// function findPiece(currentPosition, targetSquare){
//     // Finds the piece on a target square for a given position
//     // const setup = position.replaceAll("/", "");
//     const setup = currentPosition.replaceAll("/", "")
//     console.log(setup, targetSquare)
//     for (i=0; i<64;){
//         setupTemp = setup
//         if (isInt(setup[i])){
//             console.log(i, setupTemp)
//             var setupTemp = setupTemp.slice(0, i) + setupTemp[i].repeat(Number(setupTemp[i])-1) + setupTemp.slice(i);
//             i += Number(setupTemp[i]);
//             console.log(i, setupTemp)

//         }
//         // console.log(setup[i], isInt(setup[i]))
//         i++;
//     }
//     console.log(setupTemp)
// }

// // Function to make a move
// function makeMove(source, target) {
//     // Get the piece at the source square
//     const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
//     const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
//     const piece = findPiece(initialPosition, source)

//     // currentPosition[from];
//     // console.log(from, to)
    
//     // // if (piece) {
//     //     // Update the position object
//     // currentPosition[to] = piece;
//     // delete currentPosition[from];
    
//     // Re-render the board with the new position
//     // renderBoard(files, ranks, currentPosition);
    
//     // console.log(`Moved ${piece} from ${source} to ${target}`);
        
//         // Here you would later add validation and backend communication
//     // }
// }

function extendPositionString(fenString){
    // Converts a FEN position to a 64 character string with zeros in place of empty squares
    // For example, the row 1p5p becomes 0p00000p
    var strippedString = fenString.replaceAll("/", "")
    console.log(strippedString);
    for (i=0; i<8;){
        if (isInt(strippedString[i])){
            console.log(i, strippedString[i])
            var setupTemp = setupTemp.slice(0, i) + "0".repeat(Number(setupTemp[i])-1) + setupTemp.slice(i);
        //     i += Number(setupTemp[i]);
        //     console.log(i, setupTemp)

        // }
        // // console.log(setup[i], isInt(setup[i]))
        }
        i++;
    }
    var extendedString = fenString;
    console.log(extendedString);
    return extendedString;
}


document.addEventListener('DOMContentLoaded', function() {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    // Create the board squares
    createBoard(files, ranks);    
    // Render initial position
    const fenString = "1p5p"
    const extendedString = "0p00000p"; //extendPositionString(fenString);
    renderBoard(files, ranks, extendedString);
    
    // Implement drag and drop
    //...//
});
