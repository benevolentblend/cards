import { canBeDiscarded, getCardValues, isDrawCard, isWildCard } from '@/utils';

import { CardCollection, Deck, Hand } from './Cards';

import type { Card, ColorSuit } from './Cards';

// util for easy adding logs
const addLog = (
  message: string,
  logs: BaseGameState['log']
): BaseGameState['log'] => {
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

type Direction = 'clockwise' | 'counterclockwise';

// initial host until a user is assigned
const fakeHost = {
  id: 'fakehost',
  name: '',
  disconnected: true,
};

type DrawPenaltyType = 'Draw2' | 'Draw4';

interface OneMoreCard {
  declaredBy: string;
  vulnerablePlayer: string;
}

type BaseGameState =
  | {
      turn?: User;
      phase: 'lobby';
      host: User;
      direction: Direction;
      effectiveColor: ColorSuit | null;
      pendingDrawCount: number;
      pendingDrawType: DrawPenaltyType | null;
      oneMoreCard: OneMoreCard | null;
      wins: Record<string, number>;
      log: {
        dt: number;
        message: string;
      }[];
    }
  | {
      turn: User;
      phase: 'game' | 'gameOver';
      host: User;
      direction: Direction;
      effectiveColor: ColorSuit | null;
      pendingDrawCount: number;
      pendingDrawType: DrawPenaltyType | null;
      oneMoreCard: OneMoreCard | null;
      wins: Record<string, number>;
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
  | { type: 'gameState'; payload: ClientGameState }
  | { type: 'discard'; payload: string }
  | { type: 'hand'; payload: Card[] }
  | { type: 'draw'; payload: Card | Card[] };

// The maximum log size, change as needed
const MAX_LOG_SIZE = 4;
const HAND_SIZE = 7;
const CALL_OUT_PENALTY = 3;

type WithUser<T> = T & { user: User };

export type DefaultAction =
  | { type: 'UserEntered' }
  | { type: 'UserExit' }
  | { type: 'UserDisconnected' }
  | { type: 'UserReconnected' }
  | { type: 'SpectatorEntered' }
  | { type: 'SpectatorExit' };

// Here are all the actions we can dispatch for a user
type GameAction =
  | { type: 'startGame' }
  | { type: 'draw' }
  | { type: 'discard'; card: Card; chosenColor?: ColorSuit }
  | { type: 'becomeSpectator' }
  | { type: 'becomePlayer' }
  | { type: 'kickPlayer'; targetUserId: string }
  | { type: 'declareOneMoreCard' }
  | { type: 'callOut'; targetUserId: string };

// This interface holds all the information about your game

export type ServerGameState = BaseGameState & {
  users: UserWithCards[];
  disconnectedUsers: string[];
  spectators: User[];
  deck: Card[];
  discardPile: Card[];
};

export type GameErrorState =
  | {
      reason: 'userNotFound';
    }
  | {
      reason: 'badDiscard';
      card: Card;
    }
  | { reason: 'wrongTurn' }
  | { reason: 'missingColorChoice' };

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

  // Ensure first card is not a wild or draw card
  let firstCard = deck.takeCard();
  while (isWildCard(firstCard) || isDrawCard(firstCard)) {
    deck.addCards([firstCard]);
    deck.shuffle();
    firstCard = deck.takeCard();
  }

  discardPile.addCards([firstCard]);
  return {
    turn: undefined,
    host: fakeHost,
    phase: 'lobby',
    direction: 'clockwise',
    effectiveColor: null,
    pendingDrawCount: 0,
    pendingDrawType: null,
    oneMoreCard: null,
    wins: {},
    users: [],
    disconnectedUsers: [],
    spectators: [],
    deck: deck.getCards(),
    discardPile: discardPile.getCards(),
    log: addLog('Game Created!', []),
  };
};

export const validateServerAction = (
  action: ServerAction,
  state: ServerGameState,
  userIndex: number
): GameErrorState | null => {
  if (userIndex < 0) {
    return { reason: 'userNotFound' };
  }

  if (state.phase === 'game' && action.user.id !== state.turn.id) {
    return { reason: 'wrongTurn' };
  }

  if (action.type === 'discard') {
    const lastDiscarded = state.discardPile[0];

    if (
      !canBeDiscarded(
        lastDiscarded,
        action.card,
        state.effectiveColor,
        state.pendingDrawType
      )
    )
      return { reason: 'badDiscard', card: action.card };

    // Wild cards must have a chosen color
    if (isWildCard(action.card) && !action.chosenColor) {
      return { reason: 'missingColorChoice' };
    }
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
  const move = direction === 'clockwise' ? userIndex + 1 : userIndex - 1;

  const nextIndex = ((move % userCount) + userCount) % userCount; // wrapping formula from Liam
  return users[nextIndex];
};

const getOtherDirection = (direction: Direction): Direction =>
  direction === 'clockwise' ? 'counterclockwise' : 'clockwise';

const handleUserEntered = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'UserEntered' }>
): ServerGameState => {
  const newUserHand =
    state.phase === 'game' ? deck.deal(HAND_SIZE) : new Hand();
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
      `${action.user.name} joined 🎉, ${users.length} user(s) in room`,
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
  action: Extract<ServerAction, { type: 'UserExit' }>
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
      phase: 'lobby',
      turn: undefined,
    };
  }

  if (state.phase === 'lobby') {
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
  action: Extract<ServerAction, { type: 'startGame' }>
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
    phase: 'game',
    oneMoreCard: null,
  };
};

