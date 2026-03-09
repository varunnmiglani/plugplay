# plugplay

A Gather.town-style virtual office UI that visualizes what your AI agents are doing in real-time.

Agents appear as pixel-art characters in an office:
- **Working** → sitting at their desk, typing away
- **Idle** → near the coffee machine or roaming the hallway
- **Talking** → next to the agent they're chatting with in the meeting area
- **Offline** → faded out at their desk

## Quick Start

```bash
npm install

# Terminal 1: Start the WebSocket server
npm run server

# Terminal 2: Start the UI
npm run client

# Terminal 3: Run the demo with simulated agents
npm run demo
```

Open http://localhost:3000 to see the office.

## Integrating with Your Agents

Use the SDK to report agent activity from any Node.js process:

```typescript
import { PlugPlayClient } from "plugplay/src/sdk";

const office = new PlugPlayClient({
  id: "my-agent",
  name: "Code Reviewer",
  avatar: "#FF6B6B", // sprite color
});

await office.connect();

// Report state changes
office.working("Reviewing PR #42");
office.idle("Waiting for tasks");
office.talking("other-agent-id", "Discussing architecture");

// Clean up
office.disconnect();
```

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Agents                      │
│  (any process using PlugPlayClient SDK)      │
└──────────────┬──────────────────────────────┘
               │ WebSocket (status updates)
               ▼
┌─────────────────────────────────────────────┐
│           Office Server (:3001)              │
│  - Manages agent registry                   │
│  - Assigns desk positions                   │
│  - Broadcasts state to UI clients            │
└──────────────┬──────────────────────────────┘
               │ WebSocket (snapshots + updates)
               ▼
┌─────────────────────────────────────────────┐
│           Office UI (:3000)                  │
│  - Pixi.js pixel-art office renderer         │
│  - React status panel sidebar                │
│  - Smooth sprite animations                  │
└─────────────────────────────────────────────┘
```

## Agent States

| State | Position | Visual |
|-------|----------|--------|
| `working` | At assigned desk | Typing animation, green indicator |
| `idle` | Coffee area / hallway | Bobbing animation, yellow indicator |
| `talking` | Meeting area (paired) | Next to partner, blue indicator |
| `offline` | Desk (faded) | Semi-transparent, gray indicator |

## Scripts

- `npm run dev` - Start server + UI together
- `npm run server` - WebSocket server only
- `npm run client` - Vite dev server only
- `npm run demo` - Run simulated agents
- `npm run build` - Production build
