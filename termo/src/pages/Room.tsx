import { ChevronLeftCircle, Delete } from "lucide-react";
import { useRef, useState } from "react";
import { useParams } from "react-router";
import { Button } from "rsuite";
import LetterInput from "../components/LetterInput";
import type { TLetters } from "../types/TLetters";
import KeyButton from "../components/KeyButton";

export default function Room() {
  const { id } = useParams<{ id: string }>();

  const inputRefs = useRef<Array<HTMLInputElement>>([]);

  const [letters, setLetters] = useState<TLetters>({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
  });

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

  const handleChangeLetter = (position: number, letter: string) => {
    setLetters((prevLetters) => ({
      ...prevLetters,
      [position]: letter.toUpperCase(),
    }));

    let newPosition = position;

    if (letter === "") newPosition = position - 2;

    if (newPosition < 5) {
      inputRefs.current[newPosition]?.focus();
    }
  };

  const handleKeyboardButtonClick = (value: string) => {
    const emptyPosition = Object.entries(letters).find(
      ([, letter]) => letter === ""
    );

    if (emptyPosition) {
      const position = Number(emptyPosition[0]);
      handleChangeLetter(position, value);
    }
  };

  const handleDeleteButtonClick = () => {
    const filledPositions = Object.entries(letters)
      .filter(([, letter]) => letter !== "")
      .map(([position]) => Number(position));

    if (filledPositions.length > 0) {
      const lastPosition = filledPositions[filledPositions.length - 1];
      handleChangeLetter(lastPosition, "");
    }
  };

  return (
    <div className="h-full bg-slate-100 flex flex-col gap-40">
      <header className="pt-5 flex justify-around items-center">
        <Button appearance="ghost" className="flex gap-2">
          <ChevronLeftCircle />
          <p>Sair</p>
        </Button>

        <p className="text-xl">
          Sala <b>#{id}</b>
        </p>

        <div></div>
      </header>

      <main className="flex flex-col gap-20 items-center justify-center">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b-[#cacaca7c] border-b-2 pb-8">
            <p className="text-xl font-bold text-[#58585b]">Última jogada:</p>

            <ol className="flex gap-4 text-4xl font-black input-letter">
              {Object.entries(letters).map(([position, letter]) => (
                <li key={position} className="shrink-0">
                  <LetterInput
                    position={Number(position)}
                    value={letter}
                    onChange={(letter) =>
                      handleChangeLetter(Number(position), letter)
                    }
                    inputRef={(el: HTMLInputElement) => {
                      inputRefs.current[Number(position) - 1] = el;
                    }}
                  />
                </li>
              ))}
            </ol>
          </div>

          <ol className="flex gap-4 text-4xl font-black input-letter">
            {Object.entries(letters).map(([position, letter]) => (
              <li key={position} className="shrink-0">
                <LetterInput
                  position={Number(position)}
                  value={letter}
                  onChange={(letter) =>
                    handleChangeLetter(Number(position), letter)
                  }
                  inputRef={(el: HTMLInputElement) => {
                    inputRefs.current[Number(position) - 1] = el;
                  }}
                />
              </li>
            ))}
          </ol>
        </div>

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
              .slice(11, 19)
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
              <button className="xl:w-[8dvw] h-[10dvh] w-full flex-1 rounded-lg bg-gray-200 text-center font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                <p className="text-2xl">Enter</p>
              </button>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
