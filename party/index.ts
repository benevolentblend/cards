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
    const name = new URL(request.url).searchParams.get("name") ?? "User";
    connection.setState({ name });

    // Join as spectator if game is in progress, otherwise as player
    const isGameInProgress = this.gameState.phase !== "lobby";
    const actionType = isGameInProgress ? "SpectatorEntered" : "UserEntered";

    this.gameState = gameUpdater(
      { type: actionType, user: { id: connection.id, name } },
      this.gameState
    );

    this.room.broadcast(
      JSON.stringify({
        type: "gameState",
        payload: convertServerToClientState(this.gameState),
      })
    );

    // Send hand to player (spectators don't get a hand)
    const userIndex = this.gameState.users.findIndex(
      (user) => user.id === connection.id
    );

    if (userIndex >= 0) {
      connection.send(
        JSON.stringify({
          type: "hand",
          payload: this.gameState.users[userIndex].cards,
        })
      );
    }
  }
  onClose(connection: CardConnection) {
    const name = connection.state?.name ?? "";

    // Determine if disconnecting user is a player or spectator
    const isPlayer = this.gameState.users.some((u) => u.id === connection.id);
    const actionType = isPlayer ? "UserExit" : "SpectatorExit";

    this.gameState = gameUpdater(
      {
        type: actionType,
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

    // Spectator actions don't need player validation
    const isSpectatorAction = action.type === "becomePlayer";
    const isPlayerToSpectatorAction = action.type === "becomeSpectator";

    if (isSpectatorAction) {
      // Verify sender is actually a spectator
      const isSpectator = this.gameState.spectators.some(
        (s) => s.id === sender.id
      );
      if (!isSpectator) {
        console.log(`${name} is not a spectator`);
        return;
      }
    } else if (isPlayerToSpectatorAction) {
      // Verify sender is actually a player
      const isPlayer = this.gameState.users.some((u) => u.id === sender.id);
      if (!isPlayer) {
        console.log(`${name} is not a player`);
        return;
      }
    } else {
      // Regular player actions - validate normally
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
    }

    this.gameState = gameUpdater(action, this.gameState);
    this.room.broadcast(
      JSON.stringify({
        type: "gameState",
        payload: convertServerToClientState(this.gameState),
      })
    );

    // Find user index after state update (may have changed)
    const userIndex = this.gameState.users.findIndex(
      (user) => user.id === sender.id
    );

    if (action.type === "draw" && userIndex >= 0) {
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
        this.room.getConnection(user.id)?.send(
          JSON.stringify({
            type: "hand",
            payload: user.cards,
          })
        );
      });
    }

    // Send hand to player who just became a player (empty hand in lobby)
    if (action.type === "becomePlayer" && userIndex >= 0) {
      sender.send(
        JSON.stringify({
          type: "hand",
          payload: this.gameState.users[userIndex].cards,
        })
      );
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
