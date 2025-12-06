import { Button, Input, Message, useToaster } from "rsuite";
import type { TRoomStatus } from "../types/TRoomStatus";
import { Check } from "lucide-react";
import { useState } from "react";
import axios from "axios";

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
  const toaster = useToaster();

  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const onEnterRoom = () => {};

  const onSubmitPassword = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/room/join/${roomCode}`,
        {
          name: username,
          password,
        }
      );
    } catch {
      toaster.push(
        <Message showIcon type="error">
          Senha incorreta
        </Message>,
        {
          placement: "topCenter",
          duration: 5000,
        }
      );
    }
  };

  return (
    <div className="w-60 h-80 bg-slate-100 rounded border-[#cacaca7c] border p-2 flex flex-col justify-between px-6 gap-2">
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
          <div className="flex flex-col gap-1">
            <label>
              Usuário:
              <Input type="text" value={username} onChange={setUsername} />
            </label>

            <label>
              Senha:
              <Input type="text" value={password} onChange={setPassword} />
            </label>
          </div>

          <Button appearance="ghost" onClick={onSubmitPassword}>
            <Check />
          </Button>
        </div>
      ) : (
        <Button appearance="primary" block onClick={onEnterRoom}>
          Entrar na Sala
        </Button>
      )}
    </div>
  );
}
