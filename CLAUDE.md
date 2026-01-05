# Card Game

A real-time multiplayer card game (similar to UNO) built with Next.js and PartyKit.

## Tech Stack

- **Frontend**: Next.js (Pages Router), React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives with Tailwind styling)
- **Backend**: PartyKit (WebSocket server for real-time multiplayer)
- **Icons**: Lucide React

## Project Structure

```
src/
  components/     # React components (Game, Card, GameLobby, GameOver, etc.)
  components/ui/  # shadcn/ui components (Button, etc.)
  hooks/          # Custom hooks (useGameRoom, useLocalStorage)
  pages/          # Next.js pages
  styles/         # Global CSS
  utils/          # Utility functions

game/
  logic.ts        # Core game state machine and action handlers
  Cards.ts        # Card types and deck utilities

party/
  index.ts        # PartyKit WebSocket server
```

## Key Concepts

### Game Phases
- `lobby` - Players join, host can start game when 2+ players
- `game` - Active gameplay with turns
- `gameOver` - Winner declared, can play again

### User Types
- **Players** - Active participants with cards
- **Spectators** - Observers who can join between games
- **Host** - First player, can start games and kick disconnected players

### Card Types
- Number cards (1-9) in 4 colors (R, G, B, Y)
- Skip cards - Skip next player's turn
- Reverse cards - Change play direction

### State Architecture
- `ServerGameState` - Full state with cards (server-side)
- `ClientGameState` - Sanitized state without other players' cards (client-side)
- Actions flow: Client -> PartyKit Server -> Broadcast to all clients

## Commands

```bash
npm run dev        # Start development server (Next.js + PartyKit)
npm run build      # Production build
npm run lint       # Run ESLint
```

## Environment Variables

Create a `.env` file:
```
APP_URL=http://localhost:3000
```

## Features

- Real-time multiplayer via WebSockets
- Player reconnection (cards preserved during active game)
- Spectator mode
- Host can kick disconnected players
- Direction indicator (clockwise/counterclockwise)
