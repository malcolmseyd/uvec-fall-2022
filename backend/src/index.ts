import express from "express";
import ws from "ws";
import Game from "./game";
import Message from "./message";
import AIMode from "./ai-mode";
import BoardState from "./board-state";
import AIPlayer from "./ai-player";
const app = express();
const port = 3000;

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world! 456");
});

let games: Array<Game> = [];

const wsServer = new ws.Server({
  noServer: true,
  path: "/connect",
});

wsServer.on("connection", (socket) => {
  socket.on("message", async (message) => {
    let msg: Message;
    try {
      msg = JSON.parse(message.toString());
    } catch (e) {
      console.log("unparsable message: \n" + message.toString());
      console.log("error: \n" + e);
      return;
    }
    console.log(msg);

    if (msg.type == "testRandom") {
      let ai: AIPlayer = new AIPlayer();
      ai.aiMode = AIMode.RANDOM;
      let boardState: BoardState = {
        vline: [
          [0, 2, 1],
          [0, 0, 0],
          [1, 2, 0],
        ],
        hline: [
          [0, 2, 1],
          [0, 0, 0],
          [1, 2, 0],
        ],
        claimed: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      };
      // let game: Game = {
      //     players: [ socket, ai ],
      //     boardState,
      //     aiMode: ai.aiMode,
      // }
      let res = await ai.getMove(boardState);
      console.log(res);
    }

    games.forEach((g) => {
      if (g.players[0] == socket) {
        // game already started, calculate next move
        switch (msg.type) {
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
  });
});

// start the Express server
const server = app.listen(port);
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});
