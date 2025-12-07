import axios from "axios";
import { createContext, useContext, useState, type ReactNode } from "react";

interface IPlayerContext {
  name: string;
  roomCode: string;
  setName: (name: string) => void;
  setRoomCode: (roomCode: string) => void;
  createRoom: (name: string, password: string) => Promise<void>;
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
  setName: () => {},
  setRoomCode: () => {},
  enterRoom: async () => {},
  exitRoom: () => {},
  reset: () => {},
  createRoom: async () => {},
});

interface IPlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: IPlayerProviderProps) {
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem("playerName") || "";
  });
  const [roomCode, setRoomCode] = useState<string>(() => {
    return localStorage.getItem("roomCode") || "";
  });

  const createRoom = async (name: string, password: string) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/room/create`,
      {
        name,
        password,
      }
    );

    if (res.status === 201) {
      setName(name);
      setRoomCode(res.data.roomCode);
      localStorage.setItem("playerName", name);
      localStorage.setItem("roomCode", res.data.roomCode);
      window.location.href = `/room/${res.data.roomCode}`;
    }
  };

  const enterRoom = async (
    roomCode: string,
    name: string,
    password?: string
  ) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/room/join/${roomCode}`, {
      name,
      password,
    });

    setName(name);
    setRoomCode(roomCode);
    localStorage.setItem("playerName", name);
    localStorage.setItem("roomCode", roomCode);
  };

  const exitRoom = async () => {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_URL}/room/${roomCode}`
    );
    reset();
  };

  const reset = () => {
    setName("");
    setRoomCode("");
    localStorage.removeItem("playerName");
    localStorage.removeItem("roomCode");
  };

  return (
    <playerContext.Provider
      value={{
        name,
        roomCode,
        setName,
        setRoomCode,
        createRoom,
        enterRoom,
        exitRoom,
        reset,
      }}
    >
      {children}
    </playerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePlayerContext = () => {
  return useContext(playerContext);
};
