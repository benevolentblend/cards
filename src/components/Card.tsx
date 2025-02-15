import { getCardValues } from "@/utils";
import { Card, CardSuit } from "../../game/Cards";

interface BaseCardComponentProps extends React.PropsWithChildren {
  color: string;
}

export const suitToColor = (suit: CardSuit) => {
  switch (suit) {
    case "R":
      return "bg-red-700";
    case "B":
      return "bg-blue-700";
    case "G":
      return "bg-green-700";
    case "Y":
      return "bg-yellow-300";
  }
};

const BaseCardComponent: React.FC<BaseCardComponentProps> = ({
  color,
  children,
}) => (
  <div
    className={`grid justify-center content-center p-1 rounded-md w-24 h-32 border border-solid ${color}`}
  >
    {children}
  </div>
);

interface CardComponentProps extends React.PropsWithChildren {
  card?: Card;
}
const CardComponent: React.FC<CardComponentProps> = ({ card, children }) => {
  if (!card) {
    return (
      <BaseCardComponent color="bg-gray-700">
        <div className="rounded-full text-center w-20 h-20 py-6 text-white">
          Cards
        </div>
        {children}
      </BaseCardComponent>
    );
  }

  const { suit, name } = getCardValues(card);

  return (
    <BaseCardComponent color={suitToColor(suit)}>
      <div className="rounded-full text-center bg-white w-20 h-20 p-6 text-lg">
        {name}
      </div>
      {children}
    </BaseCardComponent>
  );
};

export default CardComponent;
