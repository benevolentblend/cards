import { FC } from "react";
import { Action, User } from "../../game/logic";
import NameForm from "./NameForm";

interface GameOverProps {
  isHost: boolean;
  isSpectator: boolean;
  winner: User;
  serverDispatch: (action: Action) => void;
}

const GameOver: FC<GameOverProps> = ({
  serverDispatch,
  isHost,
  isSpectator,
  winner,
}) => {
  const startGame = () => serverDispatch({ type: "startGame" });
  const joinGame = () => serverDispatch({ type: "becomePlayer" });

  return (
    <>
      <div className="text-lg">{winner.name} Won!</div>
      {isSpectator ? (
        <div>
          <p className="text-stone-500 mb-2">You are spectating</p>
          <button
            onClick={joinGame}
            className="w-full rounded-sm border p-5 bg-green-500 text-white shadow-sm hover:shadow-lg hover:cursor-pointer transition-all duration-200"
          >
            Join Game
          </button>
        </div>
      ) : (
        isHost && (
          <div>
            <button
              onClick={startGame}
              className="w-full disabled:opacity-50 rounded-sm border p-5 bg-yellow-400 group text-black shadow-sm enabled:hover:shadow-lg enabled:hover:cursor-pointer transition-all duration-200"
            >
              Play Again
            </button>
          </div>
        )
      )}
    </>
  );
};

export default GameOver;
