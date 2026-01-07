import Logs from './Logs';
import NameForm from './NameForm';
import PlayerList from './PlayerList';

import type { Action, User } from '../../game/logic';
import type { FC } from 'react';

interface LogEntry {
  dt: number;
  message: string;
}

interface GameLobbyProps {
  otherUsers: User[];
  username: string;
  hostId: string;
  isHost: boolean;
  isSpectator: boolean;
  spectatorCount: number;
  serverDispatch: (action: Action) => void;
  setUsername: (username: string) => void;
  log: LogEntry[];
}

const GameLobby: FC<GameLobbyProps> = ({
  otherUsers,
  serverDispatch,
  username,
  setUsername,
  isHost,
  hostId,
  isSpectator,
  spectatorCount,
  log,
}) => {
  const startGame = () => serverDispatch({ type: 'startGame' });
  const joinGame = () => serverDispatch({ type: 'becomePlayer' });
  const becomeSpectator = () => serverDispatch({ type: 'becomeSpectator' });
  const canStartGame = otherUsers.length >= 1;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-stone-800">Game Lobby</h2>
      </div>
      <PlayerList {...{ isHost, isSpectator, hostId, otherUsers, username }} />

      {spectatorCount > 0 && (
        <div className="flex items-center justify-center gap-2 text-stone-500">
          <span className="text-lg">👀</span>
          <span className="text-sm">
            {spectatorCount} spectator{spectatorCount !== 1 ? 's' : ''} watching
          </span>
        </div>
      )}

      <div className="border-t border-stone-200 pt-4">
        <NameForm {...{ username, setUsername }} />
      </div>

      {isSpectator ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-stone-100 p-3 text-center">
            <span className="text-stone-600">👀 You are spectating</span>
          </div>
          <button
            onClick={joinGame}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            🎮 Join Game
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {isHost && (
            <button
              onClick={startGame}
              disabled={!canStartGame}
              className={`w-full rounded-xl p-4 font-semibold shadow-lg transition-all duration-200 ${
                canStartGame
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-stone-900 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]'
                  : 'cursor-not-allowed bg-stone-200 text-stone-400'
              }`}
            >
              {canStartGame ? '🎲 Start Game' : '⏳ Waiting for players...'}
            </button>
          )}
          {!isHost && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="font-medium text-amber-800">
                ⏳ Waiting for host to start the game...
              </p>
            </div>
          )}
          <button
            onClick={becomeSpectator}
            className="w-full rounded-lg bg-stone-100 p-3 text-sm text-stone-600 transition-all duration-200 hover:bg-stone-200"
          >
            👀 Become Spectator
          </button>
        </div>
      )}

      <Logs log={log} />
    </div>
  );
};

export default GameLobby;
