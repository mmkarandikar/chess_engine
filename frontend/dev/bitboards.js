import { createBoard, renderBoard } from "../functions.js"
// Render the chess board from the 12 bitboards

// The standard initial position in FEN
const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Define bitboards for each piece type
const BITBOARDS = {
    whitePawns: 0n,
    whiteKnights: 0n,
    whiteBishops: 0n,
    whiteRooks: 0n,
    whiteQueens: 0n,
    whiteKing: 0n,
    blackPawns: 0n,
    blackKnights: 0n,
    blackBishops: 0n,
    blackRooks: 0n,
    blackQueens: 0n,
    blackKing: 0n
};

// Set bitboards using input FEN code
function setBitboards(fen) {
    // Reset all current bitboards
    for (const key in BITBOARDS) {
        BITBOARDS[key] = 0n;
    }

    const parts = fen.split(' '); // Separate the board part of the FEN 
    const boardPart = parts[0];
    const rows = boardPart.split('/');
    
    let rank = 0;
    let file = 0;
    
    // Loop over rank and file to parse FEN
    for (const row of rows) {
        file = 0;
        for (const char of row) {
            if (/[1-8]/.test(char)) {
                // Skip empty squares
                file += parseInt(char);
            } else {
                // Set the appropriate bit for this piece
                const bit = rank * 8 + file;
                const bitMask = 1n << BigInt(bit);
                
                switch (char) {
                    case 'P': BITBOARDS.whitePawns |= bitMask; break;
                    case 'N': BITBOARDS.whiteKnights |= bitMask; break;
                    case 'B': BITBOARDS.whiteBishops |= bitMask; break;
                    case 'R': BITBOARDS.whiteRooks |= bitMask; break;
                    case 'Q': BITBOARDS.whiteQueens |= bitMask; break;
                    case 'K': BITBOARDS.whiteKing |= bitMask; break;
                    case 'p': BITBOARDS.blackPawns |= bitMask; break;
                    case 'n': BITBOARDS.blackKnights |= bitMask; break;
                    case 'b': BITBOARDS.blackBishops |= bitMask; break;
                    case 'r': BITBOARDS.blackRooks |= bitMask; break;
                    case 'q': BITBOARDS.blackQueens |= bitMask; break;
                    case 'k': BITBOARDS.blackKing |= bitMask; break;
                }
                file++;
            }
        }
        rank++;
    }
    
    // Store other game state information if needed
    // parts[1] = active color
    // parts[2] = castling availability
    // parts[3] = en passant target square
    // parts[4] = halfmove clock
    // parts[5] = fullmove number
    
    return {
        activeColor: parts[1],
        castling: parts[2],
        enPassant: parts[3],
        halfmoveClock: parseInt(parts[4]),
        fullmoveNumber: parseInt(parts[5])
    };
}

// Generate FEN string from current bitboards
function generateFEN() {
    let fen = '';
    
    // Generate board position part
    for (let rank = 0; rank < 8; rank++) {
        let emptyCount = 0;
        
        for (let file = 0; file < 8; file++) {
            const bit = rank * 8 + file;
            const bitMask = 1n << BigInt(bit);
            
            let pieceChar = null;
            
            if (BITBOARDS.whitePawns & bitMask) pieceChar = 'P';
            else if (BITBOARDS.whiteKnights & bitMask) pieceChar = 'N';
            else if (BITBOARDS.whiteBishops & bitMask) pieceChar = 'B';
            else if (BITBOARDS.whiteRooks & bitMask) pieceChar = 'R';
            else if (BITBOARDS.whiteQueens & bitMask) pieceChar = 'Q';
            else if (BITBOARDS.whiteKing & bitMask) pieceChar = 'K';
            else if (BITBOARDS.blackPawns & bitMask) pieceChar = 'p';
            else if (BITBOARDS.blackKnights & bitMask) pieceChar = 'n';
            else if (BITBOARDS.blackBishops & bitMask) pieceChar = 'b';
            else if (BITBOARDS.blackRooks & bitMask) pieceChar = 'r';
            else if (BITBOARDS.blackQueens & bitMask) pieceChar = 'q';
            else if (BITBOARDS.blackKing & bitMask) pieceChar = 'k';
            
            if (pieceChar) {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                fen += pieceChar;
            } else {
                emptyCount++;
            }
        }
        
        if (emptyCount > 0) {
            fen += emptyCount;
        }
        
        if (rank < 7) {
            fen += '/';
        }
    }
    
    // Add the rest of the FEN components
    // For now, using placeholders - replace these with actual game state
    // fen += ' w KQkq - 0 1';
    
    return fen;
}

// Print a visual representation of a bitboard
function printBitboard(bitboard) {
    let output = '';
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const bit = rank * 8 + file;
            const isSet = (bitboard & (1n << BigInt(bit))) !== 0n;
            output += isSet ? '1 ' : '0 ';
        }
        output += '\n';
    }
    console.log(output);
}

// Print all bitboards in the current position
function debugPosition() {
    for (const [type, board] of Object.entries(BITBOARDS)) {
        console.log(`${type}:`);
        printBitboard(board);
        console.log('-------------------');
    }
}

// Global variable to track the current board position
let currentPosition = { ...INITIAL_FEN };

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
                console.log(square.id, square.code, pieceElement.id)
                draggedPiece = pieceElement;
                sourceSquare = square.id;
                
                // Visual feedback
                setTimeout(() => {
                    pieceElement.style.opacity = '0.75';
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
                // console.log(square.code);
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

// Function to make a move
function makeMove(sourceSquare, targetSquare) {
    // Get the piece at the source square
    console.log(sourceSquare);
    // const piece = sourceSquare.querySelector('.piece');
    console.log(`Moved ${piece} from ${from} to ${to}`);
    // if (piece) {
        // // Update the position object
        // currentPosition[to] = piece;
        // delete currentPosition[from];
        
        // // Re-render the board with the new position
        // renderBoard(currentPosition);
        
        
        // Here you would later add validation and backend communication
    // }
}

document.addEventListener('DOMContentLoaded', function() {
    createBoard();
    // BITBOARDS correspond to an empty board
    setBitboards(INITIAL_FEN); // Set the board using the initial position
    renderBoard(INITIAL_FEN); // Render the board
    // debugPosition();
    setupDragAndDrop();
    // let currentPosition = generateFEN(); // Generate the corresponding FEN
});