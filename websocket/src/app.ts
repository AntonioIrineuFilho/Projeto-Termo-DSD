import express, { Express } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import IPlayerWebSocket from "./interfaces/IPlayerWebsocket";
import gameWsHandler from "./gameHandler";

const app: Express = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: IPlayerWebSocket, req) => {
  const { searchParams } = new URL(req.url || "", `http://${req.headers.host}`);
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");

  const errors: string[] = [];

  if (!roomCode || roomCode.trim() === "") errors.push("Room code required");
  if (!playerName || playerName.trim() === "") {
    errors.push("Player name required");
  }

  if (errors.length > 0) {
    ws.send(JSON.stringify({ type: "error", message: errors.join(", ") }));
    ws.close();
    return;
  }

  gameWsHandler.onConnect({ playerName: playerName!, roomCode: roomCode!, ws });

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    switch (data.type) {
      case "try":
        const word = (data.word as string).toUpperCase();
        gameWsHandler.onTry({ word, ws });
        break;
    }
  });

  ws.on("close", () => {
    gameWsHandler.onClose({ roomCode: ws.roomCode });
  });
});

server.listen(3001, () => {
  console.log("Websocket is running on port 3001");
});
