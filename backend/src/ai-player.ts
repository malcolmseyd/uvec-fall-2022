import AIMode from "./ai-mode";
import BoardState from "./board-state";
const modeToUrl: Record<any, any> = {
    "random": "https://mnthomson.gh.srv.us/move",
}

class AIPlayer {
    aiMode: AIMode;

    async getMove(boardState: BoardState) {
        let res = await fetch(modeToUrl[this.aiMode], {
            method: "POST",
            body: JSON.stringify(boardState),
            headers: { 'Content-Type': 'application/json' },
        });
        // console.log(res);
        return await res.text();
    }
}

export default AIPlayer;