import { Input } from "rsuite";
import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import { useEffect, useState } from "react";
import type { TRoom } from "../types/TRoom";
import axios from "axios";

export default function Home() {
  const [rooms, setRooms] = useState<TRoom[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await axios.get<TRoom[]>(
        `${import.meta.env.VITE_API_URL}/rooms`
      );
      setRooms(res.data);
    };

    fetchRooms();
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <header className="bg-slate-100 p-6 border-b-[#cacaca7c] border-b-2">
        <p className="text-xl font-bold text-center">Termo Arena</p>
      </header>

      <div className="px-5 flex gap-4 items-end">
        <label className="text-lg">
          Buscar Sala:
          <Input type="search" width={513} />
        </label>

        <CreateRoomModal />
      </div>

      <main className="flex flex-wrap gap-8 px-5">
        {rooms.map((room) => (
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
