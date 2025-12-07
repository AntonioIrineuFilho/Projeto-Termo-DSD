export default function KeyButton({
  value,
  onClick,
  disabled,
}: {
  value: string;
  onClick: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="xl:w-[5dvw] h-[10dvh] w-full flex-1 rounded-lg bg-gray-200 text-center font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      onClick={() => onClick(value)}
      disabled={disabled}
    >
      {value}
    </button>
  );
}
