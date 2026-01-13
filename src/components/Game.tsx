import { useState } from 'react';

import { useGameRoom } from '@/hooks/useGameRoom';
import { canBeDiscarded, isWildCard } from '@/utils';

import CallOutButton from './CallOutButton';
import CardComponent from './Card';
import ColorPicker from './ColorPicker';
import GameLobby from './GameLobby';
import GameOver from './GameOver';
import Logs from './Logs';
import OneMoreCardButton from './OneMoreCardButton';
import Opponent from './Opponent';
import PendingDrawIndicator from './PendingDrawIndicator';

import type { ColorSuit } from '../../game/Cards';
import type { CardWithId } from '@/hooks/useGameRoom';
import type { FC } from 'react';

interface GameProps {
  username: string;
  setUsername: (username: string) => void;
  id: string;
  roomId: string;
}

const Game: FC<GameProps> = ({ username, setUsername, id, roomId }) => {
  const { clientState, serverDispatch, clientDispatch } = useGameRoom(
    username,
    id,
    roomId
  );
  const [pendingWildCard, setPendingWildCard] = useState<CardWithId | null>(
    null
  );

  if (clientState.gameState === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 animate-bounce text-4xl">🃏</div>
        <p className="animate-pulse text-stone-500">Connecting to game...</p>
      </div>
    );
  }
  const hostId = clientState.gameState.host.id;
  const isHost = clientState.gameState.host.id === id;
  const lastDiscarded = clientState.gameState.lastDiscarded;
  const isUsersTurn =
    clientState.gameState.turn && clientState.gameState.turn.id === id;
  const isPlayer = clientState.gameState.users.some((user) => user.id === id);
  const isSpectator = !isPlayer;
  const otherUsers = clientState.gameState.users.filter(
    (user) => user.id !== id
  );
  const spectatorCount = clientState.gameState.spectatorCount;
  const direction = clientState.gameState.direction;
  const effectiveColor = clientState.gameState.effectiveColor;
  const pendingDrawCount = clientState.gameState.pendingDrawCount;
  const pendingDrawType = clientState.gameState.pendingDrawType;
  const oneMoreCard = clientState.gameState.oneMoreCard;

  // One more card logic
  const myCardCount = clientState.hand.length;
  const canDeclareOneMoreCard = isUsersTurn && myCardCount === 2;
  const hasDeclared = oneMoreCard?.declaredBy === id;
  const declaredByUser = oneMoreCard?.declaredBy
    ? clientState.gameState.users.find((u) => u.id === oneMoreCard.declaredBy)
    : null;

  // Call out logic
  const vulnerablePlayerId = oneMoreCard?.vulnerablePlayer;
  const vulnerableUser = vulnerablePlayerId
    ? clientState.gameState.users.find((u) => u.id === vulnerablePlayerId)
    : null;
  const canCallOut =
    isPlayer && vulnerablePlayerId && vulnerablePlayerId !== id;

  const drawCard = () => {
    serverDispatch({ type: 'draw' });
  };

  const discardCard = (card: CardWithId) => {
    if (isWildCard(card.card)) {
      // Show color picker for wild cards
      setPendingWildCard(card);
    } else {
      serverDispatch({ type: 'discard', card: card.card });
      clientDispatch({ type: 'discard', payload: card.id });
    }
  };

  const handleColorChoice = (color: ColorSuit) => {
    if (pendingWildCard) {
      serverDispatch({
        type: 'discard',
        card: pendingWildCard.card,
        chosenColor: color,
      });
      clientDispatch({ type: 'discard', payload: pendingWildCard.id });
      setPendingWildCard(null);
    }
  };

  const declareOneMoreCard = () => {
    serverDispatch({ type: 'declareOneMoreCard' });
  };

  const callOutPlayer = (targetUserId: string) => {
    serverDispatch({ type: 'callOut', targetUserId });
  };

  if (clientState.gameState.phase === 'lobby') {
    return (
      <GameLobby
        {...{
          otherUsers,
          setUsername,
          username,
          hostId,
          serverDispatch,
          isHost,
          isSpectator,
          spectatorCount,
          log: clientState.gameState.log,
        }}
      />
    );
  }

  if (clientState.gameState.phase === 'gameOver') {
    const winner = clientState.gameState.turn;
    return (
      <GameOver
        {...{
          hostId,
          otherUsers,
          serverDispatch,
          isHost,
          isSpectator,
          winner,
          username,
          setUsername,
          log: clientState.gameState.log,
        }}
      />
    );
  }

  const becomeSpectator = () => serverDispatch({ type: 'becomeSpectator' });

  return (
    <div className="space-y-4">
      {isSpectator && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-stone-200 to-stone-300 p-3 text-center text-stone-600">
          <span className="text-lg">👀</span>
          <span>Spectating</span>
          {spectatorCount > 1 && (
            <span className="text-sm text-stone-500">
              ({spectatorCount} watching)
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-stone-500">
            Host:{' '}
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs text-amber-800">
              {clientState.gameState.host.name}
            </span>
          </span>
          <span className="text-stone-500">Direction:</span>
          <span className="text-lg">
            {direction === 'clockwise' ? '➡️' : '⬅️'}
          </span>
        </div>
        {spectatorCount > 0 && !isSpectator && (
          <div className="flex items-center gap-1 text-stone-500">
            <span>👀</span>
            <span>{spectatorCount}</span>
          </div>
        )}
      </div>

      {isUsersTurn && (
        <div className="box-border rounded-xl border border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 p-3 text-center">
          <span className="font-semibold text-amber-800">🎯 Your turn!</span>
        </div>
      )}

      {canDeclareOneMoreCard && (
        <div className="flex justify-center">
          <OneMoreCardButton
            hasDeclared={hasDeclared}
            onDeclare={declareOneMoreCard}
          />
        </div>
      )}

      {!!clientState.gameState.turn && !isUsersTurn && (
        <div className="box-border rounded-xl bg-stone-100 p-3 text-center">
          <span className="text-stone-600">
            Waiting for {clientState.gameState.turn.name}...
          </span>
        </div>
      )}

      {declaredByUser && !hasDeclared && (
        <div className="rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 p-3 text-center">
          <span className="font-semibold text-orange-800">
            {declaredByUser.name} declared &quot;One more Card!&quot;
          </span>
        </div>
      )}

      {canCallOut && vulnerableUser && (
        <div className="flex justify-center">
          <CallOutButton
            vulnerableUserName={vulnerableUser.name}
            onCallOut={() => callOutPlayer(vulnerablePlayerId)}
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 py-2">
        {clientState.gameState.users.map((user) => (
          <Opponent
            key={user.id}
            user={user}
            isTheirTurn={clientState.gameState?.turn?.id === user.id}
            isHost={isHost}
            onKick={() =>
              serverDispatch({ type: 'kickPlayer', targetUserId: user.id })
            }
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 py-6">
        <PendingDrawIndicator pendingDrawCount={pendingDrawCount} />
        <div className="flex h-55 w-55 items-start justify-center gap-4">
          <div className="text-center">
            <p className="mb-2 text-xs text-stone-500">Discard Pile</p>
            <div className="transform transition-transform hover:scale-105">
              <CardComponent
                card={lastDiscarded}
                effectiveColor={effectiveColor}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs text-stone-500">Draw Pile</p>
            <CardComponent />
            {isUsersTurn && (
              <button
                className={`mt-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 ${
                  pendingDrawCount > 0
                    ? 'bg-gradient-to-r from-red-500 to-orange-600'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                }`}
                onClick={drawCard}
              >
                {pendingDrawCount > 0
                  ? `Draw ${pendingDrawCount} Cards`
                  : 'Draw Card'}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isSpectator && (
        <>
          <div className="border-t border-stone-200 pt-4">
            <p className="mb-3 text-center text-sm text-stone-500">Your Hand</p>
            <div className="flex flex-wrap justify-center gap-2">
              {clientState.hand.map(({ card, id: cardId }) => {
                const cardCanBeDiscarded = canBeDiscarded(
                  lastDiscarded,
                  card,
                  effectiveColor,
                  pendingDrawType
                );
                const isPlayable = isUsersTurn && cardCanBeDiscarded;
                return (
                  <div
                    key={cardId}
                    className={`transition-all duration-200 ${
                      isPlayable
                        ? 'rounded-xl ring-2 ring-green-400 ring-offset-2'
                        : ''
                    }`}
                  >
                    <CardComponent card={card}>
                      {isPlayable && (
                        <button
                          className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                          onClick={() => discardCard({ card, id: cardId })}
                        >
                          Play
                        </button>
                      )}
                    </CardComponent>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 text-center">
            <span className="font-medium text-stone-700">{username}</span>
            {isHost && (
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs text-amber-800">
                Host
              </span>
            )}
            <button
              onClick={becomeSpectator}
              className="text-xs text-stone-400 transition-colors hover:text-stone-600"
            >
              Leave Game
            </button>
          </div>
        </>
      )}

      <Logs log={clientState.gameState.log} />

      <ColorPicker
        isOpen={pendingWildCard !== null}
        onSelectColor={handleColorChoice}
      />
    </div>
  );
};

export default Game;
