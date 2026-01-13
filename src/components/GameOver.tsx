import Logs from './Logs';
import NameForm from './NameForm';
import PlayerList from './PlayerList';

import type { Action, User } from '../../game/logic';
import type { FC } from 'react';

interface LogEntry {
  dt: number;
  message: string;
}

interface GameOverProps {
  otherUsers: User[];
  hostId: string;
  isHost: boolean;
  isSpectator: boolean;
  winner: User;
  username: string;
  visibleUserId: string;
  wins: Record<string, number>;
  setUsername: (username: string) => void;
  serverDispatch: (action: Action) => void;
  log: LogEntry[];
}

const GameOver: FC<GameOverProps> = ({
  otherUsers,
  hostId,
  serverDispatch,
  isHost,
  isSpectator,
  winner,
  username,
  visibleUserId,
  wins,
  setUsername,
  log,
}) => {
  const startGame = () => serverDispatch({ type: 'startGame' });
  const joinGame = () => serverDispatch({ type: 'becomePlayer' });
  const becomeSpectator = () => serverDispatch({ type: 'becomeSpectator' });

  const initial = winner.name.charAt(0).toUpperCase() || '?';
  const canStartGame = otherUsers.length >= 1;

  // Build scoreboard: combine current user with other users, sorted by wins
  const allPlayers = isSpectator
    ? otherUsers
    : [{ id: visibleUserId, name: username || 'You' }, ...otherUsers];

  const scoreboard = allPlayers
    .map((user) => ({
      ...user,
      wins: wins[user.id] ?? 0,
    }))
    .sort((a, b) => b.wins - a.wins);

  return (
    <div className="space-y-6 py-4 text-center">
      <div className="animate-bounce text-6xl">🎉</div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-stone-800">Game Over!</h2>
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-bold text-white shadow-lg">
            {initial}
          </div>
        </div>
        <p className="text-xl text-stone-700">
          <span className="font-semibold text-amber-600">{winner.name}</span>{' '}
          wins!
        </p>
      </div>

      <div className="flex justify-center gap-2 text-4xl">
        <span className="animate-pulse" style={{ animationDelay: '0ms' }}>
          🏆
        </span>
        <span className="animate-pulse" style={{ animationDelay: '200ms' }}>
          ⭐
        </span>
        <span className="animate-pulse" style={{ animationDelay: '400ms' }}>
          🎊
        </span>
      </div>

      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <h3 className="mb-3 font-semibold text-stone-700">Scoreboard</h3>
        <div className="space-y-2">
          {scoreboard.map((player, index) => {
            const isWinner = player.id === winner.id;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  isWinner
                    ? 'bg-amber-200 font-semibold text-amber-900'
                    : 'bg-white/50 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <span>👑</span>}
                  <span>{player.name}</span>
                </div>
                <span>
                  {player.wins} win{player.wins !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <PlayerList {...{ isHost, isSpectator, hostId, otherUsers, username }} />

      <div className="border-t border-stone-200 pt-4">
        <NameForm username={username} setUsername={setUsername} />
      </div>

      <div className="space-y-3 pt-2">
        {isSpectator ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-stone-100 p-3">
              <span className="text-stone-600">👀 You were spectating</span>
            </div>
            <button
              onClick={joinGame}
              className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              🎮 Join Next Game
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {isHost ? (
              <button
                onClick={startGame}
                disabled={!canStartGame}
                className={`w-full rounded-xl p-4 font-semibold shadow-lg transition-all duration-200 ${
                  canStartGame
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-stone-900 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]'
                    : 'cursor-not-allowed bg-stone-200 text-stone-400'
                }`}
              >
                {canStartGame ? '🎲 Play Again ' : '⏳ Waiting for players...'}
              </button>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="font-medium text-amber-800">
                  ⏳ Waiting for host to start a new game...
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
      </div>

      <Logs log={log} />
    </div>
  );
};

export default GameOver;
