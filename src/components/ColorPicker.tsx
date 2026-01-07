import type { ColorSuit } from '../../game/Cards';
import type { FC } from 'react';

interface ColorPickerProps {
  onSelectColor: (color: ColorSuit) => void;
  isOpen: boolean;
}

const colors: { suit: ColorSuit; bg: string; hoverBg: string; label: string }[] = [
  { suit: 'R', bg: 'bg-red-500', hoverBg: 'hover:bg-red-600', label: 'Red' },
  { suit: 'B', bg: 'bg-blue-500', hoverBg: 'hover:bg-blue-600', label: 'Blue' },
  { suit: 'G', bg: 'bg-green-500', hoverBg: 'hover:bg-green-600', label: 'Green' },
  { suit: 'Y', bg: 'bg-yellow-400', hoverBg: 'hover:bg-yellow-500', label: 'Yellow' },
];

const ColorPicker: FC<ColorPickerProps> = ({ onSelectColor, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-center text-lg font-semibold text-stone-700">
          Choose a Color
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {colors.map(({ suit, bg, hoverBg, label }) => (
            <button
              key={suit}
              onClick={() => onSelectColor(suit)}
              className={`${bg} ${hoverBg} h-20 w-20 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
