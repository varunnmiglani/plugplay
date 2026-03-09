import * as PIXI from "pixi.js";
import type { Agent, AgentState } from "../../shared/types.js";

const TILE = 48;
const MOVE_SPEED = 2; // pixels per frame

/**
 * Pixel-art agent sprite with animations.
 * Each agent is a little character that moves around the office.
 */
export class AgentSprite {
  public container: PIXI.Container;
  public agentData: Agent;

  private body: PIXI.Graphics;
  private nameLabel: PIXI.Text;
  private statusBubble: PIXI.Container;
  private statusText: PIXI.Text;
  private targetX: number;
  private targetY: number;
  private bobOffset = 0;
  private bobDirection = 1;
  private idleTimer = 0;

  constructor(agent: Agent) {
    this.agentData = agent;
    this.container = new PIXI.Container();
    this.container.sortableChildren = true;

    // Target position
    this.targetX = agent.position.x * TILE;
    this.targetY = agent.position.y * TILE;
    this.container.x = this.targetX;
    this.container.y = this.targetY;

    // Draw the character
    this.body = this.drawCharacter(agent.avatar);
    this.body.zIndex = 1;
    this.container.addChild(this.body);

    // Name label
    this.nameLabel = new PIXI.Text(agent.name, {
      fontSize: 10,
      fill: 0xffffff,
      fontFamily: "monospace",
      fontWeight: "bold",
      stroke: 0x000000,
      strokeThickness: 2,
    });
    this.nameLabel.anchor.set(0.5, 1);
    this.nameLabel.x = TILE / 2;
    this.nameLabel.y = -2;
    this.nameLabel.zIndex = 3;
    this.container.addChild(this.nameLabel);

    // Status bubble
    this.statusBubble = new PIXI.Container();
    this.statusBubble.zIndex = 2;
    this.statusBubble.visible = false;

    const bubbleBg = new PIXI.Graphics();
    bubbleBg.name = "bubbleBg";
    this.statusBubble.addChild(bubbleBg);

    this.statusText = new PIXI.Text("", {
      fontSize: 8,
      fill: 0x2c3e50,
      fontFamily: "monospace",
      wordWrap: true,
      wordWrapWidth: 120,
    });
    this.statusText.x = 6;
    this.statusText.y = 4;
    this.statusBubble.addChild(this.statusText);

    this.statusBubble.x = TILE + 4;
    this.statusBubble.y = -10;
    this.container.addChild(this.statusBubble);

    this.updateState(agent);
  }

  private drawCharacter(color: string): PIXI.Graphics {
    const g = new PIXI.Graphics();
    const c = PIXI.utils.string2hex(color);

    // Shadow
    g.beginFill(0x000000, 0.2);
    g.drawEllipse(TILE / 2, TILE - 4, 12, 4);
    g.endFill();

    // Body
    g.beginFill(c);
    g.drawRoundedRect(14, 18, 20, 22, 4);
    g.endFill();

    // Head
    g.beginFill(0xfdbcb4); // skin tone
    g.drawCircle(TILE / 2, 14, 10);
    g.endFill();

    // Hair
    g.beginFill(darken(c, 0.3));
    g.drawRoundedRect(14, 4, 20, 10, 6);
    g.endFill();

    // Eyes
    g.beginFill(0x2c3e50);
    g.drawCircle(20, 14, 2);
    g.drawCircle(28, 14, 2);
    g.endFill();

    // Smile
    g.lineStyle(1.5, 0x2c3e50);
    g.arc(TILE / 2, 17, 4, 0.2, Math.PI - 0.2);

    return g;
  }

  updateState(agent: Agent): void {
    this.agentData = agent;
    this.targetX = agent.position.x * TILE;
    this.targetY = agent.position.y * TILE;

    // Update status bubble
    const truncatedActivity =
      agent.activity.length > 40 ? agent.activity.slice(0, 37) + "..." : agent.activity;
    this.statusText.text = truncatedActivity;

    // Redraw bubble background to fit text
    const bubbleBg = this.statusBubble.getChildByName("bubbleBg") as PIXI.Graphics;
    if (bubbleBg) {
      bubbleBg.clear();
      bubbleBg.beginFill(0xffffff, 0.95);
      bubbleBg.lineStyle(1, 0xbdc3c7);
      bubbleBg.drawRoundedRect(0, 0, this.statusText.width + 12, this.statusText.height + 8, 6);
      bubbleBg.endFill();
      // Little triangle pointer
      bubbleBg.beginFill(0xffffff, 0.95);
      bubbleBg.moveTo(-4, 8);
      bubbleBg.lineTo(0, 4);
      bubbleBg.lineTo(0, 12);
      bubbleBg.endFill();
    }

    // Show bubble when working or talking
    this.statusBubble.visible = agent.state === "working" || agent.state === "talking";

    // Opacity for offline
    this.container.alpha = agent.state === "offline" ? 0.4 : 1;

    // State indicator dot
    this.updateStateIndicator(agent.state);
  }

  private updateStateIndicator(state: AgentState): void {
    // Remove old indicator
    const old = this.container.getChildByName("stateIndicator");
    if (old) this.container.removeChild(old);

    const indicator = new PIXI.Graphics();
    indicator.name = "stateIndicator";
    indicator.zIndex = 4;

    const colors: Record<AgentState, number> = {
      working: 0x27ae60, // green
      idle: 0xf39c12, // yellow
      talking: 0x3498db, // blue
      offline: 0x95a5a6, // gray
    };

    indicator.beginFill(colors[state]);
    indicator.drawCircle(TILE - 6, 6, 4);
    indicator.endFill();
    indicator.beginFill(0xffffff);
    indicator.drawCircle(TILE - 6, 6, 2);
    indicator.endFill();
    indicator.beginFill(colors[state]);
    indicator.drawCircle(TILE - 6, 6, 1.5);
    indicator.endFill();

    this.container.addChild(indicator);
  }

  /** Called every frame to animate movement and idle animations */
  tick(delta: number): void {
    // Smooth movement toward target
    const dx = this.targetX - this.container.x;
    const dy = this.targetY - this.container.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      const speed = MOVE_SPEED * delta;
      this.container.x += (dx / dist) * Math.min(speed, dist);
      this.container.y += (dy / dist) * Math.min(speed, dist);
    }

    // Bob animation when idle
    if (this.agentData.state === "idle") {
      this.idleTimer += delta * 0.03;
      this.body.y = Math.sin(this.idleTimer) * 2;
    } else if (this.agentData.state === "working") {
      // Subtle typing animation
      this.idleTimer += delta * 0.08;
      this.body.y = Math.sin(this.idleTimer) * 0.5;
    } else {
      this.body.y = 0;
    }
  }
}

function darken(color: number, amount: number): number {
  const r = Math.max(0, ((color >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((color >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (color & 0xff) * (1 - amount));
  return (r << 16) | (g << 8) | b;
}
