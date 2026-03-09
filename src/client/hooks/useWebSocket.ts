import { useEffect, useRef, useCallback, useState } from "react";
import type { Agent, OfficeLayout, ServerMessage } from "../../shared/types.js";

interface OfficeState {
  agents: Map<string, Agent>;
  office: OfficeLayout | null;
  connected: boolean;
}

export function useOfficeWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<OfficeState>({
    agents: new Map(),
    office: null,
    connected: false,
  });

  const handleMessage = useCallback((event: MessageEvent) => {
    const msg: ServerMessage = JSON.parse(event.data);

    setState((prev) => {
      switch (msg.type) {
        case "snapshot": {
          const agents = new Map<string, Agent>();
          for (const a of msg.agents) {
            agents.set(a.id, a);
          }
          return { ...prev, agents, office: msg.office };
        }

        case "agent_update": {
          const agents = new Map(prev.agents);
          agents.set(msg.agent.id, msg.agent);
          return { ...prev, agents };
        }

        case "agent_removed": {
          const agents = new Map(prev.agents);
          agents.delete(msg.id);
          return { ...prev, agents };
        }

        default:
          return prev;
      }
    });
  }, []);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((prev) => ({ ...prev, connected: true }));
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
      // Auto-reconnect after 2s
      setTimeout(() => {
        if (wsRef.current === ws) {
          wsRef.current = null;
          // Trigger re-mount
          setState((prev) => ({ ...prev }));
        }
      }, 2000);
    };

    ws.onmessage = handleMessage;

    return () => {
      ws.close();
    };
  }, [url, handleMessage]);

  return state;
}
