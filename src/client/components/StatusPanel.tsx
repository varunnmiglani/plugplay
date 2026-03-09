import React from "react";
import type { Agent, AgentState } from "../../shared/types.js";

const STATE_COLORS: Record<AgentState, string> = {
  working: "#27ae60",
  idle: "#f39c12",
  talking: "#3498db",
  offline: "#95a5a6",
};

const STATE_LABELS: Record<AgentState, string> = {
  working: "Working",
  idle: "Idle",
  talking: "Talking",
  offline: "Offline",
};

const STATE_ICONS: Record<AgentState, string> = {
  working: "💻",
  idle: "☕",
  talking: "💬",
  offline: "🌙",
};

interface StatusPanelProps {
  agents: Map<string, Agent>;
  connected: boolean;
}

export function StatusPanel({ agents, connected }: StatusPanelProps) {
  const sortedAgents = Array.from(agents.values()).sort((a, b) => {
    const order: AgentState[] = ["working", "talking", "idle", "offline"];
    return order.indexOf(a.state) - order.indexOf(b.state);
  });

  const counts = {
    working: sortedAgents.filter((a) => a.state === "working").length,
    idle: sortedAgents.filter((a) => a.state === "idle").length,
    talking: sortedAgents.filter((a) => a.state === "talking").length,
    offline: sortedAgents.filter((a) => a.state === "offline").length,
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h2 style={styles.title}>Office Status</h2>
        <div style={{
          ...styles.connectionDot,
          backgroundColor: connected ? "#27ae60" : "#e74c3c",
        }} />
      </div>

      <div style={styles.stats}>
        {(Object.entries(counts) as [AgentState, number][]).map(([state, count]) => (
          <div key={state} style={styles.stat}>
            <span style={styles.statIcon}>{STATE_ICONS[state]}</span>
            <span style={{ color: STATE_COLORS[state], fontWeight: "bold" }}>{count}</span>
            <span style={styles.statLabel}>{STATE_LABELS[state]}</span>
          </div>
        ))}
      </div>

      <div style={styles.agentList}>
        {sortedAgents.map((agent) => (
          <div key={agent.id} style={styles.agentCard}>
            <div style={styles.agentHeader}>
              <div
                style={{
                  ...styles.avatarDot,
                  backgroundColor: agent.avatar,
                  opacity: agent.state === "offline" ? 0.4 : 1,
                }}
              />
              <span style={styles.agentName}>{agent.name}</span>
              <span
                style={{
                  ...styles.stateBadge,
                  backgroundColor: STATE_COLORS[agent.state] + "22",
                  color: STATE_COLORS[agent.state],
                  borderColor: STATE_COLORS[agent.state] + "44",
                }}
              >
                {STATE_LABELS[agent.state]}
              </span>
            </div>
            <div style={styles.activity}>{agent.activity}</div>
            {agent.talkingTo && (
              <div style={styles.talkingTo}>
                💬 with {agents.get(agent.talkingTo)?.name || agent.talkingTo}
              </div>
            )}
          </div>
        ))}

        {sortedAgents.length === 0 && (
          <div style={styles.empty}>No agents in the office yet</div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 320,
    height: "100%",
    backgroundColor: "#1e1e2e",
    borderLeft: "1px solid #313244",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 16px 12px",
    borderBottom: "1px solid #313244",
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#cdd6f4",
    fontFamily: "monospace",
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  stats: {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
    borderBottom: "1px solid #313244",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontFamily: "monospace",
  },
  statIcon: {
    fontSize: 14,
  },
  statLabel: {
    color: "#6c7086",
    fontSize: 10,
  },
  agentList: {
    flex: 1,
    overflowY: "auto",
    padding: 8,
  },
  agentCard: {
    padding: "10px 12px",
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: "#181825",
    border: "1px solid #313244",
  },
  agentHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  avatarDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  agentName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    color: "#cdd6f4",
    fontFamily: "monospace",
  },
  stateBadge: {
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 4,
    fontFamily: "monospace",
    fontWeight: 600,
    border: "1px solid",
  },
  activity: {
    fontSize: 11,
    color: "#a6adc8",
    fontFamily: "monospace",
    paddingLeft: 18,
    lineHeight: 1.4,
  },
  talkingTo: {
    fontSize: 11,
    color: "#89b4fa",
    fontFamily: "monospace",
    paddingLeft: 18,
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    color: "#6c7086",
    fontFamily: "monospace",
    fontSize: 13,
    padding: 24,
  },
};
