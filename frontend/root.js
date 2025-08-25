import { renderBoard, squareLookupTable, findLegalMoves } from './functions.js'
import { makeMove } from './moves.js';
import { genMoveEntry, checkThreeFoldRep, pieceToUnicode, pieceSortOrder, pieceNameToValue } from './helpers.js'

// Initialise global variables
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Initial board position
// const INITIAL_FEN = 'rnbqkbnr/ppppp11p/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1'; // Initial board position

var currentPosition = INITIAL_FEN;
var turnToPlay;
var draggedPiece = null;
var sourceSquare = null;
var moveDictionary = {};
var moveCounter = 1;
var allFENS = [INITIAL_FEN];
var checkmate = false;
var stalemate = false;
var check = false; 

// Remove all existing visual elements for selected piece and legal moves
function removeSquareVisuals(){
    // Clicked squares
    const clickedSquares = document.querySelectorAll('.selected-square');
    for (let cSquare of clickedSquares){
        cSquare.classList.remove('selected-square');
    }
    // Destination squares
    const destSquares = document.querySelectorAll('.dest-square');
    for (let square of destSquares){
        square.classList.remove('dest-square');
    }
    // Legal moves dots
    const legalDots = document.querySelectorAll('.allowedMovesDot');
    for (let dot of legalDots){
        dot.remove();
    };
    // Attack moves dots
    const attackDots = document.querySelectorAll('.attackDot');
    for (let dot of attackDots){
        dot.remove();
    };
}


// Handles the behaviour upon clicking a square
function selectSquare(event) {
    let clickedPiece = event.target;
    let allMoves;
    if (turnToPlay == clickedPiece.id.split('-')[0]){
        if (document.querySelectorAll('.selected-square').length > 0){
            removeSquareVisuals();
        }
        clickedPiece.classList.add('selected-square');
        event.currentTarget.classList.add('selected-square');
        let square = event.target.parentElement;
        let [legalMoves, attackMoves, enPassantMoves] = findLegalMoves(clickedPiece.id, square, currentPosition);
        allMoves = (legalMoves.concat(attackMoves)).concat(enPassantMoves);

        // Highlight all legal moves
        for (let move of allMoves){
            let squareID = squareLookupTable.valueToKey[move];
            let targetSquare = document.getElementById(`${squareID}`);
            let legalDot = document.createElement('span');
            targetSquare.classList.add('dest-square');
            if (attackMoves.includes(move)){
                legalDot.classList.add('attackDot');
            }
            else {
                legalDot.classList.add('allowedMovesDot');
            }
            targetSquare.appendChild(legalDot);
        };
    }
    else {
        removeSquareVisuals();
    };

    return [clickedPiece, allMoves];
}

// Set up the drag and drop interface
function playAgainstHuman(movesTable){    
    let whiteMove = '';
    let blackMove = '';
    let lastMove = '';
    // let undoButton = document.getElementById('undo');
    // if (undoButton){
    //     undoButton.addEventListener('click', undoMove);
    // }
    
    let whitePlayerBox = document.getElementById('playerBoxWhite');
    let blackPlayerBox = document.getElementById('playerBoxBlack');

    // Fetch capture boxes
    let capturedByWhite = [];  // Keep track of pieces captured by white
    let capturedByBlack = [];  // Keep track of pieces captured by black
    let capturedPiece;
    let pieceScore;

    document.querySelectorAll('.square').forEach(square => {
        // When clicking a square / dragging a piece
        square.addEventListener('click', (event) => {

            if (event.currentTarget.classList.contains('dest-square')){
                let moveElements = document.querySelectorAll('.selected-square');
                sourceSquare = moveElements[0];
                draggedPiece = moveElements[1];
                dropPiece(event, whiteMove, blackMove, lastMove, whitePlayerBox, blackPlayerBox, capturedByWhite, capturedByBlack, capturedPiece, pieceScore, movesTable);
            }
            else {
                selectSquare(event);
            }
        });

        square.addEventListener('mousedown', function(e) {
            const pieceElement = square.querySelector('.piece');
            if (pieceElement){
                if (pieceElement.colour == turnToPlay) {
                    draggedPiece = pieceElement;
                    sourceSquare = square;
                    pieceElement.style.opacity = '0.75'; // Visual feedback
                    e.preventDefault(); // Prevent default drag image
                }
            }
        });

        // When a piece is dropped on a square
        square.addEventListener('mouseup', (event) => {
            dropPiece(event, whiteMove, blackMove, lastMove, whitePlayerBox, blackPlayerBox, capturedByWhite, capturedByBlack, capturedPiece, pieceScore, movesTable);
        });
    });
}