const handleDrew = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'draw' }>
): ServerGameState => {
  let discardPile = state.discardPile;
  let log = state.log;

  // Determine how many cards to draw
  const drawCount = state.pendingDrawCount > 0 ? state.pendingDrawCount : 1;

  const reshuffleIfNeeded = () => {
    if (deck.isEmpty() && discardPile.length > 1) {
      const [topCard, ...newDeck] = discardPile;
      discardPile = [topCard];
      deck.addCards(newDeck);
      deck.shuffle();
      log = addLog('Shuffled discard pile into deck!', log);
    }
  };

  const drawnCards: Card[] = [];
  for (let i = 0; i < drawCount; i++) {
    reshuffleIfNeeded();
    if (!deck.isEmpty()) {
      drawnCards.push(deck.drawCard());
    }
  }

  const users = state.users.map((user) =>
    user.id !== action.user.id
      ? user
      : { ...user, cards: [...user.cards, ...drawnCards] }
  );

  // Clear pending draw after drawing
  const hadPenalty = state.pendingDrawCount > 0;

  // Clear declaration on draw (they didn't play their card)
  // Also clear vulnerability since this player took their turn
  const oneMoreCard = null;

  return {
    ...state,
    deck: deck.getCards(),
    discardPile,
    users,
    pendingDrawCount: 0,
    pendingDrawType: null,
    oneMoreCard,
    log: hadPenalty
      ? addLog(`${action.user.name} drew ${drawCount} cards!`, log)
      : log,
  };
};

const handleDeclareOneMoreCard = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'declareOneMoreCard' }>
): ServerGameState => {
  if (state.phase !== 'game') return state;

  // Only the current turn player can declare
  if (action.user.id !== state.turn.id) return state;

  // Player must have exactly 2 cards to declare
  const user = state.users.find((u) => u.id === action.user.id);
  if (!user || user.cards.length !== 2) return state;

  return {
    ...state,
    oneMoreCard: {
      declaredBy: action.user.id,
      vulnerablePlayer: '',
    },
    log: addLog(`${action.user.name} declared "One more Card!"`, state.log),
  };
};

const handleCallOut = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'callOut' }>
): ServerGameState => {
  if (state.phase !== 'game') return state;

  const targetId = action.targetUserId;

  // Verify target is actually vulnerable
  if (!state.oneMoreCard || state.oneMoreCard.vulnerablePlayer !== targetId)
    return state;

  // Cannot call out yourself
  if (action.user.id === targetId) return state;

  // Draw penalty cards
  let discardPile = state.discardPile;

  const reshuffleIfNeeded = () => {
    if (deck.isEmpty() && discardPile.length > 1) {
      const [topCard, ...newDeck] = discardPile;
      discardPile = [topCard];
      deck.addCards(newDeck);
      deck.shuffle();
    }
  };

  const penaltyCards: Card[] = [];
  for (let i = 0; i < CALL_OUT_PENALTY; i++) {
    reshuffleIfNeeded();
    if (!deck.isEmpty()) {
      penaltyCards.push(deck.drawCard());
    }
  }

  const users = state.users.map((user) =>
    user.id !== targetId
      ? user
      : { ...user, cards: [...user.cards, ...penaltyCards] }
  );

  const targetUser = state.users.find((u) => u.id === targetId);

  return {
    ...state,
    deck: deck.getCards(),
    discardPile,
    users,
    oneMoreCard: null,
    log: addLog(
      `${action.user.name} called out ${targetUser?.name}! Drew ${penaltyCards.length} cards as penalty.`,
      state.log
    ),
  };
};

