import * as PIXI from "pixi.js";

/**
 * Gather.town-style pixel art office generator.
 * Warm colors, detailed furniture, cozy office vibes.
 */

const TILE = 48;

// Gather-style color palette
const COLORS = {
  // Floors
  woodLight: 0xc9a87c,
  woodDark: 0xb8956a,
  woodAccent: 0xd4b896,
  carpetBlue: 0x5b7fa6,
  carpetBlueDark: 0x4e6d91,
  carpetTeal: 0x5a9e8f,
  carpetTealDark: 0x4d8a7c,
  // Walls
  wallTop: 0x8fa4b8,
  wallFace: 0x6b839a,
  wallDark: 0x5a7089,
  wallTrim: 0xa3b8cc,
  // Furniture
  deskWood: 0xc49a6c,
  deskTop: 0xd4ad82,
  deskLeg: 0x9e7a4e,
  chairBlue: 0x4a7fb5,
  chairPurple: 0x7b5ea7,
  chairGreen: 0x5a9e6b,
  chairOrange: 0xd4854a,
  monitorDark: 0x2a2a3e,
  monitorScreen: 0x3dc9b0,
  monitorScreen2: 0x5b8ef5,
  monitorScreen3: 0xf5c542,
  // Kitchen
  counterTop: 0xd4c4a8,
  counterFace: 0xb8a88c,
  coffeeMachine: 0x3a3a4e,
  mugWhite: 0xf0ebe0,
  // Decor
  plantGreen: 0x4caf50,
  plantDark: 0x357a38,
  potTerracotta: 0xc67a4a,
  potDark: 0xa8603a,
  bookRed: 0xc0392b,
  bookBlue: 0x2980b9,
  bookGreen: 0x27ae60,
  bookYellow: 0xf1c40f,
  rugWarm: 0xb85a3a,
  rugWarmLight: 0xcc7a5a,
  windowGlass: 0xa8d5e2,
  windowFrame: 0xf0ebe0,
  whiteboardBg: 0xf5f5f0,
  whiteboardFrame: 0xc0c0b0,
};

const CHAIR_COLORS = [COLORS.chairBlue, COLORS.chairPurple, COLORS.chairGreen, COLORS.chairOrange];
const SCREEN_COLORS = [COLORS.monitorScreen, COLORS.monitorScreen2, COLORS.monitorScreen3];

/** Draw a warm wood floor tile with plank pattern */
export function drawFloorTile(color1: number, color2: number): PIXI.Graphics {
  const g = new PIXI.Graphics();

  // Base wood color
  g.beginFill(color1);
  g.drawRect(0, 0, TILE, TILE);
  g.endFill();

  // Wood plank lines (horizontal)
  g.lineStyle(1, color2, 0.25);
  g.moveTo(0, TILE / 3);
  g.lineTo(TILE, TILE / 3);
  g.moveTo(0, (TILE * 2) / 3);
  g.lineTo(TILE, (TILE * 2) / 3);

  // Offset vertical plank joints
  g.lineStyle(1, color2, 0.15);
  g.moveTo(TILE / 2, 0);
  g.lineTo(TILE / 2, TILE / 3);
  g.moveTo(TILE * 0.25, TILE / 3);
  g.lineTo(TILE * 0.25, (TILE * 2) / 3);
  g.moveTo(TILE * 0.75, (TILE * 2) / 3);
  g.lineTo(TILE * 0.75, TILE);

  return g;
}

/** Draw a carpet tile */
function drawCarpetTile(color1: number, color2: number): PIXI.Graphics {
  const g = new PIXI.Graphics();
  g.beginFill(color1);
  g.drawRect(0, 0, TILE, TILE);
  g.endFill();

  // Subtle carpet texture (small dots)
  g.beginFill(color2, 0.3);
  for (let i = 4; i < TILE; i += 8) {
    for (let j = 4; j < TILE; j += 8) {
      g.drawRect(i, j, 2, 2);
    }
  }
  g.endFill();

  return g;
}

