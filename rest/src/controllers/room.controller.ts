import { Request, Response } from "express";
import redis from "../lib/redis";
import { IRoom } from "../interfaces/IRoom";
import ICreateRoomDTO from "../interfaces/dtos/ICreateRoomDTO";
import rabbitmqServer from "../lib/rabbitmq-server";

class RoomController {
  private static async sendRoomsUpdateMessage() {
    const keys = await redis.keys("room:*");
    const rooms: IRoom[] = [];

    for (const key of keys) {
      const roomData = await redis.get(key);
      if (roomData) {
        const room = JSON.parse(roomData);

        const { password, ...roomWithoutPassword } = room;

        rooms.push(roomWithoutPassword);
      }
    }

    await rabbitmqServer.publishInQueue("rooms", JSON.stringify(rooms));
  }

  async createRoom(req: Request<any, any, ICreateRoomDTO>, res: Response) {
    const { name, password } = req.body;

    if (name.trim().length === 0) {
      return res.status(400).json({ message: "Nome de usuário é obrigatório" });
    }

    const roomCode = Math.random().toString(36).substring(2, 8);

    const type = password && password.trim().length > 0 ? "Privada" : "Pública";

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

    await RoomController.sendRoomsUpdateMessage();

    return res.status(201).json({ roomCode });
  }

  async joinRoom(req: Request<{ roomCode: string }>, res: Response) {
    const { roomCode } = req.params;
    const { name, password } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Nome de usuário é obrigatório" });
    }

    const roomData = await redis.get(`room:${roomCode}`);

    if (!roomData) {
      return res.status(404).send();
    }

    const room: IRoom = JSON.parse(roomData);

    if (room.players.some((player) => player.name === name)) {
      return res
        .status(409)
        .json({ message: "Nome de usuário já está em uso na sala" });
    }

    if (room.password && room.password !== password) {
      return res.status(401).send();
    }

    room.players.push({ name });
    room.status = "Em andamento";

    await redis.set(`room:${roomCode}`, JSON.stringify(room));

    await RoomController.sendRoomsUpdateMessage();

    return res.status(200).json({ message: "Entrou na sala com sucesso" });
  }

  async deleteRoom(req: Request<{ roomCode: string }>, res: Response) {
    const { roomCode } = req.params;

    const roomData = await redis.get(`room:${roomCode}`);

    if (!roomData) {
      return res.status(404).send();
    }

    await redis.del(`room:${roomCode}`);

    await RoomController.sendRoomsUpdateMessage();

    return res.status(200).json({ message: "Sala deletada com sucesso" });
  }

  async getAllRooms(req: Request, res: Response) {
    const keys = await redis.keys("room:*");
    const rooms: IRoom[] = [];

    for (const key of keys) {
      const roomData = await redis.get(key);
      if (roomData) {
        const room = JSON.parse(roomData);

        const { password, ...roomWithoutPassword } = room;

        rooms.push(roomWithoutPassword);
      }
    }

    return res.status(200).json(rooms);
  }
}

const roomController = new RoomController();

export default roomController;
