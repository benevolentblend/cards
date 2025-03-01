import { FC } from "react";
import { Action, User } from "../../game/logic";
import NameForm from "./NameForm";

interface GameLobbyProps {
  otherUsers: User[];
  username: string;
  isHost: boolean;
  serverDispatch: (action: Action) => void;
  setUsername: (username: string) => void;
}

const GameLobby: FC<GameLobbyProps> = ({
  otherUsers,
  serverDispatch,
  username,
  setUsername,
  isHost,
}) => {
  const startGame = () => serverDispatch({ type: "startGame" });

  return (
    <>
      <ul>
        {otherUsers.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <NameForm {...{ username, setUsername }} />
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
    </>
  );
};

export default GameLobby;
