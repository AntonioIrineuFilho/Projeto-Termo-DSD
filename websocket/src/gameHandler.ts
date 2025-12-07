import IOnCloseDTO from "./interfaces/dtos/IOnCloseDTO";
import IOnConnectDTO from "./interfaces/dtos/IOnConnectDTO";
import { IOnTryDTO } from "./interfaces/dtos/IOnTryDTO";
import IRoomGame from "./interfaces/IRoomGame";

class GameWsHandler {
  private rooms: IRoomGame[] = [];

  onConnect({ playerName, roomCode, ws }: IOnConnectDTO) {
    let room = this.rooms.find((room) => room.code === roomCode);

    if (!room) {
      this.rooms.push({ code: roomCode, players: [], word: "" });
      room = this.rooms[this.rooms.length - 1]!;
    }

    const players = room.players;

    const alreadyConnected = players.some(
      (client) => client.playerName === playerName
    );

    if (alreadyConnected) return;

    ws.playerName = playerName;
    ws.roomCode = roomCode;

    players.push(ws);

    ws.send(JSON.stringify({ type: "joined", roomCode }));

    if (players.length === 2) {
      const next = Math.floor(Math.random() * 2);

      players.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "startGame",
            turn: players[next]!.playerName,
          })
        );

        room.word = "TESTE";
      });
    }
  }

  onTry({ word, ws }: IOnTryDTO) {
    const room = this.rooms.find((r) => r.code === ws.roomCode);

    // Unexpected case
    if (!room) {
      ws.send(
        JSON.stringify({ type: "error", message: "Internal server error" })
      );
      return;
    }

    const roomWord = room.word;
    if (word === roomWord) {
      room.players.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "gameOver",
            winner: ws.playerName,
            word: roomWord,
          })
        );
      });
      return;
    }

    interface IResultLetter {
      letter: string;
      status: "CORRECT" | "PRESENT" | "ABSENT";
    }

    const wordArray = word.toUpperCase().split("");

    const resultLetters: IResultLetter[] = wordArray.map((letter, index) => {
      if (roomWord[index] === letter) return { letter, status: "CORRECT" };
      if (roomWord.includes(letter)) return { letter, status: "PRESENT" };
      return { letter, status: "ABSENT" };
    });

    const nextTurnPlayer = room.players.find(
      (player) => player.playerName !== ws.playerName
    );

    // Unexpected case
    if (!nextTurnPlayer) {
      ws.send(
        JSON.stringify({ type: "error", message: "Internal server error" })
      );
      return;
    }

    room.players.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "tryResult",
          playerName: ws.playerName,
          letters: resultLetters,
          nextTurnPlayer: nextTurnPlayer?.playerName,
        })
      );
    });
  }

  onClose({ roomCode }: IOnCloseDTO) {
    const room = this.rooms.find((r) => r.code === roomCode);
    if (room) {
      this.rooms.splice(this.rooms.indexOf(room), 1);
    }
  }
}

const gameWsHandler = new GameWsHandler();

export default gameWsHandler;