function dropPiece(event, whiteMove, blackMove, lastMove, whitePlayerBox, blackPlayerBox, capturedByWhite, capturedByBlack, capturedPiece, pieceScore, movesTable) {
    let square = event.currentTarget;
    let castling = '';
    if (draggedPiece && sourceSquare) {
        let targetSquare = square;
        let [legalMoves, attackMoves, enPassantMoves] = findLegalMoves(draggedPiece.id, sourceSquare, currentPosition);
        let allMoves = legalMoves.concat(attackMoves).concat(enPassantMoves);
        if (allMoves.includes(targetSquare.code)){
                if (draggedPiece.id == 'white-king'){
                    if (sourceSquare.code == 60 && targetSquare.code == 62){
                        castling = 'K';
                    }
                    else if (sourceSquare.code == 60 && targetSquare.code == 58){
                        castling = 'Q';
                    }
                }
                else if (draggedPiece.id == 'black-king'){
                    if (sourceSquare.code == 4 && targetSquare.code == 6){
                        castling = 'k';
                    }
                    else if (sourceSquare.code == 4 && targetSquare.code == 2){
                        castling = 'q';
                    } 
                }
                lastMove = genMoveEntry(draggedPiece, sourceSquare, targetSquare, castling, currentPosition);
                [currentPosition, allFENS, capturedPiece, check, checkmate, stalemate] = makeMove(draggedPiece, sourceSquare, targetSquare, castling, currentPosition, moveCounter, turnToPlay, allFENS);

                // If a piece is captured, add piece to the indicator for captured pieces
                if (capturedPiece){

                    // Find the numerical value of the captured piece and add it to pieceCount
                    // console.log(capturedPiece, pieceNameToValue(capturedPiece))
                    // console.log()

                    if (capturedPiece.split('-')[0] == 'black'){
                        let capturedPieceCodes = [];
                        capturedByWhite.push(capturedPiece.split('-')[1]);
                        capturedByWhite = capturedByWhite.sort((a, b) => {return pieceSortOrder.indexOf(a) - pieceSortOrder.indexOf(b)})
                        for (let piece of capturedByWhite){
                            capturedPieceCodes.push(pieceToUnicode(`black-${piece}`));
                        }
                    }
                    else {
                        let capturedPieceCodes = [];
                        capturedByBlack.push(capturedPiece.split('-')[1]);
                        capturedByBlack = capturedByBlack.sort((a, b) => {return pieceSortOrder.indexOf(a) - pieceSortOrder.indexOf(b)})
                        for (let piece of capturedByBlack){
                            capturedPieceCodes.push(pieceToUnicode(`white-${piece}`));
                        }
                    }

                }

                // End the game if checkmate/stalemate occurs on the board
                if (checkmate){
                    let endMethod = 'checkmate'
                    endGame(turnToPlay, targetSquare, endMethod);
                    lastMove += '#';
                }
                else if (stalemate){
                    let endMethod = 'stalemate';
                    endGame(turnToPlay, targetSquare, endMethod);
                }
                else if (check){
                    lastMove += '+';
                }
                if (turnToPlay == 'white'){
                    // Find active dot and add to black player box
                    let activePlayerDot = whitePlayerBox.children[0];
                    blackPlayerBox.appendChild(activePlayerDot);

                    let row = movesTable.insertRow();
                    let whiteCell = row.insertCell();
                    whiteMove = `${targetSquare.id}`
                    turnToPlay = 'black';
                    whiteCell.textContent = `${moveCounter}. ${lastMove}`;
                    row.appendChild(whiteCell);
                }
                else if (turnToPlay == 'black'){
                    // Find active dot and add to white player box
                    let activePlayerDot = blackPlayerBox.children[0];
                    whitePlayerBox.appendChild(activePlayerDot);

                    let blackCell = movesTable.rows[movesTable.rows.length - 1].insertCell();
                    blackCell.textContent = `${lastMove}`;
                    blackMove = `${targetSquare.id}`
                    turnToPlay = 'white';
                    moveCounter++;

                };
                moveDictionary[moveCounter] = `${whiteMove} ${blackMove}`;
            }
            // Reset drag state
            draggedPiece.style.opacity = '1';
            blackMove = '';
            draggedPiece = null;
            sourceSquare = null;         

            // Check three-fold repetition
            if (checkThreeFoldRep(allFENS)){
                endGame(turnToPlay, targetSquare, 'three-fold repetition');
            }

            // Check the 50-move rule
            if (Number(currentPosition.split(' ')[4]) == 50){
                endGame(turnToPlay, targetSquare, 'the 50-move rule');
            }
            // Remove all visual elements (i.e. attack/move highlights) at the end of each move
            removeSquareVisuals();
    };
};

