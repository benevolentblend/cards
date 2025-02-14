import { useState } from "react";
import { useGameRoom } from "@/hooks/useGameRoom";
import { getCardValues, suitToColor } from "@/utils";
import { Card } from "../../game/Cards";

interface GameProps {
  username: string;
  roomId: string;
}

const Game = ({ username, roomId }: GameProps) => {
  const { gameState, dispatch } = useGameRoom(username, roomId);

  // Local state to use for the UI
  const [guess, setGuess] = useState<number>(0);

  // Indicated that the game is loading
  if (gameState === null) {
    return (
      <p>
        <span className="transition-all w-fit inline-block mr-4 animate-bounce">
          🎲
        </span>
        Waiting for server...
      </p>
    );
  }

  const drawCard = () => {
    // Dispatch allows you to send an action!
    // Modify /game/logic.ts to change what actions you can send
    dispatch({ type: "draw" });
  };

  const discardCard = (card: Card) => {
    // Dispatch allows you to send an action!
    // Modify /game/logic.ts to change what actions you can send
    dispatch({ type: "discard", card });
  };

  return (
    <>
      <div className="">
        {gameState.users.map((user) => (
          <div key={user.id}>
            {user.id}&apos;s cards
            <div className="flex flex-wrap">
              {user.cards.map((card) => {
                const { suit, name } = getCardValues(card);

                return (
                  <div
                    className={`grid justify-center content-center p-1 rounded-md w-24 h-32 border border-solid ${suitToColor(
                      suit
                    )}`}
                    key={card}
                  >
                    <div className="rounded-full text-center align-middle bg-white w-20 h-20 p-6 text-lg">
                      {name}
                    </div>
                    <button
                      className="bg-black rounded p-2 inline-block shadow text-xs text-stone-50 hover:animate-wiggle"
                      onClick={() => discardCard(card)}
                    >
                      Discard
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          className="bg-black rounded p-2 inline-block shadow text-xs text-stone-50 hover:animate-wiggle"
          onClick={drawCard}
        >
          Draw Card
        </button>
      </div>
      <div className=" bg-yellow-100 flex flex-col p-4 rounded text-sm">
        {gameState.log.map((logEntry, i) => (
          <p key={logEntry.dt} className="animate-appear text-black">
            {logEntry.message}
          </p>
        ))}
      </div>

      <h2 className="text-lg">
        Players in room <span className="font-bold">{roomId}</span>
      </h2>
    </>
  );
};

export default Game;