/** Draw Gather-style walls with depth */
export function drawOfficeFloor(width: number, height: number): PIXI.Container {
  const c = new PIXI.Container();

  // Meeting carpet area definition (tiles 15-18, 7-10)
  const carpetArea = { x1: 15, y1: 7, x2: 19, y2: 11 };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isTopWall = y === 0;
      const isBottomWall = y === height - 1;
      const isLeftWall = x === 0;
      const isRightWall = x === width - 1;
      const isWall = isTopWall || isBottomWall || isLeftWall || isRightWall;

      let tile: PIXI.Graphics;

      if (isWall) {
        tile = new PIXI.Graphics();

        if (isTopWall) {
          // Top wall - the visible wall face
          tile.beginFill(COLORS.wallFace);
          tile.drawRect(0, 0, TILE, TILE);
          tile.endFill();
          // Wall trim at bottom
          tile.beginFill(COLORS.wallTrim);
          tile.drawRect(0, TILE - 6, TILE, 6);
          tile.endFill();
          // Subtle brick-like pattern
          tile.lineStyle(1, COLORS.wallDark, 0.2);
          tile.moveTo(0, TILE * 0.3);
          tile.lineTo(TILE, TILE * 0.3);
          tile.moveTo(0, TILE * 0.6);
          tile.lineTo(TILE, TILE * 0.6);
          tile.moveTo(TILE * 0.5, 0);
          tile.lineTo(TILE * 0.5, TILE * 0.3);
          tile.moveTo(TILE * 0.25, TILE * 0.3);
          tile.lineTo(TILE * 0.25, TILE * 0.6);
          tile.moveTo(TILE * 0.75, TILE * 0.6);
          tile.lineTo(TILE * 0.75, TILE - 6);
        } else if (isBottomWall || isLeftWall || isRightWall) {
          tile.beginFill(COLORS.wallDark);
          tile.drawRect(0, 0, TILE, TILE);
          tile.endFill();
          tile.beginFill(COLORS.wallFace, 0.5);
          tile.drawRect(2, 2, TILE - 4, TILE - 4);
          tile.endFill();
        }
      } else {
        // Check if we're in the carpet/meeting area
        const inCarpet = x >= carpetArea.x1 && x <= carpetArea.x2 &&
          y >= carpetArea.y1 && y <= carpetArea.y2;

        if (inCarpet) {
          tile = drawCarpetTile(COLORS.carpetTeal, COLORS.carpetTealDark);
          // Carpet border
          const isEdgeL = x === carpetArea.x1;
          const isEdgeR = x === carpetArea.x2;
          const isEdgeT = y === carpetArea.y1;
          const isEdgeB = y === carpetArea.y2;
          if (isEdgeL || isEdgeR || isEdgeT || isEdgeB) {
            tile.lineStyle(2, COLORS.carpetTealDark, 0.6);
            if (isEdgeL) { tile.moveTo(1, 0); tile.lineTo(1, TILE); }
            if (isEdgeR) { tile.moveTo(TILE - 1, 0); tile.lineTo(TILE - 1, TILE); }
            if (isEdgeT) { tile.moveTo(0, 1); tile.lineTo(TILE, 1); }
            if (isEdgeB) { tile.moveTo(0, TILE - 1); tile.lineTo(TILE, TILE - 1); }
          }
        } else {
          const isAlt = (x + y) % 2 === 0;
          tile = drawFloorTile(
            isAlt ? COLORS.woodLight : COLORS.woodDark,
            COLORS.woodAccent
          );
        }
      }

      tile.x = x * TILE;
      tile.y = y * TILE;
      c.addChild(tile);
    }
  }

  // Windows on top wall
  const windowPositions = [3, 6, 9, 12];
  for (const wx of windowPositions) {
    const win = drawWindow();
    win.x = wx * TILE;
    win.y = 0;
    c.addChild(win);
  }

  // Door on left wall
  const door = drawDoor();
  door.x = 0;
  door.y = (height - 3) * TILE;
  c.addChild(door);

  return c;
}

