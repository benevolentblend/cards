import type { FC } from 'react';

interface PendingDrawIndicatorProps {
  pendingDrawCount: number;
}

const PendingDrawIndicator: FC<PendingDrawIndicatorProps> = ({
  pendingDrawCount,
}) => {
  if (pendingDrawCount === 0) return null;

  return (
    <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600 shadow">
      +{pendingDrawCount} pending!
    </div>
  );
};

export default PendingDrawIndicator;
