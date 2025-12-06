import { Button, Input, Message, useToaster } from "rsuite";
import type { TRoomStatus } from "../types/TRoomStatus";
import { Check } from "lucide-react";
import { useState } from "react";
import { AxiosError } from "axios";
import { usePlayerContext } from "../context/PlayerContext";

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
  const { enterRoom } = usePlayerContext();

  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const onEnterRoom = async () => {
    try {
      await enterRoom(roomCode, username, password);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toaster.push(
            <Message showIcon type="error">
              Senha incorreta
            </Message>,
            {
              placement: "topCenter",
              duration: 5000,
            }
          );
        } else if (error.response?.status === 400) {
          toaster.push(
            <Message showIcon type="error">
              Nome de usuário é obrigatório
            </Message>,
            {
              placement: "topCenter",
              duration: 5000,
            }
          );
        } else {
          toaster.push(
            <Message showIcon type="error">
              Erro ao entrar na sala
            </Message>,
            {
              placement: "topCenter",
              duration: 5000,
            }
          );
        }
      }
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

      {status === "Em andamento" ? null : isPrivate ? (
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

          <Button appearance="ghost" onClick={onEnterRoom}>
            <Check />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label>
            Usuário:
            <Input type="text" value={username} onChange={setUsername} />
          </label>

          <Button appearance="primary" block onClick={onEnterRoom}>
            Entrar na Sala
          </Button>
        </div>
      )}
    </div>
  );
}