/** Draw a window on the wall */
function drawWindow(): PIXI.Graphics {
  const g = new PIXI.Graphics();
  const w = TILE * 2;
  const h = TILE - 8;

  // Window frame
  g.beginFill(COLORS.windowFrame);
  g.drawRoundedRect(4, 4, w - 8, h, 3);
  g.endFill();

  // Glass panes (2 panes)
  g.beginFill(COLORS.windowGlass);
  g.drawRect(8, 8, (w - 20) / 2, h - 8);
  g.drawRect(w / 2 + 2, 8, (w - 20) / 2, h - 8);
  g.endFill();

  // Light reflection
  g.beginFill(0xffffff, 0.2);
  g.drawRect(10, 10, 8, 12);
  g.drawRect(w / 2 + 4, 10, 8, 12);
  g.endFill();

  // Cross bar
  g.beginFill(COLORS.windowFrame);
  g.drawRect(w / 2 - 2, 4, 4, h);
  g.drawRect(4, h / 2, w - 8, 3);
  g.endFill();

  return g;
}

/** Draw office door */
function drawDoor(): PIXI.Graphics {
  const g = new PIXI.Graphics();

  // Door frame
  g.beginFill(COLORS.deskWood);
  g.drawRect(0, 0, TILE, TILE * 2);
  g.endFill();

  // Door panel
  g.beginFill(0xb08050);
  g.drawRoundedRect(6, 6, TILE - 12, TILE * 2 - 12, 3);
  g.endFill();

  // Door panels (decorative insets)
  g.beginFill(0xa07040);
  g.drawRoundedRect(10, 10, TILE - 20, TILE - 16, 2);
  g.drawRoundedRect(10, TILE, TILE - 20, TILE - 16, 2);
  g.endFill();

  // Door handle
  g.beginFill(0xd4af37);
  g.drawCircle(TILE - 14, TILE, 3);
  g.endFill();
  g.beginFill(0xf0d060);
  g.drawCircle(TILE - 14, TILE, 1.5);
  g.endFill();

  return g;
}

/** Draw a Gather-style desk with monitor and colored chair */
export function drawDesk(index: number = 0): PIXI.Container {
  const c = new PIXI.Container();
  const chairColor = CHAIR_COLORS[index % CHAIR_COLORS.length];
  const screenColor = SCREEN_COLORS[index % SCREEN_COLORS.length];

  // Desk shadow
  const shadow = new PIXI.Graphics();
  shadow.beginFill(0x000000, 0.1);
  shadow.drawEllipse(TILE / 2, TILE - 2, 22, 5);
  shadow.endFill();
  c.addChild(shadow);

  // Desk surface (top-down perspective)
  const desk = new PIXI.Graphics();
  // Desk legs
  desk.beginFill(COLORS.deskLeg);
  desk.drawRect(6, 32, 3, 10);
  desk.drawRect(TILE - 9, 32, 3, 10);
  desk.endFill();
  // Desk top surface
  desk.beginFill(COLORS.deskTop);
  desk.drawRoundedRect(2, 10, TILE - 4, 24, 2);
  desk.endFill();
  // Desk front edge (depth)
  desk.beginFill(COLORS.deskWood);
  desk.drawRect(2, 30, TILE - 4, 4);
  desk.endFill();
  c.addChild(desk);

  // Monitor
  const monitor = new PIXI.Graphics();
  // Monitor stand
  monitor.beginFill(COLORS.monitorDark);
  monitor.drawRect(21, 12, 6, 4);
  monitor.endFill();
  // Monitor body
  monitor.beginFill(COLORS.monitorDark);
  monitor.drawRoundedRect(10, 0, 28, 14, 2);
  monitor.endFill();
  // Screen
  monitor.beginFill(screenColor);
  monitor.drawRect(12, 2, 24, 10);
  monitor.endFill();
  // Screen content (code lines)
  monitor.beginFill(0xffffff, 0.3);
  monitor.drawRect(14, 4, 12, 1);
  monitor.drawRect(14, 6, 18, 1);
  monitor.drawRect(14, 8, 8, 1);
  monitor.endFill();
  c.addChild(monitor);

  // Keyboard
  const keyboard = new PIXI.Graphics();
  keyboard.beginFill(0x4a4a5e);
  keyboard.drawRoundedRect(14, 18, 20, 8, 1);
  keyboard.endFill();
  keyboard.beginFill(0x5a5a6e);
  keyboard.drawRect(16, 19, 16, 6);
  keyboard.endFill();
  c.addChild(keyboard);

  // Chair (below desk)
  const chair = new PIXI.Graphics();
  // Chair wheels
  chair.beginFill(0x333344);
  chair.drawCircle(18, TILE - 2, 2);
  chair.drawCircle(30, TILE - 2, 2);
  chair.endFill();
  // Chair base
  chair.beginFill(0x444455);
  chair.drawRect(17, TILE - 5, 14, 3);
  chair.endFill();
  // Chair seat
  chair.beginFill(chairColor);
  chair.drawRoundedRect(14, TILE - 12, 20, 8, 3);
  chair.endFill();
  // Chair back
  chair.beginFill(darken(chairColor, 0.15));
  chair.drawRoundedRect(16, TILE - 14, 16, 4, 2);
  chair.endFill();
  c.addChild(chair);

  return c;
}

