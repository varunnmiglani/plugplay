import * as PIXI from "pixi.js";

/**
 * Programmatic pixel art generator - no external assets needed.
 * Creates all office furniture, floor tiles, and agent sprites from code.
 */

const TILE = 48;

/** Draw a floor tile */
export function drawFloorTile(color1: number, color2: number): PIXI.Graphics {
  const g = new PIXI.Graphics();
  g.beginFill(color1);
  g.drawRect(0, 0, TILE, TILE);
  g.endFill();
  // Subtle grid lines
  g.lineStyle(1, color2, 0.3);
  g.drawRect(0, 0, TILE, TILE);
  return g;
}

/** Draw a desk */
export function drawDesk(): PIXI.Container {
  const c = new PIXI.Container();

  // Desk surface
  const desk = new PIXI.Graphics();
  desk.beginFill(0x8b6914);
  desk.drawRoundedRect(4, 12, 40, 24, 3);
  desk.endFill();
  // Desk edge highlight
  desk.beginFill(0xa67c1a);
  desk.drawRoundedRect(4, 12, 40, 4, 2);
  desk.endFill();

  // Monitor
  const monitor = new PIXI.Graphics();
  monitor.beginFill(0x2c3e50);
  monitor.drawRoundedRect(14, 2, 20, 14, 2);
  monitor.endFill();
  // Screen
  monitor.beginFill(0x3498db);
  monitor.drawRect(16, 4, 16, 10);
  monitor.endFill();
  // Stand
  monitor.beginFill(0x7f8c8d);
  monitor.drawRect(22, 16, 4, 4);
  monitor.endFill();

  // Chair (below desk)
  const chair = new PIXI.Graphics();
  chair.beginFill(0x2c3e50);
  chair.drawCircle(24, 42, 7);
  chair.endFill();
  chair.beginFill(0x34495e);
  chair.drawCircle(24, 42, 5);
  chair.endFill();

  c.addChild(chair, desk, monitor);
  return c;
}

/** Draw the coffee machine area */
export function drawCoffeeMachine(): PIXI.Container {
  const c = new PIXI.Container();

  // Counter
  const counter = new PIXI.Graphics();
  counter.beginFill(0x7f8c8d);
  counter.drawRoundedRect(4, 16, 40, 28, 3);
  counter.endFill();
  counter.beginFill(0x95a5a6);
  counter.drawRoundedRect(4, 16, 40, 6, 2);
  counter.endFill();

  // Coffee machine
  const machine = new PIXI.Graphics();
  machine.beginFill(0x2c3e50);
  machine.drawRoundedRect(12, 2, 24, 18, 3);
  machine.endFill();
  // Red light
  machine.beginFill(0xe74c3c);
  machine.drawCircle(32, 6, 2);
  machine.endFill();
  // Dispenser
  machine.beginFill(0x1a252f);
  machine.drawRect(18, 12, 12, 8);
  machine.endFill();

  // Coffee cup
  const cup = new PIXI.Graphics();
  cup.beginFill(0xecf0f1);
  cup.drawRoundedRect(20, 26, 8, 8, 2);
  cup.endFill();
  cup.beginFill(0x6f4e37);
  cup.drawRect(21, 27, 6, 5);
  cup.endFill();

  // Label
  const label = new PIXI.Text("COFFEE", {
    fontSize: 7,
    fill: 0xecf0f1,
    fontFamily: "monospace",
  });
  label.x = 13;
  label.y = 4;

  c.addChild(counter, machine, cup, label);
  return c;
}

/** Draw a meeting area marker */
export function drawMeetingSpot(): PIXI.Container {
  const c = new PIXI.Container();
  const rug = new PIXI.Graphics();
  rug.beginFill(0x9b59b6, 0.3);
  rug.drawRoundedRect(2, 2, TILE - 4, TILE - 4, 8);
  rug.endFill();
  rug.lineStyle(1, 0x9b59b6, 0.5);
  rug.drawRoundedRect(6, 6, TILE - 12, TILE - 12, 4);
  c.addChild(rug);
  return c;
}

/** Draw walls and floor for the entire office */
export function drawOfficeFloor(width: number, height: number): PIXI.Container {
  const c = new PIXI.Container();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isWall = y === 0 || y === height - 1 || x === 0 || x === width - 1;
      let tile: PIXI.Graphics;

      if (isWall) {
        tile = new PIXI.Graphics();
        tile.beginFill(0x5d6d7e);
        tile.drawRect(0, 0, TILE, TILE);
        tile.endFill();
        // Brick pattern for walls
        if (y === 0 || y === height - 1) {
          tile.lineStyle(1, 0x4a5a6a, 0.5);
          tile.moveTo(0, TILE / 2);
          tile.lineTo(TILE, TILE / 2);
          tile.moveTo(TILE / 3, 0);
          tile.lineTo(TILE / 3, TILE / 2);
          tile.moveTo((TILE * 2) / 3, TILE / 2);
          tile.lineTo((TILE * 2) / 3, TILE);
        }
      } else {
        // Alternating floor tiles
        const isAlt = (x + y) % 2 === 0;
        tile = drawFloorTile(isAlt ? 0xd5c4a1 : 0xcbb994, 0xb5a481);
      }

      tile.x = x * TILE;
      tile.y = y * TILE;
      c.addChild(tile);
    }
  }

  // Door
  const door = new PIXI.Graphics();
  door.beginFill(0x8b4513);
  door.drawRect(0, 0, TILE, TILE);
  door.endFill();
  door.beginFill(0xa0522d);
  door.drawRoundedRect(4, 4, TILE - 8, TILE - 8, 4);
  door.endFill();
  // Doorknob
  door.beginFill(0xf1c40f);
  door.drawCircle(TILE - 12, TILE / 2, 3);
  door.endFill();
  door.x = 0;
  door.y = (height - 2) * TILE;
  c.addChild(door);

  return c;
}

/** Create a plant decoration */
export function drawPlant(): PIXI.Container {
  const c = new PIXI.Container();
  // Pot
  const pot = new PIXI.Graphics();
  pot.beginFill(0xc0392b);
  pot.drawRect(16, 30, 16, 14);
  pot.endFill();
  pot.beginFill(0xe74c3c);
  pot.drawRect(14, 28, 20, 6);
  pot.endFill();

  // Leaves
  const leaves = new PIXI.Graphics();
  leaves.beginFill(0x27ae60);
  leaves.drawCircle(24, 20, 10);
  leaves.drawCircle(18, 16, 7);
  leaves.drawCircle(30, 16, 7);
  leaves.drawCircle(24, 10, 6);
  leaves.endFill();

  c.addChild(pot, leaves);
  return c;
}
