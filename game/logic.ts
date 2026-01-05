import { canBeDiscarded, getCardValues } from "@/utils";
import { CardCollection, Deck, Hand, Card } from "./Cards";

// util for easy adding logs
const addLog = (
  message: string,
  logs: BaseGameState["log"]
): BaseGameState["log"] => {
  return [{ dt: new Date().getTime(), message: message }, ...logs].slice(
    0,
    MAX_LOG_SIZE
  );
};

// If there is anything you want to track for a specific user, change this interface
export interface User {
  id: string;
  name: string;
  disconnected: boolean;
}

export interface UserWithCards extends User {
  cards: Card[];
}

export interface UserWithCardCount extends User {
  cardCount: number;
}

type Direction = "clockwise" | "counterclockwise";

// initial host until a user is assigned
const fakeHost = {
  id: "fakehost",
  name: "",
  disconnected: true,
};

type BaseGameState =
  | {
      turn?: User;
      phase: "lobby";
      host: User;
      direction: Direction;
      log: {
        dt: number;
        message: string;
      }[];
    }
  | {
      turn: User;
      phase: "game" | "gameOver";
      host: User;
      direction: Direction;
      log: {
        dt: number;
        message: string;
      }[];
    };

// Do not change!
export type Action = DefaultAction | GameAction;

// Do not change!
export type ServerAction = WithUser<DefaultAction> | WithUser<GameAction>;

export type ClientAction =
  | { type: "gameState"; payload: ClientGameState }
  | { type: "discard"; payload: string }
  | { type: "hand"; payload: Card[] }
  | { type: "draw"; payload: Card };

// The maximum log size, change as needed
const MAX_LOG_SIZE = 4;
const HAND_SIZE = 7;

type WithUser<T> = T & { user: User };

export type DefaultAction =
  | { type: "UserEntered" }
  | { type: "UserExit" }
  | { type: "UserDisconnected" }
  | { type: "UserReconnected" }
  | { type: "SpectatorEntered" }
  | { type: "SpectatorExit" };

// Here are all the actions we can dispatch for a user
type GameAction =
  | { type: "startGame" }
  | { type: "draw" }
  | { type: "discard"; card: Card }
  | { type: "becomeSpectator" }
  | { type: "becomePlayer" }
  | { type: "kickPlayer"; targetUserId: string };

// This interface holds all the information about your game

export type ServerGameState = BaseGameState & {
  users: UserWithCards[];
  disconnectedUsers: UserWithCards[];
  spectators: User[];
  deck: Card[];
  discardPile: Card[];
};

export type GameErrorState =
  | {
      reason: "userNotFound";
    }
  | {
      reason: "badDiscard";
      card: Card;
    }
  | { reason: "wrongTurn" };

export type ClientGameState = BaseGameState & {
  users: UserWithCardCount[];
  spectatorCount: number;
  lastDiscarded: Card;
};

// This is how a fresh new game starts out, it's a function so you can make it dynamic!
export const initialGame = (): ServerGameState => {
  const deck = Deck.Build({ duplicates: 2 });
  const discardPile = new CardCollection([]);

  deck.shuffle();
  discardPile.addCards([deck.takeCard()]);
  return {
    turn: undefined,
    host: fakeHost,
    phase: "lobby",
    direction: "clockwise",
    users: [],
    disconnectedUsers: [],
    spectators: [],
    deck: deck.getCards(),
    discardPile: discardPile.getCards(),
    log: addLog("Game Created!", []),
  };
};

export const validateServerAction = (
  action: ServerAction,
  state: ServerGameState,
  userIndex: number
): GameErrorState | null => {
  if (userIndex < 0) {
    return { reason: "userNotFound" };
  }

  if (state.phase === "game" && action.user.id !== state.turn.id) {
    return { reason: "wrongTurn" };
  }

  if (action.type === "discard") {
    const lastDiscarded = state.discardPile[0];

    if (!canBeDiscarded(lastDiscarded, action.card))
      return { reason: "badDiscard", card: action.card };
  }

  return null;
};