/** Draw the coffee/kitchen area */
export function drawCoffeeMachine(): PIXI.Container {
  const c = new PIXI.Container();

  // Counter base
  const counter = new PIXI.Graphics();
  counter.beginFill(COLORS.counterFace);
  counter.drawRoundedRect(2, 20, TILE - 4, 24, 2);
  counter.endFill();
  // Counter top
  counter.beginFill(COLORS.counterTop);
  counter.drawRoundedRect(0, 16, TILE, 6, 2);
  counter.endFill();
  c.addChild(counter);

  // Coffee machine
  const machine = new PIXI.Graphics();
  machine.beginFill(COLORS.coffeeMachine);
  machine.drawRoundedRect(8, 0, 20, 18, 3);
  machine.endFill();
  // Machine detail
  machine.beginFill(0x4a4a5e);
  machine.drawRect(12, 2, 12, 8);
  machine.endFill();
  // Red power light
  machine.beginFill(0xe74c3c);
  machine.drawCircle(26, 4, 2);
  machine.endFill();
  // Drip area
  machine.beginFill(0x2a2a3a);
  machine.drawRect(14, 12, 8, 6);
  machine.endFill();
  c.addChild(machine);

  // Coffee cup
  const cup = new PIXI.Graphics();
  cup.beginFill(COLORS.mugWhite);
  cup.drawRoundedRect(34, 18, 8, 9, 2);
  cup.endFill();
  // Coffee liquid
  cup.beginFill(0x6f4e37);
  cup.drawRect(35, 19, 6, 5);
  cup.endFill();
  // Cup handle
  cup.lineStyle(2, COLORS.mugWhite);
  cup.arc(42, 23, 3, -Math.PI / 2, Math.PI / 2, false);
  c.addChild(cup);

  // Steam
  const steam = new PIXI.Graphics();
  steam.lineStyle(1, 0xffffff, 0.3);
  steam.moveTo(38, 14);
  steam.bezierCurveTo(36, 10, 40, 8, 38, 4);
  steam.moveTo(36, 15);
  steam.bezierCurveTo(34, 11, 38, 9, 36, 5);
  c.addChild(steam);

  return c;
}

/** Draw a meeting area with a round table and chairs */
export function drawMeetingSpot(): PIXI.Container {
  const c = new PIXI.Container();
  // Handled by the carpet tiles in drawOfficeFloor
  // Just draw the meeting table furniture here
  return c;
}

