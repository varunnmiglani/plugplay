import { useEffect, useState } from "react";
import type { Agent, AgentState, OfficeLayout } from "../../shared/types.js";
import { createDefaultOffice, getRandomRoamPosition } from "../../shared/office-layout.js";

const AGENTS_CONFIG = [
  { id: "agent-coder", name: "Coder", avatar: "#4ECDC4" },
  { id: "agent-reviewer", name: "Reviewer", avatar: "#FF6B6B" },
  { id: "agent-planner", name: "Planner", avatar: "#45B7D1" },
  { id: "agent-tester", name: "Tester", avatar: "#96CEB4" },
  { id: "agent-deployer", name: "Deployer", avatar: "#FFEAA7" },
  { id: "agent-researcher", name: "Researcher", avatar: "#DDA0DD" },
];

const WORK_ACTIVITIES = [
  "Writing authentication module",
  "Refactoring database layer",
  "Implementing search API",
  "Building React components",
  "Optimizing SQL queries",
  "Writing unit tests",
  "Fixing CSS layout bug",
  "Adding error handling",
  "Creating REST endpoints",
  "Setting up CI pipeline",
  "Reviewing PR #142",
  "Debugging memory leak",
  "Updating dependencies",
  "Writing documentation",
];

const IDLE_ACTIVITIES = [
  "Getting coffee",
  "Taking a break",
  "Stretching",
  "Checking notifications",
  "Browsing HN",
  "Waiting for build",
];

const TALK_TOPICS = [
  "Discussing API design",
  "Code review sync",
  "Sprint planning",
  "Debugging together",
  "Architecture discussion",
  "Pair programming",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useDemoMode() {
  const [office] = useState<OfficeLayout>(() => createDefaultOffice());
  const [agents, setAgents] = useState<Map<string, Agent>>(() => {
    const map = new Map<string, Agent>();
    const off = createDefaultOffice();
    for (let i = 0; i < AGENTS_CONFIG.length; i++) {
      const cfg = AGENTS_CONFIG[i];
      const desk = off.desks[i];
      map.set(cfg.id, {
        id: cfg.id,
        name: cfg.name,
        avatar: cfg.avatar,
        state: "working",
        activity: randomFrom(WORK_ACTIVITIES),
        position: desk ? desk.position : getRandomRoamPosition(off),
        lastSeen: Date.now(),
      });
    }
    return map;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) => {
        const next = new Map(prev);
        const ids = Array.from(next.keys());
        const count = 1 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
          const id = randomFrom(ids);
          const agent = { ...next.get(id)! };
          const roll = Math.random();

          if (roll < 0.5) {
            agent.state = "working";
            agent.activity = randomFrom(WORK_ACTIVITIES);
            const desk = office.desks.find((d) => d.assignedTo === agent.id || !d.assignedTo);
            agent.position = desk ? desk.position : getRandomRoamPosition(office);
            agent.talkingTo = undefined;
          } else if (roll < 0.75) {
            agent.state = "idle";
            agent.activity = randomFrom(IDLE_ACTIVITIES);
            agent.position = getRandomRoamPosition(office);
            agent.talkingTo = undefined;
          } else {
            const others = ids.filter((oid) => oid !== id);
            const partnerId = randomFrom(others);
            const partner = { ...next.get(partnerId)! };
            const topic = randomFrom(TALK_TOPICS);

            agent.state = "talking";
            agent.activity = topic;
            agent.talkingTo = partnerId;
            const spotIdx = Math.floor(Math.random() * Math.floor(office.meetingSpots.length / 2)) * 2;
            agent.position = office.meetingSpots[spotIdx];

            partner.state = "talking";
            partner.activity = topic;
            partner.talkingTo = id;
            partner.position = office.meetingSpots[spotIdx + 1] || office.meetingSpots[spotIdx];
            partner.lastSeen = Date.now();
            next.set(partnerId, partner);
          }

          agent.lastSeen = Date.now();
          next.set(id, agent);
        }

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [office]);

  return { agents, office, connected: true };
}
