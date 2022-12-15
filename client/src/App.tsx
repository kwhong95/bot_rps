import { useEffect, useReducer } from "react";
import "./App.css";
import io from "socket.io-client";

const socket = io("http://localhost:3001").connect();

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "ENTER_GAME":
      socket.emit(action.type);
      return {
        ...state,
        started: true,
      };
    case "SEND_GAME_DATA":
      socket.emit(action.type, action.data);
      return {
        ...state,
        data: action.data,
        selected: true,
      };
    case "GET_GAME_RESULT":
      return {
        ...state,
        result: action.result,
      };
    case "RESET_GAME":
      return {
        ...state,
        data: "",
        result: "",
        selected: false,
      };
    case "REQUEST_RESULTS":
      socket.emit(action.type, true);
      return {
        ...state,
      };
    case "PRINT_RESULTS":
      return {
        ...state,
        results: action.results,
      };
    case "LEAVE_GAME":
      return {
        ...state,
        started: false,
        selected: false,
        result: "",
        results: "",
      };
    default:
      return state;
  }
};

const initialState = {
  started: false,
  data: "",
  result: "",
  selected: false,
  results: "",
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const enterGame = () => dispatch({ type: "ENTER_GAME" });

  const sendGameData = (selected: string) => {
    dispatch({ type: "SEND_GAME_DATA", data: selected });
  };

  const getGameResult = () => {
    socket.on("SEND_GAME_RESULT", (data) => {
      dispatch({ type: "GET_GAME_RESULT", result: data });
    });
  };

  const printGameResult = (result: string) => {
    if (result === "Win") {
      return "승리";
    } else if (result === "Draw") {
      return "무승부";
    } else if (result === "Defeat") {
      return "패배";
    }
  };

  const saveGameResult = () => {
    socket.emit("SAVE_GAME_RESULT", state.result);
    dispatch({ type: "RESET_GAME" });
  };

  const requestResults = () => {
    dispatch({ type: "REQUEST_RESULTS" });

    setInterval(printResults, 1000);
  };

  const printResults = () => {
    socket.on("PRINT_RESULTS", (data) => {
      dispatch({ type: "PRINT_RESULTS", results: data });
    });
  };

  useEffect(() => {
    if (state.selected) {
      getGameResult();
    }
  }, [state.selected]);

  return (
    <div className="App">
      {!state.started ? (
        <div>
          <h1>가위바위보 게임 봇</h1>
          <button onClick={enterGame}>입장하기</button>
        </div>
      ) : (
        <>
          {state.selected ? (
            <div>
              <p>{printGameResult(state.result)}</p>
              <div
                style={{ display: "flex", gap: 10, justifyContent: "center" }}
              >
                <button onClick={saveGameResult}>다시하기</button>
                <button onClick={requestResults}>결과보기</button>
              </div>
            </div>
          ) : (
            <div>
              <h1>게임 시작!</h1>
              <p>아래 버튼 중 하나를 선택하세요.</p>
              <div
                style={{ display: "flex", gap: 10, justifyContent: "center" }}
              >
                <button onClick={() => sendGameData("가위")}>가위</button>
                <button onClick={() => sendGameData("바위")}>바위</button>
                <button onClick={() => sendGameData("보")}>보</button>
              </div>
            </div>
          )}
          {state.results && (
            <div>
              <p>{state.results}</p>
              <button onClick={() => dispatch({ type: "LEAVE_GAME" })}>게임 종료하기</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
