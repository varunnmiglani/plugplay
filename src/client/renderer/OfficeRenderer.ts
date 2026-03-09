import * as PIXI from "pixi.js";
import type { Agent, OfficeLayout } from "../../shared/types.js";
import { AgentSprite } from "./AgentSprite.js";
import {
  drawOfficeFloor,
  drawDesk,
  drawCoffeeMachine,
  drawMeetingSpot,
  drawMeetingTable,
  drawPlant,
  drawBookshelf,
  drawWhiteboard,
  drawRug,
} from "./PixelGraphics.js";

const TILE = 48;

/**
 * Main office renderer - manages the Pixi.js application,
 * draws the office, and manages agent sprites.
 */
export class OfficeRenderer {
  public app: PIXI.Application;

  private officeLayer: PIXI.Container;
  private agentLayer: PIXI.Container;
  private agentSprites = new Map<string, AgentSprite>();
  private office: OfficeLayout | null = null;
  private resizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      view: canvas,
      backgroundColor: 0x1a1a2e,
      resizeTo: canvas.parentElement || undefined,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.officeLayer = new PIXI.Container();
    this.agentLayer = new PIXI.Container();
    this.agentLayer.sortableChildren = true;

    this.app.stage.addChild(this.officeLayer);
    this.app.stage.addChild(this.agentLayer);

    // Animation loop
    this.app.ticker.add((delta) => this.tick(delta));

    // Center the office
    this.resizeHandler = () => this.centerView();
    this.centerView();
    window.addEventListener("resize", this.resizeHandler);
  }

  /** Initialize the office layout */
  setOffice(office: OfficeLayout): void {
    this.office = office;
    this.officeLayer.removeChildren();

    // Draw floor and walls
    const floor = drawOfficeFloor(office.width, office.height);
    this.officeLayer.addChild(floor);

    // Draw desks with varied colors
    for (let i = 0; i < office.desks.length; i++) {
      const desk = office.desks[i];
      const deskSprite = drawDesk(i);
      deskSprite.x = desk.position.x * TILE;
      deskSprite.y = desk.position.y * TILE;
      this.officeLayer.addChild(deskSprite);
    }

    // Draw coffee area
    const coffee = drawCoffeeMachine();
    coffee.x = office.coffeeArea.x * TILE;
    coffee.y = office.coffeeArea.y * TILE;
    this.officeLayer.addChild(coffee);

    // Draw meeting table in the center of meeting area
    if (office.meetingSpots.length >= 4) {
      const meetingTable = drawMeetingTable();
      meetingTable.x = (office.meetingSpots[0].x) * TILE;
      meetingTable.y = (office.meetingSpots[0].y) * TILE;
      this.officeLayer.addChild(meetingTable);
    }

    // Add decorative plants
    const plantPositions = [
      { x: 1, y: 1 },
      { x: office.width - 2, y: 1 },
      { x: office.width - 2, y: office.height - 2 },
      { x: 1, y: office.height - 2 },
      { x: 14, y: 1 },
    ];
    for (const pos of plantPositions) {
      const plant = drawPlant();
      plant.x = pos.x * TILE;
      plant.y = pos.y * TILE;
      this.officeLayer.addChild(plant);
    }

    // Add bookshelves along the right wall
    const bookshelfPositions = [
      { x: office.width - 2, y: 3 },
      { x: office.width - 2, y: 5 },
    ];
    for (const pos of bookshelfPositions) {
      const shelf = drawBookshelf();
      shelf.x = pos.x * TILE;
      shelf.y = pos.y * TILE;
      this.officeLayer.addChild(shelf);
    }

    // Whiteboard on top wall
    const whiteboard = drawWhiteboard();
    whiteboard.x = 15 * TILE;
    whiteboard.y = 1 * TILE;
    this.officeLayer.addChild(whiteboard);

    // Rug near coffee area
    const rug = drawRug();
    rug.x = (office.coffeeArea.x + 1) * TILE;
    rug.y = (office.coffeeArea.y + 1) * TILE;
    this.officeLayer.addChild(rug);

    // Area labels with Gather-style appearance
    const labels: { text: string; x: number; y: number }[] = [
      { text: "💻 WORKSPACE", x: 5, y: 1.3 },
      { text: "☕ KITCHEN", x: office.coffeeArea.x - 1, y: office.coffeeArea.y - 0.8 },
      { text: "🤝 MEETING ROOM", x: office.meetingSpots[0].x - 0.5, y: office.meetingSpots[0].y - 1 },
    ];

    for (const l of labels) {
      const text = new PIXI.Text(l.text, {
        fontSize: 9,
        fill: 0xd4d4d4,
        fontFamily: "monospace",
        fontWeight: "bold",
        letterSpacing: 1,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowDistance: 1,
        dropShadowAlpha: 0.4,
      });
      text.x = l.x * TILE;
      text.y = l.y * TILE;
      this.officeLayer.addChild(text);
    }

    this.centerView();
  }

  /** Update or create an agent sprite */
  updateAgent(agent: Agent): void {
    let sprite = this.agentSprites.get(agent.id);

    if (!sprite) {
      sprite = new AgentSprite(agent);
      this.agentSprites.set(agent.id, sprite);
      this.agentLayer.addChild(sprite.container);
    }

    sprite.updateState(agent);
  }

  /** Remove an agent sprite */
  removeAgent(id: string): void {
    const sprite = this.agentSprites.get(id);
    if (sprite) {
      this.agentLayer.removeChild(sprite.container);
      this.agentSprites.delete(id);
    }
  }

  private tick(delta: number): void {
    for (const sprite of this.agentSprites.values()) {
      sprite.tick(delta);
    }
  }

  private centerView(): void {
    if (!this.office) return;

    const officeWidth = this.office.width * TILE;
    const officeHeight = this.office.height * TILE;
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    // Scale to fit with some padding
    const scale = Math.min(
      (screenWidth - 20) / officeWidth,
      (screenHeight - 20) / officeHeight,
      2 // max zoom
    );

    this.app.stage.scale.set(scale);
    this.app.stage.x = (screenWidth - officeWidth * scale) / 2;
    this.app.stage.y = (screenHeight - officeHeight * scale) / 2;
  }

  destroy(): void {
    window.removeEventListener("resize", this.resizeHandler);
    this.app.destroy();
  }
}
