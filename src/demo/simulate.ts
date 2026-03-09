import { PlugPlayClient } from "../sdk/PlugPlayClient.js";

/**
 * Demo simulation - creates several virtual agents that cycle through
 * different states to show off the office UI.
 */

interface SimAgent {
  client: PlugPlayClient;
  name: string;
  id: string;
}

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

async function main() {
  console.log("Starting agent simulation...");
  console.log("Make sure the server is running: npm run server\n");

  const agents: SimAgent[] = [];

  // Connect all agents
  for (const config of AGENTS_CONFIG) {
    const client = new PlugPlayClient(config);
    try {
      await client.connect();
      agents.push({ client, ...config });
      console.log(`  ${config.name} joined the office`);
    } catch {
      console.error(`  Failed to connect ${config.name} - is the server running?`);
      process.exit(1);
    }
  }

  console.log(`\n${agents.length} agents connected. Simulating activity...\n`);

  // Simulation loop
  function simulateAgent(agent: SimAgent) {
    const roll = Math.random();

    if (roll < 0.5) {
      // Working
      const activity = randomFrom(WORK_ACTIVITIES);
      agent.client.working(activity);
      console.log(`  [${agent.name}] Working: ${activity}`);
    } else if (roll < 0.75) {
      // Idle
      const activity = randomFrom(IDLE_ACTIVITIES);
      agent.client.idle(activity);
      console.log(`  [${agent.name}] Idle: ${activity}`);
    } else {
      // Talking to another agent
      const others = agents.filter((a) => a.id !== agent.id);
      const partner = randomFrom(others);
      const topic = randomFrom(TALK_TOPICS);
      agent.client.talking(partner.id, topic);
      console.log(`  [${agent.name}] Talking to ${partner.name}: ${topic}`);
    }
  }

  // Run simulation with staggered updates
  const interval = setInterval(() => {
    // Update 1-3 random agents each tick
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      simulateAgent(randomFrom(agents));
    }
    console.log("");
  }, 3000);

  // Initial state - everyone starts working
  for (const agent of agents) {
    agent.client.working(randomFrom(WORK_ACTIVITIES));
  }

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down simulation...");
    clearInterval(interval);
    for (const agent of agents) {
      agent.client.disconnect();
    }
    process.exit(0);
  });
}

main();
