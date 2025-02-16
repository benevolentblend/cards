import { CardWithId, useGameRoom } from "@/hooks/useGameRoom";
import CardComponent from "./Card";
import { canBeDiscarded } from "@/utils";

interface GameProps {
  username: string;
  roomId: string;
}

const Game = ({ username, roomId }: GameProps) => {
  const { clientState, serverDispatch, clientDispatch } = useGameRoom(
    username,
    roomId
  );

  // Indicated that the game is loading
  if (clientState.gameState === null) {
    return <p>Waiting for server...</p>;
  }
  const lastDiscarded = clientState.gameState.lastDiscarded;
  const isUsersTurn = clientState.gameState.turn === username;
  const otherUsers = clientState.gameState.users.filter(
    (user) => user.id !== username
  );

  const drawCard = () => {
    // Dispatch allows you to send an action!
    // Modify /game/logic.ts to change what actions you can send
    serverDispatch({ type: "draw" });
  };

  const discardCard = (card: CardWithId) => {
    // Dispatch allows you to send an action!
    // Modify /game/logic.ts to change what actions you can send
    serverDispatch({ type: "discard", card: card.card });
    clientDispatch({ type: "discard", payload: card.id });
  };

  return (
    <>
      <div>Its {clientState.gameState.turn}&apos;s Turn</div>
      <div className="">
        {otherUsers.map((user) => (
          <div key={user.id}>
            {user.id}&apos;s cards
            <div className="flex flex-wrap justify-center">
              {Array.from(Array(user.cardCount).keys()).map((i) => (
                <CardComponent key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center py-6">
        <div className="flex">
          <CardComponent card={clientState.gameState.lastDiscarded} />
          <CardComponent>
            {isUsersTurn && (
              <button
                className="bg-black rounded p-2 inline-block shadow text-xs text-stone-50 hover:animate-wiggle"
                onClick={drawCard}
              >
                Draw Card
              </button>
            )}
          </CardComponent>
        </div>
      </div>
      <div className="flex flex-wrap justify-center pb-4">
        {clientState.hand.map(({ card, id }) => {
          const cardCanBeDiscarded = canBeDiscarded(lastDiscarded, card);
          return (
            <CardComponent key={id} card={card}>
              {isUsersTurn && cardCanBeDiscarded && (
                <button
                  className="bg-black rounded p-2 inline-block shadow text-xs text-stone-50 hover:animate-wiggle"
                  onClick={() => discardCard({ card, id })}
                >
                  Discard
                </button>
              )}
            </CardComponent>
          );
        })}
      </div>
      <div className="bg-yellow-100 flex flex-col p-4 rounded text-sm">
        {clientState.gameState.log.map((logEntry, i) => (
          <p key={logEntry.dt} className="animate-appear text-black">
            {logEntry.message}
          </p>
        ))}
      </div>
    </>
  );
};

export default Game;
