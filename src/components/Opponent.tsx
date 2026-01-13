import type { UserWithCardCount } from '../../game/logic';
import type { FC } from 'react';

interface OpponentProps {
  user: UserWithCardCount;
  isTheirTurn: boolean;
  isHost: boolean;
  onKick: () => void;
}

const Opponent: FC<OpponentProps> = ({ user, isTheirTurn, isHost, onKick }) => {
  const initial = user.name.charAt(0).toUpperCase() || '?';
  const colors = [
    'from-pink-400 to-rose-500',
    'from-violet-400 to-purple-500',
    'from-cyan-400 to-teal-500',
    'from-orange-400 to-amber-500',
  ];
  const colorIndex =
    user.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  return (
    <div
      className={`box-border flex w-26 flex-col items-center rounded-xl p-3 transition-all duration-300 ${
        isTheirTurn
          ? 'bg-gradient-to-b from-amber-100 to-amber-200 shadow-lg ring-2 ring-amber-400'
          : 'bg-stone-100'
      } ${user.disconnected ? 'opacity-50' : ''}`}
    >
      <div className="relative">
        <div
          className={`h-12 w-12 rounded-full bg-gradient-to-br ${
            colors[colorIndex]
          } flex items-center justify-center border-2 text-lg font-bold text-white shadow-md ${isTheirTurn ? 'border-amber-400' : 'border-white/50'}`}
        >
          {initial}
        </div>
        {isTheirTurn && (
          <div className="absolute -top-1 -right-1 animate-bounce text-lg">
            🎯
          </div>
        )}
      </div>
      <span className="mt-1 max-w-[80px] truncate text-sm font-medium text-stone-700">
        {user.name}
      </span>
      <div className="mt-1 flex items-center gap-1">
        <span className="text-xs text-stone-500">
          {user.cardCount} card{user.cardCount === 1 ? '!' : 's'}
        </span>
      </div>
      {user.disconnected && (
        <div className="mt-1 flex flex-col items-center gap-1">
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-500">
            Offline
          </span>
          {isHost && (
            <button
              onClick={onKick}
              className="rounded px-2 py-0.5 text-xs text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
            >
              Remove
            </button>
          )}
        </div>
      )}

      <div className="mt-2 flex -space-x-6">
        {Array.from(Array(Math.min(user.cardCount, 5)).keys()).map((i) => (
          <div
            key={i}
            className="h-12 w-8 rounded border border-slate-900 bg-gradient-to-br from-slate-600 to-slate-800 shadow-sm"
            style={{
              transform: `rotate(${(i - 2) * 8}deg)`,
              zIndex: i,
            }}
          />
        ))}
        {user.cardCount > 5 && (
          <div
            className="z-10 flex h-12 w-8 items-center justify-center rounded border border-slate-600 bg-slate-500 text-xs font-bold text-white"
            style={{
              transform: `rotate(20deg)`,
            }}
          >
            +{user.cardCount - 5}
          </div>
        )}
      </div>
    </div>
  );
};

export default Opponent;
