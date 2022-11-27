import { WebSocket } from "ws";
import BoardState from "./board-state";
import AIPlayer from "./ai-player";
import AIMode from "./ai-mode";

interface Game {
    players: Array<WebSocket | AIPlayer>;
    boardState: BoardState;
    aiMode?: AIMode;
}

export default Game;