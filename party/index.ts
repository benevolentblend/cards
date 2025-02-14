import type * as Party from "partykit/server";

import { gameUpdater, initialGame, Action, ServerAction } from "../game/logic";
import { ServerGameState, ClientGameState } from "../game/logic";

export default class Server implements Party.Server {
  private gameState: ServerGameState;

  constructor(readonly party: Party.Party) {
    this.gameState = initialGame();
    console.log("Room created:", party.id);
    // party.storage.put;
  }
  onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!

    // let's send a message to the connection
    // conn.send();
    this.gameState = gameUpdater(
      { type: "UserEntered", user: { id: connection.id } },
      this.gameState
    );

    this.party.broadcast(JSON.stringify(this.gameState));
  }
  onClose(connection: Party.Connection) {
    this.gameState = gameUpdater(
      {
        type: "UserExit",
        user: { id: connection.id },
      },
      this.gameState
    );
    this.party.broadcast(JSON.stringify(this.gameState));
  }
  onMessage(message: string, sender: Party.Connection) {
    const action: ServerAction = {
      ...(JSON.parse(message) as Action),
      user: { id: sender.id },
    };
    console.log(`Received action ${action.type} from user ${sender.id}`);
    this.gameState = gameUpdater(action, this.gameState);
    this.party.broadcast(JSON.stringify(this.gameState));
  }
}

Server satisfies Party.Worker;
