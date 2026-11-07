import type { Comments, Era, Hotspot, HotspotSprite, Pt, RoomDef, Script, Verb } from '../../engine/types';
import { rect } from './util';

/**
 * Easter Eggs und Gags: für die Lösung nicht nötig. Sie stehen gesammelt hier, damit sich einzelne
 * leicht wieder entfernen lassen und die Rätsel in den Raummodulen unberührt bleiben.
 *
 * `add` hängt neue Klickflächen an. `patch` füllt bei vorhandenen Klickflächen nur Lücken:
 * Was ein Raum selbst für ein Verb oder einen Gegenstand vorsieht, hat immer Vorrang.
 */
interface Patch {
  verbs?: Partial<Record<Verb, Script>>;
  comments?: Comments;
  useWith?: Record<string, Script>;
}

interface Extra {
  room: string;
  era: Era;
  /** Nur diese Varianten der Zeitebene; ohne Angabe alle. */
  variants?: readonly number[];
  add?: readonly Hotspot[];
  patch?: Record<string, Patch>;
}

const say = (name: string): string => `say.extra.${name}`;
const line =
  (name: string): Script =>
  async (g) => {
    await g.say(say(name));
  };

function spot(
  id: string,
  [x, y, w, h]: readonly [number, number, number, number],
  walkTo: Pt,
  look: {
    sprite?: { name: string; x?: number; y?: number; depthY?: number };
    comments?: Partial<Record<Verb, string>>;
    verbs?: Partial<Record<Verb, Script>>;
    defaultVerb?: Verb;
  } = {},
): Hotspot {
  const comments: Comments = { schauan: say(id) };
  for (const [verb, name] of Object.entries(look.comments ?? {})) comments[verb as Verb] = say(name);
  const sprite: HotspotSprite | undefined = look.sprite && {
    key: `backgrounds/sprites/x_${look.sprite.name}.png`,
    x: look.sprite.x ?? x,
    y: look.sprite.y ?? y,
    depthY: look.sprite.depthY,
  };
  return {
    id: `x_${id}`,
    name: `hotspot.x_${id}`,
    area: rect(x, y, w, h),
    walkTo,
    face: 'hinten',
    comments,
    sprite,
    verbs: look.verbs,
    defaultVerb: look.defaultVerb,
  };
}

const chuck = (x: number, y: number, walkTo: Pt): Hotspot =>
  spot('chuck', [x, y, 14, 18], walkTo, {
    sprite: { name: 'topf' },
    comments: { redemit: 'chuck_rede', nimm: 'chuck_nimm' },
  });

const museumExtras: Pick<Extra, 'add'> = {
  add: [
    spot('schwert', [236, 24, 12, 32], [242, 96], {
      sprite: { name: 'schwert', x: 237, y: 25 },
      comments: { nimm: 'schwert_nimm' },
    }),
    spot('hut', [292, 50, 26, 21], [300, 98], {
      sprite: { name: 'vitrine', y: 50 },
      comments: { nimm: 'hut_nimm', oeffne: 'hut_nimm' },
    }),
    spot('kristall', [292, 71, 26, 21], [300, 98], { comments: { nimm: 'kristall_nimm' } }),
  ],
};

// In Figurengröße, ein gutes Stück vor der Bank geparkt.
const motorrad = spot('motorrad', [226, 88, 72, 40], [262, 132], {
  sprite: { name: 'motorrad', depthY: 128 },
  comments: { benutze: 'motorrad_benutze', nimm: 'motorrad_benutze' },
});

const denkmal = spot('denkmal', [66, 13, 32, 80], [82, 98], { sprite: { name: 'denkmal', depthY: 93 } });