const getNextTurn = (
  currentTurn: User,
  users: UserWithCards[],
  direction: Direction
): User => {
  const userIndex = users.findIndex((user) => user.id === currentTurn.id);
  const userCount = users.length;
  const move = direction === "clockwise" ? userIndex + 1 : userIndex - 1;

  const nextIndex = ((move % userCount) + userCount) % userCount; // wrapping formula from Liam
  return users[nextIndex];
};

const getOtherDirection = (direction: Direction): Direction =>
  direction === "clockwise" ? "counterclockwise" : "clockwise";

const handleUserEntered = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: "UserEntered" }>
): ServerGameState => {
  const newUserHand =
    state.phase === "game" ? deck.deal(HAND_SIZE) : new Hand();
  const isFirstPlayer = state.host.id === fakeHost.id;
  const users = [
    ...state.users,
    { ...action.user, cards: newUserHand.getCards() },
  ];

  const host = isFirstPlayer ? action.user : state.host;
  const nextState = {
    ...state,
    host,
    log: addLog(
      `${action.user.name} (${action.user.id}) joined 🎉, ${users.length} user(s) in room`,
      state.log
    ),
  };

  return {
    ...nextState,
    users,
  };
};

const handleUserExited = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: "UserExit" }>
): ServerGameState => {
  const remainingUsers = state.users.filter(
    (user) => user.id !== action.user.id && !user.disconnected
  );
  const isLastPlayer = remainingUsers.length === 0;

  // Reassign host if the leaving player was the host
  const needsNewHost = state.host.id === action.user.id;
  const newHost = isLastPlayer
    ? fakeHost
    : needsNewHost
    ? remainingUsers[0]
    : state.host;

  let log = addLog(`user ${action.user.name} left 😢`, state.log);

  if (needsNewHost) {
    log = addLog(`user ${newHost.name} promoted to host`, state.log);
  }

  const nextState = {
    ...state,
    users: remainingUsers,
    deck: deck.getCards(),
    host: newHost,
    log: log,
  };

  // No players left - reset to lobby
  if (isLastPlayer) {
    return {
      ...nextState,
      phase: "lobby",
      turn: undefined,
    };
  }

  if (state.phase === "lobby") {
    return nextState;
  }

  // Advance turn if it was the leaving player's turn
  const isLeavingPlayersTurn = state.turn.id === action.user.id;
  return {
    ...nextState,
    turn: isLeavingPlayersTurn
      ? getNextTurn(action.user, remainingUsers, state.direction)
      : state.turn,
  };
};

const handleStartGame = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: "startGame" }>
): ServerGameState => {
  // Need at least 2 players to start
  if (state.users.length < 2) {
    return state;
  }

  state.users.forEach((user) => {
    deck.addCards(user.cards);
  });

  deck.shuffle();

  const users = state.users.map((user) => ({
    ...user,
    cards: deck.deal(HAND_SIZE).getCards(),
  }));

  return {
    ...state,
    deck: deck.getCards(),
    turn: getNextTurn(action.user, state.users, state.direction),
    users,
    phase: "game",
  };
};

const handleDrew = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: "draw" }>
) => {
  let discardPile = state.discardPile;
  let log = state.log;

  if (deck.isEmpty()) {
    console.log(state);
    const [topCard, ...newDeck] = state.discardPile;
    discardPile = [topCard];
    console.log(newDeck);
    deck.addCards(newDeck);
    deck.shuffle();
    log = addLog(`Shuffled discard pile into deck!`, state.log);
  }
  const drawnCard = deck.drawCard();
  return {
    ...state,
    deck: deck.getCards(),
    discardPile,
    users: state.users.map((user) =>
      user.id !== action.user.id
        ? user
        : { ...user, cards: [...user.cards, drawnCard] }
    ),
    log: addLog(`user ${action.user.name} drew a card!`, log),
  };
};

