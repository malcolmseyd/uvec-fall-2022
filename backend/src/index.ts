import express from "express";
import fetch from "node-fetch";
import ws from "ws";
import Game from "./game";
import Message from "./message";
const app = express();
const port = 3000;

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world! 123" );
} );

let games: Array<Game> = [];

function getNextMoveAI(): Message {
    let res = fetch("https://mnthomson.gh.srv.us/move");
    return null;
}

const wsServer = new ws.Server({ 
    noServer: true,
    path: "/connect" 
});

wsServer.on('connection', socket => {
    socket.on('message', message => {
        let msg: Message;
        try {
            msg = JSON.parse(message.toString());
        } catch (e) {
            console.log("unparsable message: \n" + message.toString());
            console.log("error: \n" + e)
            return;
        }
        console.log(msg);

        games.forEach(g => {
            if (g.players[0] == socket) {
                // game already started, calculate next move
                switch(msg.type) {
                    case "playAgain":
                        // send blank board state
                        break;
                    case "v":
                        // update board state, send move to other client
                        break;
                    case "h":
                        // update board state, send move to other client
                        break;
                }

                return;
            }
        });
    })
})

// start the Express server
const server = app.listen(port);
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    })
});