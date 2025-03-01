import { FC } from "react";
import { Action, User } from "../../game/logic";
import NameForm from "./NameForm";

interface GameLobbyProps {
  isHost: boolean;
  winner: User;
  serverDispatch: (action: Action) => void;
}

const GameOver: FC<GameLobbyProps> = ({ serverDispatch, isHost, winner }) => {
  const startGame = () => serverDispatch({ type: "startGame" });

  return (
    <>
      <div className="text-lg">{winner.name} Won!</div>
      {isHost && (
        <div>
          <button
            onClick={startGame}
            className="w-full disabled:opacity-50 rounded-sm border p-5 bg-yellow-400 group text-black shadow-sm enabled:hover:shadow-lg enabled:hover:cursor-pointer transition-all duration-200"
          >
            Play Again
          </button>
        </div>
      )}
    </>
  );
};

export default GameOver;
