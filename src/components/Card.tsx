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
    className={`relative grid justify-center content-center p-2 rounded-xl w-24 h-36 border-2 shadow-lg
      transition-all duration-200 ease-out
      ${isBack ? '' : 'hover:-translate-y-2 hover:shadow-xl'}
      ${colorClasses}`}
  >
    <div className="absolute inset-1 rounded-lg border border-white/30 pointer-events-none" />
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
          <div className="text-3xl mb-1">🃏</div>
          <div className="text-white text-xs font-medium tracking-wider opacity-75">
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
      return <SkipForward className="w-8 h-8" />;
    }
    if (name === 'Reverse') {
      return <RefreshCw className="w-8 h-8" />;
    }
    return <span className="text-xl font-bold">{name}</span>;
  };

  const renderCornerContent = () => {
    return name;
  };

  return (
    <BaseCardComponent colorClasses={`${colors.bg} ${colors.border}`}>
      <div className="absolute top-2 left-2 text-white font-bold text-sm drop-shadow flex items-center">
        {renderCornerContent()}
      </div>
      <div
        className={`rounded-full text-center bg-white w-16 h-16 flex items-center justify-center shadow-inner ${colors.text}`}
      >
        {renderCardContent()}
      </div>
      <div className="absolute bottom-2 right-2 text-white font-bold text-sm drop-shadow rotate-180 flex items-center">
        {renderCornerContent()}
      </div>
      {children}
    </BaseCardComponent>
  );
};

export default CardComponent;
