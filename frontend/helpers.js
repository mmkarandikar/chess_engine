// We define some general-purpose helper functions to make future computation easier

// import { BiDirectionalMap } from './classes.js';

// Function to check if its input is an integer
export function isInt(value) {
    let x;
    if (isNaN(value)) {
      return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}

// Function that adds a character to a string at the specified index
export function setCharAt(str, indexA, indexB, chr) {
    if(indexB-indexA > str.length-1) return str;
    return str.substring(0,indexA) + chr + str.substring(indexB);
}

// Function that rotates an array by a specific number of indices (count)
export function arrayRotate(arr, count) {
    const len = arr.length
    arr.push(...arr.splice(0, (-count % len + len) % len))
    return arr
  }

// Function that returns a filter to retain only unique values in an array
export function filterUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

export function findStringCase(inputString) {
  let str = inputString;
  if (str === str.toLowerCase()){
    return 'lower';
  }
  else if (str === str.toUpperCase()){
    return 'upper';
  }
  else {
    throw new TypeError(`Invalid string: ${str}`);
  }
}

// Function that converts the ID of a piece (e.g. 'white-pawn') to its FEN shorthand code (e.g. P)
export function pieceIDToCode(movedPiece){
  let movedPieceCode = '';
  movedPieceCode = movedPiece.id.split('-')[0][0] + movedPiece.id.split('-')[1][0];
  if (movedPieceCode[0] == 'w'){
      movedPieceCode = movedPieceCode[1].toUpperCase();
  }
  else{
      movedPieceCode = movedPieceCode[1].toLowerCase();
  }
  return movedPieceCode;
}

export function pieceCodeToID(pieceCode){
  // First, let's find the colour of the piece
  let pieceID = ''
  if (findStringCase(pieceCode) === 'lower'){
    pieceID += 'black-';
  }
  else if (findStringCase(pieceCode) === 'upper'){
    pieceID += 'white-';
  }
  // Finally, append the piece type
  pieceCode = pieceCode.toLowerCase()
  if (pieceCode === 'p'){
    pieceID += 'pawn';
  }
  else if (pieceCode === 'r'){
    pieceID += 'rook';
  }
  else if (pieceCode === 'b'){
    pieceID += 'bishop';
  }
  else if (pieceCode === 'n'){
    pieceID += 'knight';
  }
  else if (pieceCode === 'q'){
    pieceID += 'queen';
  }
  else if (pieceCode === 'k'){
    pieceID += 'king';
  }
  else {
    throw new TypeError(`Invalid piece code ${pieceCode}`);
  }
  return pieceID
}

// Function to convert the standard FEN string to an extended format which always has 64 characters
// For example, the FEN row 4p3 becomes 0000p000. This is easier to parse.
export function extendFEN(fen) {
  // Remove any slashes and split the FEN string into an array of ranks
  const ranks = fen.replace(/\//g, '').split('');
  
  // Initialize an array to hold the expanded board representation
  let board = [];
  
  // Iterate over each rank
  for (let rank of ranks) {
    if (/\d/.test(rank)) {
      // If the rank is a number, add that many '0's to the board
      board.push(...Array(parseInt(rank)).fill('0'));
    } else {
      // Otherwise, add the piece to the board
      board.push(rank);
    }
  }

  // Join the board array into a string and ensure it's 64 characters long
  board = board.join('').padEnd(64, '0').slice(0, 64);
  return board;
}


// Convert the extended FEN string to the standard notation
export function convertToFEN(boardString, turnToPlay, moveCounter, castlingString, enPassantString, halfMoveCount) {
    if (boardString.length !== 64) {
      throw new Error('Input string must be exactly 64 characters.');
    }
    let fen = '';
    let emptyCount = 0;
    for (let i=0; i<64; i++){
        if (boardString[i] === '0'){
            if (emptyCount < 7){
                emptyCount++;

            }
            else{
                fen += 8;
                emptyCount = 0;
            }
        }
        else{
            if (emptyCount > 0){
                fen += emptyCount;
                emptyCount = 0;
            }
            fen += boardString[i];
        }

        if ((i+1) % 8 == 0){
            if (emptyCount > 0){
                fen += emptyCount;
            }
            emptyCount = 0;
            if (i != 63){
                fen += '/';
            }
        }
    }

    let turnString = '';
    if (turnToPlay == 'white'){
        turnString = 'b';
    }
    else if (turnToPlay == 'black'){
        turnString = 'w';
    }
    fen += ` ${turnString} ${castlingString} ${enPassantString} ${halfMoveCount} ${moveCounter}`; 
    return fen;
}

// Returns the piece that occupies the input square, evaluates to false for empty squares 
export function isOccupied(targetSquareCode, currentPosition){
    // Convert to 64 bits
    var fenPosition = extendFEN(currentPosition);
    // Define variable to store occupying piece
    var occupyingPiece = fenPosition[targetSquareCode]
    if (occupyingPiece == 0){
        return false;
    }
    else {
        occupyingPiece = pieceCodeToID(occupyingPiece);
        return occupyingPiece;
    };
}

// Generates the entry for a given move in arithmetic notation
export function genMoveEntry(draggedPiece, sourceSquare, targetSquare, castling, currentPosition){    
    let piece = draggedPiece.id.split('-')[1];
    let move = '';
    if (castling != ''){
        move += 'O-O';
    }
    else{
        switch (piece) {
            case 'pawn':
                move = '';
                break;
            case 'bishop':
                move = 'B';
                break;
            case 'knight':
                move = 'N';
                break;
            case 'rook':
                move = 'R';
                break;
            case 'queen':
                move = 'Q';
                break;
            case 'king':
                move = 'K';
                break;    
            default:
                move = '';
                break;
        }
        if (isOccupied(targetSquare.code, currentPosition)){
            if (draggedPiece.id.split('-')[1] == 'pawn'){
                move = `${sourceSquare.id[0]}x${targetSquare.id}`
            }
            else {
                move = `${move}x${targetSquare.id}`
            }
        }
        else {
          move += `${targetSquare.id}`;
        }
    }
    return move
}

// Function to check if a position has repeated three times
export function checkThreeFoldRep(allFENS) {
  const fenList = new Map();
  for (let fen of allFENS){
    fen = fen.split(' ')[0];
    const count = fenList.get(fen) || 0;
    fenList.set(fen, count + 1);
    if (count + 1 === 3) {
      return true;
    }
  }
  return false;
}

export function pieceToUnicode(piece) {
  let unicode;
  switch (piece) {
    case 'white-pawn':
      unicode = '\u2659';
      break;
    case 'white-knight':
      unicode = '\u2658';
      break; 
    case 'white-bishop':
      unicode = '\u2657';
      break;
    case 'white-rook':
      unicode = '\u2656';
      break;
    case 'white-queen':
      unicode = '\u2655';
      break;
    case 'white-king':
      unicode = '\u2654';
      break;
    case 'black-pawn':
      unicode = '\u265F';
      break;
    case 'black-knight':
      unicode = '\u265E';
      break; 
    case 'black-bishop':
      unicode = '\u265D';
      break;
    case 'black-rook':
      unicode = '\u265C';
      break;
    case 'black-queen':
      unicode = '\u265B';
      break;
    case 'black-king':
      unicode = '\u265A';
      break;
    default:
      unicode = '';
      break;
  }
  return unicode
}

export const pieceSortOrder = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

export function pieceNameToValue(pieceName){
  // First, let's find the colour of the piece
  let pieceType = pieceName.split('-')[1]
  let pieceValue;
  // Finally, append the piece type
  if (pieceType === 'pawn'){
    pieceValue = 1;
  }
  else if (pieceType === 'rook'){
        pieceValue = 5;
  }
  else if (pieceType === 'bishop'){
        pieceValue = 3;
  }
  else if (pieceType === 'knight'){
        pieceValue = 3;
  }
  else if (pieceType === 'queen'){
        pieceValue = 9;
  }
  else if (pieceType === 'king'){
        pieceValue = 200; // King gets an arbitrarily high value
  }
  else {
    throw new TypeError(`Invalid piece name ${pieceName}`);
  }
  return pieceValue
}