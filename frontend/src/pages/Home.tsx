import { Input } from "rsuite";
import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import { useEffect, useRef, useState } from "react";
import type { TRoom } from "../types/TRoom";
import axios from "axios";

export default function Home() {
  const [rooms, setRooms] = useState<TRoom[]>([]);
  const [search, setSearch] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await axios.get<TRoom[]>(
        `${import.meta.env.VITE_API_URL}/rooms`
      );
      setRooms(res.data);
    };

    fetchRooms();

    const ws = new WebSocket(import.meta.env.VITE_WS_LOBBY_URL);
    wsRef.current = ws;

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data) {
        setRooms(data);
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchRooms = async () => {
        const res = await axios.get<TRoom[]>(
          `${import.meta.env.VITE_API_URL}/rooms`,
          {
            params: {
              search,
            },
          }
        );
        setRooms(res.data);
      };

      fetchRooms();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="h-full flex flex-col gap-4">
      <header className="bg-slate-100 p-6 border-b-[#cacaca7c] border-b-2">
        <p className="text-xl font-bold text-center">Termo Arena</p>
      </header>

      <div className="px-5 flex gap-4 items-end">
        <label className="text-lg">
          Buscar Sala:
          <div className="w-full md:w-[513px]">
            <Input
              type="search"
              value={search}
              onChange={setSearch}
              style={{ width: "100%" }}
            />
          </div>
        </label>

        <CreateRoomModal />
      </div>

      <main className="flex xl:flex-row flex-col flex-wrap gap-8 px-5">
        {rooms &&
          rooms.map((room) => (
            <div key={room.code}>
              <RoomCard
                isPrivate={room.type === "Privada"}
                status={room.status}
                players={room.players}
                roomCode={room.code}
              />
            </div>
          ))}
      </main>
    </div>
  );
}