const handleDiscarded = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'discard' }>
): ServerGameState => {
  if (state.phase === 'lobby') {
    return state;
  }

  const discardPile = new CardCollection(state.discardPile);
  const { suit: cardSuit, name: discardName } = getCardValues(action.card);
  let hasWon = false;
  let wentToOneCard = false;
  const users = state.users.map((user) => {
    if (user.id === action.user.id) {
      const userHand = new Hand(user.cards);

      if (userHand.hasCard(action.card)) {
        userHand.playCard(action.card);
        discardPile.addCards([action.card]);

        hasWon = userHand.isEmpty();
        wentToOneCard = userHand.getCount() === 1;
      }
      return { ...user, cards: [...userHand.getCards()] };
    }

    return user;
  });

  if (hasWon) {
    return {
      ...state,
      users: users,
      discardPile: discardPile.getCards(),
      phase: 'gameOver',
      effectiveColor: null,
      pendingDrawCount: 0,
      pendingDrawType: null,
      oneMoreCard: null,
      wins: {
        ...state.wins,
        [action.user.id]: (state.wins[action.user.id] ?? 0) + 1,
      },
    };
  }

  // Handle direction changes
  const direction =
    discardName === 'Reverse'
      ? getOtherDirection(state.direction)
      : state.direction;

  // Handle effective color
  let effectiveColor: ColorSuit | null = null;
  if (cardSuit === 'W' && action.chosenColor) {
    // Wild card: use chosen color
    effectiveColor = action.chosenColor;
  } else if (cardSuit !== 'W') {
    // Colored card: clear effective color (use card's own color)
    effectiveColor = null;
  }

  // Handle pending draw count
  let pendingDrawCount = state.pendingDrawCount;
  let pendingDrawType = state.pendingDrawType;

  if (discardName === 'Draw2') {
    pendingDrawCount += 2;
    pendingDrawType = 'Draw2';
  } else if (discardName === 'Draw4') {
    pendingDrawCount += 4;
    pendingDrawType = 'Draw4';
  }

  // Calculate next turn
  const nextTurn = getNextTurn(action.user, users, direction);

  // Only Skip cards skip the next player
  // Draw2 and Draw4 do NOT skip - the next player needs their turn to draw or stack
  const turn =
    discardName === 'Skip' ? getNextTurn(nextTurn, users, direction) : nextTurn;

  // Check if player went to 1 card without declaring
  const didDeclare = state.oneMoreCard?.declaredBy === action.user.id;
  const becameVulnerable = wentToOneCard && !didDeclare;

  // Only set oneMoreCard if player became vulnerable, otherwise null
  const oneMoreCard: OneMoreCard | null = becameVulnerable
    ? { declaredBy: '', vulnerablePlayer: action.user.id }
    : null;

  return {
    ...state,
    direction,
    discardPile: discardPile.getCards(),
    users,
    turn,
    effectiveColor,
    pendingDrawCount,
    pendingDrawType,
    oneMoreCard,
  };
};

const handleSpectatorEntered = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'SpectatorEntered' }>
): ServerGameState => {
  return {
    ...state,
    spectators: [...state.spectators, action.user],
    log: addLog(`${action.user.name} is now spectating 👀`, state.log),
  };
};

