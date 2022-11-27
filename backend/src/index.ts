import express from "express";
import ws, { createWebSocketStream } from "ws";
import Game from "./game";
import { Message, MoveMessage, PlayAgainMessage } from "./message";
import AIMode from "./ai-mode";
import BoardState from "./board-state";
import AIPlayer from "./ai-player";
import { syncBuiltinESMExports } from "module";
const app = express();
const port = 3001;
function blank(x: number, y: number) {
  return Array.from({ length: x }, () => Array.from({ length: y }, () => 0));
}

function blankBoardState(x: number, y: number): BoardState {
  return {
    vline: blank(y - 1, x),
    hline: blank(y, x - 1),
    claimed: blank(y - 1, x - 1),
    state: "p1",
  };
}

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world! 456");
});

let games: Array<Game> = [];

function validate(
  boardState: BoardState,
  move: MoveMessage,
  player: string
): boolean {
  if (boardState.state === player) {
    switch (move.type) {
      case "v":
        if (boardState.vline[move.location[0]][move.location[1]] == 0) {
          return true;
        }
        break;
      case "h":
        if (boardState.hline[move.location[0]][move.location[1]] == 0) {
          return true;
        }
    }
  }
  return false;
}

function applyMove(boardState: BoardState, move: MoveMessage, player: number) {
  const [y, x] = move.location;
  switch (move.type) {
    case "v":
      // update board state, send move to other client
      boardState.vline[y][x] = player;

      const maxX = boardState.vline[0].length - 1;
      const minX = 0;

      let hasParallel: "up" | "down" = "up";
      if (x > minX && boardState.vline[y][x - 1] != 0) {
        hasParallel = "up";
      } else if (x < maxX && boardState.vline[y][x + 1] != 0) {
        hasParallel = "down";
      } else {
        break;
      }

      // if (hasParallel == "up") {
      //   // we know x and x-1 are claimed
      //   // check x-1,y and x-1,y+1
      //   if (boardState[vlin])
      // } else {
      //   // we know x and x+1 are claimed

      // }

      break;

    case "h":
      // update board state, send move to other client
      boardState.hline[y][x] = player;
      break;
    default:
      throw Error;
  }
}

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

    let connExists = false;
    games.forEach(async (g) => {
      if (g.players[0].conn == socket) {
        connExists = true;
        // game already started, calculate next move
        switch (msg.type) {
          case "playAgain":
            // send blank board state
            console.log("received playagain from same socket");
            g.boardState = blankBoardState(4, 4);
            break;
          case "v":
            // update board state, send move to other client
            if (validate(g.boardState, msg, "p1")) {
              applyMove(g.boardState, msg, 1);
            }
            break;
          case "h":
            // update board state, send move to other client
            if (validate(g.boardState, msg, "p1")) {
              applyMove(g.boardState, msg, 1);
            }
            break;
        }

        g.boardState.state = "p2";
        socket.send(JSON.stringify(g.boardState));

        let p2 = g.players[1];
        if (p2.type === "ai") {
          let ai: AIPlayer = p2.conn;
          let response = await ai.getMove(g.boardState);
          let result: MoveMessage = JSON.parse(response);
          applyMove(g.boardState, result, 2);
        }

        g.boardState.state = "p1";
        socket.send(JSON.stringify(g.boardState));
        return;
      }
    });

    if (msg.type == "playAgain" && !connExists) {
      let ai: AIPlayer = new AIPlayer();
      ai.aiMode = AIMode.RANDOM;
      let game: Game = {
        players: [
          {
            type: "player",
            conn: socket,
          },
          {
            type: "ai",
            conn: ai,
          },
        ],
        boardState: blankBoardState(4, 4),
      };
      games.push(game);
      socket.send(JSON.stringify(blankBoardState(4, 4)));
      return;
    }
  });
});

// start the Express server
const server = app.listen(port);
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});
console.log("SERVER IS UP");
