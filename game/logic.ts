import { Connection } from "partykit/server";
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
}

export interface UserWithCards extends User {
  cards: Card[];
}

export interface UserWithCardCount extends User {
  cardCount: number;
}

// Do not change this! Every game has a list of users and log of actions
interface BaseGameState {
  log: {
    dt: number;
    message: string;
  }[];
}

// Do not change!
export type Action = DefaultAction | GameAction;

// Do not change!
export type ServerAction = WithUser<DefaultAction> | WithUser<GameAction>;

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
    users: [],
    deck: deck.getCards(),
    discardPile: discardPile.getCards(),
    log: addLog("Game Created!", []),
  };
};

// Here are all the actions we can dispatch for a user
type GameAction = { type: "draw" } | { type: "discard"; card: Card };

export const gameUpdater = (
  action: ServerAction,
  state: ServerGameState
): ServerGameState => {
  const deck = new Deck(state.deck);

  switch (action.type) {
    case "UserEntered":
      const newUserHand = deck.deal(HAND_SIZE);

      return {
        ...state,
        users: [
          ...state.users,
          { ...action.user, cards: newUserHand.getCards() },
        ],
        log: addLog(`user ${action.user.id} joined 🎉`, state.log),
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
        users: state.users.filter((user) => user.id !== action.user.id),
        log: addLog(`user ${action.user.id} left 😢`, state.log),
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
        log: addLog(`user ${action.user.id} drew a card!`, state.log),
      };

    case "discard":
      const discardPile = new CardCollection(state.discardPile);
      return {
        ...state,
        deck: deck.getCards(),
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
      };
  }
};
