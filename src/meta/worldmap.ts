/** Campaign hex field graph + abstract residue eco (Mind Vessel–shaped, Warhead lore). */

const GROUNDS = ["open", "timber", "yard", "bog", "teeth"] as const
export type Ground = (typeof GROUNDS)[number]

export type CachedLoot = { kind: "salvage" | "intel" | "sample"; x: number; y: number }

export type CachedSleeper = {
  hull: string
  wake: string
  x: number
  y: number
  awake: boolean
}

/** Pointy-top axial hex neighbors. */
export const HEX_DIRS: readonly [number, number][] = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

export type FieldNode = {
  id: number
  seed: number
  /** Axial hex column. */
  q: number
  /** Axial hex row. */
  r: number
  ground: Ground
  bearing: number
  exits: number[]
  /** Abstract feral mass (0–18). */
  feral: number
  /** Abstract rust mass (0–18). */
  rust: number
  bio: number
  oxide: number
  scar: number
  sleepers: CachedSleeper[]
  loot: CachedLoot[]
  visited: boolean
}

export type CampaignMap = {
  seed: number
  start: number
  nodes: FieldNode[]
}

/** Hex disk radius 7 → 169 cells. */
export const HEX_RADIUS = 7
const LOOT_CAP = 2

export function diskCount(radius = HEX_RADIUS) {
  return 3 * radius * (radius + 1) + 1
}

/** Pointy-top disk fit: size so the full disk sits inside a square canvas. */
export function fitHexSize(css: number, radius = HEX_RADIUS, pad = 1.02) {
  const spanX = Math.sqrt(3) * radius + 1
  const spanY = 1.5 * radius + 1
  return css / (2 * Math.max(spanX, spanY) * pad)
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export function hexKey(q: number, r: number) {
  return `${q},${r}`
}

/** Pointy-top axial → pixel (size = center-to-vertex). */
export function axialToPixel(q: number, r: number, size: number) {
  return {
    x: size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    y: size * ((3 / 2) * r),
  }
}

/** Pointy-top hex corner points around a center. */
export function hexCorners(cx: number, cy: number, size: number) {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30)
    pts.push({ x: cx + size * Math.cos(a), y: cy + size * Math.sin(a) })
  }
  return pts
}

export function neighborAngle(from: Pick<FieldNode, "q" | "r">, to: Pick<FieldNode, "q" | "r">) {
  const d = axialToPixel(to.q - from.q, to.r - from.r, 1)
  return Math.atan2(d.y, d.x)
}

function link(nodes: FieldNode[], a: number, b: number) {
  if (a === b) return
  if (!nodes[a].exits.includes(b)) nodes[a].exits.push(b)
  if (!nodes[b].exits.includes(a)) nodes[b].exits.push(a)
}

function diskCells(radius: number) {
  const cells: { q: number; r: number }[] = []
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) <= radius) cells.push({ q, r })
    }
  }
  return cells
}

export function genMap(seed: number): CampaignMap {
  const rng = mulberry32(seed || 1)
  const cells = diskCells(HEX_RADIUS)
  const nodes: FieldNode[] = cells.map((c, i) => ({
    id: i,
    seed: ((seed || 1) * 1009 + i * 7919) | 0,
    q: c.q,
    r: c.r,
    ground: GROUNDS[(rng() * GROUNDS.length) | 0],
    bearing: (rng() * 8) | 0,
    exits: [],
    feral: 3 + rng() * 7,
    rust: 2 + rng() * 6,
    bio: 1 + rng() * 5,
    oxide: 1 + rng() * 5,
    scar: 0,
    sleepers: [],
    loot: [],
    visited: false,
  }))
  const at = new Map(nodes.map((n) => [hexKey(n.q, n.r), n]))
  for (const n of nodes) {
    for (const [dq, dr] of HEX_DIRS) {
      const nb = at.get(hexKey(n.q + dq, n.r + dr))
      if (nb) link(nodes, n.id, nb.id)
    }
  }
  const start = nodes.find((n) => n.q === 0 && n.r === 0)?.id ?? 0
  return { seed: seed || 1, start, nodes }
}

/** Layout every node in pixel space, centered. */
export function layoutHex(map: CampaignMap, size: number, cx: number, cy: number) {
  return map.nodes.map((n) => {
    const p = axialToPixel(n.q, n.r, size)
    return { id: n.id, x: cx + p.x, y: cy + p.y }
  })
}

/** One eco tick on a cold node (abstract pops only). */
export function ecoStep(n: FieldNode, dt = 1) {
  const scar = n.scar
  n.feral += (0.09 * n.bio - 0.045 * n.rust - 0.07 * scar) * dt
  n.rust += (0.08 * n.oxide - 0.05 * n.feral - 0.05 * scar) * dt
  n.bio += (0.025 - 0.012 * n.feral - 0.02 * scar) * dt
  n.oxide += (0.022 - 0.01 * n.rust) * dt
  n.scar = Math.max(0, n.scar - 0.012 * dt)
  n.feral = clamp(n.feral, 0, 18)
  n.rust = clamp(n.rust, 0, 18)
  n.bio = clamp(n.bio, 0, 12)
  n.oxide = clamp(n.oxide, 0, 12)
}

