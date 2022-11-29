export type Message = MoveMessage | PlayAgainMessage;

export type MoveMessage = {
  type: "v" | "h";
  location: [number, number];
  eval?: number;
};

export type PlayAgainMessage = {
  type: "playAgain";
  size: [number, number];
};
