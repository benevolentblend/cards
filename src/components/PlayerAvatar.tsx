import type { FC } from 'react';

interface PlayerAvatarProps {
  name: string;
  isHost?: boolean;
}

const PlayerAvatar: FC<PlayerAvatarProps> = ({ name, isHost }) => {
  const initial = name.charAt(0).toUpperCase() || '?';
  const colors = [
    'from-pink-400 to-rose-500',
    'from-violet-400 to-purple-500',
    'from-cyan-400 to-teal-500',
    'from-orange-400 to-amber-500',
  ];
  const colorIndex =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-14 w-14 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center border-2 border-white/50 text-xl font-bold text-white shadow-md`}
      >
        {initial}
      </div>
      <span className="max-w-[80px] truncate text-sm font-medium text-stone-700">
        {name}
      </span>
      {isHost && (
        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
          Host
        </span>
      )}
    </div>
  );
};

export default PlayerAvatar;
