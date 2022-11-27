import { type } from "os";
import { useEffect, useState } from "react";

function arr<T>(cols: number, init: (col: number) => T): T[] {
  return Array.from({ length: cols }, (_, col) => init(col));
}

function matrix<T>(
  cols: number,
  rows: number,
  init: (col: number, row: number) => T
): T[][] {
  return arr(cols, (col) => arr(rows, (row) => init(col, row)));
}

const DOT_SIZE = 20;
const LINE_SIZE = 100;

type LineLocation = {
  type: "h" | "v";
  location: [number, number];
};
function coordsToLine(col: number, row: number): LineLocation {
  return row % 2 == 0 && col % 2 == 1
    ? {
        type: "h",
        location: [Math.floor(row / 2), Math.floor((col - 1) / 2)],
      }
    : {
        type: "v",
        location: [Math.floor((row - 1) / 2), Math.floor(col / 2)],
      };
}

type CellProps = { col: number; row: number } & State;
function Cell({ col, row, vline, hline, ws }: CellProps) {
  const type =
    col % 2 == 0 && row % 2 == 0
      ? "dot"
      : col % 2 == 0 || row % 2 == 0
      ? "line"
      : "square";

  // const owner: number = 0;
  // console.log({ col, row });
  const {
    type: lineDir,
    location: [lineY, lineX],
  } = coordsToLine(col, row);
  const owner =
    type != "line"
      ? 0
      : lineDir == "h"
      ? hline[lineY][lineX]
      : vline[lineY][lineX];

  const width = col % 2 == 0 ? DOT_SIZE : LINE_SIZE;
  const height = row % 2 == 0 ? DOT_SIZE : LINE_SIZE;

  const [hover, setHover] = useState(false);

  const color =
    owner == 1
      ? "red"
      : owner == 2
      ? "blue"
      : type == "dot"
      ? "black"
      : type == "line" && hover
      ? "lightgrey"
      : "white";

  return (
    <td
      key={[row, col].toString()}
      style={{
        border: "0px black solid",
        backgroundColor: color,
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onClick={() => {
        if (type != "line" || ws == undefined || ws.readyState != ws.OPEN)
          return;
        const move = coordsToLine(col, row);
        console.log("sending message", move);
        const data = JSON.stringify(move);
        console.log("ws", ws);
        ws.send(data);
      }}
    >
      <img src="./s.gif" height={height} width={width}></img>
    </td>
  );
}

type GridProps = State;
function Grid(props: GridProps) {
  const { hline, vline } = props;
  const N = hline.length;

  console.log("hline", hline);
  console.log("vline", vline);

  return (
    <table cellPadding={0} cellSpacing={0} border={0}>
      <tbody>
        {arr(2 * vline.length + 1, (row) => (
          <tr>
            {arr(2 * hline[0].length + 1, (col) => (
              <Cell {...{ ...{ col, row }, ...props }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type GameState = {
  vline: number[][];
  hline: number[][];
  claimed: number[][];
  state: "unstarted" | "p1" | "p2" | "over";
  error?: string;
};

type State = GameState & {
  ws: WebSocket;
};

// const testState: State = {
//   hline: [
//     [1, 0, 0],
//     [1, 2, 1],
//     [0, 0, 0],
//     [2, 0, 1],
//   ],
//   vline: [
//     [1, 2, 2, 0],
//     [0, 2, 2, 0],
//     [0, 0, 0, 1],
//   ],
//   claimed: [],
//   state: "p1",
//   error: undefined,
// };

// let ws: undefined | WebSocket = undefined;

export default function Home() {
  const [state, setState] = useState<State | undefined>(undefined);
  useEffect(() => {
    const ws = new WebSocket("wss://4o7ebjyojxb5g47gtxvbbkqnt4.srv.us/connect");

    ws.addEventListener("open", (e) => {
      console.log("connected!");
      ws.send(JSON.stringify({ type: "playAgain" }));
      // ws.send(JSON.stringify({ type: "testRandom" }));
    });
    ws.addEventListener("message", (e) => {
      console.log(e.data);
      const newState = JSON.parse(e.data);
      setState({ ...newState, ws });
    });
  }, []);
  return (
    <div>
      <h1>Dots and Boxes</h1>
      {state == undefined ? <p>Connecting...</p> : <Grid {...state} />}
    </div>
  );
}
