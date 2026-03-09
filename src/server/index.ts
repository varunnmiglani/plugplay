import { WebSocketServer, WebSocket } from "ws";
import type { Agent, ClientMessage, ServerMessage, OfficeLayout } from "../shared/types.js";
import { createDefaultOffice, getRandomRoamPosition } from "../shared/office-layout.js";

const PORT = 3001;
const OFFLINE_TIMEOUT_MS = 30_000;

const office: OfficeLayout = createDefaultOffice();
const agents = new Map<string, Agent>();
const uiClients = new Set<WebSocket>();
const agentClients = new Map<string, WebSocket>();
let nextDeskIndex = 0;

function assignDesk(agentId: string): { x: number; y: number } {
  const available = office.desks.find((d) => !d.assignedTo);
  if (available) {
    available.assignedTo = agentId;
    return available.position;
  }
  // Overflow: put them at a roam spot
  return getRandomRoamPosition(office);
}

function freeDeskFor(agentId: string): void {
  const desk = office.desks.find((d) => d.assignedTo === agentId);
  if (desk) desk.assignedTo = undefined;
}

function getPositionForState(agent: Agent): { x: number; y: number } {
  switch (agent.state) {
    case "working": {
      const desk = office.desks.find((d) => d.assignedTo === agent.id);
      return desk ? desk.position : assignDesk(agent.id);
    }
    case "idle":
      return getRandomRoamPosition(office);
    case "talking": {
      if (agent.talkingTo) {
        const partner = agents.get(agent.talkingTo);
        if (partner) {
          // Pick a meeting spot near the partner
          const spot = office.meetingSpots[0];
          return spot;
        }
      }
      return office.meetingSpots[0];
    }
    case "offline": {
      const desk = office.desks.find((d) => d.assignedTo === agent.id);
      return desk ? desk.position : { x: 0, y: 0 };
    }
  }
}

function broadcast(msg: ServerMessage): void {
  const data = JSON.stringify(msg);
  for (const client of uiClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function sendSnapshot(client: WebSocket): void {
  const msg: ServerMessage = {
    type: "snapshot",
    agents: Array.from(agents.values()),
    office,
  };
  client.send(JSON.stringify(msg));
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const role = url.searchParams.get("role");

  if (role === "ui") {
    // UI client connecting
    uiClients.add(ws);
    sendSnapshot(ws);
    ws.on("close", () => uiClients.delete(ws));
    console.log("[server] UI client connected");
    return;
  }

  // Agent client
  ws.on("message", (raw) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString());

      switch (msg.type) {
        case "register": {
          const deskPos = assignDesk(msg.id);
          const agent: Agent = {
            id: msg.id,
            name: msg.name,
            avatar: msg.avatar || randomColor(),
            state: "idle",
            activity: "Just joined the office",
            position: getRandomRoamPosition(office),
            lastSeen: Date.now(),
          };
          agents.set(msg.id, agent);
          agentClients.set(msg.id, ws);
          broadcast({ type: "agent_update", agent });
          console.log(`[server] Agent registered: ${msg.name} (${msg.id})`);
          break;
        }

        case "status": {
          const agent = agents.get(msg.id);
          if (!agent) break;
          agent.state = msg.state;
          agent.activity = msg.activity;
          agent.talkingTo = msg.talkingTo;
          agent.lastSeen = Date.now();

          // Handle talking pairs - position them next to each other
          if (msg.state === "talking" && msg.talkingTo) {
            const partner = agents.get(msg.talkingTo);
            if (partner) {
              const spotIdx = Math.floor(Math.random() * Math.floor(office.meetingSpots.length / 2)) * 2;
              agent.position = office.meetingSpots[spotIdx];
              partner.position = office.meetingSpots[spotIdx + 1] || office.meetingSpots[spotIdx];
              broadcast({ type: "agent_update", agent: partner });
            }
          } else {
            agent.position = getPositionForState(agent);
          }

          broadcast({ type: "agent_update", agent });
          break;
        }

        case "disconnect": {
          const agent = agents.get(msg.id);
          if (agent) {
            agent.state = "offline";
            agent.activity = "Offline";
            broadcast({ type: "agent_update", agent });
          }
          break;
        }
      }
    } catch (e) {
      console.error("[server] Bad message:", e);
    }
  });

  ws.on("close", () => {
    // Find which agent this was and mark offline
    for (const [id, client] of agentClients) {
      if (client === ws) {
        const agent = agents.get(id);
        if (agent) {
          agent.state = "offline";
          agent.activity = "Disconnected";
          broadcast({ type: "agent_update", agent });
        }
        agentClients.delete(id);
        break;
      }
    }
  });
});

// Periodic check for agents that haven't reported in
setInterval(() => {
  const now = Date.now();
  for (const [id, agent] of agents) {
    if (agent.state !== "offline" && now - agent.lastSeen > OFFLINE_TIMEOUT_MS) {
      agent.state = "offline";
      agent.activity = "Timed out";
      broadcast({ type: "agent_update", agent });
    }
  }
}, 10_000);

function randomColor(): string {
  const colors = ["#4ECDC4", "#FF6B6B", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"];
  return colors[nextDeskIndex++ % colors.length];
}

console.log(`[plugplay] Office server running on ws://localhost:${PORT}`);
console.log(`[plugplay] UI clients connect to ws://localhost:${PORT}?role=ui`);
console.log(`[plugplay] Agents connect to ws://localhost:${PORT}`);
