import type { Motif } from "./exploration";
const crescent = '<path d="M168 18a12 12 0 1 0 0 24a9 9 0 0 1 0-24"/>';
const quad =
  '<g transform="translate(163 161)"><path d="M0-16v9m0 14v9m-16-16h9m14 0h9"/><circle r="3"/></g>';
const spiral = Array.from({ length: 140 }, (_, i) => {
  const t = (i / 139) * Math.PI * 5,
    r = 3 + (i / 139) * 36;
  return `${100 + Math.cos(t) * r},${100 + Math.sin(t) * r}`;
}).join(" ");
const shapes: Record<Motif, string> = {
  eye:
    '<path d="M25 100Q100 24 175 100Q100 176 25 100Z"/><circle cx="100" cy="100" r="27"/><path d="M100 22v156"/>' +
    crescent,
  tree:
    '<path d="M100 22v156M100 67L65 42L44 43M65 42V24M100 85L53 65L32 69M100 67L135 42L156 43M135 42V24M100 85L147 65L168 69M100 133L65 158L44 157M65 158v18M100 115L53 135L32 131M100 133L135 158L156 157M135 158v18M100 115L147 135L168 131"/>' +
    crescent,
  clock:
    '<circle cx="95" cy="93" r="65"/>' +
    Array.from(
      { length: 12 },
      (_, i) => `<path transform="rotate(${i * 30} 95 93)" d="M95 35v8"/>`,
    ).join("") +
    quad,
  sun:
    `<polyline points="${spiral}"/>` +
    Array.from(
      { length: 12 },
      (_, i) => `<path transform="rotate(${i * 30} 100 100)" d="M100 33v-16"/>`,
    ).join("") +
    crescent,
  weave:
    '<path d="M15 48Q90 4 183 52M9 150Q100 195 180 150"/><path stroke="#a66559" d="M20 42L170 149L95 20L34 169L178 64"/><path d="M29 44L99 175L176 55L26 153L95 19"/><circle cx="95" cy="20" r="10"/><path d="M10 65a19 19 0 0 1 30-26M151 151a19 19 0 0 1 30-7"/>' +
    crescent +
    quad,
  duck: '<path d="M39 116q-5 43 65 43q55 0 57-39l-25-9q18-39-10-48q-30-7-33 27l-9 26q-30-23-45 0Z"/><path d="M139 92l28 10l-29 9"/><circle cx="124" cy="86" r="3"/>',
};
/** Original line drawings interpreting the written Notion motifs, not a traced ritual image. */
export function markSvg(motif: Motif, covered = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#28352b"/><g fill="none" stroke="${motif === "tree" ? "#e1e2cc" : "#c9ba91"}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${shapes[motif]}</g>${covered ? '<rect x="30" y="28" width="132" height="145" fill="#988b6b" transform="rotate(-6 100 100)"/><path d="M39 62h95M37 76h70M40 122h90" stroke="#6f7055" stroke-width="3"/>' : ""}</svg>`;
}
export const markData = (motif: Motif, covered = false) =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(markSvg(motif, covered));
