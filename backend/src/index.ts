import express from "express";
import ws, { createWebSocketStream } from "ws";
import Game from "./game";
import { Message, MoveMessage, PlayAgainMessage } from "./message";
import AIMode from "./ai-mode";
import BoardState from "./board-state";
import AIPlayer from "./ai-player";
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

function applyMove(
  boardState: BoardState,
  move: MoveMessage,
  player: number
): boolean {
  let gotSquare = false;
  const [y, x] = move.location;

  let [left, right, upper, lower] = [0, 0, 0, 0];
  switch (move.type) {
    case "v":
      // update board state
      boardState.vline[y][x] = player;

      const maxX = boardState.vline[0].length - 1;
      const minX = 0;

      left = 0;
      if (x > minX && boardState.vline[y][x - 1] != 0) {
        // parallel is to the left
        left = x - 1;

        // we have left and right bounds
        // check upper and lower
        upper = boardState.hline[y][left];
        lower = boardState.hline[y + 1][left];

        if (upper != 0 && lower != 0) {
          // just claimed a square!
          boardState.claimed[y][left] = player;
          console.log(player, "claimed", y, left, boardState.claimed);
          gotSquare = true;
        }
      }
      if (x < maxX && boardState.vline[y][x + 1] != 0) {
        // parallel is to the right
        left = x;

        // we have left and right bounds
        // check upper and lower
        upper = boardState.hline[y][left];
        lower = boardState.hline[y + 1][left];

        if (upper != 0 && lower != 0) {
          // just claimed a square!
          boardState.claimed[y][left] = player;
          console.log(player, "claimed", y, left, boardState.claimed);
          gotSquare = true;
        }
      }
      break;

    case "h":
      // block scope
      // update board state
      boardState.hline[y][x] = player;

      const maxY = boardState.vline.length - 1;
      const minY = 0;

      upper = 0;
      if (y > minY && boardState.vline[y - 1][x] != 0) {
        // parallel is to the top
        upper = y - 1;

        // we have upper and lower bounds
        // check left and rigth
        left = boardState.vline[upper][x];
        right = boardState.vline[upper][x + 1];

        if (left != 0 && right != 0) {
          // just claimed a square!
          boardState.claimed[upper][x] = player;
          console.log(player, "claimed", upper, x, boardState.claimed);
          gotSquare = true;
        }
      }
      if (y < maxY && boardState.vline[y + 1][x] != 0) {
        // parallel is to the bottom
        upper = y;

        // we have upper and lower bounds
        // check left and rigth
        left = boardState.vline[upper][x];
        right = boardState.vline[upper][x + 1];

        if (left != 0 && right != 0) {
          // just claimed a square!
          boardState.claimed[upper][x] = player;
          console.log(player, "claimed", upper, x, boardState.claimed);
          gotSquare = true;
        }
      }
      break;
  }
  if (gotSquare) {
    let unclaimed = false;
    for (let i = 0; i < boardState.claimed.length; i++) {
      for (let j = 0; j < boardState.claimed[i].length; j++) {
        if (boardState.claimed[i][j] == 0) {
          unclaimed = true;
        }
      }
    }
    if (!unclaimed) [(boardState.state = "over")];
  }
  return gotSquare;
}

const wsServer = new ws.Server({
  noServer: true,
  path: "/connect",
});

wsServer.on("connection", (socket) => {
  socket.on("message", async (message) => {
    try {
      let msg: Message;
      try {
        msg = JSON.parse(message.toString());
      } catch (e) {
        console.log("unparsable message: \n" + message.toString());
        console.log("error: \n" + e);
        return;
      }
      console.log("player", msg);

      let connExists = false;
      games.forEach(async (g) => {
        try {
          if (g.players[0].conn == socket) {
            if (g.boardState.state == "over") return; // don't play if game over
            connExists = true;
            let gotSquare = false;
            // game already started, calculate next move
            switch (msg.type) {
              case "playAgain":
                // send blank board state
                console.log("received playagain from same socket");
                const [x,y] = msg.size;
                g.boardState = blankBoardState(x, y);
                break;
              case "v":
                // update board state, send move to other client
                if (validate(g.boardState, msg, "p1")) {
                  gotSquare = applyMove(g.boardState, msg, 1);
                }
                break;
              case "h":
                // update board state, send move to other client
                if (validate(g.boardState, msg, "p1")) {
                  gotSquare = applyMove(g.boardState, msg, 1);
                }
                break;
            }

            if (!gotSquare && g.boardState.state == "p1") {
              g.boardState.state = "p2";
            }
            socket.send(JSON.stringify(g.boardState));
            if (g.boardState.state == "over") return;

            if (!gotSquare) {
              let p2 = g.players[1];
              if (p2.type === "ai") {
                try {
                  do {
                    let ai: AIPlayer = p2.conn;
                    let response = await ai.getMove(g.boardState);
                    let result: MoveMessage = JSON.parse(response);
                    console.log("bot", result);
                    gotSquare = applyMove(g.boardState, result, 2);
                    socket.send(JSON.stringify(g.boardState));
                    if ((g.boardState.state as string) == "over") break;
                  } while (gotSquare);
                } catch (e) {
                  console.log("GOT ERROR", e);
                }
              }

              if (g.boardState.state == "p2") {
                g.boardState.state = "p1";
              }
              socket.send(JSON.stringify(g.boardState));
            }
            return;
          }
        } catch (e) {
          console.log("got exception:", e);
        }
      });

      if (msg.type == "playAgain" && !connExists) {
        let ai: AIPlayer = new AIPlayer();
        ai.aiMode = AIMode.RANDOM;
        const [x,y] = msg.size;
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
          boardState: blankBoardState(x, y),
        };
        games.push(game);
        socket.send(JSON.stringify(blankBoardState(x, y)));
        return;
      }
    } catch (e) {
      console.log("got exception:", e);
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