const handleDiscarded = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: "discard" }>
): ServerGameState => {
  if (state.phase === "lobby") {
    return state;
  }

  const discardPile = new CardCollection(state.discardPile);
  const { name: discardName } = getCardValues(action.card);
  let hasWon = false;
  const users = state.users.map((user) => {
    if (user.id === action.user.id) {
      const userHand = new Hand(user.cards);

      if (userHand.hasCard(action.card)) {
        userHand.playCard(action.card);
        discardPile.addCards([action.card]);

        hasWon = userHand.isEmpty();
      }
      return { ...user, cards: [...userHand.getCards()] };
    }

    return user;
  });

  if (hasWon) {
    return {
      ...state,
      users: users,
      phase: "gameOver",
    };
  }

  const direction =
    discardName === "Reverse"
      ? getOtherDirection(state.direction)
      : state.direction;

  const nextTurn = getNextTurn(action.user, users, direction);
  const turn =
    discardName === "Skip" ? getNextTurn(nextTurn, users, direction) : nextTurn;

  return {
    ...state,
    direction,
    discardPile: discardPile.getCards(),
    users,
    turn,
  };
};

const handleSpectatorEntered = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: "SpectatorEntered" }>
): ServerGameState => {
  return {
    ...state,
    spectators: [...state.spectators, action.user],
    log: addLog(`${action.user.name} is now spectating 👀`, state.log),
  };
};

const handleSpectatorExited = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: "SpectatorExit" }>
): ServerGameState => {
  return {
    ...state,
    spectators: state.spectators.filter((s) => s.id !== action.user.id),
    log: addLog(`spectator ${action.user.name} left`, state.log),
  };
};

const handleBecomeSpectator = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: "becomeSpectator" }>
): ServerGameState => {
  const user = state.users.find((u) => u.id === action.user.id);
  if (!user) return state;

  // Return user's cards to deck
  deck.addCards(user.cards);

  const remainingUsers = state.users.filter((u) => u.id !== action.user.id);
  const isOnePlayerLeft = remainingUsers.length === 1;
  const isNoPlayersLeft = remainingUsers.length === 0;

  // Reassign host if needed
  const needsNewHost = state.host.id === action.user.id;
  const newHost = isNoPlayersLeft
    ? fakeHost
    : needsNewHost
    ? remainingUsers[0]
    : state.host;

  const baseState = {
    ...state,
    users: remainingUsers,
    spectators: [
      ...state.spectators,
      { id: user.id, name: user.name, disconnected: false },
    ],
    deck: deck.getCards(),
    host: newHost,
    log: addLog(`${action.user.name} is now spectating 👀`, state.log),
  };

  // No players left - reset to lobby
  if (isNoPlayersLeft) {
    return {
      ...baseState,
      phase: "lobby",
      turn: undefined,
    };
  }

  if (state.phase === "lobby") {
    return baseState;
  }

  // Only 1 player left during game - they win
  if (isOnePlayerLeft) {
    return {
      ...baseState,
      phase: "gameOver",
      turn: remainingUsers[0],
    };
  }

  // Advance turn if it was this player's turn
  const wasTheirTurn = state.turn.id === action.user.id;
  return {
    ...baseState,
    turn: wasTheirTurn
      ? getNextTurn(action.user, remainingUsers, state.direction)
      : state.turn,
  };
};

const handleBecomePlayer = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: "becomePlayer" }>
): ServerGameState => {
  // Only allowed in lobby or gameOver phase
  if (state.phase !== "lobby" && state.phase !== "gameOver") return state;

  const spectator = state.spectators.find((s) => s.id === action.user.id);
  if (!spectator) return state;

  return {
    ...state,
    spectators: state.spectators.filter((s) => s.id !== action.user.id),
    users: [...state.users, { ...spectator, cards: [] }],
    log: addLog(`${action.user.name} joined the game 🎉`, state.log),
  };
};

const handleUserDisconnected = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: "UserDisconnected" }>
): ServerGameState => {
  const user = state.users.find((u) => u.id === action.user.id);
  if (!user) return state;

  const remainingUsers = state.users.filter(
    (u) => u.id !== action.user.id && !u.disconnected
  );
  const isNoPlayersLeft = remainingUsers.length === 0;
  const needsNewHost = state.host.id === action.user.id;
  const newHost = isNoPlayersLeft
    ? fakeHost
    : needsNewHost
    ? remainingUsers[0]
    : state.host;

  const updatedUsers = state.users.map((user) => {
    const isDisconnectedUser = user.id === action.user.id;

    return {
      ...user,
      disconnected: isDisconnectedUser ? true : user.disconnected,
    };
  });

  // Move user to disconnected list, keep their cards
  // Don't end the game - give them a chance to reconnect
  return {
    ...state,
    users: updatedUsers,
    disconnectedUsers: [...state.disconnectedUsers, user],
    host: newHost,
    log: addLog(`${action.user.name} disconnected`, state.log),
  };
};

