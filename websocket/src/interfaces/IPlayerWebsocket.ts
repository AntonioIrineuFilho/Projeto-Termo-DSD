import { WebSocket } from "ws";

export default interface IPlayerWebSocket extends WebSocket {
  playerName: string;
  roomCode: string;
}
