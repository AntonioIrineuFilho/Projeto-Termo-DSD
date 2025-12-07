import type { TRoomStatus } from "./TRoomStatus";

export type TRoom = {
  code: string;
  players: { name: string }[];
  status: TRoomStatus;
  type: "Pública" | "Privada";
};
