import { Input } from "rsuite";
import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";

export default function Home() {
  return (
    <div className="h-full flex flex-col gap-4">
      <header className="bg-slate-100 p-6 border-b-[#cacaca7c] border-b-2">
        <p className="text-xl font-bold text-center">Termo Multiplayer</p>
      </header>

      <div className="px-5 flex gap-4 items-end">
        <label className="text-lg">
          Buscar Sala:
          <Input type="search" width={513} />
        </label>

        <CreateRoomModal />
      </div>

      <main className="flex flex-wrap gap-8 px-5">
        <div>
          <RoomCard
            isPrivate={true}
            status="Aguardando"
            players={[
              {
                name: "Nicollas",
              },
            ]}
            roomCode="a12Bc32Ax"
          />
        </div>

        <div>
          <RoomCard
            isPrivate={false}
            status="Em Progresso"
            players={[
              {
                name: "Pedro",
              },
            ]}
            roomCode="z82ksmX"
          />
        </div>
      </main>
    </div>
  );
}
