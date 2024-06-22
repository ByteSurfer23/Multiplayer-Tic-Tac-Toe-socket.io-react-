// lines 2 to 7 is default code used to create the server to which all the sockets connect 
const { createServer } = require("http");
const { Server } = require('socket.io');
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: 'http://localhost:5173/',
});
const allUsers = {};
const allRooms = [];
io.on("connection", (socket) => {
    allUsers[socket.id] = {
        socket: socket,
        online: true,
    }// here the allUsers acts as a dictionary where the allUsers 
    // is the dictionary and the socket.id is the key of the dictionary and the 
    // data the key holds is the object that has been passed to it 



    socket.on("request_to_play", (data) => {// when request_to_play is emitted from client and found by server the following happens 
        const currentUser = allUsers[socket.id];// puts current user into the dictonary like array 
        currentUser.playerName = data.playerName;// sets the player name of the user who is requesting 

        // user.online and user.playing are parameters that we set to the connection made to the server
        let opponentPlayer;
        // here the loop loops through the keys of the dictionary 
        for (const key in allUsers) {
            const user = allUsers[key];
            if (user.online && !user.playing && socket.id !== key) {
                opponentPlayer = user;// here the player that is online , not playing and whose key (the users socket's id != currentusers id), is selected as opponent 
                currentUser.playing = true;
                opponentPlayer.playing = true; // setting both the opponents and current user as playing : true 
                break;
            }
        }
        if (opponentPlayer) {
            // both currentuser and opponentPlayer are both the objects that have a socket att that stores sock and conn deets 
            // and an online att 
            allRooms.push({
                player1: currentUser,
                player2: opponentPlayer
            });
            // if opponent is found the this happens
            opponentPlayer.socket.emit("OpponentFound", {
                // if opp socket emit Opponentfound then for the opponents client side it sends the currentUser's name as the opp's opp
                // also sends opp his symbol
                opponentName: currentUser.playerName,
                playingAs: "cross"
            });
            currentUser.socket.emit("OpponentFound", {
                // if curr users socket emits opp found then sets the curr users opp name and users symbol
                opponentName: opponentPlayer.playerName,
                playingAs: "circle"
            });
            currentUser.socket.on("playerMoveFromClient", (data) => {
                console.log(data);
                // if a move from the currentuser is identified in the client side of curr user then 
                // the server emits move made by the client as data and emits under the headin playerMovefromServer 
                // // the emitted headin is caught by the opp's client side and s rendered there 
                opponentPlayer.socket.emit("playerMoveFromServer", {
                    ...data,
                });
            });
            opponentPlayer.socket.on("playerMoveFromClient", (data) => {
                // if a move from the opp is identified in the client side of opp then 
                // the server emits move made by the opp as data and emits under the headin playerMovefromServer 
                // // the emitted headin is caught by the curr user  client side and s rendered there 
                console.log(data);
                currentUser.socket.emit("playerMoveFromServer", {
                    ...data,
                })
            });
        }
        else {
            currentUser.socket.emit("OpponentNotFound");
        }
    });

    socket.on("disconnect", function () {
        // "disconnect" event is default for each socket 
        // on disconnecting sets the online property of the user to be false
        const currentUser = allUsers[socket.id];// which ever sock that emits, its user is found using the id of the sock 
        // since we now know that of both users one of the user's sock has emitted disconnect 
        // there for we set the current users props to false 
        currentUser.online = false;
        currentUser.playing = false;
        for (let index = 0; index < allRooms.length; index++) {
            const { player1, player2 } = allRooms[index];
            if (player1.socket.id === socket.id) {
                // which ever sock that emits the "disconnect" if that socks id is the same as any player socks id then it emits opp left match from that sock
                player2.socket.emit("opponentLeftMatch");
                break;
            }
            if (player2.socket.id === socket.id) {
                // which ever sock that emits the "disconnect" if that socks id is the same as any player socks id then it emits opp left match from that sock
                player1.socket.emit("opponentLeftMatch");
                break;
            }
        }
    });
});
httpServer.listen(3000);// making the server listen at 3000 