/** Draw a round meeting table (placed at center of meeting area) */
export function drawMeetingTable(): PIXI.Container {
  const c = new PIXI.Container();

  // Table shadow
  const shadow = new PIXI.Graphics();
  shadow.beginFill(0x000000, 0.1);
  shadow.drawEllipse(TILE, TILE, 40, 30);
  shadow.endFill();
  c.addChild(shadow);

  // Round table
  const table = new PIXI.Graphics();
  // Table top
  table.beginFill(COLORS.deskTop);
  table.drawEllipse(TILE, TILE - 4, 36, 24);
  table.endFill();
  // Table edge
  table.beginFill(COLORS.deskWood);
  table.drawEllipse(TILE, TILE, 36, 24);
  table.drawEllipse(TILE, TILE - 2, 34, 22);
  table.endFill();
  table.beginFill(COLORS.deskTop);
  table.drawEllipse(TILE, TILE - 4, 34, 22);
  table.endFill();
  c.addChild(table);

  // Items on table
  const items = new PIXI.Graphics();
  // Laptop
  items.beginFill(0x4a4a5e);
  items.drawRoundedRect(TILE - 12, TILE - 16, 16, 10, 1);
  items.endFill();
  items.beginFill(0x5b8ef5);
  items.drawRect(TILE - 10, TILE - 14, 12, 6);
  items.endFill();
  // Notepad
  items.beginFill(0xf5f5e8);
  items.drawRect(TILE + 8, TILE - 14, 10, 12);
  items.endFill();
  items.beginFill(0x3498db, 0.4);
  items.drawRect(TILE + 10, TILE - 12, 6, 1);
  items.drawRect(TILE + 10, TILE - 9, 6, 1);
  items.drawRect(TILE + 10, TILE - 6, 4, 1);
  items.endFill();
  c.addChild(items);

  // Chairs around the table
  const chairPositions = [
    { x: TILE - 42, y: TILE - 8, color: COLORS.chairBlue },
    { x: TILE + 38, y: TILE - 8, color: COLORS.chairPurple },
    { x: TILE - 8, y: TILE - 32, color: COLORS.chairGreen },
    { x: TILE - 8, y: TILE + 22, color: COLORS.chairOrange },
  ];

  for (const pos of chairPositions) {
    const chair = new PIXI.Graphics();
    chair.beginFill(pos.color);
    chair.drawRoundedRect(pos.x, pos.y, 16, 14, 4);
    chair.endFill();
    chair.beginFill(darken(pos.color, 0.2));
    chair.drawRoundedRect(pos.x + 2, pos.y + 2, 12, 10, 3);
    chair.endFill();
    c.addChild(chair);
  }

  return c;
}

/** Draw a plant decoration - Gather style potted plant */
export function drawPlant(): PIXI.Container {
  const c = new PIXI.Container();

  // Pot
  const pot = new PIXI.Graphics();
  pot.beginFill(COLORS.potTerracotta);
  pot.moveTo(14, 28);
  pot.lineTo(34, 28);
  pot.lineTo(32, TILE - 2);
  pot.lineTo(16, TILE - 2);
  pot.closePath();
  pot.endFill();
  // Pot rim
  pot.beginFill(COLORS.potDark);
  pot.drawRect(12, 26, 24, 4);
  pot.endFill();
  // Soil
  pot.beginFill(0x5a3a20);
  pot.drawEllipse(24, 29, 9, 3);
  pot.endFill();
  c.addChild(pot);

  // Leaves (layered circles for bushy look)
  const leaves = new PIXI.Graphics();
  leaves.beginFill(COLORS.plantGreen);
  leaves.drawCircle(24, 16, 10);
  leaves.drawCircle(18, 12, 7);
  leaves.drawCircle(30, 12, 7);
  leaves.drawCircle(24, 6, 6);
  leaves.endFill();
  // Darker inner leaves for depth
  leaves.beginFill(COLORS.plantDark);
  leaves.drawCircle(22, 14, 5);
  leaves.drawCircle(28, 10, 4);
  leaves.endFill();
  // Light spots
  leaves.beginFill(0x66bb6a, 0.6);
  leaves.drawCircle(20, 8, 3);
  leaves.drawCircle(28, 14, 2);
  leaves.endFill();
  c.addChild(leaves);

  return c;
}

