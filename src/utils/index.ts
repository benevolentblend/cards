import type { Card, CardSuit, CardName, ColorSuit } from '../../game/Cards';

export const stringToColor = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `hsl(${hash % 360}, 85%, 35%)`;
};

export const getCardValues = (card: Card) => {
  const [suit, name] = card.split('-') as [CardSuit, CardName];

  return { suit, name };
};

export const isWildCard = (card: Card): boolean => {
  const { suit } = getCardValues(card);
  return suit === 'W';
};

export const isDrawCard = (card: Card): 'Draw2' | 'Draw4' | null => {
  const { name } = getCardValues(card);
  if (name === 'Draw2' || name === 'Draw4') return name;
  return null;
};

type DrawPenaltyType = 'Draw2' | 'Draw4';

export const canBeDiscarded = (
  lastDiscarded: Card,
  played: Card,
  effectiveColor: ColorSuit | null = null,
  pendingDrawType: DrawPenaltyType | null = null
): boolean => {
  const { suit: playedSuit, name: playedName } = getCardValues(played);

  // During Draw4 stack, only Draw4 can be played
  if (pendingDrawType === 'Draw4') {
    return playedName === 'Draw4';
  }

  // During Draw2 stack, only Draw2 can be played
  if (pendingDrawType === 'Draw2') {
    return playedName === 'Draw2';
  }

  // Wild cards are always playable (when no draw penalty is pending)
  if (playedSuit === 'W') {
    return true;
  }

  // Normal play: check effective color if set, otherwise match suit/name
  const { suit: lastDiscardedSuit, name: lastDiscardedName } =
    getCardValues(lastDiscarded);
  const colorToMatch = effectiveColor ?? lastDiscardedSuit;

  if (playedSuit === colorToMatch) return true;
  if (lastDiscardedName === playedName) return true;

  return false;
};
