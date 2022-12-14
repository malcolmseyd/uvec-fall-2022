import { type } from "os";
import { useEffect, useState } from "react";
import getConfig from "next/config";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const API_URL = publicRuntimeConfig.API_URL;

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
function Cell({ col, row, vline, hline, ws, claimed }: CellProps) {
  const type =
    col % 2 == 0 && row % 2 == 0
      ? "dot"
      : col % 2 == 0 || row % 2 == 0
      ? "line"
      : "square";

  const dir = col % 2 == 0 ? 'vert' : 'hori';
  // const owner: number = 0;
  // console.log({ col, row });
  const {
    type: lineDir,
    location: [lineY, lineX],
  } = coordsToLine(col, row);
  let owner =
    type != "line"
      ? 0
      : lineDir == "h"
      ? hline[lineY][lineX]
      : vline[lineY][lineX];

  const width = col % 2 == 0 ? DOT_SIZE : LINE_SIZE;
  const height = row % 2 == 0 ? DOT_SIZE : LINE_SIZE;

  if (type == "square") {
    const claimedX = (col-1)/2;
    const claimedY = (row-1)/2;
    // do shit
    owner = claimed[claimedY][claimedX];
  }

  const color =
    owner == 1
      ? "red"
      : owner == 2
      ? "blue"
      : "white";

  return (
    <td
      key={[row, col].toString()}
      className={type + " " + color + " " + dir}
      style={{
        border: "0px black solid",
      }}
      onClick={() => {
        if (type != "line" || ws == undefined || ws.readyState != ws.OPEN)
          return;
        const move = coordsToLine(col, row);
        console.log("sending message", move);
        const data = JSON.stringify(move);
        console.log("ws", ws)
        ws.send(data);
      }}
    >
    </td>
  );
}

type EvalBarProps = State;
function EvalBar(props: EvalBarProps) {
  const N = props.hline.length;
  const numPoints = (N-1) * (N-1);
  const h = (props.eval + numPoints) / (2 * numPoints) * 100;
  return <div className="eval">
    <div 
    className="eval-cover" 
    style={{
      height: h.toString() + "%",
    }}></div>
  </div>;
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
  eval: number;
}

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
  const [redScore, setRedScore] = useState<number>(0);
  const [blueScore, setBlueScore] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const url = `wss://${API_URL}/connect`
    const ws = new WebSocket(url);

    ws.addEventListener("open", (e) => {
      console.log("connected!");
      ws.send(JSON.stringify({ 
        type: "playAgain",
        size: [getRandomInt(2) + 3, getRandomInt(2) + 3],
        // size: [3, 3],
      }));
      // ws.send(JSON.stringify({ type: "testRandom" }));
    });
    ws.addEventListener("message", (e) => {
      console.log(e.data);
      const newState: State = JSON.parse(e.data);
      // const N = newState.hline.length - 1;
      // const maxPoints = N * N;
      // newState.eval = getRandomInt(2 * maxPoints) - maxPoints;
      setState({...newState, ws});
      let newRedScore = 0;
      let newBlueScore = 0;
      newState.claimed.forEach(e => {
        e.forEach(owner => {
          if(owner == 1) {
            newRedScore += 1;
          } else if(owner == 2) {
            newBlueScore += 1;
          }
        });
      });
      if (newState.state === 'over') {
        console.log(newRedScore);
        console.log(newBlueScore);
        if(newRedScore > newBlueScore) {
          setMessage("Red wins!");
        } else if(newBlueScore > newRedScore) {
          setMessage("Blue wins!");
        } else {
          setMessage("You tied!");
        }
      } else {
        setRedScore(newRedScore);
        setBlueScore(newBlueScore);
      }
    });
  }, []);
  return (
    <div className="body">
      <h1>Dots and Boxes</h1>
      {state == undefined ? 
        <p>Connecting...</p> 
      : 
        <div className="container">
          <div className="game">
          <EvalBar {...state} /> 
          <Grid {...state} />
          </div>
          {state.state !== 'over' ? 
          <div className="score">
            Red: {redScore} <br />
            Blue: {blueScore}
          </div> :
          <>{message}</>
          }
        </div>
      }
    </div>
  );
}