export function ecoAll(map: CampaignMap, dt = 1, skip?: number) {
  for (const n of map.nodes) {
    if (n.id === skip) continue
    ecoStep(n, dt)
  }
}

/** Pressure band from residue — scar quietens, oxide tips rust, bio tips feral. */
export function pressureOf(n: FieldNode, depthBand: string[]): string {
  if (n.scar >= 7 && n.feral + n.rust < 5) {
    return depthBand.includes("drift") ? "drift" : depthBand[0]
  }
  if (n.oxide >= 7 && n.rust >= n.feral) {
    if (depthBand.includes("coil")) return "coil"
    if (depthBand.includes("skirmish")) return "skirmish"
  }
  if (n.bio >= 6 && n.feral >= n.rust) {
    if (depthBand.includes("herd")) return "herd"
    if (depthBand.includes("drift")) return "drift"
  }
  if (n.rust > n.feral + 2 && depthBand.includes("skirmish")) return "skirmish"
  if (n.feral > n.rust + 2 && depthBand.includes("herd")) return "herd"
  return depthBand[(n.seed >>> 3) % depthBand.length]
}

/** Horde interval scale: scar slows packs; dense residue speeds them. */
export function hordeScale(n: FieldNode) {
  const mass = n.feral + n.rust
  const scar = n.scar
  return clamp(1.15 + scar * 0.08 - mass * 0.02, 0.55, 2.2)
}

export function foldHostiles(n: FieldNode, feralAlive: number, rustAlive: number, kills: number) {
  n.feral = clamp(n.feral * 0.35 + feralAlive * 0.55, 0, 18)
  n.rust = clamp(n.rust * 0.35 + rustAlive * 0.55, 0, 18)
  // Clear bonus only when the visit actually fought — empty scar-quiet revisits
  // must not stack scar forever with no residue left to recover.
  const cleared = feralAlive + rustAlive === 0 && kills > 0
  n.scar = clamp(n.scar + kills * 0.12 + (cleared ? 1.2 : 0), 0, 12)
  if (kills > 4) n.bio = clamp(n.bio - 0.4, 0, 12)
  if (kills > 4) n.oxide = clamp(n.oxide + 0.3, 0, 12)
  // Floor a trickle of mass from bio/oxide so packs can return after heavy scar.
  if (n.feral + n.rust < 1.2) {
    n.feral = clamp(n.feral + Math.min(1.4, n.bio * 0.15), 0, 18)
    n.rust = clamp(n.rust + Math.min(1.4, n.oxide * 0.15), 0, 18)
  }
}

export function cacheLoot(n: FieldNode, loot: CachedLoot[]) {
  n.loot = loot.slice(0, LOOT_CAP)
}

export function cacheSleepers(n: FieldNode, sleepers: CachedSleeper[]) {
  n.sleepers = sleepers.filter((s) => !s.awake).slice(0, 4)
}

export function parseMap(raw: unknown): CampaignMap | null {
  if (!raw || typeof raw !== "object") return null
  const m = raw as CampaignMap
  if (typeof m.seed !== "number" || typeof m.start !== "number" || !Array.isArray(m.nodes)) return null
  if (m.nodes.length < 2) return null
  // Pre-hex / old-radius saves: regenerate from seed.
  if (
    m.nodes.length !== diskCount() ||
    m.nodes.some((row) => row == null || typeof row.q !== "number" || typeof row.r !== "number")
  ) {
    return genMap(m.seed | 0 || 1)
  }
  const nodes: FieldNode[] = []
  for (const row of m.nodes) {
    if (!row || typeof row.id !== "number") return null
    const ground = (GROUNDS as readonly string[]).includes(row.ground) ? (row.ground as Ground) : "open"
    nodes.push({
      id: row.id | 0,
      seed: (row.seed | 0) || 1,
      q: row.q | 0,
      r: row.r | 0,
      ground,
      bearing: ((row.bearing | 0) % 8 + 8) % 8,
      exits: Array.isArray(row.exits) ? row.exits.map((x) => x | 0).filter((x) => x !== row.id) : [],
      feral: clamp(Number(row.feral) || 0, 0, 18),
      rust: clamp(Number(row.rust) || 0, 0, 18),
      bio: clamp(Number(row.bio) || 0, 0, 12),
      oxide: clamp(Number(row.oxide) || 0, 0, 12),
      scar: clamp(Number(row.scar) || 0, 0, 12),
      sleepers: Array.isArray(row.sleepers) ? row.sleepers.slice(0, 4) : [],
      loot: Array.isArray(row.loot) ? row.loot.slice(0, LOOT_CAP) : [],
      visited: !!row.visited,
    })
  }
  const at = new Map(nodes.map((n) => [hexKey(n.q, n.r), n]))
  for (const n of nodes) {
    n.exits = []
    for (const [dq, dr] of HEX_DIRS) {
      const nb = at.get(hexKey(n.q + dq, n.r + dr))
      if (nb) link(nodes, n.id, nb.id)
    }
  }
  const start =
    nodes.find((n) => n.id === m.start)?.id ??
    nodes.find((n) => n.q === 0 && n.r === 0)?.id ??
    nodes[0].id
  return { seed: m.seed | 0 || 1, start, nodes }
}
