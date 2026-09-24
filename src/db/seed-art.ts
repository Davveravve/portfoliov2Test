import sharp from "sharp";

/**
 * Procedural stand-in "screenshots" for seed data, so the site looks real
 * without shipping third-party assets. Deterministic per seed string.
 */

export type ArtStyle = "cavern" | "orbit" | "blockout";
export type Palette = { sky: [string, string]; layers: string[]; accent: string; fog: string };

function rng(seedText: string) {
  let h = 2166136261;
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const grain = (id: string, opacity: number) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer>
  </filter>`;

/** Smooth, rocky profile: layered sines with random phases plus a little jitter. */
function profile(r: () => number, w: number, base: number, amp: number, steps: number): [number, number][] {
  const waves = Array.from({ length: 3 }, (_, i) => ({
    f: (i + 1) * (1.2 + r()),
    ph: r() * Math.PI * 2,
    a: amp / (i + 1),
  }));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const y =
      base +
      waves.reduce((sum, wv) => sum + Math.sin(t * Math.PI * 2 * wv.f + wv.ph) * wv.a, 0) +
      (r() - 0.5) * amp * 0.25;
    return [t * w, y];
  });
}

const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function yAt(pts: [number, number][], x: number): number {
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i]!;
    const [x0, y0] = pts[i - 1]!;
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return pts.at(-1)![1];
}

function cavern(seed: string, w: number, h: number, p: Palette): string {
  const r = rng(seed);
  const holeX = w * (0.3 + r() * 0.4);
  const n = p.layers.length;
  const floors: [number, number][][] = [];
  const layers = p.layers
    .map((color, i) => {
      const depth = i / Math.max(1, n - 1); // 0 = far, 1 = near
      const ceil = profile(r, w, h * (0.2 - depth * 0.12), h * (0.05 + depth * 0.05), 40);
      const floor = profile(r, w, h * (0.7 + depth * 0.14), h * (0.03 + depth * 0.05), 40);
      // Stalactites hanging from the ceiling.
      const spikes = Array.from({ length: 5 + i * 3 }, () => {
        const x = r() * w;
        if (Math.abs(x - holeX) < w * 0.08) return "";
        const top = yAt(ceil, x) - 4;
        const len = h * (0.03 + r() * 0.08) * (1 + depth);
        const half = w * (0.006 + r() * 0.01) * (1 + depth);
        return `<polygon points="${x - half},${top} ${x + half},${top} ${x + half * 0.2},${top + len}" fill="${color}"/>`;
      }).join("");
      // Fog sits in front of each layer, so far layers read lighter.
      const fog = `<rect width="${w}" height="${h}" fill="${p.fog}" opacity="${(0.07 * (1 - depth)).toFixed(3)}"/>`;
      floors.push(floor);
      return `<polygon points="0,0 ${poly(ceil)} ${w},0" fill="${color}"/>${spikes}
        <polygon points="0,${h} ${poly(floor)} ${w},${h}" fill="${color}"/>${i < n - 1 ? fog : ""}${i === n - 2 ? "FIGURE" : ""}`;
    })
    .join("");
  // The climber stands in the light, on whichever ledge is in front at that x.
  const fx = holeX + w * (r() > 0.5 ? 0.03 : -0.04);
  const fy = Math.min(...floors.slice(-2).map((f) => yAt(f, fx)));
  const figure = `<rect x="${fx}" y="${fy - h * 0.05}" width="${w * 0.005}" height="${h * 0.05}" fill="${p.accent}"/>
    <circle cx="${fx + w * 0.0025}" cy="${fy - h * 0.058}" r="${w * 0.004}" fill="${p.accent}"/>`;
  return `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
      <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.fog}" stop-opacity=".32"/><stop offset=".75" stop-color="${p.fog}" stop-opacity=".06"/><stop offset="1" stop-color="${p.fog}" stop-opacity="0"/></linearGradient>
      <radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${p.fog}" stop-opacity=".22"/><stop offset="1" stop-color="${p.fog}" stop-opacity="0"/></radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="${w * 0.006}"/></filter>
      ${grain("g", 0.07)}
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    ${layers.replace(
      "FIGURE",
      `
      <polygon points="${holeX - w * 0.025},0 ${holeX + w * 0.025},0 ${holeX + w * 0.11},${h * 0.9} ${holeX - w * 0.09},${h * 0.9}" fill="url(#shaft)" filter="url(#soft)"/>
      <ellipse cx="${holeX + w * 0.01}" cy="${h * 0.82}" rx="${w * 0.14}" ry="${h * 0.05}" fill="url(#pool)"/>`,
    )}
    ${figure}
    <rect width="${w}" height="${h}" filter="url(#g)"/>`;
}

function orbit(seed: string, w: number, h: number, p: Palette): string {
  const r = rng(seed);
  const cx = w * (0.4 + r() * 0.2);
  const cy = h * (0.45 + r() * 0.1);
  const rings = Array.from({ length: 5 }, (_, i) => {
    const rad = h * (0.12 + i * 0.09);
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${p.layers[i % p.layers.length]}" stroke-width="${i === 2 ? 3 : 1.5}" stroke-dasharray="${i % 2 ? "6 10" : "none"}"/>`;
  }).join("");
  const bodies = Array.from({ length: 5 }, (_, i) => {
    const a = r() * Math.PI * 2;
    const rad = h * (0.12 + i * 0.09);
    const size = h * (0.012 + r() * 0.02);
    return `<circle cx="${cx + Math.cos(a) * rad}" cy="${cy + Math.sin(a) * rad}" r="${size}" fill="${i === 2 ? p.accent : p.fog}"/>`;
  }).join("");
  const stars = Array.from({ length: 140 }, () => {
    const s = r() * 2 + 0.5;
    return `<rect x="${r() * w}" y="${r() * h}" width="${s}" height="${s}" fill="${p.fog}" opacity="${0.2 + r() * 0.6}"/>`;
  }).join("");
  const trail = Array.from({ length: 24 }, (_, i) => {
    const a = -Math.PI / 2 + i * 0.09;
    const rad = h * 0.3 + i * 2;
    return `${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`;
  }).join(" ");
  return `
    <defs>
      <radialGradient id="sky" cx="${cx / w}" cy="${cy / h}" r="0.9"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></radialGradient>
      ${grain("g", 0.05)}
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    ${stars}
    ${rings}
    <polyline points="${trail}" fill="none" stroke="${p.accent}" stroke-width="2" opacity=".7"/>
    <circle cx="${cx}" cy="${cy}" r="${h * 0.06}" fill="${p.layers[0]}"/>
    <circle cx="${cx}" cy="${cy}" r="${h * 0.06}" fill="none" stroke="${p.fog}" stroke-width="2" opacity=".5"/>
    ${bodies}
    <rect width="${w}" height="${h}" filter="url(#g)"/>`;
}

