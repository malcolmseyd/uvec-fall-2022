import { WebSocket } from "ws";
import BoardState from "./board-state";
import AIPlayer from "./ai-player";
import AIMode from "./ai-mode";

type Player = {
    type: "player";
    conn: WebSocket;
} | {
    type: "ai";
    conn: AIPlayer;
}

interface Game {
  players: Array<Player>;
  
  boardState: BoardState;
  aiMode?: AIMode;
}

export default Game;
