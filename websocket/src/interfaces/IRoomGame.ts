import IPlayerWebSocket from "./IPlayerWebsocket";

export default interface IRoomGame {
  code: string;
  players: IPlayerWebSocket[];
  word: string;
}
