import { ChevronLeftCircle, Delete } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Button, Message, useToaster } from "rsuite";
import LetterInput from "../components/LetterInput";
import type { TLetters } from "../types/TLetters";
import KeyButton from "../components/KeyButton";
import { usePlayerContext } from "../context/PlayerContext";

export default function Room() {
  const toaster = useToaster();
  const { name, roomCode, exitRoom } = usePlayerContext();
  const { id } = useParams<{ id: string }>();

  const inputRefs = useRef<Array<HTMLInputElement>>([]);

  const [letters, setLetters] = useState<TLetters>({
    1: {
      letter: "",
      status: "NONE",
    },
    2: {
      letter: "",
      status: "NONE",
    },
    3: {
      letter: "",
      status: "NONE",
    },
    4: {
      letter: "",
      status: "NONE",
    },
    5: {
      letter: "",
      status: "NONE",
    },
  });

  const [lastTryPlayer, setLastTryPlayer] = useState<string>("");
  const [lastTryLetters, setLastTryLetters] = useState<TLetters>({
    1: {
      letter: "",
      status: "NONE",
    },
    2: {
      letter: "",
      status: "NONE",
    },
    3: {
      letter: "",
      status: "NONE",
    },
    4: {
      letter: "",
      status: "NONE",
    },
    5: {
      letter: "",
      status: "NONE",
    },
  });

  const [status, setStatus] = useState<"waiting" | "playing">("waiting");
  const [turn, setTurn] = useState<string>("");
  const [players, setPlayers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string>("");

  interface IKeyboard {
    [key: string]: {
      value: string;
      used: boolean;
    };
  }

  const defaultKeyboard: IKeyboard = {
    Q: { value: "Q", used: false },
    W: { value: "W", used: false },
    E: { value: "E", used: false },
    R: { value: "R", used: false },
    T: { value: "T", used: false },
    Y: { value: "Y", used: false },
    U: { value: "U", used: false },
    I: { value: "I", used: false },
    O: { value: "O", used: false },
    P: { value: "P", used: false },
    A: { value: "A", used: false },
    S: { value: "S", used: false },
    D: { value: "D", used: false },
    F: { value: "F", used: false },
    G: { value: "G", used: false },
    H: { value: "H", used: false },
    J: { value: "J", used: false },
    K: { value: "K", used: false },
    L: { value: "L", used: false },
    Z: { value: "Z", used: false },
    X: { value: "X", used: false },
    C: { value: "C", used: false },
    V: { value: "V", used: false },
    B: { value: "B", used: false },
    N: { value: "N", used: false },
    M: { value: "M", used: false },
  };

  const [keyboard, setKeyboard] = useState<IKeyboard>(defaultKeyboard);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomCode || !name) return;

    const ws = new WebSocket(
      import.meta.env.VITE_WS_URL + `?roomCode=${roomCode}&playerName=${name}`
    );

    wsRef.current = ws;

    ws.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case "startGame":
          setStatus("playing");
          setTurn(data.turn);
          setPlayers(data.players);
          console.log(data.players);
          break;
        case "joined":
          toaster.push(
            <Message showIcon type="success">
              Entrou na sala {data.roomCode} com sucesso!
            </Message>,
            {
              placement: "topCenter",
              duration: 3000,
            }
          );
          break;
        case "error":
          toaster.push(
            <Message showIcon type="error">
              {data.message}
            </Message>,
            {
              placement: "topCenter",
              duration: 5000,
            }
          );
          break;
        case "gameOver":
          (async () => {
            const winLetters = data.word.split("");

            const refinedWinLetters: TLetters = winLetters.reduce(
              (acc: TLetters, letter: string, index: number) => {
                acc[index + 1] = {
                  letter: letter,
                  status: "CORRECT",
                };
                return acc;
              },
              {} as TLetters
            );

            setLastTryLetters(refinedWinLetters);
            setWinner(data.winner);
            await exitRoom();
            wsRef.current?.close();
          })();
          break;
        case "playerLeft":
          toaster.push(
            <Message showIcon type="info">
              O jogador {data.playerName} saiu da sala. Partida cancelada e sala
              sendo fechada...
            </Message>,
            {
              placement: "topCenter",
              duration: 5000,
            }
          );
          setTimeout(() => {
            handleReturnHome();
          }, 5000);
          break;
        case "tryResult": {
          const lettersRes: {
            letter: string;
            status: "CORRECT" | "PRESENT" | "ABSENT" | "NONE";
          }[] = data.letters;

          const refinedLetterRes: TLetters = lettersRes.reduce(
            (acc, item, index) => {
              acc[index + 1] = {
                letter: item.letter,
                status: item.status,
              };
              return acc;
            },
            {} as TLetters
          );

          setLastTryLetters(refinedLetterRes);
          setLastTryPlayer(data.playerName);

          setKeyboard((prevKeyboard) => {
            const newKeyboard = { ...prevKeyboard };
            lettersRes.forEach((item) => {
              const letter = item.letter.toUpperCase();
              if (newKeyboard[letter]) {
                newKeyboard[letter].used = item.status === "ABSENT";
              }
            });
            return newKeyboard;
          });

          setLetters({
            1: {
              letter: "",
              status: "NONE",
            },
            2: {
              letter: "",
              status: "NONE",
            },
            3: {
              letter: "",
              status: "NONE",
            },
            4: {
              letter: "",
              status: "NONE",
            },
            5: {
              letter: "",
              status: "NONE",
            },
          });
          setTurn(data.nextTurnPlayer);
          break;
        }
        case "invalidWord":
          toaster.push(
            <Message showIcon type="warning">
              Palavra inválida! Tente novamente.
            </Message>,
            {
              placement: "topCenter",
              duration: 3000,
            }
          );
          break;
        default:
          toaster.push(
            <Message showIcon type="error">
              Erro desconhecido ao processar mensagem do servidor! Tente
              novamente.
            </Message>,
            {
              placement: "topCenter",
              duration: 5000,
            }
          );
          break;
      }
    });

    ws.addEventListener("close", () => {});

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, name, toaster]);

  const handleChangeLetter = (position: number, letter: string) => {
    setLetters((prevLetters) => ({
      ...prevLetters,
      [position]: {
        letter: letter.toUpperCase(),
        status: "NONE",
      },
    }));

    let newPosition = position;

    if (letter === "") newPosition = position - 2;

    if (newPosition < 5) {
      inputRefs.current[newPosition]?.focus();
    }
  };

  const handleKeyboardButtonClick = (value: string) => {
    const emptyPosition = Object.entries(letters).find(
      ([, letter]) => letter.letter === ""
    );

    if (emptyPosition) {
      const position = Number(emptyPosition[0]);
      handleChangeLetter(position, value);
    }
  };

  const handleDeleteButtonClick = () => {
    const filledPositions = Object.entries(letters)
      .filter(([, letter]) => letter.letter !== "")
      .map(([position]) => Number(position));

    if (filledPositions.length > 0) {
      const lastPosition = filledPositions[filledPositions.length - 1];
      handleChangeLetter(lastPosition, "");
    }
  };

  const handleSubmitTry = () => {
    const lettersEntries = Object.entries(letters);

    for (let i = 0; i < lettersEntries.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, letter] = lettersEntries[i];
      if (letter.letter === "") {
        toaster.push(
          <Message showIcon type="warning">
            Preencha todas as letras antes de enviar a tentativa
          </Message>,
          {
            placement: "topCenter",
            duration: 3000,
          }
        );
        return;
      }
    }

    wsRef.current?.send(
      JSON.stringify({
        type: "try",
        word: Object.values(letters)
          .map((letter) => letter.letter)
          .join(""),
      })
    );
  };

  const handleReturnHome = async () => {
    try {
      await exitRoom();
    } catch {
      /* */
    } finally {
      wsRef.current?.close();
      window.location.href = "/";
    }
  };

  if (status === "waiting") {
    return (
      <div className="h-full bg-slate-100 flex flex-col gap-40">
        <header className="pt-5 flex justify-around items-center">
          <Button
            appearance="ghost"
            className="flex gap-2"
            onClick={handleReturnHome}
          >
            <ChevronLeftCircle />
            <p>Sair</p>
          </Button>

          <p className="text-xl">
            Sala <b>#{id}</b>
          </p>

          <div>
            <ol>
              {players.map((player) => (
                <li key={player} className="text-center">
                  {player}
                </li>
              ))}
            </ol>
          </div>
        </header>

        <main className="flex flex-col gap-20 items-center justify-center">
          <p className="text-2xl font-bold text-[#58585b]">
            Aguardando jogadores...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-100 flex flex-col gap-40">
      <header className="pt-5 flex justify-around items-center">
        <Button
          appearance="ghost"
          className="flex gap-2"
          onClick={handleReturnHome}
        >
          <ChevronLeftCircle />
          <p>Sair</p>
        </Button>

        <div className="flex flex-col items-center gap-1">
          <p className="text-xl">
            Sala <b>#{id}</b>
          </p>
          <div className="flex gap-2 font-bold text-2xl">
            <p>{players[0]}</p>
            <p className="text-gray-500">VS</p>
            <p>{players[1]}</p>
          </div>
        </div>

        <div></div>
      </header>

      <main className="flex flex-col gap-20 items-center justify-center">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b-[#cacaca7c] border-b-2 pb-8">
            <p className="text-xl font-bold text-[#58585b]">Última jogada:</p>

            {lastTryPlayer && (
              <p className="text-lg font-semibold text-[#58585b]">
                {lastTryPlayer} tentou:
              </p>
            )}
            <ol className="flex gap-4 text-4xl font-black input-letter">
              {Object.entries(lastTryLetters).map(([position, letter]) => (
                <div
                  key={position}
                  id={`letter-${position}`}
                  className={
                    "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] shrink-0 border border-gray-300 rounded-md font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-[20px] sm:text-2xl md:text-[28px] lg:text-[32px] flex items-center justify-center" +
                    (letter.status === "CORRECT"
                      ? " bg-green-500 text-white"
                      : letter.status === "PRESENT"
                      ? " bg-yellow-500 text-white"
                      : letter.status === "ABSENT"
                      ? " bg-gray-500 text-white"
                      : "")
                  }
                >
                  <p>{letter.letter}</p>
                </div>
              ))}
            </ol>
          </div>

          {turn === name && (
            <ol className="flex gap-4 text-4xl font-black input-letter">
              {Object.entries(letters).map(([position, letter]) => (
                <li key={position} className="shrink-0">
                  <LetterInput
                    position={Number(position)}
                    value={letter.letter}
                    onChange={(newLetter) =>
                      handleChangeLetter(Number(position), newLetter)
                    }
                    inputRef={(el: HTMLInputElement) => {
                      inputRefs.current[Number(position) - 1] = el;
                    }}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>

        {winner ? (
          <div className="p-4 bg-green-200 rounded-md">
            <p className="text-2xl font-bold text-green-800">
              🎉 {winner} venceu o jogo! 🎉
            </p>
          </div>
        ) : turn !== name ? (
          <p className="text-2xl font-bold text-[#58585b]">Vez do oponente</p>
        ) : (
          <div className="flex flex-col items-center input-letter text-3xl font-black">
            <ol className="flex gap-2 xl:w-fit w-screen justify-center p-2">
              {Object.entries(keyboard)
                .slice(0, 10)
                .map(([key, { value, used }]) => (
                  <li key={key} className="w-full">
                    <KeyButton
                      value={value}
                      onClick={() => handleKeyboardButtonClick(value)}
                      disabled={used}
                    />
                  </li>
                ))}
            </ol>

            <ol className="flex gap-2 xl:w-fit w-screen justify-center p-2">
              {Object.entries(keyboard)
                .slice(10, 19)
                .map(([key, { value, used }]) => (
                  <li key={key} className="w-full">
                    <KeyButton
                      value={value}
                      onClick={() => handleKeyboardButtonClick(value)}
                      disabled={used}
                    />
                  </li>
                ))}

              <li className="w-full">
                <button className="xl:w-[4.5dvw] h-[10dvh] w-full flex-1 rounded-lg bg-gray-200 text-center font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  <Delete
                    className="w-[4dvw] h-[4dvh]"
                    onClick={handleDeleteButtonClick}
                  />
                </button>
              </li>
            </ol>

            <ol className="flex gap-2 xl:w-fit w-screen justify-center p-2">
              {Object.entries(keyboard)
                .slice(19, 26)
                .map(([key, { value, used }]) => (
                  <li key={key} className="w-full">
                    <KeyButton
                      value={value}
                      onClick={() => handleKeyboardButtonClick(value)}
                      disabled={used}
                    />
                  </li>
                ))}

              <li className="w-full">
                <button
                  className="xl:w-[8dvw] h-[10dvh] w-full flex-1 rounded-lg bg-gray-200 text-center font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleSubmitTry}
                >
                  <p className="text-2xl">Enter</p>
                </button>
              </li>
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}
