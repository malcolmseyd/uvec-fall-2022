import fetch from "node-fetch";

const modeToUrl: Record<any, any> = {
    "AIMode.RANDOM": "https://mnthomson.gh.srv.us/move"
}

class AIPlayer {
    aiMode: AIMode;

    async getMove(boardState: BoardState) {
        let res = await fetch(modeToUrl[this.aiMode], {
            method: "POST",
            body: JSON.stringify(boardState),
            headers: { 'Content-Type': 'application/json' },
        });
        console.log(res);
        return res;
    }
}

export default AIPlayer;