const EXTRAS: readonly Extra[] = [
  // --- Prolog-Orte -----------------------------------------------------------------------------
  {
    room: 'vorgarten',
    era: 1986,
    variants: [1],
    patch: {
      auto: {
        verbs: {
          benutze: async (g) => {
            await g.sayAs('biff', say('wachs_1'));
            await g.sayAs('biff', say('wachs_2'));
          },
        },
      },
      biff: {
        verbs: {
          ziehe: async (g) => {
            await g.say(say('affe'));
            await g.sayAs('biff', say('affe_biff'));
          },
        },
        useWith: {
          foto: async (g) => {
            await g.sayAs('biff', say('foto_biff'));
          },
        },
      },
    },
  },
  {
    room: 'kueche',
    era: 1986,
    add: [
      spot('mikrowelle', [238, 44, 18, 13], [246, 94], {
        sprite: { name: 'mikrowelle' },
        comments: { benutze: 'mikrowelle_benutze', oeffne: 'mikrowelle_oeffne', druecke: 'mikrowelle_benutze' },
      }),
    ],
    patch: {
      lorraine: {
        useWith: {
          foto: async (g) => {
            await g.sayAs('lorraine', say('foto_lorraine'));
          },
        },
      },
    },
  },
  {
    room: 'docs_labor',
    era: 1986,
    add: [
      spot('falle', [196, 112, 22, 12], [190, 110], {
        sprite: { name: 'falle' },
        comments: { oeffne: 'falle_oeffne', benutze: 'falle_oeffne', druecke: 'falle_oeffne' },
      }),
      spot('fleck', [130, 124, 28, 9], [140, 120], {
        sprite: { name: 'fleck' },
        comments: { nimm: 'fleck_nimm' },
      }),
      spot('fuetterer', [90, 72, 18, 20], [100, 96], {
        sprite: { name: 'fuetterer' },
        comments: { benutze: 'fuetterer_benutze', druecke: 'fuetterer_benutze' },
      }),
    ],
    patch: {
      einstein: {
        useWith: {
          banane: line('einstein_banane'),
          foto: line('einstein_foto'),
        },
      },
    },
  },

  // --- Schule und Stadt 1986 -------------------------------------------------------------------
  {
    room: 'schule_flur',
    era: 1986,
    add: [
      spot('lautsprecher', [116, 6, 16, 12], [124, 96], {
        sprite: { name: 'lautsprecher' },
        comments: { redemit: 'lautsprecher_rede' },
      }),
      spot('nachsitzen', [8, 36, 18, 24], [20, 96], { sprite: { name: 'aushang_rot' }, comments: { nimm: 'nachsitzen_nimm' } }),
    ],
  },
  {
    room: 'schuelerzeitung',
    era: 1986,
    add: [
      spot('artikel', [190, 14, 24, 18], [202, 96], { sprite: { name: 'artikel' }, comments: { nimm: 'artikel_nimm' } }),
      chuck(170, 72, [176, 96]),
    ],
  },
  { room: 'rathausplatz', era: 1986, add: [motorrad] },
  // Goldie Wilson gibt es erst wieder, wenn die Stadt nicht Mr. Tannen gehört.
  { room: 'rathausplatz', era: 1986, variants: [1], add: [denkmal] },
  {
    room: 'uhrwerk',
    era: 1986,
    patch: {
      waehlrad: {
        verbs: {
          ziehe: async (g) => {
            await g.say(say('kopierschutz_1'));
            await g.say(say('kopierschutz_2'));
          },
        },
      },
      chronopost: {
        useWith: {
          foto: line('post_foto'),
          zeitung: line('post_zeitung'),
          kugelschreiber: line('post_stift'),
          banane: line('post_banane'),
          skateboard: line('post_skateboard'),
        },
      },
    },
  },

  // --- 1955 ------------------------------------------------------------------------------------
  {
    room: 'radioladen',
    era: 1955,
    add: [
      spot('kiste', [232, 72, 24, 20], [244, 104], {
        sprite: { name: 'kiste' },
        comments: { oeffne: 'kiste_oeffne', redemit: 'kiste_rede', gib: 'kiste_oeffne' },
      }),
    ],
  },
  {
    room: 'cafe',
    era: 1955,
    add: [
      spot('karte', [244, 30, 16, 22], [248, 106], {
        sprite: { name: 'karte' },
        verbs: {
          benutze: async (g) => {
            await g.say(say('karte_bestellt'));
            await g.sayAs('lou', say('karte_lou'));
          },
        },
      }),
    ],
  },
  {
    room: 'docs_labor',
    era: 1955,
    add: [chuck(244, 74, [250, 96])],
  },
  {
    room: 'rathausplatz',
    era: 1955,
    add: [spot('goldie_plakat', [282, 66, 14, 20], [288, 96], { sprite: { name: 'aushang_blau' } })],
  },

  // --- 1885 ------------------------------------------------------------------------------------
  {
    room: 'saloon',
    era: 1885,
    add: [
      spot('grog', [168, 54, 12, 12], [175, 104], {
        sprite: { name: 'grog' },
        comments: { benutze: 'grog_nimm', nimm: 'grog_nimm' },
      }),
    ],
  },
  {
    room: 'mietstall',
    era: 1885,
    add: [spot('marshal', [16, 52, 18, 24], [28, 96], { sprite: { name: 'aushang_sand' }, comments: { nimm: 'marshal_nimm' } })],
    patch: {
      misthaufen: {
        verbs: {
          benutze: async (g) => {
            await g.say(say('mist_luft'));
            await g.showCard(say('tot_titel'), say('tot_unter'));
            await g.say(say('mist_zurueck'));
          },
        },
      },
    },
  },
  {
    room: 'festplatz',
    era: 1885,
    add: [
      spot('wanderer', [288, 56, 14, 36], [290, 98], {
        sprite: { name: 'wanderer' },
        verbs: {
          redemit: async (g) => {
            g.sfx('gitarre');
            await g.say(say('wanderer_rede'));
          },
        },
      }),
    ],
  },
  {
    room: 'stadtplan',
    era: 1885,
    add: [spot('insel', [150, 126, 14, 10], [157, 130], { sprite: { name: 'insel' } })],
  },
  {
    room: 'abstellgleis',
    era: 1885,
    patch: { kaktus: { comments: { redemit: say('kaktus_rede') } } },
  },

  // --- 2015 ------------------------------------------------------------------------------------
  {
    room: 'turmplatz',
    era: 2015,
    add: [
      spot('mond', [36, 4, 24, 24], [48, 96], { sprite: { name: 'mond' } }),
      spot('haendler', [34, 66, 20, 46], [64, 114], {
        sprite: { name: 'haendler', depthY: 112 },
        defaultVerb: 'redemit',
        comments: { redemit: 'haendler_rede', gib: 'haendler_gib' },
      }),
      spot('kino', [274, 52, 22, 36], [285, 96], { sprite: { name: 'kino' }, comments: { nimm: 'kino_nimm' } }),
      spot('holo', [112, 52, 14, 20], [118, 96], { sprite: { name: 'holo' }, comments: { redemit: 'holo_rede' } }),
    ],
    patch: { schwebeauto: { comments: { benutze: say('schwebeauto_benutze'), oeffne: say('schwebeauto_benutze') } } },
  },
  {
    room: 'cafe80er',
    era: 2015,
    add: [
      spot('wasserglas', [62, 50, 8, 10], [66, 106], {
        sprite: { name: 'wasserglas' },
        verbs: {
          schauan: async (g) => {
            g.shake(200);
            await g.say(say('wasserglas_1'));
            g.shake(300);
            await g.say(say('wasserglas_2'));
          },
        },
      }),
      spot('shake', [74, 48, 8, 12], [78, 106], {
        sprite: { name: 'shake' },
        comments: { nimm: 'shake_nimm', benutze: 'shake_nimm' },
      }),
      spot('pluesch', [132, 46, 18, 14], [141, 106], { sprite: { name: 'pluesch' }, comments: { redemit: 'pluesch_rede', nimm: 'pluesch_nimm' } }),
      spot('pillen', [150, 52, 10, 8], [155, 106], { sprite: { name: 'pillen' }, comments: { nimm: 'pillen_nimm', benutze: 'pillen_nimm' } }),
      spot('hoverboard', [254, 52, 10, 36], [259, 106], {
        sprite: { name: 'hoverboard' },
        comments: { nimm: 'hoverboard_benutze', benutze: 'hoverboard_benutze' },
      }),
    ],
  },
  { room: 'museum', era: 2015, ...museumExtras, patch: { museumsroboter: { verbs: {
    druecke: async (g) => {
      await g.sayAs('museumsroboter', say('roboter_abschied'));
      await g.say(say('roboter_besen'));
    },
  } } } },
  {
    room: 'lobby',
    era: 2015,
    add: [
      spot('schacht', [42, 14, 16, 10], [50, 96], { sprite: { name: 'schacht' }, comments: { oeffne: 'schacht_oeffne' } }),
      spot('schuhe', [44, 84, 12, 5], [50, 96], { sprite: { name: 'schuhe' }, comments: { nimm: 'schuhe_nimm' } }),
      spot('chuck_lobby', [275, 40, 26, 48], [288, 96], { comments: { redemit: 'chuck_rede', nimm: 'chuck_nimm' } }),
    ],
    patch: { aufzug: { comments: { ziehe: say('aufzug_gefuehl') } } },
  },
  {
    room: 'gasse',
    era: 2015,
    add: [
      spot('origami', [90, 110, 10, 8], [95, 118], { sprite: { name: 'origami' }, comments: { nimm: 'origami_nimm' } }),
      spot('direktor', [150, 18, 18, 24], [159, 96], { sprite: { name: 'aushang_neon' } }),
    ],
  },
];

