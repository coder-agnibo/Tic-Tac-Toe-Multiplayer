import { useEffect, useState } from "react";
import "./App.css";
import Square from "./square/Square";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

function App() {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("Circle");
  const [finishedState, setFinishedState] = useState();
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // column dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "Circle" || e === "Cross") return true;
    });

    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState]);

  // useEffect(() => {
  //   if (socket && socket.connected) {
  //     setPlayOnline(true);
  //   }
  // }, [socket]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your Name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    return result;
  };

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("opponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("opponentFound", function (data) {
    setOpponentName(data.opponentName);
    console.log(data);
  });

  const playOnlineClick = async () => {
    const result = takePlayerName();
    // console.log(result);
    if (!(await result).isConfirmed) return;

    const userName = (await result).value;
    setPlayerName(userName);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: userName,
    });

    setSocket(newSocket);
  };

  if (!playOnline) {
    return (
      <div className="main-div">
        <button onClick={playOnlineClick} className="play-online">
          {" "}
          Play Online
        </button>
      </div>
    );
  }

  if (playerName && !opponentName) {
    return (
      <>
        <div className="waiting">
          <p>Waiting for an opponent....</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="main-div">
        <div className="move-detection">
          <div className="left"> Yourself</div>
          <div className="right"> Opponent</div>
        </div>
        <div>
          <h1 className="game-heading light-background"> Tic Tac Toe</h1>
          <div className="square-wrapper">
            {gameState.map((arr, rowIndex) =>
              arr.map((e, colIndex) => {
                return (
                  <Square
                    finishedArrayState={finishedArrayState}
                    gameState={gameState}
                    finishedState={finishedState}
                    setFinishedState={setFinishedState}
                    currentPlayer={currentPlayer}
                    setCurrentPlayer={setCurrentPlayer}
                    setGameState={setGameState}
                    id={rowIndex * 3 + colIndex}
                    key={rowIndex * 3 + colIndex}
                  />
                );
              })
            )}
          </div>
          {finishedState && finishedState !== "draw" && (
            <h3 className="finished-state"> {finishedState} won the game! </h3>
          )}

          {finishedState && finishedState === "draw" && (
            <h3 className="finished-state"> {finishedState} Draw match! </h3>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
