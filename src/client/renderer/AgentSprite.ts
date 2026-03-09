import * as PIXI from "pixi.js";
import type { Agent, AgentState } from "../../shared/types.js";

const TILE = 48;
const MOVE_SPEED = 2; // pixels per frame

/**
 * Gather.town-style agent sprite with smooth animations.
 * Each agent is a cute pixel character that moves around the office.
 */
export class AgentSprite {
  public container: PIXI.Container;
  public agentData: Agent;

  private body: PIXI.Container;
  private nameLabel: PIXI.Text;
  private statusBubble: PIXI.Container;
  private statusText: PIXI.Text;
  private targetX: number;
  private targetY: number;
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

    // Name label with background
    const nameBg = new PIXI.Graphics();
    this.nameLabel = new PIXI.Text(agent.name, {
      fontSize: 9,
      fill: 0xffffff,
      fontFamily: "monospace",
      fontWeight: "bold",
    });
    this.nameLabel.anchor.set(0.5, 1);
    this.nameLabel.x = TILE / 2;
    this.nameLabel.y = -4;

    // Name background pill
    nameBg.beginFill(0x000000, 0.55);
    nameBg.drawRoundedRect(
      TILE / 2 - this.nameLabel.width / 2 - 4,
      -4 - this.nameLabel.height - 2,
      this.nameLabel.width + 8,
      this.nameLabel.height + 4,
      4
    );
    nameBg.endFill();
    nameBg.zIndex = 3;
    this.nameLabel.zIndex = 3;

    this.container.addChild(nameBg);
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

  private drawCharacter(color: string): PIXI.Container {
    const c = new PIXI.Container();
    const g = new PIXI.Graphics();
    const hex = PIXI.utils.string2hex(color);

    // Shadow
    g.beginFill(0x000000, 0.15);
    g.drawEllipse(TILE / 2, TILE - 3, 11, 4);
    g.endFill();

    // --- Body (shirt) ---
    g.beginFill(hex);
    g.drawRoundedRect(15, 22, 18, 16, 3);
    g.endFill();
    // Shirt highlight
    g.beginFill(lighten(hex, 0.15));
    g.drawRoundedRect(17, 23, 6, 12, 2);
    g.endFill();

    // Arms
    g.beginFill(hex);
    g.drawRoundedRect(11, 24, 6, 10, 3);
    g.drawRoundedRect(31, 24, 6, 10, 3);
    g.endFill();

    // Hands (skin)
    g.beginFill(0xfdbcb4);
    g.drawCircle(14, 35, 3);
    g.drawCircle(34, 35, 3);
    g.endFill();

    // --- Legs/pants ---
    g.beginFill(darken(hex, 0.35));
    g.drawRect(17, 36, 7, 8);
    g.drawRect(25, 36, 7, 8);
    g.endFill();

    // Shoes
    g.beginFill(0x3a3a4a);
    g.drawRoundedRect(16, 42, 8, 4, 2);
    g.drawRoundedRect(24, 42, 8, 4, 2);
    g.endFill();

    // --- Head ---
    // Head shape
    g.beginFill(0xfdbcb4);
    g.drawRoundedRect(16, 6, 16, 17, 6);
    g.endFill();

    // Hair
    g.beginFill(darken(hex, 0.4));
    g.drawRoundedRect(14, 2, 20, 10, 6);
    g.endFill();
    // Side hair
    g.beginFill(darken(hex, 0.4));
    g.drawRoundedRect(14, 6, 4, 8, 2);
    g.drawRoundedRect(30, 6, 4, 8, 2);
    g.endFill();

    // Eyes (white + pupil for Gather look)
    g.beginFill(0xffffff);
    g.drawCircle(20, 14, 3);
    g.drawCircle(28, 14, 3);
    g.endFill();
    g.beginFill(0x2c3e50);
    g.drawCircle(21, 14, 1.8);
    g.drawCircle(29, 14, 1.8);
    g.endFill();
    // Eye highlight
    g.beginFill(0xffffff);
    g.drawCircle(20.5, 13, 0.8);
    g.drawCircle(28.5, 13, 0.8);
    g.endFill();

    // Mouth (small smile)
    g.lineStyle(1, 0xc48a80);
    g.arc(TILE / 2, 18, 3, 0.3, Math.PI - 0.3);

    // Cheeks (blush)
    g.lineStyle(0);
    g.beginFill(0xf5a0a0, 0.25);
    g.drawEllipse(17, 17, 3, 2);
    g.drawEllipse(31, 17, 3, 2);
    g.endFill();

    c.addChild(g);
    return c;
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
      bubbleBg.lineStyle(1, 0xd0d0d0);
      bubbleBg.drawRoundedRect(0, 0, this.statusText.width + 12, this.statusText.height + 8, 8);
      bubbleBg.endFill();
      // Triangle pointer
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
    const old = this.container.getChildByName("stateIndicator");
    if (old) this.container.removeChild(old);

    const indicator = new PIXI.Graphics();
    indicator.name = "stateIndicator";
    indicator.zIndex = 4;

    const colors: Record<AgentState, number> = {
      working: 0x27ae60,
      idle: 0xf39c12,
      talking: 0x3498db,
      offline: 0x95a5a6,
    };

    // Outer glow
    indicator.beginFill(colors[state], 0.3);
    indicator.drawCircle(TILE - 4, 4, 6);
    indicator.endFill();
    // Main dot
    indicator.beginFill(colors[state]);
    indicator.drawCircle(TILE - 4, 4, 4);
    indicator.endFill();
    // Inner highlight
    indicator.beginFill(0xffffff, 0.4);
    indicator.drawCircle(TILE - 5, 3, 1.5);
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

    // Idle bob animation
    if (this.agentData.state === "idle") {
      this.idleTimer += delta * 0.03;
      this.body.y = Math.sin(this.idleTimer) * 2;
    } else if (this.agentData.state === "working") {
      // Subtle typing motion
      this.idleTimer += delta * 0.08;
      this.body.y = Math.sin(this.idleTimer) * 0.5;
    } else if (this.agentData.state === "talking") {
      // Gentle bounce when talking
      this.idleTimer += delta * 0.05;
      this.body.y = Math.abs(Math.sin(this.idleTimer)) * 1.5;
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

function lighten(color: number, amount: number): number {
  const r = Math.min(255, ((color >> 16) & 0xff) * (1 + amount));
  const g = Math.min(255, ((color >> 8) & 0xff) * (1 + amount));
  const b = Math.min(255, (color & 0xff) * (1 + amount));
  return (r << 16) | (g << 8) | b;
}
