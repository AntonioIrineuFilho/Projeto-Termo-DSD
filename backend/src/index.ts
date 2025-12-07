import "dotenv/config";
import app from "./app";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import redis from "./lib/redis";

interface PlayerWebSocket extends WebSocket {
  playerName?: string;
  roomCode?: string;
}

interface RoomGame {
  code: string;
  players: PlayerWebSocket[];
  word: string;
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const roomClients: RoomGame[] = [];

wss.on("connection", (ws: PlayerWebSocket, req) => {
  const { searchParams } = new URL(req.url || "", `http://${req.headers.host}`);
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");

  if (!roomCode) {
    ws.send(JSON.stringify({ type: "error", message: "Room code required" }));
    ws.close();
    return;
  }

  if (!playerName) {
    ws.send(JSON.stringify({ type: "error", message: "Player name required" }));
    ws.close();
    return;
  }

  if (!roomClients.some((room) => room.code === roomCode)) {
    roomClients.push({ code: roomCode, players: [], word: "" });
  }

  const room = roomClients.find((room) => room.code === roomCode);

  if (!room) {
    ws.send(
      JSON.stringify({ type: "error", message: "Internal server error" })
    );
    ws.close();
    return;
  }

  const players = room.players;

  const alreadyConnected = players.some(
    (client) => client.playerName === playerName
  );

  if (alreadyConnected) {
    ws.send(JSON.stringify({ type: "error", message: "Already connected" }));
    ws.close();
    return;
  }

  ws.playerName = playerName;
  ws.roomCode = roomCode;

  players.push(ws);

  if (players.length === 2) {
    const next = Math.floor(Math.random() * 2);

    players.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "startGame",
          turn: players[next]!.playerName,
        })
      );

      room.word = "TESTE";
    });
  }

  ws.send(JSON.stringify({ type: "joined", roomCode }));

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.type === "try") {
      const word = (data.word as string).toUpperCase();

      const room = roomClients.find((room) => room.code === ws.roomCode);
      if (!room) {
        ws.send(
          JSON.stringify({ type: "error", message: "Internal server error" })
        );
        return;
      }

      const roomWord = room.word;
      if (word === roomWord) {
        room.players.forEach((client) => {
          client.send(
            JSON.stringify({
              type: "gameOver",
              winner: ws.playerName,
              word: roomWord,
            })
          );
        });
        return;
      }

      const letters: {
        letter: string;
        status: "CORRECT" | "PRESENT" | "ABSENT";
      }[] = word.split("").map((letter, index) => {
        if (roomWord[index] === letter) {
          return { letter, status: "CORRECT" };
        } else if (roomWord.includes(letter)) {
          return { letter, status: "PRESENT" };
        } else {
          return { letter, status: "ABSENT" };
        }
      });

      const nextTurnPlayer = room.players.find(
        (client) => client.playerName !== ws.playerName
      );

      room.players.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "tryResult",
            playerName: ws.playerName,
            letters,
            nextTurnPlayer: nextTurnPlayer?.playerName,
          })
        );
      });
    }
  });

  ws.on("close", () => {
    const room = roomClients.find((room) => room.code === roomCode);
    if (room) {
      roomClients.splice(roomClients.indexOf(room), 1);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
