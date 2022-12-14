interface BoardState {
  vline: number[][];
  hline: number[][];
  claimed: number[][];
  state: "unstarted" | "p1" | "p2" | "over";
  error?: string;
  eval?: number;
}

export default BoardState;