const handleSpectatorExited = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'SpectatorExit' }>
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
  action: Extract<ServerAction, { type: 'becomeSpectator' }>
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
      phase: 'lobby',
      turn: undefined,
    };
  }

  if (state.phase === 'lobby') {
    return baseState;
  }

  // Only 1 player left during game - they win
  if (isOnePlayerLeft) {
    const winner = remainingUsers[0];
    return {
      ...baseState,
      phase: 'gameOver',
      turn: winner,
      oneMoreCard: null,
      wins: {
        ...state.wins,
        [winner.id]: (state.wins[winner.id] ?? 0) + 1,
      },
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
  action: Extract<ServerAction, { type: 'becomePlayer' }>
): ServerGameState => {
  // Only allowed in lobby or gameOver phase
  if (state.phase !== 'lobby' && state.phase !== 'gameOver') return state;

  const spectator = state.spectators.find((s) => s.id === action.user.id);
  const needsNewHost = state.host.id === fakeHost.id;

  if (!spectator) return state;

  const newHost = needsNewHost ? spectator : state.host;

  return {
    ...state,
    host: newHost,
    spectators: state.spectators.filter((s) => s.id !== action.user.id),
    users: [...state.users, { ...spectator, cards: [] }],
    log: addLog(`${action.user.name} joined the game 🎉`, state.log),
  };
};

const handleUserDisconnected = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'UserDisconnected' }>
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
    disconnectedUsers: [...state.disconnectedUsers, user.id],
    host: newHost,
    log: addLog(`${action.user.name} disconnected`, state.log),
  };
};

const handleUserReconnected = (
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'UserReconnected' }>
): ServerGameState => {
  const disconnectedUser = state.disconnectedUsers.find(
    (userId) => userId === action.user.id
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
      (userId) => userId !== action.user.id
    ),
    log: addLog(`${action.user.name} reconnected 🔄`, state.log),
  };
};

const handleKickPlayer = (
  deck: Deck,
  state: ServerGameState,
  action: Extract<ServerAction, { type: 'kickPlayer' }>
): ServerGameState => {
  const isInGame = state.phase === 'game';

  // Only host can kick
  if (action.user.id !== state.host.id) return state;

  const targetId = action.targetUserId;
  const disconnectedUser = state.users.find((user) => user.id === targetId);

  if (!disconnectedUser) return state;

  const remainingUsers = state.users.filter(
    (u) => u.id !== action.targetUserId
  );
  const isOnePlayerLeft = remainingUsers.length === 1;

  if (isOnePlayerLeft) {
    const winner = remainingUsers[0];
    return {
      ...state,
      phase: 'gameOver',
      turn: winner,
      oneMoreCard: null,
      wins: {
        ...state.wins,
        [winner.id]: (state.wins[winner.id] ?? 0) + 1,
      },
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
    disconnectedUsers: state.disconnectedUsers.filter(
      (userId) => userId !== targetId
    ),
    deck: deck.getCards(),
    log: addLog(`${disconnectedUser.name} was kicked`, state.log),
  };

  if (wasKickedPlayersTurn) {
    updates['turn'] = nextTurn;
  }

  return updates;
};

export const gameUpdater = (
  action: ServerAction,
  state: ServerGameState
): ServerGameState => {
  const deck = new Deck(state.deck);

  switch (action.type) {
    case 'UserEntered':
      return handleUserEntered(deck, state, action);
    case 'UserExit':
      return handleUserExited(deck, state, action);
    case 'UserDisconnected':
      return handleUserDisconnected(state, action);
    case 'UserReconnected':
      return handleUserReconnected(state, action);
    case 'SpectatorEntered':
      return handleSpectatorEntered(state, action);
    case 'SpectatorExit':
      return handleSpectatorExited(state, action);
    case 'startGame':
      return handleStartGame(deck, state, action);
    case 'draw':
      return handleDrew(deck, state, action);
    case 'discard':
      return handleDiscarded(state, action);
    case 'becomeSpectator':
      return handleBecomeSpectator(deck, state, action);
    case 'becomePlayer':
      return handleBecomePlayer(state, action);
    case 'kickPlayer':
      return handleKickPlayer(deck, state, action);
    case 'declareOneMoreCard':
      return handleDeclareOneMoreCard(state, action);
    case 'callOut':
      return handleCallOut(deck, state, action);
  }
};

export const convertServerToClientState = (
  gameState: ServerGameState
): ClientGameState => {
  const { users, discardPile, spectators, ...safeState } = gameState;

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
