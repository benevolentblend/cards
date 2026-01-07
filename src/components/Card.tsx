import { RefreshCw, SkipForward } from 'lucide-react';

import { getCardValues } from '@/utils';

import type { Card, CardSuit } from '../../game/Cards';

interface BaseCardComponentProps extends React.PropsWithChildren {
  colorClasses: string;
  isBack?: boolean;
}

export const suitToColors = (suit: CardSuit) => {
  switch (suit) {
    case 'R':
      return {
        bg: 'bg-gradient-to-br from-red-500 to-red-700',
        text: 'text-red-700',
        border: 'border-red-800',
      };
    case 'B':
      return {
        bg: 'bg-gradient-to-br from-blue-500 to-blue-700',
        text: 'text-blue-700',
        border: 'border-blue-800',
      };
    case 'G':
      return {
        bg: 'bg-gradient-to-br from-green-500 to-green-700',
        text: 'text-green-700',
        border: 'border-green-800',
      };
    case 'Y':
      return {
        bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
        text: 'text-yellow-700',
        border: 'border-yellow-600',
      };
  }
};

const BaseCardComponent: React.FC<BaseCardComponentProps> = ({
  colorClasses,
  isBack,
  children,
}) => (
  <div
    className={`relative grid h-36 w-24 content-center justify-center rounded-xl border-2 p-2 shadow-lg transition-all duration-200 ease-out ${isBack ? '' : 'hover:-translate-y-2 hover:shadow-xl'} ${colorClasses}`}
  >
    <div className="pointer-events-none absolute inset-1 rounded-lg border border-white/30" />
    {children}
  </div>
);

interface CardComponentProps extends React.PropsWithChildren {
  card?: Card;
}

const CardComponent: React.FC<CardComponentProps> = ({ card, children }) => {
  if (!card) {
    return (
      <BaseCardComponent
        colorClasses="bg-gradient-to-br from-slate-600 to-slate-800 border-slate-900"
        isBack
      >
        <div className="flex flex-col items-center justify-center">
          <div className="mb-1 text-3xl">🃏</div>
          <div className="text-xs font-medium tracking-wider text-white opacity-75">
            DECK
          </div>
        </div>
        {children}
      </BaseCardComponent>
    );
  }

  const { suit, name } = getCardValues(card);
  const colors = suitToColors(suit);

  const renderCardContent = () => {
    if (name === 'Skip') {
      return <SkipForward className="h-8 w-8" />;
    }
    if (name === 'Reverse') {
      return <RefreshCw className="h-8 w-8" />;
    }
    return <span className="text-xl font-bold">{name}</span>;
  };

  const renderCornerContent = () => {
    return name;
  };

  return (
    <BaseCardComponent colorClasses={`${colors.bg} ${colors.border}`}>
      <div className="absolute top-2 left-2 flex items-center text-sm font-bold text-white drop-shadow">
        {renderCornerContent()}
      </div>
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full bg-white text-center shadow-inner ${colors.text}`}
      >
        {renderCardContent()}
      </div>
      <div className="absolute right-2 bottom-2 flex rotate-180 items-center text-sm font-bold text-white drop-shadow">
        {renderCornerContent()}
      </div>
      {children}
    </BaseCardComponent>
  );
};

export default CardComponent;
