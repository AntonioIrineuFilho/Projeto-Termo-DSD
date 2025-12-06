import axios from "axios";
import { createContext, useContext, useState, type ReactNode } from "react";

interface IPlayerContext {
  name: string;
  roomCode: string;
  enterRoom: (
    roomCode: string,
    name: string,
    password?: string
  ) => Promise<void>;
  exitRoom: () => void;
  reset: () => void;
}

const playerContext = createContext<IPlayerContext>({
  name: "",
  roomCode: "",
  enterRoom: async () => {},
  exitRoom: () => {},
  reset: () => {},
});

interface IPlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: IPlayerProviderProps) {
  const [name, setName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");

  const enterRoom = async (
    roomCode: string,
    name: string,
    password?: string
  ) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/room/join/${roomCode}`,
      {
        name,
        password,
      }
    );

    setName(name);
    setRoomCode(roomCode);
  };

  const exitRoom = () => {};

  const reset = () => {
    setName("");
    setRoomCode("");
  };

  return (
    <playerContext.Provider
      value={{ name, roomCode, enterRoom, exitRoom, reset }}
    >
      {children}
    </playerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePlayerContext = () => {
  return useContext(playerContext);
};
