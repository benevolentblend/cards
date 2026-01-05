import { CardWithId, useGameRoom } from "@/hooks/useGameRoom";
import CardComponent from "./Card";
import { canBeDiscarded } from "@/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import GameLobby from "./GameLobby";
import GameOver from "./GameOver";
import { FC } from "react";
import { UserWithCardCount } from "../../game/logic";

interface GameProps {
  username: string;
  setUsername: (username: string) => void;
  roomId: string;
  id: string;
}

interface OpponentProps {
  user: UserWithCardCount;
  isTheirTurn: boolean;
  isHost: boolean;
  onKick: () => void;
}

const Opponent: FC<OpponentProps> = ({ user, isTheirTurn, isHost, onKick }) => {
  const initial = user.name.charAt(0).toUpperCase() || "?";
  const colors = [
    "from-pink-400 to-rose-500",
    "from-violet-400 to-purple-500",
    "from-cyan-400 to-teal-500",
    "from-orange-400 to-amber-500",
  ];
  const colorIndex =
    user.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  return (
    <div
      className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
        isTheirTurn
          ? "bg-gradient-to-b from-amber-100 to-amber-200 ring-2 ring-amber-400 shadow-lg"
          : "bg-stone-100"
      } ${user.disconnected ? "opacity-50" : ""}`}
    >
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[colorIndex]}
            flex items-center justify-center text-white text-lg font-bold shadow-md
            border-2 ${isTheirTurn ? "border-amber-400" : "border-white/50"}`}
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
          <div className="w-8 h-12 bg-slate-500 rounded border border-slate-600 flex items-center justify-center text-white text-xs font-bold">
            +{user.cardCount - 5}
          </div>
        )}
      </div>
    </div>
  );
};

const Game = ({ username, setUsername, id, roomId }: GameProps) => {
  const { clientState, serverDispatch, clientDispatch } = useGameRoom(
    username,
    id,
    roomId
  );
  const [logs] = useLocalStorage("logs", "false");

  if (clientState.gameState === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-4xl mb-4 animate-bounce">🃏</div>
        <p className="text-stone-500 animate-pulse">Connecting to game...</p>
      </div>
    );
  }

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

  const drawCard = () => {
    serverDispatch({ type: "draw" });
  };

  const discardCard = (card: CardWithId) => {
    serverDispatch({ type: "discard", card: card.card });
    clientDispatch({ type: "discard", payload: card.id });
  };

  if (clientState.gameState.phase === "lobby") {
    return (
      <GameLobby
        {...{
          otherUsers,
          setUsername,
          username,
          serverDispatch,
          isHost,
          isSpectator,
          spectatorCount,
        }}
      />
    );
  }

  if (clientState.gameState.phase === "gameOver") {
    const winner = clientState.gameState.turn;
    return (
      <GameOver
        {...{
          serverDispatch,
          isHost,
          isSpectator,
          winner,
        }}
      />
    );
  }

  const becomeSpectator = () => serverDispatch({ type: "becomeSpectator" });

  return (
    <div className="space-y-4">
      {isSpectator && (
        <div className="bg-gradient-to-r from-stone-200 to-stone-300 text-stone-600 text-center p-3 rounded-xl flex items-center justify-center gap-2">
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
          <span className="text-stone-500">Direction:</span>
          <span className="text-lg">
            {direction === "clockwise" ? "➡️" : "⬅️"}
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
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-xl p-3 text-center">
          <span className="text-amber-800 font-semibold">🎯 Your turn!</span>
        </div>
      )}

      {!!clientState.gameState.turn && !isUsersTurn && (
        <div className="bg-stone-100 rounded-xl p-3 text-center">
          <span className="text-stone-600">
            Waiting for {clientState.gameState.turn.name}...
          </span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 py-2">
        {otherUsers.map((user) => (
          <Opponent
            key={user.id}
            user={user}
            isTheirTurn={clientState.gameState?.turn?.id === user.id}
            isHost={isHost}
            onKick={() =>
              serverDispatch({ type: "kickPlayer", targetUserId: user.id })
            }
          />
        ))}
      </div>

      <div className="flex justify-center py-6">
        <div className="flex gap-4 items-center">
          <div className="text-center">
            <p className="text-xs text-stone-500 mb-2">Discard Pile</p>
            <div className="transform hover:scale-105 transition-transform">
              <CardComponent card={lastDiscarded} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-500 mb-2">Draw Pile</p>
            <CardComponent />
            {isUsersTurn && (
              <button
                className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg px-4 py-2
                  text-white text-sm font-semibold shadow-md hover:shadow-lg
                  hover:scale-105 active:scale-95 transition-all"
                onClick={drawCard}
              >
                Draw Card
              </button>
            )}
          </div>
        </div>
      </div>

      {!isSpectator && (
        <>
          <div className="border-t border-stone-200 pt-4">
            <p className="text-center text-sm text-stone-500 mb-3">Your Hand</p>
            <div className="flex flex-wrap justify-center gap-2">
              {clientState.hand.map(({ card, id: cardId }) => {
                const cardCanBeDiscarded = canBeDiscarded(lastDiscarded, card);
                const isPlayable = isUsersTurn && cardCanBeDiscarded;
                return (
                  <div
                    key={cardId}
                    className={`transition-all duration-200 ${
                      isPlayable
                        ? "ring-2 ring-green-400 ring-offset-2 rounded-xl"
                        : ""
                    }`}
                  >
                    <CardComponent card={card}>
                      {isPlayable && (
                        <button
                          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-3 py-2
                            text-white text-xs font-semibold shadow-md hover:shadow-lg
                            hover:scale-105 active:scale-95 transition-all"
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

          <div className="text-center pt-2 flex justify-center items-center gap-3">
            <span className="font-medium text-stone-700">{username}</span>
            {isHost && (
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                Host
              </span>
            )}
            <button
              onClick={becomeSpectator}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Leave Game
            </button>
          </div>
        </>
      )}

      {logs === "true" && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mt-4">
          <p className="text-xs text-amber-700 font-medium mb-2">Game Log</p>
          <div className="space-y-1">
            {clientState.gameState.log.map((logEntry) => (
              <p
                key={logEntry.dt}
                className="text-sm text-amber-900 animate-appear"
              >
                {logEntry.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
