import IPlayerWebSocket from "../IPlayerWebsocket";

export default interface IOnConnectDTO {
  ws: IPlayerWebSocket;
  roomCode: string;
  playerName: string;
}
