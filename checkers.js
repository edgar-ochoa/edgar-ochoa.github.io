// Initial board game configuration
// -1 is a square that is not available
// 0 is a a square that does not currently have a piece
// Any number above 0 is the piece number that occupies that space

let board = [
    [1,-1,9,-1,0,-1,17,-1],
    [-1,5,-1,0,-1,13,-1,21],
    [2,-1,10,-1,0,-1,18,-1],
    [-1,6,-1,0,-1,14,-1,22],
    [3,-1,11,-1,0,-1,19,-1],
    [-1,7,-1,0,-1,15,-1,23],
    [4,-1,12,-1,0,-1,20,-1],
    [-1,8,-1,0,-1,16,-1,24]
]

// global variables
let positionDict = {}; // holds the piece name as key, the position as the value
let winner = null; // no winner to begin with
let player1piece = null; // holds the player 1 piece ID
let player2piece = null; // holds the player 2 piece ID
let turn = 1; // keep track of which turn it is
let player1alive = true; // players start out as both alive
let player2alive = true; // players start out as both alive


// returns true if a player has won, false if not
function hasWon(){
    // no player can have won if there are more than 12 pieces left
    if(positionDict.length > 12 ){
        winner = null;
        console.log("DID NOT WIN")
        return false;
    }

    player1alive = false;
    player2alive = false;
    // iterate over keys to find pieces for each player
    let keys = Object.keys(positionDict);
    keys.forEach(key => {
        // if pieces less than 13 than player 1 is still alive
        if(parseInt(key) < 13){
            player1alive = true;
        }
        // if found pieces more than 12 than player 2 is still alive
        if(parseInt(key) >=13){
            player2alive = true;
        }
    });

    // no one has won if both players are alive
    if(player1alive && player2alive) {
        console.log("DID NOT WIN");
        return false;
    }
    // otherwise one of the players must be alive for a WIN to happen
    if(player1alive || player2alive){
        if(player1alive){
            winner = 1;
        }
        if (player2alive){
            winner = 2;
        }
        console.log("PLAYER WON!")
        return true;
    } 
}


// Update a board matrix index
function updateBoard(rowPos,colPos,newValue){
    board[rowPos][colPos] = newValue;
    return;
}


// Takes a integer and returns a board piece
function createPieceDiv(idNumber) {
    // create element and set the ID on it, add class
    const pieceDiv = document.createElement('div');
    pieceDiv.classList.add('piece');
    pieceDiv.id = idNumber;
   
    // add an event listener to the piece div
    pieceDiv.addEventListener('click', function(event){
        // on click the piece should be selected
        selectNewPiece(event.target.id)
    });
    return pieceDiv;
}


// takes the ID for the piece selected and the new square location ID
function move(selectedPieceId, newSquareID){
    let coordinates = newSquareID.split(",");
    let newX = parseInt(coordinates[0]);
    let newY = parseInt(coordinates[1]);
    let oldPos = positionDict[selectedPieceId];
    let oldX = oldPos[0];
    let oldY = oldPos[1];

    //let newSquareValue = board[x][y];
    if(isSquareAvailable(newX,newY) && isSquareWithinReach(newX,newY)){
        let oldVal = board[oldX][oldY];
        board[oldX][oldY] = 0;
        board[newX][newY] = oldVal;

        // find elements
        let piece = document.getElementById(selectedPieceId);
        let square = document.getElementById(newSquareID);
        // move the elements
        square.appendChild(piece);
        positionDict[selectedPieceId] = [newX,newY]; // udpate postionDict
        console.log(positionDict);
        console.log(board);
        endTurn();
    }
    return;
}

// checks if a move is valid
function isSquareWithinReach(newSquareX,newSquareY){
    newSquareX = parseInt(newSquareX);
    newSquareY = parseInt(newSquareY);
    console.log("entered isSquareWithinReach")
    console.log("newSquareX: "+newSquareX + " newSquareY: "+newSquareY)

    // track player piece
    let playerPiece = null;
    if(turn==1) {playerPiece = player1piece;}
    if(turn==2) {playerPiece = player2piece;}

    // get the piece's location
    let position = positionDict[playerPiece];
    let oldX = parseInt(position[0]);
    let oldY = parseInt(position[1]);

    // calculate movement
    let xTransfer = newSquareX - oldX;
    let yTransfer = newSquareY - oldY;

    // determine if movement is valid
    if(Math.abs(xTransfer) != Math.abs(yTransfer) ){
        console.log("Must move in a diagonal")
        return false;
    }
    if( Math.abs(xTransfer) > 2 && Math.abs(yTransfer) > 2) {
        console.log("It is too far, more than 2 spaces away")
        return false;
    }
    if( Math.abs(xTransfer) == 1 && Math.abs(yTransfer) == 1){
        if(board[newSquareX][newSquareY] != 0) { // make sure there is no piece located there
            return false;
        }
    }
    if( Math.abs(xTransfer) == 2 && Math.abs(yTransfer) == 2 ){
        // check if there is a piece in the space in between
        let middleX = (newSquareX + oldX) / 2;
        let middleY = (newSquareY + oldY) / 2;

        if(board[middleX][middleY] == 0 ){ // no piece in the middle tile
            console.log("there is no piece to jump over")
            return false;
        } else {
            let pieceId = board[middleX][middleY];
            removePiece(pieceId);
        }
    }
    return true;
}


