import "dotenv/config";
import express, { Express } from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import RabbitmqServer from "./rabbitmq-server";

const app: Express = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const connections: WebSocket[] = [];

wss.on("connection", (ws: WebSocket) => {
  connections.push(ws);
});

server.listen(3002, () => {
  console.log("Websocket-lobby is running on port 3002");

  const rabbitmqServer = new RabbitmqServer(process.env.RABBITMQ_URL!);
  rabbitmqServer.start().then(async () => {
    console.log("Connected to RabbitMQ");

    await rabbitmqServer.consume("rooms", (msg: string) => {
      connections.forEach((ws) => {
        ws.send(msg);
      });
    });
  });
});
