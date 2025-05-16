// Each square on the board is assigned a numerical value between 0 and 63
// We create a look-up table to quickly convert the arithmetic notation (e.g. a1, a2, ...) 
// to its numerical equivalent. For this we define a custom class in './classes.js'
// Import the custom class and create a new instance of this class
import { BiDirectionalMap } from './classes.js';
import { isInt, filterUnique, setCharAt, extendFEN, convertToFEN  } from './helpers.js';
import { bishopMoves, rookMoves, knightMoves, kingMoves, pawnMoves } from './moves.js';

export var squareLookupTable = new BiDirectionalMap();

// Define the files and ranks
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Function to convert the shorthand code for a piece to its full name
export function getPiece(pieceCode) {
    let pieceType;
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


// Function that creates an empty board
export function createBoard() {
    const board = document.querySelector('.chess-board');
    
    // Clear existing squares to prevent duplication
    board.innerHTML = '';

    // Loop over ranks and files to get the 64 squares
    let iterVariable = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.id = `${files[j]}${ranks[i]}`;
            square.code = iterVariable;
            square.classList.add('square', ((i + j) % 2 === 0 ? 'light-square' : 'dark-square'));
            board.appendChild(square);
            squareLookupTable.set(square.id, iterVariable); // Set the key-value pair for the look-up table
            iterVariable++
        }
    }   
    return board;
}

// Function that renders the pieces on the board given any board position
export function renderBoard(fenPosition) {

    // Remove any existing piece elements
    document.querySelectorAll('.square').forEach(square => {
        const existingPiece = square.querySelector('.piece');
        if (existingPiece) {
            square.removeChild(existingPiece);
        }
    });
    
    // Render the pieces on the board by looping over characters of the FEN string
    const setup = extendFEN(fenPosition)
    let allSquares = document.querySelectorAll('.square')
    for (let i=0; i<64; i++){
        const squareElement = allSquares[i];
        let piece = setup[i];
        let pieceCode = getPiece(piece);
        if (pieceCode != 0){
            const pieceElement = document.createElement('div');
            pieceElement.className = 'piece ' + pieceCode;
            pieceElement.id = pieceCode;
            pieceElement.colour = pieceCode.split('-')[0];
            try {
                squareElement.append(pieceElement);            
            }
            catch (TypeError){
                break
            }
        }
    }
}

// // Find all legal moves for each piece on the board
export function tabulatePseudoLegalMoves(currentPosition){
    let movesDictionary = new Map();
    let allMoves = []
    let setup = extendFEN(currentPosition);
    
    let allSquares = document.querySelectorAll('.square')
    // To tabulate all moves, we go to each square, find the piece on that square, and find all its legal moves
    for (let i=0; i<64; i++){
        const squareElement = allSquares[i];
        const piece = setup[i];
        const pieceCode = getPiece(piece);
        if (pieceCode != 0){
            let [legalMoves, attackMoves, enPassantMoves] = findPseudoLegalMoves(pieceCode, squareElement, currentPosition);
            allMoves = (legalMoves.concat(attackMoves)).concat(enPassantMoves);
            if (allMoves.length != 0){
                movesDictionary.set(`${pieceCode},${squareElement.id}`, allMoves);
            }
        }
    }
    return movesDictionary;
}


// Find all pseudo legal moves
export function findPseudoLegalMoves(clickedPiece, sourceSquare, currentPosition){
    let pieceCode;
    let castlingString = currentPosition.split(' ')[2]; // Tracks whether castling is possible
    let pieceColour = clickedPiece.split('-')[0];
    if (clickedPiece.split('-')[1] != 'pawn'){
        pieceCode = clickedPiece.split('-')[1];
    }
    else{
        pieceCode = clickedPiece;
    }
    let pseudoLegalMoves = [];
    let attacks = [];
    let enPassantMoves = [];
    let castling = '';
    switch (pieceCode) {
        case 'white-pawn':
            [pseudoLegalMoves, attacks, enPassantMoves] = pawnMoves(sourceSquare, 'white', currentPosition);
            break;
        case 'black-pawn':
            [pseudoLegalMoves, attacks, enPassantMoves] = pawnMoves(sourceSquare, 'black', currentPosition);
            break;    
        case 'knight':
            [pseudoLegalMoves, attacks] = knightMoves(sourceSquare.code, pieceColour, currentPosition);
            break;
        case 'rook':
            [pseudoLegalMoves, attacks] = rookMoves(sourceSquare.code, pieceColour, currentPosition);
            break;
        case 'bishop':
            [pseudoLegalMoves, attacks] = bishopMoves(sourceSquare.code, pieceColour, currentPosition);
            break;
        case 'queen':
            let [rooks, rookAttacks] = rookMoves(sourceSquare.code, pieceColour, currentPosition);
            let [bishops, bishopAttacks] = bishopMoves(sourceSquare.code, pieceColour, currentPosition);
            pseudoLegalMoves = rooks.concat(bishops);
            attacks = rookAttacks.concat(bishopAttacks);
            break;
        case 'king':
            [pseudoLegalMoves, attacks, castling] = kingMoves(sourceSquare, pieceColour, castlingString, currentPosition);
            break;
        default:
            pseudoLegalMoves = [];
            attacks = [];
            break;
    }
    pseudoLegalMoves = pseudoLegalMoves.filter(move => move >= 0 && move <= 63)
    pseudoLegalMoves = pseudoLegalMoves.filter(move => move != sourceSquare.code && move !== undefined)
    pseudoLegalMoves = pseudoLegalMoves.filter(filterUnique)

    return [pseudoLegalMoves, attacks, enPassantMoves]
}

