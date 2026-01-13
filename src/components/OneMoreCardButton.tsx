import type { FC } from 'react';

interface OneMoreCardButtonProps {
  hasDeclared: boolean;
  onDeclare: () => void;
}

const OneMoreCardButton: FC<OneMoreCardButtonProps> = ({
  hasDeclared,
  onDeclare,
}) => {
  return (
    <button
      onClick={onDeclare}
      disabled={hasDeclared}
      className={`rounded-lg px-4 py-2 font-semibold transition-all ${
        hasDeclared
          ? 'cursor-default bg-green-200 text-green-800'
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md hover:scale-105'
      }`}
    >
      {hasDeclared ? 'Declared!' : 'One more Card!'}
    </button>
  );
};

export default OneMoreCardButton;
