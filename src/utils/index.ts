import { Card, CardSuit, CardName } from "../../game/Cards";

export const stringToColor = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `hsl(${hash % 360}, 85%, 35%)`;
};

export const getCardValues = (card: Card) => {
  const [suit, name] = card.split("-") as [CardSuit, CardName];

  return { suit, name };
};
