import { FC } from "react";
import { Action, User } from "../../game/logic";
import NameForm from "./NameForm";

interface GameLobbyProps {
  otherUsers: User[];
  username: string;
  isHost: boolean;
  isSpectator: boolean;
  spectatorCount: number;
  serverDispatch: (action: Action) => void;
  setUsername: (username: string) => void;
}

const GameLobby: FC<GameLobbyProps> = ({
  otherUsers,
  serverDispatch,
  username,
  setUsername,
  isHost,
  isSpectator,
  spectatorCount,
}) => {
  const startGame = () => serverDispatch({ type: "startGame" });
  const joinGame = () => serverDispatch({ type: "becomePlayer" });
  const becomeSpectator = () => serverDispatch({ type: "becomeSpectator" });

  return (
    <>
      <ul>
        {otherUsers.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      {spectatorCount > 0 && (
        <p className="text-sm text-stone-500 my-2">
          {spectatorCount} spectator{spectatorCount !== 1 ? "s" : ""} watching
        </p>
      )}
      <NameForm {...{ username, setUsername }} />
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
        <>
          {isHost && (
            <div>
              <button
                onClick={startGame}
                className="w-full disabled:opacity-50 rounded-sm border p-5 bg-yellow-400 group text-black shadow-sm enabled:hover:shadow-lg enabled:hover:cursor-pointer transition-all duration-200"
              >
                Start Game
              </button>
            </div>
          )}
          <div className="mt-4">
            <button
              onClick={becomeSpectator}
              className="w-full rounded-sm border p-3 bg-stone-200 text-stone-600 text-sm hover:bg-stone-300 hover:cursor-pointer transition-all duration-200"
            >
              Become Spectator
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default GameLobby;
