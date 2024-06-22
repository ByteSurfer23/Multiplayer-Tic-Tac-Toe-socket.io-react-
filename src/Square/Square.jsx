import React, { useState } from 'react'
import './Square.css'

const circleSvg = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
            {" "}
            <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>{" "}
        </g>
    </svg>
);

const crossSvg = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
            {" "}
            <path
                d="M19 5L5 19M5.00001 5L19 19"
                stroke="#fff"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>{" "}
        </g>
    </svg>
);

const Square = ({ playingAs, currentElement, gameState, socket, winner, finishedArrayState, setFinishedState, finishedState, setgameState, id, currentPlayer, setCurrentPlayer, key }) => {
    const [icon, setIcon] = useState(null);// for each square the state of icon is present , this displays the icon on each square 
    const clickOnsquare = () => {
        if (playingAs !== currentPlayer) {
            return;
        }
        if (finishedState) {
            return;
        }
        if (!icon) {
            if (currentPlayer === 'circle') {
                setIcon(circleSvg);// if player is circle it sets the svg to circle
            }
            else {
                setIcon(crossSvg);// if player is cross then it sets it to cross svg 
            }
        }
        const myCurrentPlayer = currentPlayer;// here the socket is passed to each square in the client side of both the players
        // if the socket of any user's client side emits this then the object called state is sent to server 
        socket.emit("playerMoveFromClient", {
            state: {
                id,
                sign: myCurrentPlayer,
            },
        });
        setCurrentPlayer(currentPlayer === 'circle' ? 'cross' : 'circle');
        console.log(currentPlayer);// changes the current player on each click, as the function is called on each click
        setgameState(prevState => {
            const newState = [...prevState];// previous state that is obtained here 
            const rowIndex = Math.floor(id / 3);
            const colIndex = id % 3;
            /*here setgameState passes an object that is the renderForm, 
            which is altered as per moves */
            newState[rowIndex][colIndex] = myCurrentPlayer;// marks the given position at the arrays for currentPlayer which is either circle or cross
            return newState;
        })

    }
    return (
        <div onClick={clickOnsquare} className={`square ${finishedState ? 'not-allowed' : ''} ${finishedArrayState.includes(id) ? winner + '-won' : ''} ${currentPlayer !== playingAs ? "not-allowed" : ""} ${finishedState && finishedState !== playingAs ? "grey-background" : ""}`}>{currentElement === "circle" ? circleSvg : currentElement === "cross" ? crossSvg : icon}</div>
    )
}

export default Square