function fill<T extends object>(existing: T | undefined, extra: T | undefined, blockedBy: object[] = []): T | undefined {
  if (!extra) return existing;
  const out = { ...existing } as Record<string, unknown>;
  for (const [key, value] of Object.entries(extra)) {
    if (key in out || blockedBy.some((other) => key in other)) continue;
    out[key] = value;
  }
  return out as T;
}

function applyPatch(hs: Hotspot, patch: Patch): Hotspot {
  return {
    ...hs,
    verbs: fill(hs.verbs, patch.verbs, [hs.comments ?? {}]),
    comments: fill(hs.comments, patch.comments, [hs.verbs ?? {}]),
    useWith: fill(hs.useWith, patch.useWith),
  };
}

export function withExtras(rooms: readonly RoomDef[]): RoomDef[] {
  return rooms.map((room) => {
    const extras = EXTRAS.filter((e) => e.room === room.id);
    if (extras.length === 0) return room;
    const eras = { ...room.eras };
    for (const extra of extras) {
      const variants = eras[extra.era];
      if (!variants) throw new Error(`extras: Raum ${room.id} hat keine Zeitebene ${extra.era}`);
      eras[extra.era] = variants.map((variant, index) => {
        if (extra.variants && !extra.variants.includes(index)) return variant;
        const patched = variant.hotspots.map((hs) => {
          const patch = extra.patch?.[hs.id];
          return patch ? applyPatch(hs, patch) : hs;
        });
        return { ...variant, hotspots: [...patched, ...(extra.add ?? [])] };
      });
    }
    return { ...room, eras };
  });
}
