import React, { useEffect, useState } from 'react'
import './App.css';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import Square from './Square/Square'
const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]
const App = () => {
  const [winner, setWinner] = useState(false);// stores data of winner
  const [gameState, setgameState] = useState(renderFrom);// stores gameState, various manipulations done to renderForm
  const [currentPlayer, setCurrentPlayer] = useState('circle');// tells us which is the current player, initially it is circle only 
  const [finishedState, setFinishedState] = useState(false);//checks if the game has ended or not
  const [finishedArrayState, setFinishedArrayState] = useState([])// used to mark the the line made by the winner 
  const [playOnline, setplayOnline] = useState(false);// to check if the user is online or not 
  const [socket, setSocket] = useState(null);// 
  const [playerName, setplayerName] = useState('');// set the players name 
  const [opponentName, setopponentName] = useState(null);// setting his opponnents name 
  const [playingAs, setPlayingAs] = useState(null);// setting the sybol as which he is playing 
  const checkWinner = () => {// checking the winner in all cases (rows,cols,diags)
    for (let row = 0; row < gameState.length; row++) {
      if (gameState[row][0] === gameState[row][1] && gameState[row][1] === gameState[row][2]) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);// stores the winner's winning moves
        return gameState[row][0];
      }
    }
    for (let col = 0; col < gameState.length; col++) {
      if (gameState[0][col] === gameState[1][col] && gameState[1][col] === gameState[2][col]) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);// stores the winner's winning moves
        return gameState[0][col];
      }
    }
    if (gameState[0][0] === gameState[1][1] && gameState[1][1] === gameState[2][2]) {// checks for diagonals 
      setFinishedArrayState([0 * 3 + 0, 1 * 3 + 1, 2 * 3 + 2])// stores the winner's winning moves
      return gameState[0][0];
    }
    else if (gameState[0][2] === gameState[1][1] && gameState[1][1] === gameState[2][0]) {// checks for diagonals 
      setFinishedArrayState([0 * 3 + 2, 1 * 3 + 1, 2 * 3 + 0]);// stores the winner's winning moves
      return gameState[0][2];
    }
    // on the previous loops and conditions we have checked for winner and if there is a winner then the control will leave the function 
    // thorugh the return statements provided previously
    // the const isDraw checks if every square is filled or not
    // .flat() flattens out a 2D array according to depth 
    // .every() for each elements of the function it performs a check

    const isDraw = gameState.flat().every(e => {
      if (e === 'circle' || e === 'cross') {
        return true;
      }
    });
    if (isDraw) {
      return 'draw';
    }
  };
  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setWinner(winner);
      setFinishedState(winner);
    }
  }, [gameState]);// this checks if theres is a winner every time a modification 
  // is made to [gameState]



  // we use sweetalert to take in the data required so that it can make a default pop up
  const takePlayerName = async () => {
    const name = await Swal.fire({
      title: "Enter Your Name",
      input: "text",
      inputLabel: "Enter Your Name",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      }
    });
    return name;
  }
  socket?.on("opponentLeftMatch", () => {
    // "disconnect" event is default for each socket
    Swal.fire("Opponent Left");
    setFinishedState('Opponent Left Match');

  });
  socket?.on("connect", function () {
    setplayOnline(true);// if the users is connected to the socket , sets playonline to true
  });

  socket?.on("OpponentNotFound", function () {
    setopponentName(false);// opponnent not found then opponent name is set to false
  });

  socket?.on("OpponentFound", function (data) {
    // on finding an opponent =>
    setPlayingAs(data.playingAs); // sets the users symbol 
    console.log(data.opponentName);
    setopponentName(data.opponentName); // sets opponents name 
  });

  socket?.on("playerMoveFromServer", (data) => {
    // if the playerMoveFrom Server is emitted from server 
    const id = data.state.id;
    setgameState((prevState) => {
      const newState = [...prevState];
      const rowIndex = Math.floor((id) / 3);
      const colIndex = (id) % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    // creates a renderForm for each of the user
    setCurrentPlayer(currentPlayer === 'circle' ? 'cross' : 'circle');
  });

  async function playOnlineClick() {
    const name = await takePlayerName();// takes the player name using the function , check the part where you have use sweetalert
    console.log(name);
    if (!name.isConfirmed) {
      return;
    }
    const username = name.value;
    setplayerName(username);// sets player name 
    // onclicking the button and entering name , we create a new client socket to the server 
    const newSocket = io('http://localhost:3000', {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      // if the socket of the new player is connected and the request to play is emitted from the client side 
      playerName: username,
    });
    setSocket(newSocket);// sets the socket of the user to the variable 'socket'
  }
  if (!playOnline) {
    return <div className="main-div">
      <button onClick={playOnlineClick} className='playOnline'>Play Now</button>
    </div>
  }
  if (playOnline && !opponentName) {
    return <div className='waiting'><p>Waiting For Opponent ...</p></div>
  }
  return (
    <div className='main-div'>
      <div>
        <div className='move-detection'>
          <div className={`left ${currentPlayer === playingAs ? 'current-move-' + currentPlayer : ''}`}>{playerName}</div>
          <div className={`right ${currentPlayer !== playingAs ? 'current-move-' + currentPlayer : ''}`}>{opponentName}</div>
        </div>
        <h1 className='water-background game-heading'>Tic Tac Toe</h1>
        <div className="square-wrapper">
          {
            /*
            here we have 2 nested maps here 
            only then we will get 9 elements,
            the outer map, accounts for the 3 subarrays 
            the inner map accounts for the 3 elements 
            in each subarray
            */
            /* here array.map takes 3 parameters,
           first is the element that is to be worked with 
           second is the index of the element 
           third is the array for which it was called
           so here arr.map((e,index)) signifies 'e' is the element of the array, and 
           'index' is its index within the subarray 
            */
            gameState.map((arr, rowIndex) =>
              arr.map((e, colIndex) => {
                return <Square
                  playingAs={playingAs}
                  gameState={gameState}
                  socket={socket}
                  winner={winner}
                  finishedArrayState={finishedArrayState}
                  setFinishedState={setFinishedState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setgameState={setgameState} id={rowIndex * 3 + colIndex}
                  key={rowIndex * 3 + colIndex}
                  currentElement={e} />

              })
            )}
        </div>
        {!finishedState && opponentName && (
          <h3 className='opp-display'>You are playing against {opponentName}</h3>
        )}
        {
          finishedState && finishedState === 'Opponent Left Match' && (
            <h3 className='opp-left'>Opponent has Left, You Win !</h3>
          )
        }
        <h3 className='winner-display'>{!winner ? '' : winner === 'draw' ? `It's a Draw` : finishedState === playingAs ? "You Won :)" : "You Lost :("}</h3>
      </div>
    </div>
  )
}
export default App
