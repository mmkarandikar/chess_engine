import { squareLookupTable, renderBoard, isCheck, tabulateLegalMoves } from './functions.js'
import { pieceCodeToID, setCharAt, convertToFEN, extendFEN, isOccupied } from './helpers.js'
 
const boardSize = 8;

export function bishopMoves(sourceSquareCode, pieceColour, position) {
    // Initialize an array to store bishop moves
    const bishop = [];
    const attackMoves = [];
    // Define a helper export function to add moves in a given direction
    function addMoves(start, direction) {
      let current = start;
      while (true) {
        current += direction;
        if (current < 0 || current >= 64) { break }; // Out of bounds
        if (Math.abs((current % boardSize) - (start % boardSize)) !== Math.abs(Math.floor(current / boardSize) - Math.floor(start / boardSize))) {
          break; // Not a diagonal move
        }
        else if (isOccupied(current, position)) {
            if (isOccupied(current, position).split('-')[0] != pieceColour){
                attackMoves.push(current)
            }
            break;
        }
        else {bishop.push(current)};
      }
    }
  
    // Add moves in all four diagonal directions
    addMoves(sourceSquareCode, -7); // Top-left diagonal
    addMoves(sourceSquareCode, -9); // Top-right diagonal
    addMoves(sourceSquareCode, 7);  // Bottom-left diagonal
    addMoves(sourceSquareCode, 9);  // Bottom-right diagonal
  
    return [bishop, attackMoves];
  }


export function rookMoves(sourceSquareCode, pieceColour, position){
    var attackMoves = [];
    function fileMove(start){
        var moves = [];
        var current = start;
        while (current < 56){
            current += 8;
            if (isOccupied(current, position)){
                if (isOccupied(current, position).split('-')[0] != pieceColour){
                    attackMoves.push(current)
                }
                break;
            }
            else{
                moves.push(current);
            }
        }

        var current = start;
        while (current > 7){
            current -= 8;
            if (isOccupied(current, position)){
                if (isOccupied(current, position).split('-')[0] != pieceColour){
                    attackMoves.push(current)
                }
                break;
            }
            else{
                moves.push(current);
            }
        }
        return moves;
    }

    function rankMove(start){
        var moves = [];
        var current = start;
        while (current%boardSize < 7){
            current += 1;
            if (isOccupied(current, position)){
                if (isOccupied(current, position).split('-')[0] != pieceColour){
                    attackMoves.push(current)
                }
                break;
            }
            else{
                moves.push(current);
            }
        }
        var current = start;
        while (current%boardSize > 0){
            current -= 1;
            if (isOccupied(current, position)){
                if (isOccupied(current, position).split('-')[0] != pieceColour){
                    attackMoves.push(current)
                }
                break;
            }
            else{
                moves.push(current);
            }
        }
        return moves
    }

    let rook = fileMove(sourceSquareCode).concat(rankMove(sourceSquareCode));
    return [rook, attackMoves];
}


export function knightMoves(sourceSquareCode, colour){
    let knight = [];
    let attackMoves = [];
    var steps = [[1, 16], [2, 8], [1, -16], [2, -8], [-1, 16], [-2, 8], [-1, -16], [-2, -8]];
    for (var step of steps){
        let current = sourceSquareCode;
        while (true){ 
            current += step[0];
            if (Math.floor(current/boardSize) != Math.floor(sourceSquareCode/boardSize)) {break}
            current += step[1];
            if (current >= 0 && current < 64){
                    var square = squareLookupTable.valueToKey[`${current}`];
                    var piece = document.getElementById(`${square}`).children;
                    if (piece.length == 0){
                        knight.push(current);
                    }
                    else if (piece[0].id.split('-')[0] != colour){
                        attackMoves.push(current);
                    }
                }
            break;
            }
        }
    return [knight, attackMoves];
}


