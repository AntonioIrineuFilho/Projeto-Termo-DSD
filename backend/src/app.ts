import express, { json, Express } from "express";
import cors from "cors";
import roomController from "./controllers/room.controller";

const app: Express = express();

app.use(json());
app.use(cors());

app.post("/room/create", roomController.createRoom);
app.post("/room/join/:roomCode", roomController.joinRoom);
app.get("/rooms", roomController.getAllRooms);

export default app;
