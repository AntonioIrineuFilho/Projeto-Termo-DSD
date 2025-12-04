import { Button, Input } from "rsuite";
import type { TRoomStatus } from "../types/TRoomStatus";
import { Check } from "lucide-react";

interface IRoomCardProps {
  players: {
    name: string;
  }[];
  roomCode: string;
  isPrivate: boolean;
  status: TRoomStatus;
}

export default function RoomCard({
  players,
  isPrivate,
  roomCode,
  status,
}: IRoomCardProps) {
  const onEnterRoom = () => {};

  const onSubmitPassword = () => {};

  return (
    <div className="w-60 h-60 bg-slate-100 rounded border-[#cacaca7c] border p-2 flex flex-col justify-between px-6 gap-2">
      <p>
        Sala #<b>{roomCode}</b>
      </p>

      <div className="flex items-center gap-2">
        <p>Status:</p>
        <p
          className={`rounded-full p-1 px-3 ${
            status === "Aguardando" ? "bg-yellow-300" : "bg-orange-400"
          }`}
        >
          {status}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <p>Tipo:</p>
        <p
          className={`rounded-full p-1 px-3 ${
            isPrivate ? "bg-red-300" : "bg-green-300"
          }`}
        >
          {isPrivate ? "Privada" : "Pública"}
        </p>
      </div>

      <div>
        <p>Jogadores:</p>
        <ul className="list-disc list-inside">
          {players.map((player, index) => (
            <li key={index} className="pl-3">
              {player.name}
            </li>
          ))}
        </ul>
      </div>

      {isPrivate ? (
        <div className="flex items-end gap-1">
          <label>
            Senha:
            <Input type="text" />
          </label>

          <Button appearance="ghost" onClick={onSubmitPassword}>
            <Check />
          </Button>
        </div>
      ) : (
        <Button appearance="primary" block>
          Entrar na Sala
        </Button>
      )}
    </div>
  );
}
