import type { TLetterStatus } from "./TLetterStatus";

export type TLetters = {
  [idx: number]: {
    letter: string;
    status: TLetterStatus;
  };
};
