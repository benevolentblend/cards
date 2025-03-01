import { CardWithId, useGameRoom } from "@/hooks/useGameRoom";
import CardComponent from "./Card";
import { canBeDiscarded } from "@/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import GameLobby from "./GameLobby";
import GameOver from "./GameOver";

interface GameProps {
  username: string;
  setUsername: (username: string) => void;
  roomId: string;
  id: string;
}

const Game = ({ username, setUsername, id, roomId }: GameProps) => {
  const { clientState, serverDispatch, clientDispatch } = useGameRoom(
    username,
    id,
    roomId
  );
  const [logs] = useLocalStorage("logs", "false");

  // Indicated that the game is loading
  if (clientState.gameState === null) {
    return <p>Waiting for server...</p>;
  }
  const isHost = clientState.gameState.host.id === id;
  const lastDiscarded = clientState.gameState.lastDiscarded;
  const isUsersTurn =
    clientState.gameState.turn && clientState.gameState.turn.id === id;
  const otherUsers = clientState.gameState.users.filter(
    (user) => user.id !== id
  );

  const drawCard = () => {
    // Dispatch allows you to send an action!
    // Modify /game/logic.ts to change what actions you can send
    serverDispatch({ type: "draw" });
  };

  const discardCard = (card: CardWithId) => {
    serverDispatch({ type: "discard", card: card.card });
    clientDispatch({ type: "discard", payload: card.id });
  };

  if (clientState.gameState.phase === "lobby") {
    return (
      <GameLobby
        {...{
          otherUsers,
          setUsername,
          username,
          serverDispatch,
          isHost: isHost,
        }}
      />
    );
  }

  if (clientState.gameState.phase === "gameOver") {
    const winner = clientState.gameState.turn;
    return (
      <GameOver
        {...{
          serverDispatch,
          isHost,
          winner,
        }}
      />
    );
  }

  return (
    <>
      {!!clientState.gameState.turn && (
        <div>Its {clientState.gameState.turn.name}&apos;s Turn</div>
      )}
      <div className="flex justify-between flex-wrap">
        {otherUsers.map((user) => (
          <div key={user.id}>
            {user.name}&apos;s cards
            <div className="relative w-[155px] overflow-hidden h-[160px]">
              {Array.from(Array(user.cardCount).keys()).map((i) => {
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${(i * 35) / user.cardCount}px`,
                      top: `${(i * 20) / user.cardCount}px`,
                      rotate: `${(i * 35) / user.cardCount}deg`,
                    }}
                  >
                    <CardComponent />
                  </div>
                );
              })}
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
                className="bg-black rounded-sm p-2 inline-block shadow-sm text-xs text-stone-50 hover:cursor-pointer"
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
                  className="bg-black rounded-sm p-2 inline-block shadow-sm text-xs text-stone-50 hover:cursor-pointer"
                  onClick={() => discardCard({ card, id })}
                >
                  Play
                </button>
              )}
            </CardComponent>
          );
        })}
      </div>
      <div className="text-center">{username}</div>
      {logs === "true" && (
        <div className="bg-yellow-100 flex flex-col p-4 rounded-sm text-sm">
          {clientState.gameState.log.map((logEntry, i) => (
            <p key={logEntry.dt} className="animate-appear text-black">
              {logEntry.message}
            </p>
          ))}
        </div>
      )}
    </>
  );
};

export default Game;
