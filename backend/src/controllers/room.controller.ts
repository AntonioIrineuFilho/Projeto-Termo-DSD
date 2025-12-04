import { Request, Response } from "express";
import redis from "../lib/redis";
import { IRoom } from "../interfaces/IRoom";

class RoomController {
  async createRoom(req: Request<any, any, ICreateRoomDTO>, res: Response) {
    const { name, password } = req.body;

    const roomCode = Math.random().toString(36).substring(2, 8);

    const type = password ? "Privada" : "Pública";

    await redis.set(
      `room:${roomCode}`,
      JSON.stringify({
        code: roomCode,
        password,
        players: [{ name }],
        status: "Aguardando",
        type,
      })
    );

    return res.status(201).json({ roomCode });
  }

  async joinRoom(req: Request<{ roomCode: string }>, res: Response) {
    const { roomCode } = req.params;
    const { name, password } = req.body;

    const roomData = await redis.get(`room:${roomCode}`);

    if (!roomData) {
      return res.status(404).send();
    }

    const room: IRoom = JSON.parse(roomData);

    if (room.password && room.password !== password) {
      return res.status(401).send();
    }

    room.players.push({ name });
    room.status = "Em andamento";

    await redis.set(`room:${roomCode}`, JSON.stringify(room));

    return res.status(200).json({ message: "Entrou na sala com sucesso" });
  }
}
