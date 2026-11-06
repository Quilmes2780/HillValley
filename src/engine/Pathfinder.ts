import { NavMesh } from 'navmesh';
import type { Polygon, Pt } from './types';

function closestOnSegment(p: Pt, a: Pt, b: Pt): Pt {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return a;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSq));
  return [a[0] + t * dx, a[1] + t * dy];
}

/** Hülle um navmesh: Klicks außerhalb landen auf dem nächsten begehbaren Punkt. */
export class Pathfinder {
  private readonly mesh: NavMesh | null;

  constructor(private readonly walkable: readonly Polygon[]) {
    this.mesh =
      walkable.length > 0
        ? new NavMesh(walkable.map((poly) => poly.map(([x, y]) => ({ x, y }))))
        : null;
  }

  private contains(p: Pt): boolean {
    return this.mesh?.isPointInMesh({ x: p[0], y: p[1] }) ?? false;
  }

  /** Nächster begehbarer Punkt, ganzzahlig und sicher innerhalb der Walkbox. */
  closest(p: Pt): Pt {
    if (!this.mesh || this.contains(p)) return p;
    let best: Pt = p;
    let bestDist = Infinity;
    let bestPoly: Polygon = this.walkable[0];
    for (const poly of this.walkable) {
      for (let i = 0; i < poly.length; i++) {
        const q = closestOnSegment(p, poly[i], poly[(i + 1) % poly.length]);
        const dist = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
        if (dist < bestDist) {
          best = q;
          bestDist = dist;
          bestPoly = poly;
        }
      }
    }
    // Gerundete Punkte auf schrägen Kanten können knapp außerhalb liegen: zur Mitte nachrücken.
    const cx = bestPoly.reduce((sum, q) => sum + q[0], 0) / bestPoly.length;
    const cy = bestPoly.reduce((sum, q) => sum + q[1], 0) / bestPoly.length;
    let result: Pt = [Math.round(best[0]), Math.round(best[1])];
    for (let i = 0; i < 4 && !this.contains(result); i++) {
      result = [result[0] + Math.sign(cx - result[0]), result[1] + Math.sign(cy - result[1])];
    }
    return result;
  }

  /** Wegpunkte ohne den Startpunkt; leer, wenn kein Weg existiert. */
  path(from: Pt, to: Pt): Pt[] {
    if (!this.mesh) return [];
    const start = this.closest(from);
    const end = this.closest(to);
    const found = this.mesh.findPath({ x: start[0], y: start[1] }, { x: end[0], y: end[1] });
    if (!found) return [];
    return found.slice(1).map((p): Pt => [p.x, p.y]);
  }
}
