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
      className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 w-26 box-border ${
        isTheirTurn
          ? 'bg-gradient-to-b from-amber-100 to-amber-200 ring-2 ring-amber-400 shadow-lg'
          : 'bg-stone-100'
      } ${user.disconnected ? 'opacity-50' : ''}`}
    >
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${
            colors[colorIndex]
          }
            flex items-center justify-center text-white text-lg font-bold shadow-md
            border-2 ${isTheirTurn ? 'border-amber-400' : 'border-white/50'}`}
        >
          {initial}
        </div>
        {isTheirTurn && (
          <div className="absolute -top-1 -right-1 text-lg animate-bounce">
            🎯
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-stone-700 mt-1 max-w-[80px] truncate">
        {user.name}
      </span>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs text-stone-500">{user.cardCount} cards</span>
      </div>
      {user.disconnected && (
        <div className="flex flex-col items-center gap-1 mt-1">
          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
            Offline
          </span>
          {isHost && (
            <button
              onClick={onKick}
              className="text-xs text-red-600 hover:text-red-800 hover:bg-red-100 px-2 py-0.5 rounded transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}

      <div className="flex mt-2 -space-x-6">
        {Array.from(Array(Math.min(user.cardCount, 5)).keys()).map((i) => (
          <div
            key={i}
            className="w-8 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded border border-slate-900 shadow-sm"
            style={{
              transform: `rotate(${(i - 2) * 8}deg)`,
              zIndex: i,
            }}
          />
        ))}
        {user.cardCount > 5 && (
          <div
            className="w-8 h-12 bg-slate-500 rounded border border-slate-600 flex items-center justify-center text-white text-xs font-bold z-10"
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
