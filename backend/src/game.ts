import { WebSocket } from "ws";
import AIPlayer from "./ai-player";

interface Game {
    players: Array<WebSocket | AIPlayer>;
    boardState: BoardState;
    aiMode?: AIMode;
}

export default Game;