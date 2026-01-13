import type { FC } from 'react';

interface CallOutButtonProps {
  vulnerableUserName: string;
  onCallOut: () => void;
}

const CallOutButton: FC<CallOutButtonProps> = ({
  vulnerableUserName,
  onCallOut,
}) => {
  return (
    <button
      onClick={onCallOut}
      className="animate-pulse rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 font-semibold text-white shadow-md transition-all hover:scale-105"
    >
      Call out {vulnerableUserName}!
    </button>
  );
};

export default CallOutButton;