export function kingMoves(sourceSquare, pieceColour, castlingString, position){
    const king = [];
    const attackMoves = [];
    let castling = '';
    if (sourceSquare.id[0] == 'a'){
        var kingArr = [-7, -8, 1, 8, 9];
    }
    else if (sourceSquare.id[0] == 'h'){
        var kingArr = [7, -8, -1, 8, -9];
    }
    else {
        var kingArr = [-9, -8, -7, -1, 1, 7, 8, 9];
    }
    for (let move of kingArr){
        var current = sourceSquare.code + move;
        if ((current >= 0) && (current <= 63)){
            var occ = isOccupied(current, position);
            if (occ){
                if (occ.split('-')[0] != pieceColour){
                    attackMoves.push(current);
                }
            }
            else { king.push(current); }
        }
    }

    // Allow castling only if king is in check
    const checkSquare = document.querySelectorAll('.check-square');
    if (checkSquare.length == 0){
        if (pieceColour == 'white'){
            castlingString = castlingString.slice(0, 2)
            if (castlingString[0] == 'K'){
                if (!isOccupied(61, position) && !isOccupied(62, position) && (isOccupied(63, position) == 'white-rook')){
                    king.push(62);
                    castling += 'K';
                }
            }
            if (castlingString[1] == 'Q'){
                if ((isOccupied(56, position) == 'white-rook') && !isOccupied(57, position) && !isOccupied(58, position) && !isOccupied(59, position)){
                    king.push(58);
                    castling += 'Q';
                }
            }
        }
        else if (pieceColour == 'black'){
            castlingString = castlingString.slice(2, 4)
            if (castlingString[0] == 'k'){
                if (!isOccupied(5, position) && !isOccupied(6, position) && (isOccupied(7, position) == 'black-rook')){
                    king.push(6);
                    castling += 'k';
                }
            }
            if (castlingString[1] == 'q'){
                if ((isOccupied(0, position) == 'black-rook') && !isOccupied(1, position) && !isOccupied(2, position) && !isOccupied(3, position)){
                    king.push(2);
                    castling += 'q';
                }
            }
        }
    }
    return [king, attackMoves, castling]
}


export function pawnMoves(sourceSquare, colour, position){
    var pawns = [];
    var attacks = [];
    var enPassantMoves = [];
    const enPassantString = position.split(' ')[3];
    
    if (colour == 'white'){
        if (sourceSquare.id[1] == 2){
            pawns = [sourceSquare.code - 8, sourceSquare.code - 16];
        }
        else{
            pawns = [sourceSquare.code - 8];
        }
        if (sourceSquare.id[0] == 'a'){
            attacks = [sourceSquare.code - 7];
        }
        else if (sourceSquare.id[0] == 'h'){
            attacks = [sourceSquare.code - 9];
        }
        else{
            attacks = [sourceSquare.code - 9, sourceSquare.code - 7];
        }
    }
    
    else if (colour == 'black'){
        if (sourceSquare.id[1] == 7){
            pawns = [sourceSquare.code + 8, sourceSquare.code + 16];
        }
        else{
            pawns = [sourceSquare.code + 8];
        }
        if (sourceSquare.id[0] == 'a'){
            attacks = [sourceSquare.code + 9];
        }
        else if (sourceSquare.id[0] == 'h'){
            attacks = [sourceSquare.code + 7];
        }
        else{
            attacks = [sourceSquare.code + 9, sourceSquare.code + 7];
        }                
    }
    else { throw new Error ('Invalid piece colour'); }
    
    // Ensure that moves and attacks are within the board bounds
    // If this is not done, virtual moves for pawns on the 2nd or 7th rank push them off the board
    pawns = pawns.filter(moves => ((moves >= 0) && (moves < 64)))
    attacks = attacks.filter(moves => ((moves >= 0) && (moves < 64)))
    
    const attackMoves = [];
    for (var attackSquare of attacks){
        var attackedPiece = isOccupied(attackSquare, position);
        if (attackedPiece){
            if (attackedPiece.split('-')[0] != colour){
                attackMoves.push(attackSquare);
            }
        }
    }
    if (enPassantString != '-'){
        enPassantMoves.push(squareLookupTable.keyToValue[enPassantString])
    }
    pawns = pawns.filter(moveSquare => !isOccupied(moveSquare, position));
    return [pawns, attackMoves, enPassantMoves];    
}

