import type * as Party from "partykit/server";
import { z } from "zod";

import {
  gameUpdater,
  initialGame,
  Action,
  ServerAction,
  convertServerToClientState,
  validateServerAction,
} from "../game/logic";
import { ServerGameState } from "../game/logic";

type CardConnection = Party.Connection<{ name: string }>;

const requestPayloadValidator = z.object({
  message: z.enum(["count"]),
});

const DEFAULT_HEADERS = {
  "Access-Control-Allow-Origin": process.env.APP_URL || "",
};

export default class Server implements Party.Server {
  private gameState: ServerGameState;

  constructor(readonly room: Party.Room) {
    this.gameState = initialGame();
    console.log("Room created:", room.id);
    // party.storage.put;
  }
  onConnect(connection: CardConnection, { request }: Party.ConnectionContext) {
    // A websocket just connected!

    // let's send a message to the connection
    // conn.send();
    const name = new URL(request.url).searchParams.get("name") ?? "User";
    connection.setState({ name });
    this.gameState = gameUpdater(
      { type: "UserEntered", user: { id: connection.id, name } },
      this.gameState
    );

    this.room.broadcast(
      JSON.stringify({
        type: "gameState",
        payload: convertServerToClientState(this.gameState),
      })
    );
    const userId = this.gameState.users.findIndex(
      (user) => user.id === connection.id
    );

    if (userId >= 0) {
      connection.send(
        JSON.stringify({
          type: "hand",
          payload: this.gameState.users[userId].cards,
        })
      );
    }
  }
  onClose(connection: CardConnection) {
    const name = connection.state?.name ?? "";
    this.gameState = gameUpdater(
      {
        type: "UserExit",
        user: { id: connection.id, name },
      },
      this.gameState
    );
    this.room.broadcast(
      JSON.stringify({
        type: "gameState",
        payload: convertServerToClientState(this.gameState),
      })
    );
  }
  onMessage(message: string, sender: CardConnection) {
    const name = sender.state?.name ?? "";
    const action: ServerAction = {
      ...(JSON.parse(message) as Action),
      user: { id: sender.id, name },
    };
    console.log(`Received action ${action.type} from user ${sender.id}`);
    const userIndex = this.gameState.users.findIndex(
      (user) => user.id === action.user.id
    );

    const error = validateServerAction(action, this.gameState, userIndex);

    if (error) {
      switch (error.reason) {
        case "userNotFound":
          console.error(`User ${name} was not found`);
          return;
        case "badDiscard":
          console.log(`User ${name} can not play card ${error.card}`);
          sender.send(
            JSON.stringify({
              type: "hand",
              payload: this.gameState.users[userIndex].cards,
            })
          );
          return;
        case "wrongTurn":
          console.log(`It is not ${name}'s turn.`);
          return;
      }
    }

    this.gameState = gameUpdater(action, this.gameState);
    this.room.broadcast(
      JSON.stringify({
        type: "gameState",
        payload: convertServerToClientState(this.gameState),
      })
    );

    if (action.type === "draw") {
      sender.send(
        JSON.stringify({
          type: "draw",
          payload:
            this.gameState.users[userIndex].cards[
              this.gameState.users[userIndex].cards.length - 1
            ],
        })
      );
    }

    if (action.type === "startGame") {
      this.gameState.users.forEach((user) => {
        const connection = this.room.getConnection(user.id)?.send(
          JSON.stringify({
            type: "hand",
            payload: user.cards,
          })
        );
      });
    }
  }
  async onRequest(request: Party.Request) {
    if (request.method !== "POST") {
      return new Response("Bad request", { status: 400 });
    }

    const payload = await request.json();
    const parsePayload = requestPayloadValidator.safeParse(payload);

    if (!parsePayload.success) {
      return new Response("Bad request", { status: 400 });
    }

    switch (parsePayload.data.message) {
      case "count":
        const count = Array.from(this.room.getConnections()).length;
        return new Response(JSON.stringify({ count: count }), {
          headers: DEFAULT_HEADERS,
        });
    }
  }
}

Server satisfies Party.Worker;
