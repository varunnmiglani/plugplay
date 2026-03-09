/** Agent activity states */
export type AgentState = "working" | "idle" | "talking" | "offline";

/** Position on the office grid */
export interface Position {
  x: number;
  y: number;
}

/** An agent in the virtual office */
export interface Agent {
  id: string;
  name: string;
  avatar: string; // color hex for the pixel sprite
  state: AgentState;
  /** What the agent is currently doing */
  activity: string;
  /** If talking, the ID of the agent they're talking to */
  talkingTo?: string;
  /** Current position in the office (managed by server) */
  position: Position;
  /** Last time the agent reported in */
  lastSeen: number;
}

/** Messages from agents to the server */
export type ClientMessage =
  | { type: "register"; id: string; name: string; avatar?: string }
  | { type: "status"; id: string; state: AgentState; activity: string; talkingTo?: string }
  | { type: "disconnect"; id: string };

/** Messages from server to the UI */
export type ServerMessage =
  | { type: "snapshot"; agents: Agent[]; office: OfficeLayout }
  | { type: "agent_update"; agent: Agent }
  | { type: "agent_removed"; id: string };

/** Office layout definition */
export interface OfficeLayout {
  width: number;
  height: number;
  tileSize: number;
  desks: Desk[];
  coffeeArea: Position;
  meetingSpots: Position[];
}

export interface Desk {
  id: string;
  position: Position;
  assignedTo?: string;
}
