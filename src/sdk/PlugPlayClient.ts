import WebSocket from "ws";
import type { AgentState, ClientMessage } from "../shared/types.js";

/**
 * PlugPlay SDK - Drop this into any agent to report its status
 * to the virtual office.
 *
 * Usage:
 *   const office = new PlugPlayClient({ id: "agent-1", name: "Code Reviewer" });
 *   await office.connect();
 *   office.working("Reviewing PR #42");
 *   office.talking("agent-2", "Discussing architecture");
 *   office.idle();
 *   office.disconnect();
 */
export class PlugPlayClient {
  private ws: WebSocket | null = null;
  private id: string;
  private name: string;
  private avatar?: string;
  private serverUrl: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: {
    id: string;
    name: string;
    avatar?: string;
    serverUrl?: string;
  }) {
    this.id = options.id;
    this.name = options.name;
    this.avatar = options.avatar;
    this.serverUrl = options.serverUrl || "ws://localhost:3001";
  }

  /** Connect to the office server */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.on("open", () => {
        this.send({
          type: "register",
          id: this.id,
          name: this.name,
          avatar: this.avatar,
        });
        resolve();
      });

      this.ws.on("close", () => {
        // Auto reconnect
        this.reconnectTimer = setTimeout(() => {
          this.connect().catch(() => {});
        }, 3000);
      });

      this.ws.on("error", (err) => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          reject(err);
        }
      });
    });
  }

  /** Report that the agent is actively working */
  working(activity: string): void {
    this.sendStatus("working", activity);
  }

  /** Report that the agent is idle */
  idle(activity = "Taking a break"): void {
    this.sendStatus("idle", activity);
  }

  /** Report that the agent is talking to another agent */
  talking(targetAgentId: string, topic: string): void {
    this.sendStatus("talking", topic, targetAgentId);
  }

  /** Disconnect from the office */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.send({ type: "disconnect", id: this.id });
      this.ws.close();
      this.ws = null;
    }
  }

  private sendStatus(state: AgentState, activity: string, talkingTo?: string): void {
    this.send({
      type: "status",
      id: this.id,
      state,
      activity,
      talkingTo,
    });
  }

  private send(msg: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
