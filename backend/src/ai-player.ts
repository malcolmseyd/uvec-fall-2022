import AIMode from "./ai-mode";
import BoardState from "./board-state";
import process from "process";
const modeToUrl: Record<any, any> = {
  random: process.env["AI_URL"] + "/move",
};


class AIPlayer {
  aiMode: AIMode;

  async getMove(boardState: BoardState) {
    let res = await fetch(modeToUrl[this.aiMode], {
      method: "POST",
      body: JSON.stringify(boardState),
      headers: { "Content-Type": "application/json" },
    });
    // console.log(res);
    return await res.text();
  }
}

export default AIPlayer;
