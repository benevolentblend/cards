import { FC } from "react";
import { User } from "../../game/logic";
import PlayerAvatar from "./PlayerAvatar";

interface PlayerListProps {
  otherUsers: User[];
  isSpectator: boolean;
  isHost: boolean;
  hostId: string;
  username: string;
}

const PlayerList: FC<PlayerListProps> = ({
  otherUsers,
  isSpectator,
  hostId,
  isHost,
  username,
}) => {
  const totalPlayers = otherUsers.length + (isSpectator ? 0 : 1);

  return (
    <>
      <div className="text-center">
        <p className="text-stone-500">
          {totalPlayers} player{totalPlayers !== 1 ? "s" : ""} at the table
        </p>
      </div>
      <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-6 border border-emerald-200">
        <div className="flex flex-wrap justify-center gap-6">
          {!isSpectator && (
            <PlayerAvatar name={username || "You"} isHost={isHost} />
          )}
          {otherUsers.map((user) => {
            const playerIsHost = user.id === hostId;
            return (
              <PlayerAvatar
                key={user.id}
                name={user.name}
                isHost={playerIsHost}
              />
            );
          })}
          {totalPlayers === 0 && (
            <p className="text-stone-500 italic">No players yet...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerList;
