/** Motifs follow Notion 04B; their placement here and all short inscriptions are new proposals. */
export const SECRETS = [
  {
    id: "eye",
    title: "A etiqueta coberta",
    position: [-8, -1.65, 3] as [number, number, number],
    action: "Descolar a etiqueta",
    before:
      "O armário tem uma etiqueta nova colada sobre uma inscrição antiga. Uma linha escura aparece pela borda.",
    after:
      "Um olho cortado verticalmente. O corte continua para fora da pálpebra, como se pertencesse a outro desenho. No canto inferior há um crescente pequeno. A etiqueta não tem nome nem data.",
    motif: "eye",
  },
  {
    id: "tree",
    title: "O desenho sob a água",
    position: [-7, -2.55, 10] as [number, number, number],
    action: "Afastar a película da água",
    before:
      "A água da bacia está parada. Sob a película de poeira, uma mancha clara parece um ramo.",
    after:
      "É uma árvore branca: os galhos se repetem abaixo, onde deveriam estar as raízes. O desenho está gravado no fundo da bacia; não é reflexo. Um pequeno crescente acompanha a borda.",
    motif: "tree",
  },
  {
    id: "clock",
    title: "O relógio que não quebrou",
    position: [7, -1.8, 11] as [number, number, number],
    action: "Abrir o vidro",
    before:
      "Um relógio foi deixado sobre a mesa. O vidro tem uma rachadura, mas o mostrador parece inteiro.",
    after:
      "Não há ponteiros — nem o furo onde seriam presos. Atrás do mostrador, um papel diz “17h43 / guardar até a volta”. A marca no aro tem quatro pequenas partes em torno de um eixo.",
    motif: "clock",
  },
  {
    id: "weave",
    title: "O avesso do tecido",
    position: [9.9, -1.5, 5] as [number, number, number],
    action: "Virar a ponta do tecido",
    before:
      "Uma tira de tecido cobre marcas na parede. A costura usa linha vermelha e linha clara, cruzadas várias vezes.",
    after:
      "O avesso mostra apenas um pedaço de uma trama maior. Há crescentes na margem e outra marca de quatro partes. Duas palavras sobrevivem: “NASCER” e “ESCOLHER”. O tecido foi cortado depois delas. Preso na costura há um recibo quase apagado: “custódia 06 — devolver sem abrir”. Não diz o que foi guardado, nem quem assinou.",
    motif: "weave",
  },
  {
    id: "sun",
    title: "O carimbo no verso",
    position: [0, -1.8, 13.6] as [number, number, number],
    action: "Virar o ingresso",
    before:
      "Um ingresso antigo do Festival de Calan está preso sob um peso. O lado exposto não traz nenhuma assinatura.",
    after:
      "No verso há um sol cujo centro se enrola em espiral. Uma linha de impressão foi cortada pela metade. O mesmo crescente aparece aqui, mas a tinta é diferente da que marca o tecido.",
    motif: "sun",
  },
  {
    id: "duck",
    title: "O fiscal de umidade",
    position: [-9, -2.2, 7] as [number, number, number],
    action: "Apertar o pato",
    before:
      "Entre as coisas esquecidas, um pato de borracha usa um crachá desproporcionalmente sério.",
    after:
      "Um rangido baixo. No crachá: “Fiscal de umidade. Há 23 anos sem deixar o chão secar.” No verso: “Favor não promover a gerente.”",
    motif: "duck",
  },
] as const;
export type SecretId = (typeof SECRETS)[number]["id"];
export type Motif = (typeof SECRETS)[number]["motif"];
export const EXPLORE_KEY = "agua-morta:passeio:v2";
export const OBSTACLES = [
  { x0: -3.5, x1: 3.2, z0: -2, z1: 2.25 },
  { x0: -8.7, x1: -7.3, z0: 2.4, z1: 3.6 },
  { x0: 6.1, x1: 7.9, z0: 10.4, z1: 11.6 },
  { x0: -7.7, x1: -6.3, z0: 9.3, z1: 10.7 },
];
export function validPosition(x: number, z: number, doorAngle = 0) {
  const dx = x + 2.55,
    dz = z - 0.65,
    lx = Math.cos(doorAngle) * dx + Math.sin(doorAngle) * dz,
    lz = -Math.sin(doorAngle) * dx + Math.cos(doorAngle) * dz;
  if (doorAngle > 0.1 && lx > -0.4 && lx < 5.5 && lz > -0.5 && lz < 0.6)
    return false;
  return (
    x >= -10 &&
    x <= 10 &&
    z >= -0.8 &&
    z <= 14 &&
    !OBSTACLES.some(
      (b) =>
        x > b.x0 - 0.35 &&
        x < b.x1 + 0.35 &&
        z > b.z0 - 0.35 &&
        z < b.z1 + 0.35,
    )
  );
}
export function stepPosition(
  x: number,
  z: number,
  dx: number,
  dz: number,
  doorAngle = 0,
) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / 0.12));
  for (let i = 0; i < n; i++) {
    if (validPosition(x + dx / n, z, doorAngle)) x += dx / n;
    if (validPosition(x, z + dz / n, doorAngle)) z += dz / n;
  }
  return { x, z };
}
export function nearby(x: number, z: number, yaw: number): SecretId | "safe" | null {
  const candidates = [
    ...SECRETS.map((s) => ({
      id: s.id as SecretId | "safe",
      x: s.position[0],
      z: s.position[2],
      r: 2.5,
    })),
    { id: "safe" as const, x: 0, z: 1, r: 4 },
  ];
  return (
    candidates
      .map((c) => ({
        ...c,
        d: Math.hypot(c.x - x, c.z - z),
        f: -(c.x - x) * Math.sin(yaw) - (c.z - z) * Math.cos(yaw),
      }))
      .filter((c) => c.d < c.r && c.f / Math.max(c.d, 0.001) > 0.25)
      .sort((a, b) => a.d - b.d)[0]?.id ?? null
  );
}
export function decodeJournal(raw: string | null): {
  found: SecretId[];
  note: string;
} {
  try {
    const v = JSON.parse(raw || "{}");
    return {
      found: SECRETS.filter(
        (s) => Array.isArray(v?.found) && v.found.includes(s.id),
      ).map((s) => s.id),
      note: typeof v?.note === "string" ? v.note.slice(0, 2000) : "",
    };
  } catch {
    return { found: [], note: "" };
  }
}