// Starts a new game
export function startNewGame() {
    // Initialise the move counter and board position
    moveCounter = 1;
    currentPosition = INITIAL_FEN;
    if (INITIAL_FEN.split(' ')[1] == 'w'){
        turnToPlay = 'white';
    }
    else {
        turnToPlay = 'black';
    };

    // Clear any check squares
    const checkSquares = document.querySelectorAll('.check-square');
    for (let square of checkSquares){
        square.classList.remove('check-square');
    }

    // Clear any visuals from squares (destination square, attacked square, legal moves dot)
    removeSquareVisuals();


    // Remove the result overlay
    const resultBox = document.querySelector('.resultOverlay');
    if (resultBox){
        resultBox.remove();
    };

    // Reset the dictionary containing all board positions in the game
    allFENS = [INITIAL_FEN];

    // Render initial board
    renderBoard(INITIAL_FEN);

    // Initialise table to keep track of moves
    let movesTable = document.getElementById('moves-table').getElementsByTagName('tbody')[0];
    movesTable.classList.add('moves-table');
    movesTable.innerText = '';

    // // Initialise text in result box
    // let resultBox = document.getElementById('gameResult');
    // resultBox.innerText = 'Welcome to Shatranj!'

    // Initialise the interface to play against a human
    playAgainstHuman(movesTable);
    
    // Create active move dot for white
    let oldDots = document.querySelectorAll('.active-player-dot');
    for (let dot of oldDots){
        dot.parentNode.removeChild(dot);
    }
    let activePlayerDot = document.createElement('span');
    let whitePlayerBox = document.getElementById('playerBoxWhite');
    activePlayerDot.classList.add('dot', 'active-player-dot');
    whitePlayerBox.appendChild(activePlayerDot);
}

function undoMove() {
    // Add Undo Functionality
}

function endGame(winnerColour, moveSquare, endMethod){
    winnerColour = winnerColour.replace(winnerColour[0], winnerColour[0].toUpperCase())
    const chessBoard = document.querySelector('.chess-board');
    const endGameBox = document.createElement('div');
    endGameBox.classList.add('resultOverlay');
    endGameBox.textContent = 'test';

    if (endMethod == 'checkmate'){
        if (winnerColour.toLowerCase() == 'white'){
            endGameBox.innerText = `1-0\n${winnerColour} won by checkmate on ${moveSquare.id}!`;
        }
        else {
            endGameBox.innerText = `0-1\n${winnerColour} won by checkmate on ${moveSquare.id}!`;
        }
    }
    else {
        endGameBox.innerText = `0.5-0.5\n Draw by ${endMethod}!`;

    }

    document.body.appendChild(endGameBox);
    chessBoard.appendChild(endGameBox);

    // Button for new game
    let newButton = document.createElement('button');
    newButton.classList.add('overlayNewGameButton');
    newButton.addEventListener('click', startNewGame);
    newButton.innerHTML = 'New Game';
    endGameBox.appendChild(newButton);
} 

document.addEventListener('DOMContentLoaded', function() {
    let newButton = document.getElementById('newGame');
    if (newButton){
        newButton.addEventListener('click', startNewGame);
    }
});