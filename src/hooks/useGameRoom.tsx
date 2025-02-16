import usePartySocket from "partysocket/react";
import { useReducer } from "react";
import { Action, ClientGameState, ClientAction } from "../../game/logic";
import { Card } from "../../game/Cards";
import { v4 as uuid } from "uuid";

export interface CardWithId {
  card: Card;
  id: string;
}

interface ClientState {
  gameState: ClientGameState | null;
  hand: CardWithId[];
}

const initialState: ClientState = {
  gameState: null,
  hand: [],
};

const getCardWithId = (card: Card) => ({ card, id: uuid() });

const reducer = (state: ClientState, action: ClientAction): ClientState => {
  switch (action.type) {
    case "gameState":
      return { ...state, gameState: action.payload };
    case "hand":
      return { ...state, hand: action.payload.map(getCardWithId) };
    case "draw":
      return { ...state, hand: [...state.hand, getCardWithId(action.payload)] };
    case "discard":
      return {
        ...state,
        hand: state.hand.filter((card) => card.id !== action.payload),
      };
  }
};

export const useGameRoom = (name: string, id: string, roomId: string) => {
  const [clientState, clientDispatch] = useReducer(reducer, initialState);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999",
    room: roomId,
    id,
    onMessage(event: MessageEvent<string>) {
      clientDispatch(JSON.parse(event.data));
    },
    query: {
      name,
    },
  });

  const serverDispatch = (action: Action) => {
    socket.send(JSON.stringify(action));
  };

  return {
    clientState,
    serverDispatch,
    clientDispatch,
  };
};