const handleUserReconnected = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: "UserReconnected" }>
): ServerGameState => {
  const disconnectedUser = state.disconnectedUsers.find(
    (u) => u.id === action.user.id
  );
  if (!disconnectedUser) return state;

  const updatedUsers = state.users.map((user) => {
    const isReconnectedUser = user.id === action.user.id;

    return {
      ...user,
      disconnected: isReconnectedUser ? false : user.disconnected,
    };
  });

  return {
    ...state,
    users: updatedUsers,
    disconnectedUsers: state.disconnectedUsers.filter(
      (u) => u.id !== action.user.id
    ),
    log: addLog(`${action.user.name} reconnected 🔄`, state.log),
  };
};

const handleKickPlayer = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: "kickPlayer" }>
): ServerGameState => {
  const isInGame = state.phase === "game";

  // Only host can kick
  if (action.user.id !== state.host.id) return state;

  const targetId = action.targetUserId;
  const disconnectedUser = state.disconnectedUsers.find(
    (u) => u.id === targetId
  );

  if (!disconnectedUser) return state;

  const remainingUsers = state.users.filter(
    (u) => u.id !== action.targetUserId
  );
  const isOnePlayerLeft = remainingUsers.length === 1;

  if (isOnePlayerLeft) {
    return {
      ...state,
      phase: "gameOver",
      turn: remainingUsers[0],
    };
  }

  // Return kicked player's cards to deck
  deck.addCards(disconnectedUser.cards);

  const wasKickedPlayersTurn =
    isInGame && disconnectedUser.id === state.turn.id;

  const nextTurn = wasKickedPlayersTurn
    ? getNextTurn(state.turn, remainingUsers, state.direction)
    : state.turn;

  const updates: ServerGameState = {
    ...state,
    users: remainingUsers,
    disconnectedUsers: state.disconnectedUsers.filter((u) => u.id !== targetId),
    deck: deck.getCards(),
    log: addLog(`${disconnectedUser.name} was kicked`, state.log),
  };

  if (wasKickedPlayersTurn) {
    updates["turn"] = nextTurn;
  }

  return updates;
};

export const gameUpdater = (
  action: ServerAction,
  state: ServerGameState
): ServerGameState => {
  const deck = new Deck(state.deck);

  switch (action.type) {
    case "UserEntered":
      return handleUserEntered(deck, state, action);
    case "UserExit":
      return handleUserExited(deck, state, action);
    case "UserDisconnected":
      return handleUserDisconnected(state, action);
    case "UserReconnected":
      return handleUserReconnected(state, action);
    case "SpectatorEntered":
      return handleSpectatorEntered(state, action);
    case "SpectatorExit":
      return handleSpectatorExited(state, action);
    case "startGame":
      return handleStartGame(deck, state, action);
    case "draw":
      return handleDrew(deck, state, action);
    case "discard":
      return handleDiscarded(state, action);
    case "becomeSpectator":
      return handleBecomeSpectator(deck, state, action);
    case "becomePlayer":
      return handleBecomePlayer(state, action);
    case "kickPlayer":
      return handleKickPlayer(deck, state, action);
  }
};

export const convertServerToClientState = (
  gameState: ServerGameState
): ClientGameState => {
  const {
    users,
    disconnectedUsers,
    discardPile,
    deck,
    spectators,
    ...safeState
  } = gameState;

  // Combine active and disconnected users, marking disconnected ones
  const allUsers: UserWithCardCount[] = [
    ...users.map(({ cards, id, name, disconnected }) => ({
      id,
      name,
      cardCount: cards.length,
      disconnected: disconnected,
    })),
  ];

  return {
    ...safeState,
    lastDiscarded: discardPile[0],
    spectatorCount: spectators.length,
    users: allUsers,
  };
};
