import type { OfficeLayout, Position } from "./types.js";

/** Default office layout - a cozy pixel-art office */
export function createDefaultOffice(): OfficeLayout {
  const desks = [];
  // Two rows of desks, 4 per row
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      desks.push({
        id: `desk-${row}-${col}`,
        position: { x: 3 + col * 3, y: 3 + row * 5 },
      });
    }
  }

  return {
    width: 20,
    height: 16,
    tileSize: 48,
    desks,
    coffeeArea: { x: 17, y: 2 },
    meetingSpots: [
      { x: 17, y: 8 },
      { x: 18, y: 8 },
      { x: 17, y: 9 },
      { x: 18, y: 9 },
    ],
  };
}

/** Get a random idle roaming position */
export function getRandomRoamPosition(office: OfficeLayout): Position {
  const areas = [
    // Near coffee
    { x: office.coffeeArea.x + Math.floor(Math.random() * 2) - 1, y: office.coffeeArea.y + Math.floor(Math.random() * 2) },
    // Hallway areas
    { x: 1 + Math.floor(Math.random() * (office.width - 2)), y: 7 },
    { x: 1 + Math.floor(Math.random() * (office.width - 2)), y: 1 },
    // Near entrance
    { x: 1, y: office.height - 2 },
  ];
  return areas[Math.floor(Math.random() * areas.length)];
}
