import { FC } from "react";

interface PlayerAvatarProps {
  name: string;
  isHost?: boolean;
}

const PlayerAvatar: FC<PlayerAvatarProps> = ({ name, isHost }) => {
  const initial = name.charAt(0).toUpperCase() || "?";
  const colors = [
    "from-pink-400 to-rose-500",
    "from-violet-400 to-purple-500",
    "from-cyan-400 to-teal-500",
    "from-orange-400 to-amber-500",
  ];
  const colorIndex =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors[colorIndex]}
          flex items-center justify-center text-white text-xl font-bold shadow-md
          border-2 border-white/50`}
      >
        {initial}
      </div>
      <span className="text-sm font-medium text-stone-700 max-w-[80px] truncate">
        {name}
      </span>
      {isHost && (
        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
          Host
        </span>
      )}
    </div>
  );
};

export default PlayerAvatar;