// remove a piece from board, positionDict, and DOM
function removePiece (pieceID) {
    let pos = positionDict[pieceID];
    let x = parseInt(pos[0]);
    let y = parseInt(pos[1]);

    // remove the piece from the board matrix
    board[x][y] = 0; 

    // remove piece from position index
    positionDict[pieceID] = null; 

    // remove the element from UI
    let pieceElement = document.getElementById(pieceID);
    pieceElement.remove();

    // remove the piece from positionDict
    delete positionDict[pieceID];
}


// Returns true if the location is available to move into, false otherwise
function isSquareAvailable(row,col){
    row = parseInt(row);
    col = parseInt(col);
    if(board[row][col] == 0 ){return true};
    return false;
}

// Select a piece, including adding css selectors
function selectNewPiece(pieceID){
    // get the pieces position and value
    let position = positionDict[pieceID];
    let r = position[0];
    let c = position[1];
    let value = board[r][c];

    // if player 1
    if(turn==1 && board[r][c] <13){
        // set player's pieces
        player1piece = pieceID;
        player2piece = null;

        // remove selected css attributes
        let allPieces = document.getElementsByClassName("selected");
        if(allPieces.length > 0){
            console.log("There are "+allPieces.length+ " selected items")
            for(let i = 0; i < allPieces.length; i++)
                {allPieces[i].classList.remove('selected');}
        }
    
        // fine the newly selected piece and add the selected class to it
        let selectedPiece = document.getElementById(pieceID);
        selectedPiece.classList.add('selected');
        
    // if player 2
    }else if(turn==2 && value >=13){
        // set player's pieces
        player2piece = pieceID;
        player1piece =  null;

        // remove selected css attributes
        let allPieces = document.getElementsByClassName("selected");
        if(allPieces.length > 0){
            console.log("There are "+allPieces.length+ " selected items")
            for(let i = 0; i < allPieces.length; i++)
                {allPieces[i].classList.remove('selected');}
        }
    
        // find the newly selected piece and add the selected class to it
        let selectedPiece = document.getElementById(pieceID);
        selectedPiece.classList.add('selected');
    }
}



// Assigns the turn to the other player and changes the turn label
function endTurn() {
    if(turn==1) turn = 2;
    else{turn=1}

    let turnLabel = document.getElementById('turnLabel');
    if(hasWon()){
        turnLabel.innerHTML = "Player " + winner + " wins!";
    }else{
        turnLabel.innerHTML = "Player " + turn;
    }
}


// creates the square div for the individual tiles
function createSquareDiv () {
    // create the element
    const theDiv = document.createElement('div');

    // add an event listener
    theDiv.addEventListener('click',function(event){
        if(player1piece != null ){
            move(player1piece,event.target.id);
        }else if(player2piece != null){
            move(player2piece,event.target.id);
        }
    });
    // add the css selector class for squares
    theDiv.classList.add('square');
    return theDiv;
};


// creates a row that holds 8 square divs
function createRowDiv(rowIndex) {
    // create element and assign ID and class
    const rowDiv = document.createElement('div');
    rowDiv.id = `row ${rowIndex}`;
    rowDiv.classList.add('rowDiv');
    return rowDiv;
}


// creates the div that holds the board
function createBoardDiv (){
    // create the element and assing an ID and class
    const boardDiv = document.createElement('div');
    boardDiv.classList.add('board');
    boardDiv.id = 'board';
    return boardDiv;
}


// creates the turn label div
function createTurnLabel(){
    // create element and assign ID, class, and inner HTML
    let turnLabel = document.createElement('div');
    turnLabel.classList.add('turnLabel');
    turnLabel.id = 'turnLabel';
    turnLabel.innerHTML = `Player ${turn}`;
    return turnLabel;
}


// updates the turn label's inner html
function updateTurnLabel(player){
    let turnLabel = document.getElementById("turnLabel");
    turnLabel.innerHTML = "Player "+turn;
}


// creates the board UI using the board matrix
function assembleBoard(){
    // 
    const boardDiv = createBoardDiv();
    // iterate to create the rows
    for(let r = 0; r < board.length; r++){
        const rowDiv = createRowDiv(r);
        boardDiv.appendChild(rowDiv);
        // iterate to create the column/tile and append to row
        for(let c = 0; c < board[r].length; c++){
            const current = board[r][c];
            const squareDiv = createSquareDiv();
            squareDiv.id =`${r},${c}`;

            // dark color for active tiles, light for dead tiles
            if(current == -1){
                squareDiv.classList.add("lightColoredTile");
            }else{
                squareDiv.classList.add("darkColoredTile");
            } 

            // if the number > 0 it is a piece on the board   
            if(current > 0) {
                pieceName = board[r][c];
                const piece = createPieceDiv(pieceName);
                
                // a piece less than 13 is for player 1
                if(current <13 ){
                    piece.classList.add("player1");
                    positionDict[pieceName] = [r,c];
                // else its for player 2
                }else{
                    piece.classList.add("player2"); 
                    positionDict[pieceName] = [r,c];
                }
                // append the piece to the square
                squareDiv.appendChild(piece);
            }
            // append the square to the row
            rowDiv.appendChild(squareDiv);
        }
    } 
    return boardDiv;
};

// append the turn label and board to the html
function appendBoardToHTML () {
    const main = document.getElementById('main');
    main.appendChild(createTurnLabel());
    main.appendChild(assembleBoard());
}

// function for call from html file
function start(){
    appendBoardToHTML();
}

