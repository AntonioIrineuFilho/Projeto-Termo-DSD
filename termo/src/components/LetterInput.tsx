import type { FocusEvent } from "react";

interface ILetterInputProps {
  onChange: (letter: string) => void;
  disabled?: boolean;
  value?: string;
  position: number;
  inputRef: (el: HTMLInputElement) => void;
}

export default function LetterInput({
  onChange,
  disabled,
  value,
  position,
  inputRef,
}: ILetterInputProps) {
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    const len = el.value ? el.value.length : 0;
    requestAnimationFrame(() => el.setSelectionRange(len, len));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const el = e.currentTarget as HTMLInputElement;
    const len = el.value ? el.value.length : 0;
    e.preventDefault();
    requestAnimationFrame(() => el.setSelectionRange(len, len));
  };

  return (
    <input
      id={`letter-${position}`}
      // Responsivo por breakpoint, mas não expandir: caixas têm largura fixa
      className={
        "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] shrink-0 border border-gray-300 rounded-md text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-[20px] sm:text-2xl md:text-[28px] lg:text-[32px]"
      }
      maxLength={1}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.slice(-1))}
      onFocus={(e) => handleFocus(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      ref={inputRef}
    />
  );
}