function blockout(seed: string, w: number, h: number, p: Palette): string {
  const r = rng(seed);
  // Isometric projection of a block grid.
  const tile = h * 0.055;
  const ox = w / 2;
  const oy = h * 0.2;
  const iso = (x: number, y: number, z: number) =>
    [ox + (x - y) * tile, oy + (x + y) * tile * 0.5 - z * tile * 0.9] as const;
  const grid: string[] = [];
  for (let i = -2; i <= 14; i++) {
    const [ax, ay] = iso(i, -2, 0);
    const [bx, by] = iso(i, 14, 0);
    const [cx, cy] = iso(-2, i, 0);
    const [dx, dy] = iso(14, i, 0);
    grid.push(`<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"/><line x1="${cx}" y1="${cy}" x2="${dx}" y2="${dy}"/>`);
  }
  const blocks: { x: number; y: number; z: number; accent: boolean }[] = [];
  for (let x = 0; x < 12; x++)
    for (let y = 0; y < 12; y++) {
      const v = r();
      if (v > 0.72) blocks.push({ x, y, z: 1 + Math.floor(r() * (v > 0.95 ? 5 : 2)), accent: v > 0.985 });
    }
  blocks.sort((a, b) => a.x + a.y - (b.x + b.y));
  const shapes = blocks
    .map(({ x, y, z, accent }) => {
      const top = [iso(x, y, z), iso(x + 1, y, z), iso(x + 1, y + 1, z), iso(x, y + 1, z)];
      const left = [iso(x, y + 1, z), iso(x + 1, y + 1, z), iso(x + 1, y + 1, 0), iso(x, y + 1, 0)];
      const right = [iso(x + 1, y, z), iso(x + 1, y + 1, z), iso(x + 1, y + 1, 0), iso(x + 1, y, 0)];
      const pts = (q: (readonly [number, number])[]) => q.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
      const [t, l, rr] = accent ? [p.accent, p.accent, p.accent] : [p.layers[0], p.layers[1], p.layers[2]];
      return `<polygon points="${pts(left)}" fill="${l}" ${accent ? 'opacity=".75"' : ""}/><polygon points="${pts(right)}" fill="${rr}" ${accent ? 'opacity=".55"' : ""}/><polygon points="${pts(top)}" fill="${t}"/>`;
    })
    .join("");
  return `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
      ${grain("g", 0.04)}
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    <g stroke="${p.fog}" stroke-opacity=".12" stroke-width="1">${grid.join("")}</g>
    ${shapes}
    <rect width="${w}" height="${h}" filter="url(#g)"/>`;
}

export async function renderArt(style: ArtStyle, seed: string, palette: Palette, w = 1920, h = 1080) {
  const body =
    style === "cavern"
      ? cavern(seed, w, h, palette)
      : style === "orbit"
        ? orbit(seed, w, h, palette)
        : blockout(seed, w, h, palette);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  const image = sharp(Buffer.from(svg));
  const webp = await image.clone().webp({ quality: 82 }).toBuffer();
  const blur = await image.clone().resize(16, 9).webp({ quality: 40 }).toBuffer();
  return {
    bytes: new Uint8Array(webp),
    width: w,
    height: h,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}