// Find all legal moves for a piece starting at a specific square
// Returns three arrays -- one for move squares, another for attacks, and a third for en-passant moves
export function findLegalMoves(clickedPiece, sourceSquare, currentPosition){
    let [pseudoLegalMoves, attacks, enPassantMoves] = findPseudoLegalMoves(clickedPiece, sourceSquare, 
        currentPosition);
    let allMoves = (pseudoLegalMoves.concat(attacks)).concat(enPassantMoves);
    let turnToPlay;
    if (clickedPiece.split('-')[0] == 'white'){
        turnToPlay = 'black';
    }
    else {
        turnToPlay = 'white';
    }
    for (let move of allMoves){
        let targetSquare = document.getElementById(squareLookupTable.getByValue(move));
        let newPosition = makeVirtualMove(clickedPiece, sourceSquare, targetSquare, '', currentPosition, turnToPlay)
        if (isCheck(newPosition)){
            pseudoLegalMoves = pseudoLegalMoves.filter(legalMove => legalMove != move)
            attacks = attacks.filter(legalMove => legalMove != move)
            enPassantMoves = enPassantMoves.filter(legalMove => legalMove != move)
        }
    }
    return [pseudoLegalMoves, attacks, enPassantMoves]
}

export function isCheck(position) {
    const extendedPosition = extendFEN(position);
    let kingSquare, attackColour;
    let check = false;
    if (position.split(' ')[1] == 'w'){
        kingSquare = extendedPosition.indexOf('K')
        attackColour = 'black'
    }
    else {
        kingSquare = extendedPosition.indexOf('k')
        attackColour = 'white'
    }
    let oppPosition = [];
    for (let part of position.split(' ')){
        if (part == 'w'){
            oppPosition.push('b');
        }
        else if (part == 'b'){
            oppPosition.push('w');
        }
        else {
            oppPosition.push(part) 
        }
    }
    oppPosition = oppPosition.join(' ')
    
    let moves = tabulatePseudoLegalMoves(oppPosition);

    for (const [piece, legalMoves] of moves) {
        if ((legalMoves.includes(kingSquare)) && (piece.split('-')[0]==attackColour)) {
            check = true;
            break
        }
    }
    return check;
}

// Make a virtual move, i.e. return the updated position without making any changes to the board state
export function makeVirtualMove(draggedPiece, sourceSquare, targetSquare, castling, currentPosition, turnToPlay) {
    let newFEN = extendFEN(currentPosition);
    let enPassantString = currentPosition.split(' ')[3];
    if (draggedPiece.split('-')[1] == 'pawn'){
        if (squareLookupTable.valueToKey[targetSquare.code] == enPassantString){
            const pieceColour = draggedPiece.split('-')[0];
            if (pieceColour == 'white'){
                newFEN = setCharAt(newFEN, targetSquare.code + 8, targetSquare.code + 9, 0);
            }
            else {
                newFEN = setCharAt(newFEN, targetSquare.code - 8, targetSquare.code - 7, 0);
            }
        };
    }
    if (castling == 'K'){
        newFEN = setCharAt(newFEN, 60, 64, '0RK0');
    }
    else if (castling == 'Q'){
        newFEN = setCharAt(newFEN, 56, 61, '00RK0');
    }
    else if (castling == 'q'){
        newFEN = setCharAt(newFEN, 0, 5, '00kr0');
    }
    else if (castling == 'k'){
        newFEN = setCharAt(newFEN, 4, 8, '0rk0');
    }
    else {
        newFEN = setCharAt(newFEN, targetSquare.code, targetSquare.code+1, newFEN[sourceSquare.code])
        newFEN = setCharAt(newFEN, sourceSquare.code, sourceSquare.code+1, 0)
    }
    currentPosition = convertToFEN(newFEN, turnToPlay, 0, '----', '-', 0);
    return currentPosition;
}


export function tabulateLegalMoves(position) {
    const extendedPosition = extendFEN(position);
    let kingSquare, attackColour;    
    if (position.split(' ')[1] == 'w'){
        kingSquare = extendedPosition.indexOf('K')
        attackColour = 'black'
    }
    else {
        kingSquare = extendedPosition.indexOf('k')
        attackColour = 'white'
    }
    let oppPosition = [];
    for (let part of position.split(' ')){
        if (part == 'w'){
            oppPosition.push('b');
        }
        else if (part == 'b'){
            oppPosition.push('w');
        }
        else {
            oppPosition.push(part) 
        }
    }
    oppPosition = oppPosition.join(' ')
    
    let moves = tabulatePseudoLegalMoves(oppPosition);
    let allLegalMoves = new Map();
    for (let [piece, allMoves] of moves){
        let pieceMoves = [];
        if (piece[0] == position.split(' ')[1]){
            for (let move of allMoves){
                let sourceSquare = document.getElementById(piece.split(',')[1])
                let targetSquare = document.getElementById(squareLookupTable.getByValue(move))
                let newPosition = makeVirtualMove(piece, sourceSquare, targetSquare, '', position, attackColour)
                if (!isCheck(newPosition)){
                    pieceMoves.push(move)
                }
            }
            if (pieceMoves != []){
                allLegalMoves.set(`${piece}`, pieceMoves);
            }
        }
    }
    return allLegalMoves;
}
