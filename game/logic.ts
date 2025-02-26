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
}

export interface UserWithCards extends User {
  cards: Card[];
}

export interface UserWithCardCount extends User {
  cardCount: number;
}

// Do not change this! Every game has a list of users and log of actions
interface BaseGameState {
  turn: User;
  direction: "clockwise" | "counterclockwise";
  log: {
    dt: number;
    message: string;
  }[];
}

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

export type DefaultAction = { type: "UserEntered" } | { type: "UserExit" };

// This interface holds all the information about your game

export interface ServerGameState extends BaseGameState {
  users: UserWithCards[];
  deck: Card[];
  discardPile: Card[];
}

export type GameErrorState =
  | {
      reason: "user_not_found";
    }
  | {
      reason: "bad_discard";
      card: Card;
    }
  | { reason: "wrong_turn" };

export interface ClientGameState extends BaseGameState {
  users: UserWithCardCount[];
  lastDiscarded: Card;
}

// This is how a fresh new game starts out, it's a function so you can make it dynamic!
export const initialGame = (): ServerGameState => {
  const deck = Deck.Build({ duplicates: 2 });
  const discardPile = new CardCollection([]);

  deck.shuffle();
  discardPile.addCards([deck.takeCard()]);
  return {
    turn: { id: "", name: "Temp" },
    direction: "clockwise",
    users: [],
    deck: deck.getCards(),
    discardPile: discardPile.getCards(),
    log: addLog("Game Created!", []),
  };
};

// Here are all the actions we can dispatch for a user
type GameAction = { type: "draw" } | { type: "discard"; card: Card };

export const validateServerAction = (
  action: ServerAction,
  state: ServerGameState,
  userIndex: number
): GameErrorState | null => {
  if (userIndex < 0) {
    return { reason: "user_not_found" };
  }

  if (action.user.id !== state.turn.id) {
    return { reason: "wrong_turn" };
  }

  if (action.type === "discard") {
    const lastDiscarded = state.discardPile[0];

    if (!canBeDiscarded(lastDiscarded, action.card))
      return { reason: "bad_discard", card: action.card };
  }

  return null;
};

const getNextTurn = (action: ServerAction, state: ServerGameState): User => {
  const userIndex = state.users.findIndex((user) => user.id === action.user.id);
  const userCount = state.users.length;
  const move = state.direction === "clockwise" ? userIndex + 1 : userIndex - 1;

  const nextIndex = ((move % userCount) + userCount) % userCount; // wrapping formula from Liam
  return state.users[nextIndex];
};

export const gameUpdater = (
  action: ServerAction,
  state: ServerGameState
): ServerGameState => {
  const deck = new Deck(state.deck);

  switch (action.type) {
    case "UserEntered":
      const newUserHand = deck.deal(HAND_SIZE);
      const turn =
        state.turn.id === ""
          ? { name: action.user.name, id: action.user.id }
          : state.turn; // If this is the first user in the room, make it their turn

      const users = [
        ...state.users,
        { ...action.user, cards: newUserHand.getCards() },
      ];

      return {
        ...state,
        turn,
        users,
        log: addLog(
          `${action.user.name} (${action.user.id}) joined 🎉, ${users.length} user(s) in room`,
          state.log
        ),
      };

    case "UserExit":
      // Add users cards back to the deck
      state.users.forEach((user) => {
        if (user.id === action.user.id) {
          deck.addCards(user.cards);
        }
      });

      return {
        ...state,
        deck: deck.getCards(),
        turn:
          state.turn.id === action.user.id
            ? getNextTurn(action, state)
            : state.turn,
        users: state.users.filter((user) => user.id !== action.user.id),
        log: addLog(`user ${action.user.name} left 😢`, state.log),
      };

    case "draw":
      if (deck.isEmpty()) {
        return {
          ...state,
          log: addLog(`No more cards!`, state.log),
        };
      }
      const drawnCard = deck.drawCard();
      return {
        ...state,
        deck: deck.getCards(),
        users: state.users.map((user) =>
          user.id !== action.user.id
            ? user
            : { ...user, cards: [...user.cards, drawnCard] }
        ),
        log: addLog(`user ${action.user.name} drew a card!`, state.log),
      };

    case "discard":
      const discardPile = new CardCollection(state.discardPile);
      const { name: discardName } = getCardValues(action.card);
      const direction =
        discardName === "Reverse"
          ? state.direction === "clockwise"
            ? "counterclockwise"
            : "clockwise"
          : state.direction;
      return {
        ...state,
        direction,
        users: state.users.map((user) => {
          if (user.id === action.user.id) {
            const userHand = new Hand(user.cards);

            if (userHand.hasCard(action.card)) {
              userHand.playCard(action.card);
              discardPile.addCards([action.card]);
            }

            return { ...user, cards: [...userHand.getCards()] };
          }

          return user;
        }),
        turn: getNextTurn(action, state),
      };
  }
};

export const convertServerToClientState = (
  gameState: ServerGameState
): ClientGameState => {
  const { log, users, discardPile, turn, direction } = gameState;
  return {
    turn,
    direction,
    lastDiscarded: discardPile[0],
    users: users.map(({ cards, id, name }) => {
      return { id, name, cardCount: cards.length };
    }),
    log,
  };
};
