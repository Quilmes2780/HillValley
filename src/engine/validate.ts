import { NavMesh } from 'navmesh';
import { hasText } from './i18n';
import type { Combo, Era, ItemDef, Polygon, RoomDef } from './types';

function isConvex(poly: Polygon): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    const [cx, cy] = poly[(i + 2) % poly.length];
    const cross = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (cross !== 0) {
      if (sign !== 0 && Math.sign(cross) !== sign) return false;
      sign = Math.sign(cross);
    }
  }
  return true;
}

function centerOf(poly: Polygon): { x: number; y: number } {
  const x = poly.reduce((sum, p) => sum + p[0], 0) / poly.length;
  const y = poly.reduce((sum, p) => sum + p[1], 0) / poly.length;
  return { x, y };
}

/** Prüft die Spieldaten beim Start. Fehler landen in der Konsole und im Testlauf. */
export function validateContent(
  rooms: readonly RoomDef[],
  items: readonly ItemDef[],
  combos: readonly Combo[],
): string[] {
  const errors: string[] = [];
  const needText = (key: string, where: string): void => {
    if (!hasText(key)) errors.push(`${where}: Text ${key} fehlt`);
  };
  const itemIds = new Set(items.map((item) => item.id));

  for (const item of items) {
    needText(item.name, `Gegenstand ${item.id}`);
    if (typeof item.description === 'string') needText(item.description, `Gegenstand ${item.id}`);
  }
  for (const combo of combos) {
    for (const id of [combo.a, combo.b]) {
      if (!itemIds.has(id)) errors.push(`Kombination: Gegenstand ${id} unbekannt`);
    }
  }

  for (const room of rooms) {
    needText(room.name, `Raum ${room.id}`);
    for (const [eraText, variants] of Object.entries(room.eras)) {
      variants.forEach((variant, index) => {
        const where = `Raum ${room.id}/${eraText}#${index}`;
        variant.walkable.forEach((poly, i) => {
          if (!isConvex(poly)) errors.push(`${where}: Walkbox ${i} ist nicht konvex`);
        });
        let mesh: NavMesh | null = null;
        if (variant.walkable.length > 0) {
          mesh = new NavMesh(variant.walkable.map((poly) => poly.map(([x, y]) => ({ x, y }))));
          const start = centerOf(variant.walkable[0]);
          variant.walkable.slice(1).forEach((poly, i) => {
            if (!mesh!.findPath(start, centerOf(poly))) {
              errors.push(`${where}: Walkbox ${i + 1} ist nicht erreichbar`);
            }
          });
        }
        for (const hs of variant.hotspots) {
          const label = `${where}, Hotspot ${hs.id}`;
          needText(hs.name, label);
          for (const key of Object.values(hs.comments ?? {})) needText(key, label);
          for (const id of Object.keys(hs.useWith ?? {})) {
            const isHotspot = variant.hotspots.some((other) => other.id === id);
            if (!itemIds.has(id) && !isHotspot) {
              errors.push(`${label}: Gegenstand oder Hotspot ${id} unbekannt`);
            }
          }
          if (mesh && !mesh.isPointInMesh({ x: hs.walkTo[0], y: hs.walkTo[1] })) {
            errors.push(`${label}: Standpunkt liegt außerhalb der Walkbox`);
          }
          if (hs.exit) {
            const target = rooms.find((r) => r.id === hs.exit!.room);
            const era = hs.exit.era ?? (Number(eraText) as Era);
            if (!target?.eras[era]) {
              errors.push(`${label}: Ausgang führt zu ${hs.exit.room}/${era}, das gibt es nicht`);
            }
          }
        }
      });
    }
  }
  return errors;
}