export function detectEnPassant(draggedPiece, sourceSquare, targetSquare, position){
    let enPassantSquare = '-';
    const draggedPieceColour = draggedPiece.id.split('-')[0]
    var squares = [targetSquare.code-1, targetSquare.code+1]
    
    if (draggedPiece.id.split('-')[1] == 'pawn'){
        if (Math.abs(sourceSquare.code - targetSquare.code) == 16){
            for (var square of squares){
                if (isOccupied(square, position)){
                    if (isOccupied(square, position).split('-')[1] != draggedPieceColour){
                        if (draggedPieceColour == 'white'){
                            enPassantSquare = squareLookupTable.valueToKey[targetSquare.code + 8]
                        }
                        else {
                            enPassantSquare = squareLookupTable.valueToKey[targetSquare.code - 8]
                        }
                    }
                }
            }
        }
    }
    return enPassantSquare
}

// Makes a move by updating the FEN position and rendering it
export function makeMove(draggedPiece, sourceSquare, targetSquare, castling, currentPosition, moveCounter, turnToPlay, allFENS) {
    let newFEN = extendFEN(currentPosition);
    let pMoveOrCapture = false;
    var enPassantString = currentPosition.split(' ')[3];
    let capturedPiece = isOccupied(targetSquare.code, currentPosition);

    // Check if the target square is occupied, i.e., if the move is a capture
    if (capturedPiece){
        pMoveOrCapture = true;
    }

    // Update FEN for pawn moves
    if (draggedPiece.id.split('-')[1] == 'pawn'){
        pMoveOrCapture = true;
        if (squareLookupTable.valueToKey[targetSquare.code] == enPassantString){
            const pieceColour = draggedPiece.id.split('-')[0];
            if (pieceColour == 'white'){
                newFEN = setCharAt(newFEN, targetSquare.code + 8, targetSquare.code + 9, 0);
            }
            else {
                newFEN = setCharAt(newFEN, targetSquare.code - 8, targetSquare.code - 7, 0);
            }
        };
    }
    enPassantString = detectEnPassant(draggedPiece, sourceSquare, targetSquare, currentPosition);

    // Update FEN for castling
    let castlingStringAppend = currentPosition.split(' ')[2];
    if (castling == 'K'){
        newFEN = setCharAt(newFEN, 60, 64, '0RK0');
        castlingStringAppend = setCharAt(castlingStringAppend, 0, 2, '--')
    }
    else if (castling == 'Q'){
        newFEN = setCharAt(newFEN, 56, 61, '00RK0');
        castlingStringAppend = setCharAt(castlingStringAppend, 0, 2, '--')
    }
    else if (castling == 'q'){
        newFEN = setCharAt(newFEN, 0, 5, '00kr0');
        castlingStringAppend = setCharAt(castlingStringAppend, 2, 4, '--')
    }
    else if (castling == 'k'){
        newFEN = setCharAt(newFEN, 4, 8, '0rk0');
        castlingStringAppend = setCharAt(castlingStringAppend, 2, 4, '--')
    }
    else {
        // Update FEN for all other moves
        if (draggedPiece.id == 'white-king'){
            castlingStringAppend = setCharAt(castlingStringAppend, 0, 2, '--')
        }
        else if (draggedPiece.id == 'white-rook'){
            if (sourceSquare.id == 'a1'){
                castlingStringAppend = setCharAt(castlingStringAppend, 0, 1, '-')
            }
            else if (sourceSquare.id == 'h1'){
                castlingStringAppend = setCharAt(castlingStringAppend, 1, 2, '-')
            }
        }
        else if (draggedPiece.id == 'black-king'){
            castlingStringAppend = setCharAt(castlingStringAppend, 2, 4, '--')
        }
        else if (draggedPiece.id == 'black-rook'){
            if (sourceSquare.id == 'a8'){
                castlingStringAppend = setCharAt(castlingStringAppend, 2, 3, '-')
            }
            else if (sourceSquare.id == 'h8'){
                castlingStringAppend = setCharAt(castlingStringAppend, 3, 4, '-')
            }
        }
        // Handle pawn promotion
        if ((draggedPiece.id == 'white-pawn') && (targetSquare.code >=0) && (targetSquare.code <= 7)){
            const promotionSquare = document.querySelector('.chess-board');
            let promFile = document.createElement('div')
            promFile.id = 'promotion'
            promFile.classList.add('promotion-file')
            promotionSquare.append(promFile)
            // const promotionSquare = document.getElementById('prom');
        

            // promSquare.id = 'promotionA'
            // promSquare.classList.add('square', 'promotion-square')
            // promotionSquare.append(promSquare)
            // let promotionChoice = document.createElement('promotion');
            // promSquare.classList.add('square', 'promotion-square')
            // promotionChoice.appendChild(promSquare);
            // console.log(promSquare)
            newFEN = setCharAt(newFEN, targetSquare.code, targetSquare.code+1, 'Q')
        }
        else if ((draggedPiece.id == 'black-pawn') && (targetSquare.code >=56) && (targetSquare.code <= 63)){
            newFEN = setCharAt(newFEN, targetSquare.code, targetSquare.code+1, 'q')
        }

        else {
            newFEN = setCharAt(newFEN, targetSquare.code, targetSquare.code+1, newFEN[sourceSquare.code])
        }
        newFEN = setCharAt(newFEN, sourceSquare.code, sourceSquare.code+1, 0)
        const legalDots = document.querySelectorAll('.allowedMovesDot');
        for (let dot of legalDots){
            dot.remove();
        };
        const attackDots = document.querySelectorAll('.attackDot');
        for (let dot of attackDots){
            dot.remove();
        };
    }

    // If the move is a pawn move or capture, set the count for the 50-move rule
    let halfMoveCount = Number(currentPosition.split(' ')[4]);
    if (!pMoveOrCapture){
        halfMoveCount += 1;
    }
    else {
        halfMoveCount = 0;
    }

    // Update current position with the updated FEN
    currentPosition = convertToFEN(newFEN, turnToPlay, moveCounter, castlingStringAppend, enPassantString, halfMoveCount);

    // Find out if the current position has a check, and if yes, give visual feedback
    if (isCheck(currentPosition)){
        let checkSquareCode;
        const extendedFEN = extendFEN(currentPosition);
        if (turnToPlay == 'white'){
            checkSquareCode = extendedFEN.indexOf('k');
        }
        else if (turnToPlay == 'black'){
            checkSquareCode = extendedFEN.indexOf('K');
        }
        else {
            throw new TypeError(`Invalid turnToPlay ${turnToPlay}`);                
        }
        const checkSquare = document.getElementById(squareLookupTable.getByValue(checkSquareCode));
        checkSquare.classList.add('check-square');
    }
    else {
        const checkSquares = document.querySelectorAll('.check-square');
        for (var square of checkSquares){
            square.classList.remove('check-square');
        }

    }

    // Render the new position and add it to the FEN positions dictionary
    renderBoard(currentPosition);
    allFENS.push(currentPosition);

    // Detect checkmate or stalemate
    let checkmate = false;
    let stalemate = false;
    let check = isCheck(currentPosition);
    let allLegalMoves = tabulateLegalMoves(currentPosition);
    let legalMoveCount = [...allLegalMoves.values()].every(value => value.length==0);
    if (legalMoveCount){
        if (check){
            checkmate = true;
        }
        else {
            stalemate = true;
        }
    }
    return [currentPosition, allFENS, capturedPiece, check, checkmate, stalemate]
}

