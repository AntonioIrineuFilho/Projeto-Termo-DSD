import IPlayerWebSocket from "../IPlayerWebsocket";

export interface IOnTryDTO {
  ws: IPlayerWebSocket;
  word: string;
}