/** Draw a bookshelf */
export function drawBookshelf(): PIXI.Container {
  const c = new PIXI.Container();

  // Shelf frame
  const frame = new PIXI.Graphics();
  frame.beginFill(COLORS.deskWood);
  frame.drawRect(4, 0, TILE - 8, TILE);
  frame.endFill();
  frame.beginFill(COLORS.deskTop);
  frame.drawRect(6, 0, TILE - 12, TILE - 2);
  frame.endFill();
  // Shelf dividers
  frame.beginFill(COLORS.deskWood);
  frame.drawRect(4, TILE / 3, TILE - 8, 2);
  frame.drawRect(4, (TILE * 2) / 3, TILE - 8, 2);
  frame.endFill();
  c.addChild(frame);

  // Books on shelves
  const books = new PIXI.Graphics();
  const bookColors = [COLORS.bookRed, COLORS.bookBlue, COLORS.bookGreen, COLORS.bookYellow,
    0x8e44ad, 0xe67e22, 0x1abc9c];

  // Top shelf
  let bx = 8;
  for (let i = 0; i < 4; i++) {
    const bw = 4 + Math.floor(Math.random() * 3);
    const bh = 10 + Math.floor(Math.random() * 4);
    books.beginFill(bookColors[i % bookColors.length]);
    books.drawRect(bx, TILE / 3 - bh, bw, bh);
    books.endFill();
    bx += bw + 1;
  }
  // Middle shelf
  bx = 8;
  for (let i = 0; i < 5; i++) {
    const bw = 3 + Math.floor(Math.random() * 3);
    const bh = 8 + Math.floor(Math.random() * 6);
    books.beginFill(bookColors[(i + 3) % bookColors.length]);
    books.drawRect(bx, (TILE * 2) / 3 - bh, bw, bh);
    books.endFill();
    bx += bw + 1;
  }
  // Bottom shelf
  bx = 8;
  for (let i = 0; i < 3; i++) {
    const bw = 5 + Math.floor(Math.random() * 4);
    const bh = 10 + Math.floor(Math.random() * 4);
    books.beginFill(bookColors[(i + 1) % bookColors.length]);
    books.drawRect(bx, TILE - 2 - bh, bw, bh);
    books.endFill();
    bx += bw + 2;
  }

  c.addChild(books);
  return c;
}

/** Draw a whiteboard */
export function drawWhiteboard(): PIXI.Container {
  const c = new PIXI.Container();

  // Board frame
  const frame = new PIXI.Graphics();
  frame.beginFill(COLORS.whiteboardFrame);
  frame.drawRoundedRect(2, 2, TILE * 2 - 4, TILE - 4, 2);
  frame.endFill();

  // White surface
  frame.beginFill(COLORS.whiteboardBg);
  frame.drawRect(5, 5, TILE * 2 - 10, TILE - 10);
  frame.endFill();
  c.addChild(frame);

  // Scribbles on the whiteboard
  const scribbles = new PIXI.Graphics();
  scribbles.lineStyle(1.5, 0x2980b9, 0.5);
  scribbles.moveTo(10, 12);
  scribbles.lineTo(40, 12);
  scribbles.moveTo(10, 18);
  scribbles.lineTo(55, 18);
  scribbles.moveTo(10, 24);
  scribbles.lineTo(35, 24);

  scribbles.lineStyle(1.5, 0xe74c3c, 0.5);
  scribbles.drawRect(60, 10, 20, 16);
  scribbles.moveTo(65, 28);
  scribbles.lineTo(75, 28);

  scribbles.lineStyle(1.5, 0x27ae60, 0.4);
  scribbles.moveTo(10, 32);
  scribbles.lineTo(30, 32);
  scribbles.moveTo(10, 36);
  scribbles.lineTo(45, 36);
  c.addChild(scribbles);

  // Marker tray
  const tray = new PIXI.Graphics();
  tray.beginFill(0xc0c0b0);
  tray.drawRect(20, TILE - 4, 56, 4);
  tray.endFill();
  // Markers
  tray.beginFill(0x2980b9);
  tray.drawRect(24, TILE - 6, 10, 3);
  tray.endFill();
  tray.beginFill(0xe74c3c);
  tray.drawRect(38, TILE - 6, 10, 3);
  tray.endFill();
  tray.beginFill(0x27ae60);
  tray.drawRect(52, TILE - 6, 10, 3);
  tray.endFill();
  c.addChild(tray);

  return c;
}

/** Draw a small rug/mat */
export function drawRug(): PIXI.Container {
  const c = new PIXI.Container();
  const rug = new PIXI.Graphics();

  // Rug base
  rug.beginFill(COLORS.rugWarm, 0.6);
  rug.drawRoundedRect(4, 4, TILE - 8, TILE - 8, 4);
  rug.endFill();

  // Rug pattern
  rug.lineStyle(1, COLORS.rugWarmLight, 0.4);
  rug.drawRoundedRect(8, 8, TILE - 16, TILE - 16, 2);
  rug.drawRoundedRect(12, 12, TILE - 24, TILE - 24, 1);

  c.addChild(rug);
  return c;
}

function darken(color: number, amount: number): number {
  const r = Math.max(0, ((color >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((color >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (color & 0xff) * (1 - amount));
  return (r << 16) | (g << 8) | b;
}
