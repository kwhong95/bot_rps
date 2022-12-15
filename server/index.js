const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3002",
    methods: [ "GET", "POST" ],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  let options = ["가위", "바위", "보"]
  let results = [];
  let isEndGame = false;

  // 가위바위보 무작위 데이터 전달을 위한 함수
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };

  function determineResultGame (data) {
    let gameData = options[getRandomInt(0, 2)];
    if (gameData === '가위') {
      if (data === '가위') {
        return 'Draw';
      } else if (data === '바위') {
        return 'Win';
      } else if (data === '보') {
        return 'Defeat';
      }
    } else if (gameData === '바위') {
      if (data === '가위') {
        return 'Defeat';
      } else if (data === '바위') {
        return 'Draw';
      } else if (data === '보') {
        return 'Win';
      } 
    } else if (gameData == '보') {
      if (data === '기위') {
        return 'Win';
      } else if (data === '바위') {
        return 'Defeat';
      } else if (data === '보') {
        return 'Draw';
      }
    }
  }

  function determimeGameResults (results) {
    const TotalCount = results.length;
    const WinCount = results.filter(result => result === 'Win').length;
    const DefeatCount = results.filter(result => result === 'Defeat').length;
    const DrawCount = results.filter(result => result === 'Draw').length;
    const WinRate = (WinCount / TotalCount) * 100;

    return `
      총 플레이수: ${TotalCount}회
      승 리 : ${WinCount} 회
      패 배 : ${DefeatCount} 회
      무승부 : ${DrawCount} 회
      플레이어 승률 : ${WinRate.toFixed(1)}%
    `
  }


  socket.on("ENTER_GAME", () => {
    console.log(`유저가 게임을 시작하였습니다!`)
  });
  
  // 클라이언트로부터 받은 게임 데이터를 처리
  socket.on("SEND_GAME_DATA", (data) => {
    socket.emit('SEND_GAME_RESULT', determineResultGame(data));
  });

  socket.on("SAVE_GAME_RESULT", (data) => {
    results.push(data);
    console.log(results)
  });

  socket.on("REQUEST_RESULTS", (data) => {
    isEndGame = data;
    console.log(determimeGameResults(results));
    if (isEndGame) {
      socket.emit('PRINT_RESULTS', determimeGameResults(results));
    }
  });
})

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
})