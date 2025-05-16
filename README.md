In this project, I will try to create a chess engine using traditional, non ML methods. My primary resource is the [chess programming website](https://www.chessprogramming.org/Getting_Started). In the first part of the project, I create the frontend using HTML/CSS and scripting in JS.

# To Do:
Queening choice
Material Count
Moves table scroll
Return to board button after end of game

~~Cleaner handling of the end of games (screen that announces the result overlaid on the board, a couple of buttons -- return to board, start new game, etc.?)~~

Fine-tune the arithmetic notation:
    - ~~note captures~~
    - for when multiple pieces can land on the same square
    - unicode symbols for the pieces?
Fix interactivity (dragging a piece should drag its image, show legal moves correctly without needing even clicks)
Undo move
Add different colours for selected light and dark squares?
Check code for redundancies (unncessary execution of functions, etc.)




~~En passant~~
~~Create dictionary to map piece to value, and sort captured pieces by value before displaying~~
~~Tackle the question of legality: find all legal moves~~
~~Pawn attacks (something goes wrong for the a8 and h2 pawns)~~
~~Ignore moves blocked by another pawn/piece~~
~~Implement attack moves for all squares~~
~~Castling:~~
    ~~First implement the move, let's worry about the legality of it to mark the KQkq off.~~
~~King captures and checks~~ ~~(still need to check this thoroughly -- the kind isn't able to move during check)~~
~~Detect checkmate~~
~~3-fold rep~~
~~50-move rule~~
