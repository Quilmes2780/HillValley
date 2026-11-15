import { C } from './palette.ts';
import { Canvas } from './png.ts';

function sprite(dir: string, name: string, w: number, h: number, paint: (c: Canvas) => void): void {
  const c = new Canvas(w, h);
  paint(c);
  c.save(`${dir}/backgrounds/sprites/${name}.png`);
}

// Die kleinen Raumbilder von Kapitel 3 (Streichhölzer, Bleistift, Festprogramm, Fluxkompensator und
// Brief am Boden, Sicherung im Fach, vergilbter Brief) sind mit Higgsfield erzeugt und werden hier nicht
// mehr erzeugt. Brecheisen, Sicherung, Wachsdose und Schlüsselbund hat der Nutzer gezeichnet.
export function buildK3K4Backgrounds(dir: string): void {
  sprite(dir, 'brief_fach', 14, 7, (s) => {
    s.rect(0, 0, 14, 7, C.weiss);
    s.frame(0, 0, 14, 7, C.neon);
    s.line(1, 1, 7, 4, C.grau4);
    s.line(12, 1, 7, 4, C.grau4);
  });
}
