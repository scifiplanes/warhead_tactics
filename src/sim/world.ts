import {
  CARDS,
  DECK_CAP,
  FORM_REPEAT,
  HOSTILES,
  STARTER,
  card,
  paidFor,
  rollHero,
  type Hero,
  type Side,
  type Stats,
} from "../content/catalog"
import { flashOf, gunMuzzle, type FlashDef, type FlashShape } from "../content/muzzle"
import {
  cacheLoot,
  cacheSleepers,
  ecoAll,
  foldHostiles,
  genMap,
  hordeScale,
  neighborAngle,
  pressureOf,
  type CampaignMap,
  type CachedLoot,
  type FieldNode,
} from "../meta/worldmap"

export type PathExit = { x: number; y: number; hold: number; to: number; open: boolean }

export type Commands = {
  moveX: number
  moveY: number
  group: boolean
  spread: boolean
  ability: number | null
}

export const IDLE: Commands = {
  moveX: 0,
  moveY: 0,
  group: false,
  spread: false,
  ability: null,
}

export type Burst = { x: number; y: number; tint: "blood" | "oxide" | "dust" | "flash" }

export type Body = {
  id: number
  kind: string
  side: Side
  x: number
  y: number
  hp: number
  maxHp: number
  radius: number
  speed: number
  armor: number
  range: number
  damage: number
  cooldown: number
  cool: number
  sideCool: number
  /** Primary magazine rounds left (0 + ammoMax 0 = unlimited). */
  ammo: number
  ammoMax: number
  /** Primary reload time left. */
  reloadT: number
  reloadNeed: number
  sideAmmo: number
  sideAmmoMax: number
  sideReload: number
  sideReloadNeed: number
  mobileFire: boolean
  deployNeed: number
  deploy: number
  seats: number
  heavy: boolean
  vehicle: boolean
  inSection: boolean
  boarded: number | null
  boardVeh: number | null
  boardDelay: number
  gears: string[]
  gearPay: Record<string, number>
  cost: number
  out: boolean
  alive: boolean
  fired: number
  moved: boolean
  ramCd: number
  bumpCd: number
  touch: number
  face: number
  hdg: number
  vel: number
  heal: number
  lob: boolean
  aoe: number
  pierce: number
  boost: number
  life: number
  ramMul: number
  ramSelf: number
  android: boolean
  dig: number
  spot: number
  follow: boolean
  air: boolean
  nvg: boolean
  stun: number
  /** Stun seconds this body applies on a landed hit (rust tasers). */
  shock: number
  sortieT: number
  parts: Limb[]
  name: string
  heroId: string
}

export type Limb = { id: "head" | "arm" | "leg" | "wheel" | "turret"; on: boolean }
export type Mark = { x: number; y: number; kind: "splat" | "crater" | "burn"; tint: Burst["tint"] }
export type Gib = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  part: Limb["id"]
  kind: string
  tint: Burst["tint"]
  rest: boolean
  side: Side
}

export type Slot = { id: string; charges: number; cd: number; cdMax: number }
export type Shot = { x: number; y: number; tx: number; ty: number; life: number; lift: number; from?: number }
export type Flash = {
  x: number
  y: number
  hdg: number
  life: number
  max: number
  shape: FlashShape
  core: string
  rim?: string
  along: number
  across: number
  /** Night illumination radius (world units). */
  light: number
  from?: number
}
export type Bolt = { x: number; y: number; vx: number; vy: number; dmg: number; life: number; side: Side }
export type Lob = { x: number; y: number; tx: number; ty: number; t: number; T: number; dmg: number; aoe: number; side: Side; lift: number }
export type Smoke = { x: number; y: number; r: number; t: number }
export type Mine = { x: number; y: number; t: number }
export type Strike = { x: number; y: number; t: number; n: number; next: number; dmg?: number }
export type Pass = {
  x: number
  y: number
  hx: number
  hy: number
  t: number
  n: number
  next: number
  dmg?: number
  r?: number
  step?: number
}
export type AirMark = { x: number; y: number; t: number }
export type Marsh = { x: number; y: number; r: number }
export type Weather = "clear" | "rain" | "snow" | "fog" | "dust"
export type Vision = "off" | "nvg" | "thermal"
export type Toast = { msg: string; kind: string; life: number }

export type Prop = {
  id: number
  kind: "burnt_tree" | "ruin" | "wire" | "wreck" | "post" | "teeth"
  x: number
  y: number
  hp: number
  radius: number
  alive: boolean
}

export type Drop = {
  id: number
  cardId: string
  x: number
  y: number
  bodyId: number
  kind: "unit" | "vehicle" | "gear" | "loot"
  taken: boolean
  cost: number
  skin?: "crate" | "item"
}

export type KitItem = { id: string; cost: number }

export type Inbound = {
  x: number
  y: number
  t: number
  cardId: string
  loot: boolean
  cost: number
  kit: KitItem[]
}
export type Reveal = { x: number; y: number; tx: number; ty: number; t: number; dur: number; bodyId: number; dropId: number }

export type World = {
  seed: number
  t: number
  phase: "run" | "win" | "lose"
  ax: number
  ay: number
  file: "loose" | "tight"
  gap: number
  autoBoard: boolean
  bodies: Body[]
  props: Prop[]
  drops: Drop[]
  inbound: Inbound[]
  reveals: Reveal[]
  deck: string[]
  toolbar: Slot[]
  groupLabel: string
  spreadLabel: string
  commander: number
  lzOn: boolean
  flareOn: boolean
  flareX: number
  flareY: number
  flareHold: number
  flareArm: number
  craftOn: boolean
  embarked: boolean
  loadT: number
  banner: string
  flareAt: number
  pathOn: boolean
  /** Exit marks; hold any one for PATH_HOLD to travel. */
  paths: PathExit[]
  /** Mirror of the active/nearest path for HUD and bots. */
  pathX: number
  pathY: number
  pathHold: number
  pathAt: number
  depth: number
  map: CampaignMap
  nodeId: number
  /** Hostiles killed on the current node (scar). */
  nodeKills: number
  ground: string
  bearing: number
  pressure: string
  apex: string
  escort: string
  skyMain: Weather
  skyAlt: Weather
  dayOff: number
  lost: number
  dropsTaken: number
  hullDamage: number
  nextDrop: number
  nextHorde: number
  bursts: Burst[]
  /** Player powder pops this tick (hip and set) — drained for shot audio. */
  pops: number
  rng: () => number
  nextId: number
  boardCursor: number
  exitCursor: number
  groupWas: boolean
  spreadWas: boolean
  groupHeld: number
  spreadHeld: number
  autoBoardT: number
  deckQueue: string[]
  deckPay: number[]
  /** Body gear waiting to ride the next unit or hull airdrop. */
  gearHold: KitItem[]
  kitPay: number
  hash: Map<string, Body[]>
  shots: Shot[]
  flashes: Flash[]
  bolts: Bolt[]
  marks: Mark[]
  gibs: Gib[]
  lobs: Lob[]
  mines: Mine[]
  strikes: Strike[]
  passes: Pass[]
  smokes: Smoke[]
  airMark: AirMark | null
  marshes: Marsh[]
  stashOn: boolean
  stashX: number
  stashY: number
  stashHold: number
  stashAt: number
  weather: Weather
  weatherAt: number
  vision: Vision
  toasts: Toast[]
  kills: number
  paused: boolean
  diffHp: number
  credits: number
  found: string[]
  unlocked: string[]
  hidden: string[]
  loot: number
  nextField: number
  paidPurge: boolean
  paidHaul: boolean
  paidWin: boolean
  lineBeat: number
  tags: Tag[]
  heroes: Record<string, Hero>
  heroOffered: boolean
  holdoutOffered: boolean
  sleepers: Sleeper[]
  buried: string[]
  veteranIds: string[]
}

export type Sleeper = {
  id: number
  hull: string
  wake: string
  x: number
  y: number
  awake: boolean
  hold: number
}

export type Tag = { x: number; y: number; text: string; kind: string; life: number; slot: number }

export type Diff = "easy" | "normal" | "hard"
export type RunOpts = {
  diff?: Diff
  hidden?: string[]
  known?: string[]
  heroes?: Hero[]
  wear?: Record<string, number>
  map?: CampaignMap
  nodeId?: number
}

export type Spawn = {
  kind: string
  x: number
  y: number
  inSection?: boolean
  side?: Side
  pack?: boolean
  /** Horde-only: goat/crow may bring a melee screen. */
  screen?: boolean
  hp?: number
  speed?: number
  range?: number
  damage?: number
  cooldown?: number
}

const STEP = 1 / 30
export const MAP = 400
const PICKUP = 3
const BOARD_RANGE = 1.7
const JOIN_DELAY = 1.1
const AUTO_EVERY = 0.6
export const CRAFT_WAIT = 18
export const DAY = 240

export function daylight(t: number) {
  return 0.5 + 0.5 * Math.cos((t / DAY) * Math.PI * 2)
}

const NIGHT = 0.45
export const BEAM_R = 14
export const BEAM_ARC = 0.55
const WEATHER: Record<Weather, { conceal: number; move: number; bog: number; fire: number }> = {
  clear: { conceal: 0, move: 1, bog: 1, fire: 1 },
  rain: { conceal: 1, move: 1.15, bog: 1.4, fire: 0.9 },
  snow: { conceal: 1, move: 1.25, bog: 1.2, fire: 0.88 },
  fog: { conceal: 3, move: 1.05, bog: 1, fire: 0.8 },
  dust: { conceal: 2, move: 1.1, bog: 1.15, fire: 0.85 },
}
const SKY: Weather[] = ["clear", "rain", "snow", "fog", "dust"]
const GROUNDS = ["open", "timber", "yard", "bog", "teeth"] as const
type Ground = (typeof GROUNDS)[number]
const BANDS = [
  ["drift", "skirmish"],
  ["herd", "coil"],
  ["line", "air"],
  ["apex"],
]
const APEX = ["reach", "mast", "dray", "rust_plow", "post", "bloom", "cluster", "fog", "ball", "amalgam"]
const ESCORT = ["walker", "roller", "slab", "drone", "coil", "flake"]
// ponytail: offset DAY matches 0; DAY/2 is midnight
const DAY_OFF = [0, DAY / 3, (2 * DAY) / 3, DAY / 2]
const PROP_W: Record<Ground, [Prop["kind"], number][]> = {
  open: [
    ["wreck", 45],
    ["ruin", 35],
    ["burnt_tree", 10],
    ["post", 10],
  ],
  timber: [
    ["burnt_tree", 75],
    ["wreck", 15],
    ["ruin", 10],
  ],
  yard: [
    ["ruin", 30],
    ["wire", 30],
    ["teeth", 20],
    ["post", 20],
  ],
  bog: [
    ["wreck", 60],
    ["burnt_tree", 20],
    ["ruin", 20],
  ],
  teeth: [
    ["teeth", 55],
    ["post", 35],
    ["wire", 10],
  ],
}
const DENSE: Record<Ground, number> = { open: 0.55, timber: 1.1, yard: 1, bog: 0.7, teeth: 0.85 }
const RECIPE: Record<string, { body: [string, number][]; early: [string, number][] }> = {
  drift: {
    body: [
      ["shambler", 50],
      ["doghead", 25],
      ["pighead", 15],
      ["mutant", 10],
    ],
    early: [
      ["shambler", 70],
      ["doghead", 30],
    ],
  },
  skirmish: {
    body: [
      ["scoot", 45],
      ["drone", 35],
      ["tract", 20],
    ],
    early: [
      ["scoot", 60],
      ["drone", 40],
    ],
  },
  herd: {
    body: [
      ["pighead", 35],
      ["goathead", 30],
      ["crowhead", 20],
      ["doghead", 15],
    ],
    early: [
      ["doghead", 55],
      ["pighead", 45],
    ],
  },
  coil: {
    body: [
      ["coil", 40],
      ["flake", 35],
      ["drone", 25],
    ],
    early: [
      ["drone", 60],
      ["coil", 40],
    ],
  },
  line: {
    body: [
      ["walker", 35],
      ["roller", 25],
      ["slab", 20],
      ["drone", 20],
    ],
    early: [
      ["drone", 70],
      ["scoot", 30],
    ],
  },
  air: {
    body: [
      ["kite", 45],
      ["drone", 35],
      ["flake", 20],
    ],
    early: [
      ["drone", 60],
      ["kite", 40],
    ],
  },
}
export const FLARE_ARM = 3
export const LOAD_STEP = 0.8
export const FLARE_R = 5
export const PATH_HOLD = 8
/** Path / opposite-LZ mark distance from field center. */
export const PATH_R = 72
/** Seconds between each exit reveal after the first. */
export const EXIT_STAGGER = 24
const DROP_WARN = 3
const DROP_EVERY = 14
const STASH_R = 3
const STASH_HOLD = 4
const HORDE_EVERY = 2.4
const HOSTILE_CAP = 36
const RAM = 36
const RAM_SELF = 7
const PROP_HIT = 3
const PROP_BUMP = 0.85
/** Short-range hits scrape steel; soft skins still take most of it. */
const meleeHull = (armor: number) => Math.max(0.25, 0.9 - armor)
const CELL = 8
export const GAP_MAX = 5
const GAP_RATE = 2.4
const GAP_NUDGE = 0.22

export function makeRun(seed: number, deck: string[], opts: RunOpts = {}): World {
  const w = blank(seed)
  w.diffHp = opts.diff === "easy" ? 0.75 : opts.diff === "hard" ? 1.35 : 1
  w.map = opts.map ?? genMap(seed || 1)
  ecoAll(w.map, 1.5)
  const startId = opts.nodeId ?? w.map.start
  w.nodeId = w.map.nodes.some((n) => n.id === startId) ? startId : w.map.start
  w.nodeKills = 0
  // Field first so deck shuffle keeps the same rng stream as before the graph.
  rollField(w, nodeOf(w))
  nodeOf(w).visited = true
  w.heroes = {}
  for (const hero of opts.heroes ?? []) w.heroes[hero.id] = hero
  w.veteranIds = (opts.heroes ?? []).map((hero) => hero.id)
  const ordered = deck.slice(0, DECK_CAP)
  const seen: Record<string, number> = {}
  const wear = opts.wear ?? {}
  const paired = ordered.map((id) => {
    const n = seen[id] ?? 0
    seen[id] = n + 1
    return { id, cost: paidFor(id, wear[id] ?? 0, n) }
  })
  // Body gear must lead the queue so the Lead wears it at step-off. Shuffle only
  // units / vehicles / section tools — a mid-queue hull used to eat the kit prefix.
  const kit = paired.filter((row) => deckGearId(w, row.id))
  const drops = paired.filter((row) => !deckGearId(w, row.id))
  shuffle(w.rng, drops)
  const flat = [...kit, ...drops]
  w.deck = flat.map((row) => row.id)
  w.deckQueue = w.deck.slice()
  w.deckPay = flat.map((row) => row.cost)
  w.unlocked = (opts.known ?? []).slice()
  w.found = []
  w.hidden = (opts.hidden ?? []).filter((id) => !w.unlocked.includes(id))
  shuffle(w.rng, w.hidden)
  w.nextDrop = 8
  w.nextHorde = 2
  w.flareAt = 48
  w.pathAt = 72
  w.stashAt = 22
  w.commander = spawnBody(w, { kind: STARTER, x: 0, y: 0, inSection: true }).id
  outfitLead(w)
  labels(w)
  grantThermal(w)
  grantNvg(w)
  return w
}

export function step(w: World, cmd: Commands, dt: number) {
  let left = Math.min(Math.max(0, dt), 2)
  let first = true
  while (left > 1e-8) {
    const h = Math.min(STEP, left)
    tick(w, { ...cmd, ability: first ? cmd.ability : null }, h)
    first = false
    left -= h
  }
}

export function balanceLine(w: World): string {
  return `BALANCE t=${w.t.toFixed(1)} lost=${w.lost} drops=${w.dropsTaken} hull=${w.hullDamage.toFixed(0)} result=${w.phase}`
}

export function takeBursts(w: World): Burst[] {
  const out = w.bursts
  w.bursts = []
  return out
}

/** Drain player shot pops for muffled brass audio (includes hip misses). */
export function takePops(w: World) {
  const n = w.pops
  w.pops = 0
  return n
}

export function spawnBody(w: World, spec: Spawn): Body {
  const row = CARDS.find((c) => c.id === spec.kind)
  const host = HOSTILES.find((h) => h.id === spec.kind)
  const base: Stats = row?.stats ??
    host?.stats ?? {
      hp: 20,
      speed: 4,
      range: 1,
      damage: 4,
      cooldown: 0.5,
      mobileFire: true,
      deployNeed: 0,
      seats: 0,
      heavy: false,
      armor: 0,
      radius: 0.4,
      vehicle: false,
    }
  const hp = spec.hp ?? (host ? Math.max(1, Math.round(base.hp * w.diffHp)) : base.hp)
  const b: Body = {
    id: w.nextId++,
    kind: spec.kind,
    side: spec.side ?? host?.side ?? "player",
    x: spec.x,
    y: spec.y,
    hp,
    maxHp: hp,
    radius: base.radius,
    speed: spec.speed ?? base.speed,
    armor: base.armor,
    range: spec.range ?? base.range,
    damage: spec.damage ?? base.damage,
    cooldown: spec.cooldown ?? base.cooldown,
    cool: 0,
    sideCool: 0,
    ammo: 0,
    ammoMax: 0,
    reloadT: 0,
    reloadNeed: 0,
    sideAmmo: 0,
    sideAmmoMax: 0,
    sideReload: 0,
    sideReloadNeed: 0,
    mobileFire: base.mobileFire,
    deployNeed: base.deployNeed,
    deploy: 0,
    seats: base.seats,
    heavy: base.heavy,
    vehicle: base.vehicle,
    inSection: spec.inSection ?? false,
    boarded: null,
    boardVeh: null,
    boardDelay: 0,
    gears: [],
    gearPay: {},
    cost: 0,
    out: false,
    alive: true,
    fired: 0,
    moved: false,
    ramCd: 0,
    bumpCd: 0,
    touch: 0,
    face: 1,
    hdg: 0,
    vel: 0,
    heal: row?.heal ?? 0,
    lob: row?.lob ?? false,
    aoe: row?.aoe ?? 0,
    pierce: row?.pierce ?? 0,
    boost: 0,
    life: 0,
    ramMul: 1,
    ramSelf: 1,
    android: row?.android ?? false,
    dig: row?.dig ?? 0,
    spot: row?.spot ?? 0,
    follow: row?.follow ?? false,
    air: row?.air ?? host?.air ?? false,
    nvg: row?.nvg ?? false,
    stun: 0,
    shock: host?.shock ?? 0,
    sortieT: 0,
    parts: limbs(base.vehicle, row?.air ?? host?.air ?? false),
    name: "",
    heroId: "",
  }
  if (host?.lob) {
    b.lob = true
    b.aoe = host.aoe ?? 1.8
  }
  if (row?.sortie) b.sortieT = row.sortie * (jtacLive(w) ? 1.25 : 1)
  w.bodies.push(b)
  if (host?.pack && spec.pack !== false) {
    for (let i = 1; i < host.pack; i++) {
      const a = (i / host.pack) * Math.PI * 2
      spawnBody(w, { ...spec, x: spec.x + Math.cos(a) * 0.9, y: spec.y + Math.sin(a) * 0.9, pack: false, screen: false })
    }
  }
  if (spec.screen) screenPack(w, spec.kind, spec.x, spec.y)
  return b
}

export function placeDrop(w: World, cardId: string, x: number, y: number, cost = 0): Drop {
  const hero = w.heroes[cardId]
  if (hero) {
    const body = spawnBody(w, { kind: hero.chassis, x, y, inSection: false })
    arm(w, body)
    fitGun(w, body, hero.gun)
    grantGift(body, hero.gift)
    body.name = hero.name
    body.heroId = hero.id
    body.cost = cost
    const drop: Drop = {
      id: w.nextId++,
      cardId,
      x,
      y,
      bodyId: body.id,
      kind: "unit",
      taken: false,
      cost,
      skin: "crate",
    }
    w.drops.push(drop)
    return drop
  }
  const c = card(cardId)
  const drop: Drop = {
    id: w.nextId++,
    cardId,
    x,
    y,
    bodyId: 0,
    kind: c.kind,
    taken: false,
    cost,
    skin: c.kind === "gear" ? "crate" : undefined,
  }
  if (c.kind === "unit" || c.kind === "vehicle") {
    const body = spawnBody(w, { kind: cardId, x, y, inSection: false })
    arm(w, body)
    body.cost = cost
    drop.bodyId = body.id
  }
  w.drops.push(drop)
  return drop
}

function blank(seed: number): World {
  return {
    seed,
    t: 0,
    phase: "run",
    ax: 0,
    ay: 0,
    file: "loose",
    gap: GAP_MAX,
    autoBoard: false,
    bodies: [],
    props: [],
    drops: [],
    inbound: [],
    reveals: [],
    deck: [],
    toolbar: [],
    groupLabel: "TIGHT",
    spreadLabel: "WIDE",
    commander: 0,
    lzOn: false,
    flareOn: false,
    flareX: 0,
    flareY: -PATH_R,
    flareHold: 0,
    flareArm: 0,
    craftOn: false,
    embarked: false,
    loadT: 0,
    banner: "",
    flareAt: 48,
    pathOn: false,
    paths: [{ x: 0, y: PATH_R, hold: 0, to: 0, open: false }],
    pathX: 0,
    pathY: PATH_R,
    pathHold: 0,
    pathAt: 72,
    depth: 0,
    map: genMap(seed || 1),
    nodeId: 0,
    nodeKills: 0,
    ground: "open",
    bearing: 0,
    pressure: "drift",
    apex: "reach",
    escort: "drone",
    skyMain: "clear",
    skyAlt: "rain",
    dayOff: 0,
    lost: 0,
    dropsTaken: 0,
    hullDamage: 0,
    nextDrop: 6,
    nextHorde: 2,
    bursts: [],
    pops: 0,
    rng: mulberry32(seed || 1),
    nextId: 1,
    boardCursor: 0,
    exitCursor: 0,
    groupWas: false,
    spreadWas: false,
    groupHeld: 0,
    spreadHeld: 0,
    autoBoardT: 0,
    deckQueue: [],
    deckPay: [],
    gearHold: [],
    kitPay: 0,
    hash: new Map(),
    shots: [],
    flashes: [],
    bolts: [],
    marks: [],
    gibs: [],
    lobs: [],
    mines: [],
    strikes: [],
    passes: [],
    smokes: [],
    airMark: null,
    marshes: [],
    stashOn: false,
    stashX: 22,
    stashY: 8,
    stashHold: 0,
    stashAt: 22,
    weather: "clear",
    weatherAt: 52,
    vision: "off",
    toasts: [],
    kills: 0,
    credits: 0,
    found: [],
    unlocked: [],
    hidden: [],
    loot: 0,
    nextField: 9,
    paidPurge: false,
    paidHaul: false,
    paidWin: false,
    lineBeat: 0,
    tags: [],
    paused: false,
    diffHp: 1,
    heroes: {},
    heroOffered: false,
    holdoutOffered: false,
    sleepers: [],
    buried: [],
    veteranIds: [],
  }
}

function tick(w: World, cmd: Commands, dt: number) {
  if (w.phase !== "run" || w.paused) return
  for (const b of w.bodies) b.moved = false
  orders(w, cmd, dt)
  labels(w)
  drive(w, cmd, dt)
  drops(w, dt)
  reveals(w, dt)
  pickup(w)
  sleepers(w, dt)
  horde(w, dt)
  rebuild(w)
  ai(w, dt)
  rebuild(w)
  climate(w, dt)
  combat(w, dt)
  bolts(w, dt)
  rams(w, dt)
  lobs(w, dt)
  mines(w, dt)
  strikes(w, dt)
  passes(w, dt)
  digs(w, dt)
  heals(w, dt)
  gibs(w, dt)
  ages(w, dt)
  reap(w)
  bounties(w)
  cull(w)
  flare(w, cmd, dt)
  path(w, dt)
  stash(w, dt)
  grantThermal(w)
  grantNvg(w)
  grantEwar(w)
  ability(w, cmd)
  ending(w)
  w.t += dt
}

function orders(w: World, cmd: Commands, dt: number) {
  if (w.craftOn) {
    w.autoBoard = false
    if (w.gap > 0) {
      w.gap = Math.max(0, w.gap - GAP_RATE * dt)
      syncFile(w)
    }
  }
  if (w.file === "tight") w.gap = 0
  const aboard = () => w.bodies.some((b) => b.alive && b.boarded !== null)
  let dropped = false
  if (cmd.group && w.gap <= 0) {
    if (!w.groupWas) boardOne(w)
    w.groupHeld += dt
    while (w.groupHeld >= FORM_REPEAT) {
      w.groupHeld -= FORM_REPEAT
      boardOne(w)
    }
  } else w.groupHeld = 0
  if (cmd.spread && aboard()) {
    w.autoBoard = false
    if (!w.spreadWas) {
      disembarkOne(w)
      dropped = true
    }
    w.spreadHeld += dt
    while (w.spreadHeld >= FORM_REPEAT) {
      w.spreadHeld -= FORM_REPEAT
      disembarkOne(w)
      dropped = true
    }
  } else w.spreadHeld = 0
  if (cmd.spread) w.autoBoard = false
  if (cmd.group && w.gap > 0) {
    const kick = w.groupWas ? 0 : GAP_NUDGE
    w.gap = Math.max(0, w.gap - kick - GAP_RATE * dt)
    syncFile(w)
  } else if (cmd.spread && !dropped && !aboard() && w.gap < GAP_MAX) {
    const kick = w.spreadWas ? 0 : GAP_NUDGE
    w.gap = Math.min(GAP_MAX, w.gap + kick + GAP_RATE * dt)
    syncFile(w)
  }
  w.groupWas = cmd.group
  w.spreadWas = cmd.spread
  if (w.craftOn) {
    while (w.bodies.some((b) => b.alive && b.boarded !== null)) disembarkOne(w)
  } else if (w.autoBoard) {
    w.autoBoardT += dt
    if (w.autoBoardT >= AUTO_EVERY) {
      w.autoBoardT = 0
      boardOne(w)
    }
  }
}

function syncFile(w: World) {
  w.file = w.gap === 0 ? "tight" : "loose"
}

function fastestOpen(list: Body[]): Body | null {
  let best: Body | null = null
  for (const v of list) {
    if (!best || v.speed > best.speed || (v.speed === best.speed && v.id < best.id)) best = v
  }
  return best
}

function boardOne(w: World) {
  const units = feet(w).filter((u) => u.boardVeh === null)
  const vehs = vehicles(w)
  if (!units.length || !vehs.length) return
  const lead = units.find((u) => u.id === w.commander)
  const u = lead ?? units[0]
  let v: Body | null = null
  if (lead) {
    v = fastestOpen(vehs.filter((h) => free(w, h)))
    if (v) w.boardCursor = (vehs.findIndex((h) => h.id === v!.id) + 1) % vehs.length
  } else {
    const start = w.boardCursor % vehs.length
    for (let i = 0; i < vehs.length; i++) {
      const h = vehs[(start + i) % vehs.length]
      if (!free(w, h)) continue
      v = h
      w.boardCursor = (start + i + 1) % vehs.length
      break
    }
  }
  if (!v) return
  u.boardVeh = v.id
  u.boardDelay = 0
  tryBoard(u, v)
  if (u.boarded === v.id) tag(w, u.x, u.y, "BOARD", "board")
}

function disembarkOne(w: World) {
  const vehs = vehicles(w).filter((v) => w.bodies.some((b) => b.alive && b.boarded === v.id))
  if (!vehs.length) return
  const v = vehs[w.exitCursor % vehs.length]
  w.exitCursor++
  const u = w.bodies.find((b) => b.alive && b.boarded === v.id)
  if (!u) return
  u.boarded = null
  u.boardVeh = null
  u.boardDelay = 0
  u.x = v.x + v.radius + u.radius + 0.35
  u.y = v.y
}

function tryBoard(u: Body, v: Body) {
  if (u.boardDelay > 0 || u.boarded !== null) return
  if (Math.hypot(u.x - v.x, u.y - v.y) <= BOARD_RANGE) {
    u.boarded = v.id
    u.boardVeh = null
    u.x = v.x
    u.y = v.y
  }
}

function commandUnit(w: World): Body | null {
  const c = w.bodies.find((b) => b.id === w.commander && b.alive)
  if (c) return c
  const foot = (follow: boolean) =>
    w.bodies.find((b) => b.alive && b.inSection && b.side === "player" && !b.vehicle && b.follow === follow)
  return foot(false) ?? foot(true) ?? null
}

function commandHull(w: World, unit: Body | null): Body | null {
  if (!unit || unit.boarded === null) return null
  return w.bodies.find((b) => b.id === unit.boarded && b.alive) ?? null
}

function drive(w: World, cmd: Commands, dt: number) {
  const boss = commandUnit(w)
  const hull = commandHull(w, boss)
  const driven = vehicles(w).filter((v) => w.bodies.some((b) => b.alive && b.boarded === v.id))
  const len = Math.hypot(cmd.moveX, cmd.moveY)
  const nx = len > 0 ? cmd.moveX / len : 0
  const ny = len > 0 ? cmd.moveY / len : 0
  if (driven.length && hull) {
    const top = Math.min(...driven.map((v) => v.speed * (v.boost > 0 ? 1.8 : 1) * bog(w, true, v.kind, v.x, v.y)))
    if (len > 0) {
      w.ax = clamp(w.ax + nx * top * dt, -MAP, MAP)
      w.ay = clamp(w.ay + ny * top * dt, -MAP, MAP)
    }
    const lead = hull && driven.includes(hull) ? hull : driven[0]
    const lx = w.ax - lead.x
    const ly = w.ay - lead.y
    const ld = Math.hypot(lx, ly)
    if (ld > 4.2) {
      w.ax = lead.x + (lx / ld) * 4.2
      w.ay = lead.y + (ly / ld) * 4.2
    }
    steer(w, lead, w.ax, w.ay, dt)
    const wing = driven.filter((v) => v !== lead)
    wing.forEach((v, i) => {
      const [tx, ty] = wingSpot(lead.x, lead.y, lead.hdg, lead.radius, v, i, wing.length)
      steer(w, v, tx, ty, dt)
    })
    separateHulls(driven)
  } else if (driven.length) {
    const hdg = len > 0 ? Math.atan2(ny, nx) : (boss?.hdg ?? 0)
    driven.forEach((v, i) => {
      const [tx, ty] = wingSpot(boss?.x ?? w.ax, boss?.y ?? w.ay, hdg, boss?.radius ?? 0.45, v, i, driven.length)
      steer(w, v, tx, ty, dt)
    })
    separateHulls(driven)
  }
  for (const v of driven) {
    for (const u of w.bodies) {
      if (u.alive && u.boarded === v.id) {
        u.x = v.x
        u.y = v.y
        u.moved = true
      }
    }
  }
  if ((!driven.length || !hull) && len > 0) {
    const pace = 5.5 * bog(w, false, "", w.ax, w.ay, boss ?? undefined)
    w.ax = clamp(w.ax + nx * pace * dt, -MAP, MAP)
    w.ay = clamp(w.ay + ny * pace * dt, -MAP, MAP)
  }
  if (boss && !hull && !boss.air) {
    const lx = w.ax - boss.x
    const ly = w.ay - boss.y
    const ld = Math.hypot(lx, ly)
    if (ld > 3.2) {
      w.ax = boss.x + (lx / ld) * 3.2
      w.ay = boss.y + (ly / ld) * 3.2
    }
  }

  const loose = feet(w)
  if (boss?.follow && !boss.air && !hull && !loose.includes(boss)) loose.unshift(boss)
  const open = Math.max(0, Math.min(1, w.gap / GAP_MAX))
  const radius = 1.15 + 6.8 * open
  const core = hull ?? boss
  const bossOnFoot = boss && !hull ? boss.id : -1
  const ringN = loose.filter((u) => u.boardVeh === null && u.id !== bossOnFoot).length
  let ring = 0
  loose.forEach((u) => {
    let tx = core?.x ?? w.ax
    let ty = core?.y ?? w.ay
    if (u.boardVeh !== null) {
      const v = w.bodies.find((b) => b.id === u.boardVeh && b.alive)
      if (v) {
        tx = v.x
        ty = v.y
      }
      u.boardDelay = Math.max(0, u.boardDelay - dt)
    } else if (u.id === bossOnFoot) {
      tx = w.ax
      ty = w.ay
    } else {
      const off = ringN <= 1 ? [radius, 0] : slot(ring, ringN, radius)
      ring++
      tx += off[0]
      ty += off[1]
    }
    const dx = tx - u.x
    const dy = ty - u.y
    const d = Math.hypot(dx, dy)
    if (d > 0.08) {
      const m = Math.min(limbSpeed(u) * bog(w, false, "", u.x, u.y, u) * dt, d)
      u.x = clamp(u.x + (dx / d) * m, -MAP, MAP)
      u.y = clamp(u.y + (dy / d) * m, -MAP, MAP)
      u.moved = true
      u.hdg = Math.atan2(dy, dx)
      if (Math.abs(dx) > 0.02) u.face = dx < 0 ? -1 : 1
    }
    if (u.boardVeh !== null) {
      const v = w.bodies.find((b) => b.id === u.boardVeh && b.alive)
      if (v) tryBoard(u, v)
    }
  })
  tails(w, dt)
}

function angDiff(a: number, b: number) {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

function steer(w: World, v: Body, tx: number, ty: number, dt: number) {
  if (v.touch && !v.heavy) {
    const prop = w.props.find((p) => p.id === v.touch && p.alive)
    if (prop) {
      const dx = tx - v.x
      const dy = ty - v.y
      const d = Math.hypot(dx, dy) || 1
      const side = Math.sin(w.t * 0.7 + v.id) >= 0 ? 1 : -1
      const out = prop.radius + v.radius + 2.2
      tx += (-dy / d) * side * out
      ty += (dx / d) * side * out
    }
  }
  const dx = tx - v.x
  const dy = ty - v.y
  const d = Math.hypot(dx, dy)
  const top = v.speed * (v.boost > 0 ? 1.8 : 1) * bog(w, true, v.kind, v.x, v.y)
  const turn = (v.heavy ? 1.15 : 1.45) + v.speed * 0.09
  if (d > 0.4) {
    let want = Math.atan2(dy, dx)
    let diff = angDiff(want, v.hdg)
    const rev = Math.abs(diff) > 2.3 && d < 2.2
    if (rev) diff = angDiff(want + Math.PI, v.hdg)
    const rate = turn * dt * (0.85 + 0.15 * Math.min(1, Math.abs(v.vel) / Math.max(2, top * 0.4)))
    v.hdg += clamp(diff, -rate, rate)
    const align = Math.max(0, Math.cos(diff))
    let tgt = top * clamp((d - 0.4) / 3.4, 0, 1) * (0.3 + 0.7 * align)
    if (rev) tgt *= -0.55
    const acc = top * 1.8 * (Math.abs(tgt) < Math.abs(v.vel) ? 2 : 1) * (v.boost > 0 ? 1.5 : 1)
    v.vel += clamp(tgt - v.vel, -acc * dt, acc * dt)
  } else {
    const acc = top * 3.2
    v.vel += clamp(-v.vel, -acc * dt, acc * dt)
  }
  const step = v.vel * dt
  if (Math.abs(step) > 1e-4) {
    const ox = v.x
    const oy = v.y
    moveVehicle(w, v, Math.cos(v.hdg) * step, Math.sin(v.hdg) * step, dt)
    if (Math.hypot(v.x - ox, v.y - oy) < Math.abs(step) * 0.15) v.vel *= 0.85
  }
  v.x = clamp(v.x, -MAP, MAP)
  v.y = clamp(v.y, -MAP, MAP)
  v.face = Math.cos(v.hdg) < 0 ? -1 : 1
}

function wingSpot(ax: number, ay: number, hdg: number, anchorR: number, v: Body, i: number, n: number): [number, number] {
  const reach = Math.max(anchorR, v.radius) + v.radius + 1.7
  const mid = (n - 1) / 2
  const ang = hdg + Math.PI / 2 + (i - mid) * (Math.PI / 3)
  return [ax + Math.cos(ang) * reach, ay + Math.sin(ang) * reach]
}

function separateHulls(list: Body[]) {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dd = dx * dx + dy * dy
      const m = a.radius + b.radius
      if (dd >= m * m || dd < 1e-4) continue
      const d = Math.sqrt(dd)
      const p = (m - d) / 2
      a.x -= (dx / d) * p
      a.y -= (dy / d) * p
      b.x += (dx / d) * p
      b.y += (dy / d) * p
      a.vel *= 0.9
      b.vel *= 0.9
    }
  }
}

function moveVehicle(w: World, v: Body, dx: number, dy: number, dt: number) {
  v.bumpCd = Math.max(0, v.bumpCd - dt)
  if (dx === 0 && dy === 0) return
  if (slide(w, v, dx, dy)) {
    v.moved = true
    return
  }
  if (slide(w, v, dx, 0) || slide(w, v, 0, dy)) v.moved = true
}

function slide(w: World, v: Body, dx: number, dy: number): boolean {
  if (dx === 0 && dy === 0) return false
  const nx = clamp(v.x + dx, -MAP, MAP)
  const ny = clamp(v.y + dy, -MAP, MAP)
  const other = otherHull(w, v, nx, ny)
  if (other && !manned(w, other)) {
    const ax = other.x - nx
    const ay = other.y - ny
    const ad = Math.hypot(ax, ay) || 1
    const push = other.radius + v.radius + 0.25 - ad
    if (push > 0) {
      other.x = clamp(other.x + (ax / ad) * push, -MAP, MAP)
      other.y = clamp(other.y + (ay / ad) * push, -MAP, MAP)
    }
    v.x = nx
    v.y = ny
    v.touch = 0
    return true
  }
  if (other) {
    const ox = v.x - other.x
    const oy = v.y - other.y
    const od = Math.hypot(ox, oy) || 1
    const gap = other.radius + v.radius + 0.05 - od
    if (gap > 0) {
      v.x += (ox / od) * gap
      v.y += (oy / od) * gap
    }
    return false
  }
  const prop = hitProp(w, nx, ny, v.radius)
  if (!prop) {
    v.x = nx
    v.y = ny
    if (v.touch) {
      const held = w.props.find((p) => p.id === v.touch && p.alive)
      if (!held || Math.hypot(held.x - nx, held.y - ny) > held.radius + v.radius + 1.2) v.touch = 0
    }
    return true
  }
  if (v.bumpCd <= 0 && v.touch !== prop.id && Math.abs(v.vel) > 1.2) {
    const scrape = PROP_HIT * clamp(Math.abs(v.vel) / 8, 0.35, 1)
    hurt(w, v, scrape, "dust")
    v.bumpCd = PROP_BUMP
    if (v.heavy) {
      prop.alive = false
      prop.hp = 0
      burst(w, prop.x, prop.y, "dust")
      stamp(w, prop.x, prop.y, "crater", "dust")
      v.x = nx
      v.y = ny
      v.touch = 0
      return true
    }
  }
  v.touch = prop.id
  const ox = v.x - prop.x
  const oy = v.y - prop.y
  const od = Math.hypot(ox, oy) || 1
  const gap = prop.radius + v.radius + 0.05 - od
  if (gap > 0) {
    v.x += (ox / od) * gap
    v.y += (oy / od) * gap
  }
  return false
}

function manned(w: World, v: Body) {
  return w.bodies.some((b) => b.alive && b.boarded === v.id)
}

function otherHull(w: World, v: Body, x: number, y: number): Body | null {
  for (const o of w.bodies) {
    if (o === v || !o.alive || !o.vehicle) continue
    const dx = o.x - x
    const dy = o.y - y
    const m = o.radius + v.radius
    if (dx * dx + dy * dy < m * m) return o
  }
  return null
}

function clearMark(w: World, x: number, y: number) {
  for (const p of w.paths) {
    if (!p.open) continue
    if (Math.hypot(x - p.x, y - p.y) < 8) return false
  }
  if (Math.hypot(x - w.flareX, y - w.flareY) < 8) return false
  if (Math.hypot(x - w.stashX, y - w.stashY) < 6) return false
  return true
}

function syncPathMirror(w: World, active?: PathExit | null) {
  const at = squadAt(w)
  let pick = active ?? null
  if (!pick && w.paths.length) {
    let best = Infinity
    for (const p of w.paths) {
      if (!p.open) continue
      const d = Math.hypot(at.x - p.x, at.y - p.y)
      if (d < best) {
        best = d
        pick = p
      }
    }
  }
  const p = pick ?? w.paths.find((row) => row.open) ?? w.paths[0]
  if (!p) {
    w.pathX = 0
    w.pathY = PATH_R
    w.pathHold = 0
    return
  }
  w.pathX = p.x
  w.pathY = p.y
  w.pathHold = p.hold
}

function nodeOf(w: World): FieldNode {
  return w.map.nodes.find((n) => n.id === w.nodeId) ?? w.map.nodes[0]
}

const REVEAL = 1.6

export function discover(w: World, cardId: string, x: number, y: number) {
  const dx = x - w.ax
  const dy = y - w.ay
  const away = Math.atan2(dy, dx)
  const ang = away + (w.rng() - 0.5) * 1.2
  const sx = clamp(x + Math.cos(ang) * 8, -MAP + 2, MAP - 2)
  const sy = clamp(y + Math.sin(ang) * 8, -MAP + 2, MAP - 2)
  const drop = placeDrop(w, cardId, x, y)
  const body = drop.bodyId ? w.bodies.find((b) => b.id === drop.bodyId) : undefined
  if (body) {
    body.x = sx
    body.y = sy
    body.hdg = Math.atan2(y - sy, x - sx)
    if (Math.abs(x - sx) > 0.02) body.face = x < sx ? -1 : 1
  } else {
    drop.x = sx
    drop.y = sy
  }
  w.reveals.push({ x: sx, y: sy, tx: x, ty: y, t: 0, dur: REVEAL, bodyId: drop.bodyId, dropId: drop.id })
}

function reveals(w: World, dt: number) {
  const live: Reveal[] = []
  for (const r of w.reveals) {
    const body = r.bodyId ? w.bodies.find((b) => b.id === r.bodyId) : undefined
    const drop = w.drops.find((d) => d.id === r.dropId)
    if (body?.inSection || drop?.taken) continue
    r.t += dt
    const k = Math.min(1, r.t / r.dur)
    const e = k * k * (3 - 2 * k)
    const x = r.x + (r.tx - r.x) * e
    const y = r.y + (r.ty - r.y) * e
    if (body?.alive) {
      body.x = x
      body.y = y
      body.moved = k < 1
      body.hdg = Math.atan2(r.ty - r.y, r.tx - r.x)
    } else if (drop?.kind === "gear") {
      drop.x = x
      drop.y = y
    }
    if (k < 1) live.push(r)
  }
  w.reveals = live
}

function signal(w: World, cardId: string, x: number, y: number, loot = false, cost = 0, kit: KitItem[] = []) {
  w.inbound.push({ x, y, t: DROP_WARN, cardId, loot, cost, kit })
}

function landInbound(w: World, dt: number) {
  for (const f of w.inbound) f.t -= dt
  const due = w.inbound.filter((f) => f.t <= 0)
  w.inbound = w.inbound.filter((f) => f.t > 0)
  for (const f of due) {
    if (f.loot) {
      w.drops.push({ id: w.nextId++, cardId: f.cardId, x: f.x, y: f.y, bodyId: -1, kind: "loot", taken: false, cost: 0 })
    } else {
      const drop = placeDrop(w, f.cardId, f.x, f.y, f.cost)
      if (f.kit.length && drop.bodyId) {
        const body = w.bodies.find((b) => b.id === drop.bodyId)
        if (body) dress(w, body, f.kit)
      }
    }
    burst(w, f.x, f.y, "dust")
  }
}

function deckGearId(w: World, cardId: string): boolean {
  if (w.heroes[cardId]) return false
  const row = CARDS.find((c) => c.id === cardId)
  return !!row && row.kind === "gear" && row.fits !== "section"
}

function isBodyGear(w: World, cardId: string): boolean {
  return deckGearId(w, cardId)
}

function hostChassis(w: World, cardId: string): ReturnType<typeof card> {
  const hero = w.heroes[cardId]
  return hero ? card(hero.chassis) : card(cardId)
}

function gearFitsHost(w: World, hostId: string, gearId: string): boolean {
  const host = hostChassis(w, hostId)
  const g = card(gearId)
  if (g.fits === "section" || g.ability) return false
  const veh = host.kind === "vehicle" || !!host.stats?.vehicle
  if (g.gun || g.slot) return !veh && !host.android && !host.follow
  if (g.fits === "vehicle") return veh
  if (g.fits === "deploy") return !veh
  if (g.fits === "unit" || g.fits === "any") return !veh
  return !veh
}

/** Lead steps off wearing leading body gear; non-fitting gear waits in hold. */
function outfitLead(w: World) {
  const lead = w.bodies.find((b) => b.id === w.commander)
  if (!lead) return
  fitGun(w, lead, "rifle")
  const kit: KitItem[] = []
  while (w.deckQueue.length && isBodyGear(w, w.deckQueue[0])) {
    const id = w.deckQueue.shift()!
    const cost = w.deckPay.shift() ?? 0
    if (gearFitsHost(w, STARTER, id)) kit.push({ id, cost })
    else w.gearHold.push({ id, cost })
  }
  dress(w, lead, kit)
}

function takeFitting(w: World, hostId: string): KitItem[] {
  const kit: KitItem[] = []
  const rest: KitItem[] = []
  for (const g of w.gearHold) {
    if (gearFitsHost(w, hostId, g.id)) kit.push(g)
    else rest.push(g)
  }
  w.gearHold = rest
  while (w.deckQueue.length && isBodyGear(w, w.deckQueue[0])) {
    const next = w.deckQueue[0]
    if (!gearFitsHost(w, hostId, next)) break
    kit.push({ id: w.deckQueue.shift()!, cost: w.deckPay.shift() ?? 0 })
  }
  return kit
}

/** Drain leading body gear into hold, then take the next drop (unit wears held + following kit). */
function pullDrop(w: World): { cardId: string; cost: number; kit: KitItem[] } | null {
  while (w.deckQueue.length && isBodyGear(w, w.deckQueue[0])) {
    w.gearHold.push({ id: w.deckQueue.shift()!, cost: w.deckPay.shift() ?? 0 })
  }
  if (!w.deckQueue.length) {
    const lead = w.bodies.find((b) => b.id === w.commander && b.alive && b.inSection)
    if (lead) dress(w, lead, takeFitting(w, STARTER))
    const orphan = w.gearHold.shift()
    if (!orphan) return null
    return { cardId: orphan.id, cost: orphan.cost, kit: [] }
  }
  const cardId = w.deckQueue.shift()!
  const cost = w.deckPay.shift() ?? 0
  const hero = w.heroes[cardId]
  const kind = hero ? "unit" : card(cardId).kind
  if (kind !== "unit" && kind !== "vehicle") return { cardId, cost, kit: [] }
  return { cardId, cost, kit: takeFitting(w, cardId) }
}

function loadout(w: World, b: Body, id: string, cost = 0): boolean {
  const c = card(id)
  if (c.ability || c.fits === "section") return false
  if (c.gun) {
    if (b.vehicle || b.android || b.follow) return false
    fitGun(w, b, id, cost)
    return true
  }
  if (c.slot) {
    if (!canTakeAttach(b)) return false
    const prior = b.gears.find((have) => card(have).slot === c.slot)
    if (prior) shedAttach(w, b, prior)
    b.gears.push(id)
    if (cost > 0) b.gearPay[id] = cost
    reapplyGun(b)
    return true
  }
  if (c.fits === "vehicle") {
    if (!b.vehicle) return false
  } else if (c.fits === "deploy") {
    if (b.vehicle || b.deployNeed <= 0) return false
  } else if (b.vehicle) return false
  if (b.gears.includes(id)) return false
  b.gears.push(id)
  if (cost > 0) b.gearPay[id] = cost
  if (c.armorAdd) b.armor = Math.min(0.75, b.armor + c.armorAdd)
  if (c.speedMul) b.speed *= c.speedMul
  if (c.hpMul) {
    const gain = b.maxHp * (c.hpMul - 1)
    b.maxHp = Math.round(b.maxHp * c.hpMul)
    b.hp = Math.min(b.maxHp, b.hp + gain)
  }
  if (c.ramMul) b.ramMul *= c.ramMul
  if (c.ramSelfMul) b.ramSelf *= c.ramSelfMul
  if (c.healAdd) b.heal += c.healAdd
  return true
}

function dress(w: World, b: Body, kit: KitItem[]) {
  const guns = kit.filter((k) => card(k.id).gun)
  const body = kit.filter((k) => !card(k.id).gun && !card(k.id).slot)
  const bits = kit.filter((k) => card(k.id).slot)
  let n = 0
  for (const item of [...guns, ...body, ...bits]) if (loadout(w, b, item.id, item.cost)) n++
  if (n) toast(w, n === 1 ? `${card(kit[0].id).name} fitted` : `Kit ×${n}`, "gear")
}

function drops(w: World, dt: number) {
  field(w, dt)
  landInbound(w, dt)
  if (!w.deckQueue.length && !w.gearHold.length) return
  w.nextDrop -= dt
  if (w.nextDrop > 0) return
  w.nextDrop = DROP_EVERY
  const next = pullDrop(w)
  if (!next) return
  const held = [
    ...w.inbound.filter((f) => !f.loot),
    ...w.drops.filter((d) => !d.taken && d.kind !== "loot"),
  ]
  let x = w.ax
  let y = w.ay
  for (let i = 0; i < 16; i++) {
    const ang = w.rng() * Math.PI * 2
    const dist = 24 + w.rng() * 24
    x = clamp(w.ax + Math.cos(ang) * dist, -MAP + 4, MAP - 4)
    y = clamp(w.ay + Math.sin(ang) * dist, -MAP + 4, MAP - 4)
    if (Math.hypot(x - w.ax, y - w.ay) < 20) continue
    if (!clearMark(w, x, y)) continue
    if (hitProp(w, x, y, 1.2)) continue
    if (held.some((s) => Math.hypot(s.x - x, s.y - y) < 22)) continue
    break
  }
  signal(w, next.cardId, x, y, false, next.cost, next.kit)
}

function field(w: World, dt: number) {
  w.nextField -= dt
  if (w.nextField > 0) return
  w.nextField = 9
  if (w.drops.filter((d) => !d.taken).length + w.inbound.length > 4) return
  let x = 0
  let y = 0
  for (let i = 0; i < 8; i++) {
    x = (w.rng() * 2 - 1) * 24
    y = (w.rng() * 2 - 1) * 24
    if (Math.hypot(x - w.ax, y - w.ay) < 6) continue
    if (!clearMark(w, x, y)) continue
    if (!hitProp(w, x, y, 1)) break
  }
  if (w.hidden.length && w.rng() < 0.45) {
    const id = w.hidden.shift()
    if (id) discover(w, id, x, y)
    return
  }
  if (!w.holdoutOffered && w.rng() < 0.18) {
    offerHoldout(w, x, y)
    return
  }
  const loot = (["salvage", "intel", "sample"] as const)[(w.rng() * 3) | 0]
  w.drops.push({ id: w.nextId++, cardId: loot, x, y, bodyId: -1, kind: "loot", taken: false, cost: 0 })
}

const LOOT_CR: Record<string, number> = { salvage: 12, intel: 18, sample: 15 }

function pickup(w: World) {
  for (const d of w.drops) {
    if (d.taken) continue
    if (d.kind === "loot") {
      if (!touch(w, d.x, d.y)) continue
      d.taken = true
      burst(w, d.x, d.y, "flash")
      if (d.cardId === "relic") {
        const id = w.hidden.shift()
        if (id && !w.found.includes(id) && !w.unlocked.includes(id)) {
          w.found.push(id)
          tag(w, d.x, d.y, `FIND ${card(id).name}`, "find")
          toast(w, `${card(id).name} found`, "pick")
        } else tag(w, d.x, d.y, "RELIC", "loot")
        continue
      }
      w.loot++
      w.credits += LOOT_CR[d.cardId] ?? 10
      const label = d.cardId === "salvage" ? "SALVAGE" : d.cardId === "intel" ? "INTEL" : "SAMPLE"
      tag(w, d.x, d.y, label, "loot")
      toast(w, `${label} +${LOOT_CR[d.cardId] ?? 10} CR`, "pick")
      continue
    }
    if (d.kind === "gear") {
      if (!touch(w, d.x, d.y)) continue
      if (!equip(w, d.cardId, d.cost, d.x, d.y)) continue
      d.taken = true
      w.dropsTaken++
      burst(w, d.x, d.y, "flash")
      if (!noteFind(w, d)) tag(w, d.x, d.y, card(d.cardId).name, "loot")
      continue
    }
    const body = w.bodies.find((b) => b.id === d.bodyId)
    if (!body || !body.alive) {
      d.taken = true
      continue
    }
    if (body.inSection) {
      d.taken = true
      continue
    }
    if (!touch(w, body.x, body.y)) continue
    body.inSection = true
    d.taken = true
    w.dropsTaken++
    burst(w, body.x, body.y, "flash")
    if (body.heroId || body.name) {
      toast(w, `${body.name} joined`, "pick")
      tag(w, body.x, body.y, body.name, "find")
    } else {
      if (!noteFind(w, d)) tag(w, body.x, body.y, card(d.cardId).name, "loot")
      toast(w, `${card(d.cardId).name} joined`, "pick")
    }
    if (body.vehicle) {
      const aboard = w.bodies.some((u) => u.alive && u.boarded !== null)
      if (!aboard) w.autoBoard = true
    } else onJoin(w, body)
  }
  w.drops = w.drops.filter((d) => !d.taken)
}

function onJoin(w: World, u: Body) {
  grantThermal(w)
  grantNvg(w)
  if (u.follow) return
  const others = w.bodies.filter(
    (o) => o.alive && o.inSection && !o.vehicle && o.id !== u.id,
  )
  if (!others.length || !others.every((o) => o.boarded !== null)) return
  const open = vehicles(w).filter((v) => free(w, v))
  const v = u.id === w.commander ? fastestOpen(open) : open[0]
  if (!v) return
  u.boardVeh = v.id
  u.boardDelay = JOIN_DELAY
}

function grantGift(b: Body, gift: Hero["gift"]) {
  if (gift === "tough") {
    b.maxHp *= 1.18
    b.hp = b.maxHp
  } else if (gift === "fast") b.speed *= 1.12
  else if (gift === "keen") b.spot += 1
  else b.heal += 6
}

export function offerHero(w: World): Hero | null {
  if (w.heroOffered) return null
  w.heroOffered = true
  const taken = Object.values(w.heroes).map((hero) => hero.name)
  const hero = rollHero(w.rng, taken)
  w.heroes[hero.id] = hero
  placeDrop(w, hero.id, w.stashX + 1.6, w.stashY)
  const tag = hero.tag ? ` · ${hero.tag}` : ""
  toast(w, `${hero.name}${tag} spotted`, "unit")
  return hero
}

export function offerHoldout(w: World, x: number, y: number): Body {
  w.holdoutOffered = true
  const drop = placeDrop(w, STARTER, x, y)
  const body = w.bodies.find((b) => b.id === drop.bodyId)!
  body.name = "HOLDOUT"
  tag(w, x, y, "HOLDOUT", "find")
  toast(w, "Holdout spotted", "unit")
  return body
}

const SCREEN: Record<string, { kind: string; chance: number; n: [number, number] }> = {
  goathead: { kind: "shambler", chance: 0.4, n: [2, 3] },
  crowhead: { kind: "doghead", chance: 0.3, n: [2, 3] },
}

const SLEEPER_HULLS: [string, string][] = [
  ["ugv", "tract"],
  ["mrap", "slab"],
  ["jeep", "roller"],
  ["apc", "walker"],
]

function arm(w: World, b: Body) {
  if (b.damage > 0 && b.range > 0) return
  if (b.vehicle || b.follow || b.air) {
    b.range = 8
    b.damage = 3
    b.cooldown = 0.7
    b.mobileFire = true
    b.deployNeed = 0
    return
  }
  fitGun(w, b, "rifle")
}

function soldier(b: Body) {
  return b.alive && b.inSection && b.side === "player" && !b.vehicle && !b.android && !b.follow
}

function handOf(id: string): "primary" | "secondary" {
  return card(id).hand === "secondary" ? "secondary" : "primary"
}

function primaryId(b: Body) {
  return b.gears.find((have) => card(have).gun && handOf(have) === "primary")
}

function secondaryId(b: Body) {
  return b.gears.find((have) => card(have).gun && handOf(have) === "secondary")
}

function gunId(b: Body) {
  return primaryId(b) ?? secondaryId(b)
}

function attachIds(b: Body) {
  return b.gears.filter((have) => card(have).slot)
}

function isBladeGun(id: string) {
  const g = card(id).gun
  return !!g && g.range <= 2 && !g.lob
}

function canTakeAttach(b: Body) {
  const id = primaryId(b)
  return !!id && !isBladeGun(id)
}

type Wield = {
  range: number
  damage: number
  cooldown: number
  mobileFire: boolean
  deployNeed: number
  hip: boolean
  hipRate: number
  mag: number
  reload: number
  lob: boolean
  aoe: number
  pierce: number
}

function magOf(b: Body, id: string): { size: number; reload: number } {
  const g = card(id).gun
  if (!g) return { size: 0, reload: 0 }
  let size = g.mag ?? 0
  let reload = g.reload ?? 0
  if (size <= 0) return { size: 0, reload: 0 }
  if (handOf(id) === "primary") {
    for (const have of attachIds(b)) {
      const add = card(have).magAdd
      if (add) size += add
    }
  }
  return { size, reload: reload > 0 ? reload : 1.5 }
}

function syncAmmo(b: Body) {
  const pri = primaryId(b)
  if (pri) {
    const m = magOf(b, pri)
    const was = b.ammoMax
    b.ammoMax = m.size
    b.reloadNeed = m.reload
    if (m.size <= 0) {
      b.ammo = 0
      b.reloadT = 0
    } else if (was <= 0) {
      b.ammo = m.size
      b.reloadT = 0
    } else {
      b.ammo = Math.min(b.ammo, m.size)
      if (b.ammo > 0) b.reloadT = 0
    }
  } else {
    b.ammoMax = 0
    b.ammo = 0
    b.reloadT = 0
    b.reloadNeed = 0
  }
  const sec = secondaryId(b)
  if (sec) {
    const m = magOf(b, sec)
    const was = b.sideAmmoMax
    b.sideAmmoMax = m.size
    b.sideReloadNeed = m.reload
    if (m.size <= 0) {
      b.sideAmmo = 0
      b.sideReload = 0
    } else if (was <= 0) {
      b.sideAmmo = m.size
      b.sideReload = 0
    } else {
      b.sideAmmo = Math.min(b.sideAmmo, m.size)
      if (b.sideAmmo > 0) b.sideReload = 0
    }
  } else {
    b.sideAmmoMax = 0
    b.sideAmmo = 0
    b.sideReload = 0
    b.sideReloadNeed = 0
  }
}

function wieldOf(b: Body, id: string): Wield {
  const g = card(id).gun!
  let range = g.range
  let damage = g.damage
  let cooldown = g.cooldown
  let mobileFire = g.mobileFire
  let deployNeed = g.deployNeed
  const hip = !!g.hip
  const hipRate = g.hipRate ?? 1
  let lob = !!g.lob
  let aoe = g.aoe ?? 0
  let pierce = g.pierce ?? 0
  if (handOf(id) === "primary") {
    for (const have of attachIds(b)) {
      const fit = card(have)
      if (fit.rangeMul) range *= fit.rangeMul
      if (fit.rateMul) cooldown *= fit.rateMul
      if (fit.deployMul && deployNeed > 0) deployNeed *= fit.deployMul
      if (fit.pierce) pierce += fit.pierce
    }
  }
  const mag = magOf(b, id)
  return {
    range,
    damage,
    cooldown,
    mobileFire,
    deployNeed,
    hip,
    hipRate,
    mag: mag.size,
    reload: mag.reload,
    lob,
    aoe,
    pierce,
  }
}

function wieldReady(b: Body, w: Wield, side: boolean) {
  if ((side ? b.sideCool : b.cool) > 0) return false
  const max = side ? b.sideAmmoMax : b.ammoMax
  if (max > 0 && (side ? b.sideAmmo : b.ammo) <= 0) return false
  if (w.mobileFire || w.deployNeed <= 0) return true
  // Medium guns may hip-fire only while moving; standing still waits out the set.
  if (w.hip && b.moved) return true
  return b.deploy >= w.deployNeed
}

function tickReload(w: World, b: Body, side: boolean, id: string | undefined, dt: number) {
  if (!id) return
  const max = side ? b.sideAmmoMax : b.ammoMax
  if (max <= 0) return
  let ammo = side ? b.sideAmmo : b.ammo
  let left = side ? b.sideReload : b.reloadT
  const need = side ? b.sideReloadNeed : b.reloadNeed
  if (ammo > 0) {
    if (side) b.sideReload = 0
    else b.reloadT = 0
    return
  }
  if (left <= 0) {
    left = need > 0 ? need : magOf(b, id).reload
    if (b.side === "player") tag(w, b.x, b.y, "RELOAD", "gear")
  }
  left -= dt
  if (left <= 0) {
    ammo = max
    left = 0
  }
  if (side) {
    b.sideAmmo = ammo
    b.sideReload = left
  } else {
    b.ammo = ammo
    b.reloadT = left
  }
}

/** Moving with a medium gun — hip-fire penalties apply (standing set stays clean). */
function hipFire(b: Body, w: Wield) {
  if (!w.hip || w.mobileFire || w.deployNeed <= 0) return false
  return b.moved
}

function wieldReach(b: Body, tgt: Body, w: Wield, sightMul: number) {
  const dist = Math.hypot(tgt.x - b.x, tgt.y - b.y)
  const melee = w.range <= 2 && !w.lob
  if (melee) {
    if (tgt.vehicle) return dist <= b.radius + tgt.radius + 0.2
    return dist - tgt.radius <= w.range + 0.25
  }
  const span = (b.side === "player" ? w.range + 1.2 : w.range) * sightMul
  return dist <= span
}

function shedAttach(w: World, b: Body, id: string) {
  const cost = b.gearPay[id] ?? 0
  delete b.gearPay[id]
  b.gears = b.gears.filter((have) => have !== id)
  const n = w.drops.filter((d) => !d.taken && d.skin === "item").length
  const a = n * 1.7
  const r = PICKUP + 0.4
  w.drops.push({
    id: w.nextId++,
    cardId: id,
    x: b.x + Math.cos(a) * r,
    y: b.y + Math.sin(a) * r,
    bodyId: -1,
    kind: "gear",
    taken: false,
    cost,
    skin: "item",
  })
}

function reapplyGun(b: Body) {
  const id = primaryId(b) ?? secondaryId(b)
  if (!id) return
  const w = wieldOf(b, id)
  b.range = w.range
  b.damage = w.damage
  b.cooldown = w.cooldown
  b.mobileFire = w.mobileFire
  b.deployNeed = w.deployNeed
  b.lob = w.lob
  b.aoe = w.aoe
  b.pierce = w.pierce
  syncAmmo(b)
}

function fitGun(w: World, b: Body, id: string, cost = 0) {
  const c = card(id)
  const g = c.gun
  if (!g) return
  const hand = handOf(id)
  const prev = hand === "primary" ? primaryId(b) : secondaryId(b)
  const old = prev ? card(prev) : undefined
  if (old?.digAdd) b.dig = Math.max(0, b.dig - old.digAdd)
  if (prev) {
    delete b.gearPay[prev]
    b.gears = b.gears.filter((have) => have !== prev)
  }
  if (hand === "primary") {
    const shed = attachIds(b)
    const shedPay = Object.fromEntries(shed.map((have) => [have, b.gearPay[have] ?? 0]))
    for (const have of shed) delete b.gearPay[have]
    b.gears = b.gears.filter((have) => !card(have).slot)
    b.gears.push(id)
    if (cost > 0) b.gearPay[id] = cost
    b.deploy = 0
    if (c.digAdd) b.dig += c.digAdd
    reapplyGun(b)
    for (const have of shed) {
      b.gearPay[have] = shedPay[have] ?? 0
      shedAttach(w, b, have)
    }
    return
  }
  b.gears.push(id)
  if (cost > 0) b.gearPay[id] = cost
  if (c.digAdd) b.dig += c.digAdd
  if (!primaryId(b)) b.deploy = 0
  reapplyGun(b)
}

function nearestBody(list: Body[], x: number, y: number): Body | null {
  let best: Body | null = null
  let bestD = Infinity
  for (const b of list) {
    const d = (b.x - x) ** 2 + (b.y - y) ** 2
    if (d >= bestD) continue
    bestD = d
    best = b
  }
  return best
}

function equip(w: World, id: string, cost = 0, x = 0, y = 0): boolean {
  const c = card(id)
  if (c.gun) {
    const hand = handOf(id)
    const soldiers = w.bodies.filter((b) => soldier(b))
    const bare = soldiers.filter((b) => !(hand === "primary" ? primaryId(b) : secondaryId(b)))
    const target = nearestBody(bare.length ? bare : soldiers, x, y)
    if (!target) return false
    fitGun(w, target, id, cost)
    toast(w, `${c.name} fitted`, "pick")
    return true
  }
  if (c.slot) {
    const target = pickAttach(w, c, x, y)
    if (!target) return false
    const prior = target.gears.find((have) => card(have).slot === c.slot)
    if (prior) shedAttach(w, target, prior)
    target.gears.push(id)
    if (cost > 0) target.gearPay[id] = cost
    reapplyGun(target)
    toast(w, `${c.name} fitted`, "pick")
    return true
  }
  const target = pickFit(w, c, x, y)
  if (c.fits && c.fits !== "section") {
    if (!target) return false
    target.gears.push(id)
    if (cost > 0) target.gearPay[id] = cost
    if (c.armorAdd) target.armor = Math.min(0.75, target.armor + c.armorAdd)
    if (c.speedMul) target.speed *= c.speedMul
    if (c.hpMul) {
      const gain = target.maxHp * (c.hpMul - 1)
      target.maxHp = Math.round(target.maxHp * c.hpMul)
      target.hp = Math.min(target.maxHp, target.hp + gain)
    }
    if (c.ramMul) target.ramMul *= c.ramMul
    if (c.ramSelfMul) target.ramSelf *= c.ramSelfMul
    if (c.healAdd) target.heal += c.healAdd
  }
  if (c.ability) {
    const have = w.toolbar.find((t) => t.id === c.ability)
    if (have) have.charges += c.charges ?? 1
    else {
      w.toolbar.push({
        id: c.ability,
        charges: c.charges ?? 0,
        cd: 0,
        cdMax: c.cd ?? 0,
      })
    }
    toast(w, `${c.name} ready`, "pick")
  } else if (target) toast(w, `${c.name} fitted`, "pick")
  const ok = Boolean((c.fits !== "section" && target) || c.ability)
  if (ok && c.fits === "section" && cost > 0) w.kitPay += cost
  return ok
}

function horde(w: World, dt: number) {
  w.nextHorde -= dt
  if (w.nextHorde > 0) return
  const n = nodeOf(w)
  // Scar only slows packs (hordeScale); never hard-skip or a cleared start LZ
  // stays empty forever after a few extracts.
  w.nextHorde = (HORDE_EVERY * hordeScale(n)) / (1 + w.depth * 0.28)
  let alive = 0
  for (const b of w.bodies) if (b.alive && b.side !== "player") alive++
  if (alive >= HOSTILE_CAP) return
  const kind = hostileKind(w)
  const at = spawnAt(w)
  const x = clamp(at.x, -MAP + 1, MAP - 1)
  const y = clamp(at.y, -MAP + 1, MAP - 1)
  spawnBody(w, { kind, x, y, screen: true })
}

function screenPack(w: World, kind: string, x: number, y: number) {
  const screen = SCREEN[kind]
  if (!screen || w.rng() >= screen.chance) return
  let alive = 0
  for (const b of w.bodies) if (b.alive && b.side !== "player") alive++
  const n = screen.n[0] + ((w.rng() * (screen.n[1] - screen.n[0] + 1)) | 0)
  for (let i = 0; i < n; i++) {
    if (alive >= HOSTILE_CAP) break
    const a = (i / Math.max(1, n)) * Math.PI * 2 + w.rng()
    spawnBody(w, {
      kind: screen.kind,
      x: clamp(x + Math.cos(a) * (1.4 + w.rng()), -MAP + 1, MAP - 1),
      y: clamp(y + Math.sin(a) * (1.4 + w.rng()), -MAP + 1, MAP - 1),
      screen: false,
    })
    alive++
  }
}

const SLEEPER_HOLD = 1.2

function sleepers(w: World, dt: number) {
  for (const s of w.sleepers) {
    if (s.awake) continue
    if (!touch(w, s.x, s.y)) {
      s.hold = 0
      continue
    }
    s.hold += dt
    if (s.hold < SLEEPER_HOLD) continue
    s.awake = true
    spawnBody(w, { kind: s.wake, x: s.x, y: s.y })
    w.drops.push({
      id: w.nextId++,
      cardId: "salvage",
      x: s.x + 2.4,
      y: s.y + 2.4,
      bodyId: -1,
      kind: "loot",
      taken: false,
      cost: 0,
    })
    tag(w, s.x, s.y, "AWAKE", "fire")
    toast(w, "Rust sleeper wakes", "veh")
  }
}

function hostileKind(w: World) {
  if (w.pressure === "apex") return w.t < 22 || w.rng() >= 0.22 ? w.escort : w.apex
  const row = RECIPE[w.pressure] ?? RECIPE.drift
  return pick(w.rng, w.t < 22 ? row.early : row.body)
}

function pick(rng: () => number, bag: [string, number][]) {
  let roll = rng() * bag.reduce((sum, [, n]) => sum + n, 0)
  for (const [id, n] of bag) {
    roll -= n
    if (roll <= 0) return id
  }
  return bag[bag.length - 1][0]
}

function spawnAt(w: World) {
  if (w.rng() < 0.6) {
    let best = w.paths[0] ?? { x: w.pathX, y: w.pathY }
    let bestD = Math.hypot(w.ax - best.x, w.ay - best.y)
    for (const p of w.paths) {
      const d = Math.hypot(w.ax - p.x, w.ay - p.y)
      if (d > bestD) {
        bestD = d
        best = p
      }
    }
    const lzD = Math.hypot(w.ax - w.flareX, w.ay - w.flareY)
    const fx = bestD >= lzD ? best.x : w.flareX
    const fy = bestD >= lzD ? best.y : w.flareY
    let dx = fx - w.ax
    let dy = fy - w.ay
    const d = Math.hypot(dx, dy) || 1
    dx /= d
    dy /= d
    const along = (w.rng() * 2 - 1) * 36
    return { x: w.ax + dx * 64 - dy * along, y: w.ay + dy * 64 + dx * along }
  }
  const edge = Math.floor(w.rng() * 4)
  const along = (w.rng() * 2 - 1) * 36
  const off = 64
  let x = w.ax
  let y = w.ay
  if (edge === 0) {
    x -= off
    y += along
  } else if (edge === 1) {
    x += off
    y += along
  } else if (edge === 2) {
    x += along
    y -= off
  } else {
    x += along
    y += off
  }
  return { x, y }
}

function ai(w: World, dt: number) {
  for (const b of w.bodies) {
    if (!b.alive || b.vehicle || b.boarded !== null || b.stun > 0) continue
    if (b.side === "player") continue
    if (b.speed <= 0) continue
    const tgt = nearest(w, b, 80, (o) => o.side !== b.side && o.boarded === null)
    if (!tgt) continue
    const dx = tgt.x - b.x
    const dy = tgt.y - b.y
    const d = Math.hypot(dx, dy) || 1
    const want =
      b.range <= 2 ? Math.max(0.35, b.radius + tgt.radius - 0.1) : Math.max(0.2, b.range * 0.85)
    if (d <= want) continue
    const m = Math.min(limbSpeed(b) * bog(w, false, "", b.x, b.y, b) * dt, d - want)
    b.x = clamp(b.x + (dx / d) * m, -MAP, MAP)
    b.y = clamp(b.y + (dy / d) * m, -MAP, MAP)
    b.moved = m > 0.01
    if (Math.abs(dx) > 0.02) b.face = dx < 0 ? -1 : 1
  }
}

function combat(w: World, dt: number) {
  for (const b of w.bodies) {
    if (!b.alive || b.boarded !== null || b.stun > 0) continue
    if (casHull(b) && b.sortieT <= 0) continue
    if (w.reveals.some((r) => r.bodyId === b.id)) continue
    b.cool -= dt
    b.sideCool -= dt
    const pri = primaryId(b)
    const sec = secondaryId(b)
    if (pri || sec) {
      combatHands(w, b, dt, pri, sec)
      continue
    }
    if (!b.mobileFire) {
      if (b.moved) b.deploy = 0
      else b.deploy = Math.min(b.deployNeed, b.deploy + dt)
    }
    const ready = b.mobileFire || (b.deployNeed > 0 && b.deploy >= b.deployNeed) || b.deployNeed === 0
    const lamp = b.side === "player" && !b.android && !b.vehicle
    if (b.damage <= 0 || b.range <= 0 || !canFire(b)) continue
    if ((!ready || b.cool > 0) && !lamp) continue
    const blind = sun(w) < NIGHT && w.vision === "off"
    const melee = b.range <= 2 && !b.lob
    const span = melee ? b.range + 0.8 : b.side === "player" ? b.range + 1.2 : b.range
    let tgt = nearest(w, b, span * sight(w, blind), (o) => o.side !== b.side && o.boarded === null)
    if (!tgt) continue
    const lit = blind && (inBeam(w, tgt.x, tgt.y) || inBeam(w, b.x, b.y))
    const dist = Math.hypot(tgt.x - b.x, tgt.y - b.y)
    if (melee) {
      if (tgt.vehicle) {
        if (dist > b.radius + tgt.radius + 0.2) continue
      } else if (dist - tgt.radius > b.range + 0.25) continue
    } else if (dist > (b.side === "player" ? b.range + 1.2 : b.range) * sight(w, lit)) continue
    if (b.side !== "player" && b.range > 2 && smoked(w, tgt)) continue
    aimAt(b, tgt)
    if (!ready || b.cool > 0) continue
    fireWeapon(w, b, tgt, {
      range: b.range,
      damage: b.damage,
      cooldown: b.cooldown,
      mobileFire: b.mobileFire,
      deployNeed: b.deployNeed,
      hip: false,
      hipRate: 1,
      mag: 0,
      reload: 0,
      lob: b.lob,
      aoe: b.aoe,
      pierce: b.pierce,
    }, false, lit)
  }
}

function combatHands(w: World, b: Body, dt: number, pri: string | undefined, sec: string | undefined) {
  const priW = pri ? wieldOf(b, pri) : null
  const secW = sec ? wieldOf(b, sec) : null
  const deploySrc = priW ?? secW
  if (deploySrc && !deploySrc.mobileFire) {
    if (b.moved) b.deploy = 0
    else b.deploy = Math.min(deploySrc.deployNeed, b.deploy + dt)
  }
  tickReload(w, b, false, pri, dt)
  tickReload(w, b, true, sec, dt)
  // damage<=0 silences fire and lamp (tests and disarms), without stripping fitted gear.
  if (b.damage <= 0 || !canFire(b)) return
  const blind = sun(w) < NIGHT && w.vision === "off"
  const aimSpan = Math.max(
    priW ? (priW.range <= 2 && !priW.lob ? priW.range + 0.8 : priW.range + 1.2) : 0,
    secW ? (secW.range <= 2 && !secW.lob ? secW.range + 0.8 : secW.range + 1.2) : 0,
  )
  if (aimSpan <= 0) return
  let tgt = nearest(w, b, aimSpan * sight(w, blind), (o) => o.side !== b.side && o.boarded === null)
  if (!tgt) return
  const lit = blind && (inBeam(w, tgt.x, tgt.y) || inBeam(w, b.x, b.y))
  const sightMul = sight(w, lit)
  aimAt(b, tgt)
  let pick: { id: string; w: Wield; side: boolean } | null = null
  if (sec && secW && wieldReady(b, secW, true) && wieldReach(b, tgt, secW, sightMul)) {
    pick = { id: sec, w: secW, side: true }
  } else if (pri && priW && wieldReady(b, priW, false) && wieldReach(b, tgt, priW, sightMul)) {
    pick = { id: pri, w: priW, side: false }
  }
  if (!pick) return
  if (b.side !== "player" && pick.w.range > 2 && smoked(w, tgt)) return
  fireWeapon(w, b, tgt, pick.w, pick.side, lit, pick.id)
}

/** Point facing and heading at the fire target (gun art and beams follow hdg). Hulls keep chassis hdg — turret art tracks separately. */
function aimAt(b: Body, tgt: { x: number; y: number }) {
  if (b.vehicle) return
  b.hdg = Math.atan2(tgt.y - b.y, tgt.x - b.x)
  if (Math.abs(tgt.x - b.x) > 0.02) b.face = tgt.x < b.x ? -1 : 1
}

function fireWeapon(w: World, b: Body, tgt: Body, stats: Wield, side: boolean, lit: boolean, gun?: string) {
  const hip = hipFire(b, stats)
  const cool = stats.cooldown * (hip ? stats.hipRate : 1)
  if (side) b.sideCool = cool
  else b.cool = cool
  b.fired++
  if (stats.mag > 0) {
    if (side) {
      b.sideAmmo = Math.max(0, b.sideAmmo - 1)
      if (b.sideAmmo <= 0) {
        b.sideReload = stats.reload
        b.sideReloadNeed = stats.reload
        if (b.side === "player") tag(w, b.x, b.y, "RELOAD", "gear")
      }
    } else {
      b.ammo = Math.max(0, b.ammo - 1)
      if (b.ammo <= 0) {
        b.reloadT = stats.reload
        b.reloadNeed = stats.reload
        if (b.side === "player") tag(w, b.x, b.y, "RELOAD", "gear")
      }
    }
  }
  aimAt(b, tgt)
  if (b.side === "player") {
    tag(w, b.x, b.y, hip ? "HIP" : "FIRE", "fire")
    w.pops++
  }
  let mul = b.gears.includes("filter") ? 1 : WEATHER[w.weather].fire
  if (casHull(b) && jtacLive(w)) mul *= 1.25
  if (casHull(b) && w.airMark && w.airMark.t > 0) {
    const mx = w.airMark.x
    const my = w.airMark.y
    let marked: Body | null = null
    let bestD = (b.side === "player" ? stats.range + 1.2 : stats.range) * sight(w, lit)
    for (const o of w.bodies) {
      if (!o.alive || o.side === b.side || o.boarded !== null) continue
      const d = Math.hypot(o.x - mx, o.y - my)
      if (d < bestD) {
        bestD = d
        marked = o
      }
    }
    if (marked) tgt = marked
    mul *= 1.2
    w.airMark = null
  }
  aimAt(b, tgt)
  const prev = { range: b.range, damage: b.damage, pierce: b.pierce, lob: b.lob, aoe: b.aoe }
  b.range = stats.range
  b.damage = stats.damage
  b.pierce = stats.pierce
  b.lob = stats.lob
  b.aoe = stats.aoe
  const wield = gun ?? gunId(b) ?? (b.vehicle || b.air ? "mount" : b.kind)
  const shotAim = Math.atan2(tgt.y - b.y, tgt.x - b.x)
  const [mx, my] = b.vehicle || b.air ? muzzleAlong(b, shotAim) : muzzleOf(b, wield)
  pushFlash(w, mx, my, b.vehicle || b.air ? shotAim : b.hdg, wield, b.id)
  const dist = Math.hypot(tgt.x - mx, tgt.y - my)
  // Hip: heavy miss that grows with range (≈40% close → ≈65% at max).
  if (hip && !stats.lob && stats.range > 2) {
    const far = Math.min(1, dist / Math.max(0.5, stats.range))
    if (w.rng() < 0.4 + 0.25 * far) {
      const scatter = (w.rng() - 0.5) * (0.7 + 0.5 * far)
      const ang = b.hdg + scatter
      const reach = dist * (0.7 + w.rng() * 0.45)
      pushShot(w, mx, my, mx + Math.cos(ang) * reach, my + Math.sin(ang) * reach, b.air ? 1.4 : 0, b.id)
      b.range = prev.range
      b.damage = prev.damage
      b.pierce = prev.pierce
      b.lob = prev.lob
      b.aoe = prev.aoe
      reapplyGun(b)
      return
    }
  }
  if (b.side !== "player" && stats.range > 2) {
    const dx = tgt.x - mx
    const dy = tgt.y - my
    const d = Math.hypot(dx, dy) || 1
    const spd = 14
    w.bolts.push({
      x: mx,
      y: my,
      vx: (dx / d) * spd,
      vy: (dy / d) * spd,
      dmg: stats.damage * mul,
      life: 1.2,
      side: b.side,
    })
    if (w.bolts.length > 48) w.bolts.splice(0, w.bolts.length - 48)
  } else {
    const tint = b.side === "rust" ? "oxide" : b.side === "feral" ? "blood" : "dust"
    if (stats.lob) {
      w.lobs.push({
        x: mx,
        y: my,
        tx: tgt.x,
        ty: tgt.y,
        t: 0,
        T: b.air ? 0.7 : 0.55,
        dmg: stats.damage * mul,
        aoe: stats.aoe || 2.2,
        side: b.side,
        lift: b.air ? 1.4 : 0,
      })
    } else {
      pushShot(w, mx, my, tgt.x, tgt.y, b.air ? 1.4 : 0, b.id)
      let hit = stats.damage * mul
      if (tgt.vehicle && stats.range <= 2) hit *= meleeHull(tgt.armor)
      hurt(w, tgt, hit, b.shock > 0 ? "flash" : tint, b)
      // Taser hitch only — never refresh an active stun into a longer lock.
      if (b.shock > 0 && tgt.stun <= 0) tgt.stun = b.shock
      if (stats.pierce > 0) pierce(w, b, tgt, tint)
    }
  }
  b.range = prev.range
  b.damage = prev.damage
  b.pierce = prev.pierce
  b.lob = prev.lob
  b.aoe = prev.aoe
  reapplyGun(b)
}

function rams(w: World, dt: number) {
  for (const b of w.bodies) {
    if (!b.alive || !b.vehicle || b.air) continue
    b.ramCd = Math.max(0, b.ramCd - dt)
    if (b.ramCd > 0) continue
    const spd = Math.abs(b.vel)
    if (!b.moved || spd < 1.2) continue
    const scale = 0.55 + 0.9 * Math.min(1, spd / Math.max(3, b.speed))
    for (const o of w.bodies) {
      if (!o.alive || o.side === "player" || o.vehicle) continue
      if (Math.hypot(b.x - o.x, b.y - o.y) > b.radius + o.radius) continue
      hurt(w, o, RAM * b.ramMul * scale, o.side === "rust" ? "oxide" : "blood", b)
      hurt(w, b, RAM_SELF * b.ramSelf * scale, "dust", o)
      if (spd > 1.5) {
        const s = Math.sign(b.vel)
        o.x += Math.cos(b.hdg) * s * 0.45
        o.y += Math.sin(b.hdg) * s * 0.45
        b.vel *= 0.78
      }
      b.ramCd = 0.45
      break
    }
  }
}

function squadAt(w: World) {
  const here = commandHull(w, commandUnit(w)) ?? commandUnit(w)
  return { x: here?.x ?? w.ax, y: here?.y ?? w.ay }
}

/** Any living section body in the ring — holds keep going if the Lead dies but allies remain. */
function zoneHeld(w: World, x: number, y: number, r: number) {
  return w.bodies.some(
    (b) => b.alive && b.inSection && b.side === "player" && Math.hypot(b.x - x, b.y - y) <= r + b.radius,
  )
}

function inLz(w: World, b: Body) {
  return Math.hypot(b.x - w.flareX, b.y - w.flareY) <= FLARE_R + b.radius
}

function squadUnit(b: Body) {
  return b.alive && b.inSection && b.side === "player" && !b.vehicle && b.kind !== "sentry_gun"
}

function hauled(w: World) {
  let n = w.embarked ? w.kitPay : 0
  for (const b of w.bodies) {
    if (!b.out) continue
    n += b.cost
    for (const id of b.gears) n += b.gearPay[id] ?? 0
  }
  return n
}

/** Deck card ids physically on the craft (fitted gear, boarded hulls/units, unspent toolbar). */
export function recoveredCards(w: World): string[] {
  const ids = new Set<string>()
  for (const b of w.bodies) {
    if (!b.out) continue
    if (b.kind !== "sentry_gun") {
      const row = CARDS.find((c) => c.id === b.kind)
      if (row?.deck) ids.add(b.kind)
    }
    for (const g of b.gears) ids.add(g)
  }
  for (const s of w.toolbar) {
    if (s.charges > 0) ids.add(s.id)
  }
  return [...ids]
}

function liftOut(w: World, b: Body) {
  if (!b.alive) return
  for (const u of w.bodies) if (u.alive && u.boarded === b.id) liftOut(w, u)
  if (!b.vehicle && b.kind !== "sentry_gun") w.embarked = true
  b.out = true
  b.alive = false
  b.inSection = false
  b.boarded = null
}

function flare(w: World, _cmd: Commands, dt: number) {
  if (!w.lzOn && !w.flareOn && !w.craftOn) {
    const spent =
      w.deckQueue.length === 0 &&
      !w.inbound.some((f) => !f.loot) &&
      !w.drops.some((d) => !d.taken && d.kind !== "loot") &&
      w.t > 8
    if (w.t >= w.flareAt || (spent && w.depth === 0)) {
      w.lzOn = true
      toast(w, "LZ marked", "unit")
    }
  }
  const inside = w.lzOn && zoneHeld(w, w.flareX, w.flareY, FLARE_R)
  if (w.lzOn && !w.flareOn) {
    w.flareArm = inside ? w.flareArm + dt : 0
    if (w.flareArm >= FLARE_ARM) {
      w.flareOn = true
      w.flareHold = 0
      toast(w, "Flare up", "unit")
    }
  } else if (w.flareOn && !w.craftOn) {
    w.flareHold = inside ? w.flareHold + dt : 0
    if (w.flareHold >= craftWait(w)) {
      w.craftOn = true
      toast(w, "Craft down", "unit")
    }
  } else if (w.craftOn && w.phase === "run") {
    const feetQ = w.bodies.filter((b) => b.alive && b.inSection && b.side === "player" && !b.vehicle && b.boarded === null && inLz(w, b))
    const hullQ = w.bodies.filter((b) => b.alive && b.inSection && b.side === "player" && b.vehicle && inLz(w, b))
    const rank = (b: Body) => (b.id === w.commander ? -1 : Math.hypot(b.x - w.flareX, b.y - w.flareY))
    feetQ.sort((a, b) => rank(a) - rank(b))
    hullQ.sort((a, b) => rank(a) - rank(b))
    const next = feetQ[0] ?? hullQ[0]
    if (next) {
      w.loadT += dt
      if (w.loadT >= LOAD_STEP) {
        w.loadT = 0
        liftOut(w, next)
      }
    } else if (w.bodies.some((b) => b.alive && b.inSection && b.side === "player")) {
      w.loadT += dt
      if (w.loadT >= 6) {
        w.loadT = 0
        for (const b of w.bodies) {
          if (!b.alive || !b.inSection || b.side !== "player" || inLz(w, b)) continue
          b.inSection = false
          if (b.boarded !== null) {
            const ride = w.bodies.find((v) => v.id === b.boarded)
            if (ride) ride.inSection = false
          }
        }
        toast(w, "Left behind", "danger")
      }
    }
    if (!w.bodies.some((b) => b.alive && b.inSection && b.side === "player")) {
      w.phase = "win"
      if (!w.paidWin) {
        w.paidWin = true
        const back = hauled(w)
        w.credits += 40 + back
        toast(w, `EXTRACT +${40 + back} CR`, "unit")
      }
    }
  }
}

function path(w: World, dt: number) {
  if (!w.craftOn && w.t >= w.pathAt && w.paths.length) {
    const want = Math.min(w.paths.length, 1 + Math.floor((w.t - w.pathAt) / EXIT_STAGGER))
    let open = 0
    for (const p of w.paths) if (p.open) open++
    while (open < want) {
      const next = w.paths.find((p) => !p.open)
      if (!next) break
      next.open = true
      next.hold = 0
      open++
      const first = !w.pathOn
      w.pathOn = true
      if (first) toast(w, "Exit marked", "unit")
      else toast(w, "Another exit", "unit")
      syncPathMirror(w)
    }
  }
  // Flare/craft or standing in the LZ is extract — never path-travel from there.
  if (!w.pathOn || w.craftOn || w.flareOn) return
  if (w.lzOn && zoneHeld(w, w.flareX, w.flareY, FLARE_R)) {
    for (const p of w.paths) p.hold = 0
    syncPathMirror(w)
    return
  }
  let active: PathExit | null = null
  for (const p of w.paths) {
    if (!p.open) {
      p.hold = 0
      continue
    }
    const inside = zoneHeld(w, p.x, p.y, FLARE_R)
    p.hold = inside ? p.hold + dt : 0
    if (inside) active = p
  }
  syncPathMirror(w, active)
  for (const p of w.paths) {
    if (!p.open) continue
    if (p.hold >= PATH_HOLD) {
      travel(w, p.to)
      return
    }
  }
}

function leaveNode(w: World) {
  const n = nodeOf(w)
  let feral = 0
  let rust = 0
  for (const b of w.bodies) {
    if (!b.alive || b.side === "player") continue
    if (b.side === "feral") feral++
    else if (b.side === "rust") rust++
  }
  foldHostiles(n, feral, rust, w.nodeKills)
  const loot: CachedLoot[] = []
  for (const d of w.drops) {
    if (d.taken || d.kind !== "loot") continue
    if (d.cardId !== "salvage" && d.cardId !== "intel" && d.cardId !== "sample") continue
    loot.push({ kind: d.cardId, x: d.x, y: d.y })
    if (loot.length >= 2) break
  }
  cacheLoot(n, loot)
  cacheSleepers(
    n,
    w.sleepers.map((s) => ({ hull: s.hull, wake: s.wake, x: s.x, y: s.y, awake: s.awake })),
  )
  n.visited = true
}

function plantSection(w: World) {
  // Crewed hulls travel with their riders even if the hull flag drifted off-section
  // (otherwise riders stay boarded to a missing id and vanish from the field).
  for (const b of w.bodies) {
    if (!b.alive || b.side !== "player" || !b.inSection || b.boarded === null) continue
    const ride = w.bodies.find((v) => v.id === b.boarded && v.alive && v.vehicle)
    if (ride) ride.inSection = true
    else b.boarded = null
  }
  w.bodies = w.bodies.filter((b) => b.alive && b.inSection && b.side === "player")
  for (const b of w.bodies) {
    if (b.boarded === null) continue
    if (!w.bodies.some((v) => v.id === b.boarded && v.alive)) b.boarded = null
  }
  const boss = w.bodies.find((b) => b.id === w.commander)
  const hull = boss && boss.boarded !== null ? w.bodies.find((b) => b.id === boss.boarded) : null
  const core = hull ?? boss
  if (core) {
    core.x = 0
    core.y = 0
    core.vel = 0
  }
  const rest = w.bodies.filter((b) => b !== core && b.boarded === null)
  rest.forEach((b, i) => {
    const a = (i / Math.max(1, rest.length)) * Math.PI * 2
    b.x = Math.cos(a) * 1.4
    b.y = Math.sin(a) * 1.4
    b.vel = 0
  })
  for (const b of w.bodies) {
    if (b.boarded === null) continue
    const ride = w.bodies.find((v) => v.id === b.boarded)
    if (!ride) {
      b.boarded = null
      continue
    }
    b.x = ride.x
    b.y = ride.y
  }
  w.ax = 0
  w.ay = 0
}

function scrubField(w: World) {
  w.props = []
  w.drops = []
  w.inbound = []
  w.reveals = []
  w.gibs = []
  w.marks = []
  w.bolts = []
  w.shots = []
  w.flashes = []
  w.lobs = []
  w.mines = []
  w.strikes = []
  w.passes = []
  w.smokes = []
  w.tags = []
  w.marshes = []
  w.sleepers = []
  w.stashOn = false
  w.stashHold = 0
}

function travel(w: World, to: number) {
  leaveNode(w)
  ecoAll(w.map, 2.2, w.nodeId)
  w.depth++
  w.diffHp *= 1.15
  w.pathOn = false
  w.pathHold = 0
  for (const p of w.paths) {
    p.hold = 0
    p.open = false
  }
  w.lzOn = false
  w.flareOn = false
  w.craftOn = false
  w.flareArm = 0
  w.flareHold = 0
  w.loadT = 0
  w.flareAt = w.t + 48
  w.pathAt = w.t + 72
  w.stashAt = w.t + 22
  plantSection(w)
  scrubField(w)
  const dest = w.map.nodes.some((n) => n.id === to) ? to : w.map.start
  enterNode(w, dest, false)
  toast(w, "TRAIL", "unit")
}

function enterNode(w: World, id: number, _first: boolean) {
  w.nodeId = id
  w.nodeKills = 0
  const n = nodeOf(w)
  rollField(w, n)
  n.visited = true
}

/** Commit the hot field back into the campaign map (extract or wipe). */
export function commitMap(w: World) {
  leaveNode(w)
  ecoAll(w.map, 1)
}

function ability(w: World, cmd: Commands) {
  if (sun(w) >= NIGHT) w.vision = "off"
  if (cmd.ability === null) return
  const slot = w.toolbar[cmd.ability]
  if (!slot) return
  const id = slot.id
  if (id === "nvg" || id === "thermal") {
    if (sun(w) >= NIGHT) {
      toast(w, "Daylight", "gear")
      return
    }
    w.vision = w.vision === id ? "off" : id
    toast(w, w.vision === "nvg" ? "NVG" : w.vision === "thermal" ? "Thermal" : "Vis off", "gear")
    return
  }
  if (id === "gunship" || id === "rocket" || id === "bomber") {
    if (w.bodies.some((b) => b.alive && b.inSection && b.kind === id)) {
      toast(w, "Busy", "gear")
      return
    }
    if (slot.cd > 0) {
      toast(w, "Cooling", "gear")
      return
    }
    spendFamily(w, slot)
    const lead = commandHull(w, commandUnit(w)) ?? commandUnit(w)
    const at = casIngress(w, lead, id)
    spawnBody(w, { kind: id, x: at.x, y: at.y, inSection: true })
    toast(w, `${card(id).name} inbound`, "gear")
    return
  }
  if (slot.cd > 0 || (slot.cdMax <= 0 && slot.charges <= 0)) {
    toast(w, "Cooling", "gear")
    return
  }
  if (id === "stun" || id === "ewar") {
    const best = crowd(w, 14)
    if (!best) {
      toast(w, "No target", "gear")
      return
    }
    spend(slot)
    for (const o of w.bodies) {
      if (!o.alive || o.side === "player") continue
      if (id === "ewar" && o.side !== "rust") continue
      if (Math.hypot(o.x - best.x, o.y - best.y) > (id === "ewar" ? 6 : 3.6)) continue
      o.stun = id === "ewar" ? 3.2 : 2.6
    }
    toast(w, id === "ewar" ? "EWAR" : "Stun", "gear")
    return
  }
  if (id === "laser") {
    const best = crowd(w, 14)
    if (!best) {
      toast(w, "No target", "gear")
      return
    }
    spendFamily(w, slot)
    w.airMark = { x: best.x, y: best.y, t: 12 }
    toast(w, "Laser on", "gear")
    return
  }
  if (id === "frag" || id === "radio" || id === "cas" || id === "fpv") {
    const best = crowd(w, 14)
    if (!best) {
      toast(w, "No target", "gear")
      return
    }
    if (id === "frag") {
      spend(slot)
      blast(w, best.x, best.y, 3.2, 28)
      return
    }
    let x = best.x
    let y = best.y
    let markMul = 1
    if (w.airMark && w.airMark.t > 0) {
      x = w.airMark.x
      y = w.airMark.y
      markMul = 1.2
      w.airMark = null
    }
    const hot = jtacLive(w)
    spendFamily(w, slot)
    if (id === "radio") {
      w.strikes.push({ x, y, t: 0.6, n: 6, next: 0, dmg: (hot ? 28 : 22) * markMul })
      toast(w, "Artillery inbound", "gear")
    } else if (id === "fpv") {
      const dx = x - w.ax
      const dy = y - w.ay
      const d = Math.hypot(dx, dy) || 1
      w.passes.push({
        x,
        y,
        hx: -dx / d,
        hy: -dy / d,
        t: 1.0,
        n: 1,
        next: 0,
        dmg: 72 * (hot ? 1.25 : 1) * markMul,
        r: 2.8,
      })
      toast(w, "FPV inbound", "gear")
    } else {
      const dx = x - w.ax
      const dy = y - w.ay
      const d = Math.hypot(dx, dy) || 1
      w.passes.push({
        x,
        y,
        hx: dx / d,
        hy: dy / d,
        t: 1.2,
        n: 7,
        next: 0,
        dmg: 24 * (hot ? 1.25 : 1) * markMul,
        step: hot ? 1.2 : 1.6,
      })
      toast(w, "CAS inbound", "gear")
    }
    return
  }
  if (id === "thermite" || id === "emp" || id === "at") {
    const best = crowd(w, 14)
    if (!best) {
      toast(w, "No target", "gear")
      return
    }
    spend(slot)
    const r = id === "emp" ? 4 : id === "at" ? 2.2 : 3.2
    for (const o of w.bodies) {
      if (!o.alive || o.side === "player") continue
      if (id === "emp" && o.side !== "rust") continue
      if (Math.hypot(o.x - best.x, o.y - best.y) > r) continue
      const bare = id === "emp" ? 36 : 40 / (1 - Math.min(0.75, o.armor)) * (id === "at" ? 1.4 : 1)
      hurt(w, o, bare, id === "emp" ? "oxide" : "flash", best)
    }
    if (id === "thermite") {
      for (const p of w.props) {
        if (!p.alive || Math.hypot(p.x - best.x, p.y - best.y) > r + p.radius) continue
        p.alive = false
        p.hp = 0
      }
    }
    toast(w, id === "emp" ? "EMP" : id === "at" ? "AT" : "Thermite", "gear")
    return
  }
  if (id === "smoke") {
    spend(slot)
    w.smokes.push({ x: w.ax, y: w.ay, r: 4.5, t: 6 })
    toast(w, "Smoke", "gear")
    return
  }
  if (id === "mines") {
    spend(slot)
    w.mines.push({ x: w.ax + (w.rng() - 0.5) * 1.2, y: w.ay + (w.rng() - 0.5) * 1.2, t: 0 })
    toast(w, "Mine", "gear")
    return
  }
  if (id === "sentry") {
    spend(slot)
    const gun = spawnBody(w, { kind: "sentry_gun", x: w.ax, y: w.ay - 1.2, side: "player" })
    gun.life = 30
    toast(w, "Sentry down", "gear")
    return
  }
  if (id === "kit") {
    spend(slot)
    let n = 0
    for (const u of w.bodies) {
      if (!u.alive || u.side !== "player" || u.vehicle || !u.inSection) continue
      if (Math.hypot(u.x - w.ax, u.y - w.ay) > 6) continue
      u.hp = Math.min(u.maxHp, u.hp + 22)
      n++
    }
    toast(w, `Kit patched ${n}`, "unit")
    return
  }
  if (id === "nitro") {
    const hulls = vehicles(w).filter((v) => w.bodies.some((b) => b.alive && b.boarded === v.id))
    const v = hulls[0] ?? vehicles(w)[0]
    if (!v) {
      toast(w, "No hull", "gear")
      return
    }
    spend(slot)
    v.boost = 3
    toast(w, "Nitro", "veh")
  }
}

function ending(w: World) {
  if (w.phase !== "run") return
  if (w.bodies.some(squadUnit)) return
  if (w.craftOn && w.embarked) return
  w.phase = "lose"
  w.credits = 0
}

function pickFit(w: World, c: ReturnType<typeof card>, x = 0, y = 0): Body | null {
  if (!c.fits || c.fits === "section") return null
  const list = w.bodies.filter(
    (b) => b.alive && b.inSection && b.side === "player" && !b.gears.includes(c.id),
  )
  const pool =
    c.fits === "unit"
      ? list.filter((b) => !b.vehicle)
      : c.fits === "vehicle"
        ? list.filter((b) => b.vehicle)
        : c.fits === "deploy"
          ? list.filter((b) => !b.vehicle && b.deployNeed > 0)
          : list.filter((b) => !b.vehicle).length
            ? list.filter((b) => !b.vehicle)
            : list
  return nearestBody(pool, x, y)
}

function pickAttach(w: World, c: ReturnType<typeof card>, x = 0, y = 0): Body | null {
  if (!c.slot) return null
  const list = w.bodies.filter((b) => soldier(b) && canTakeAttach(b))
  const needDeploy = c.fits === "deploy"
  const ok = list.filter((b) => {
    if (needDeploy) {
      const g = primaryId(b)
      const need = g ? card(g).gun?.deployNeed ?? 0 : 0
      if (need <= 0) return false
    }
    return true
  })
  const empty = ok.filter((b) => !b.gears.some((have) => card(have).slot === c.slot))
  if (empty.length) return nearestBody(empty, x, y)
  const lead = ok.find((b) => b.id === w.commander)
  if (lead) return lead
  return nearestBody(ok, x, y)
}

function spend(slot: Slot) {
  if (slot.cdMax > 0) slot.cd = slot.cdMax
  else slot.charges--
}

function spendFamily(w: World, slot: Slot) {
  spend(slot)
  if (slot.cdMax > 0 && jtacLive(w)) slot.cd = slot.cdMax * 0.7
}

function jtacLive(w: World) {
  return w.bodies.some((b) => b.alive && b.inSection && b.kind === "jtac")
}

function casHull(b: Body) {
  return b.kind === "gunship" || b.kind === "rocket" || b.kind === "bomber"
}

/** Off-screen approach point on the current orbit ray (not beside the Lead). */
function casIngress(w: World, lead: Body | null, kind: string) {
  const cx = lead?.x ?? w.ax
  const cy = lead?.y ?? w.ay
  const ring = airRing(kind)
  const ang = w.t * ring.spin + 0.4
  const reach = ring.r + 34
  return {
    x: clamp(cx + Math.cos(ang) * reach, -MAP + 1, MAP - 1),
    y: clamp(cy + Math.sin(ang) * reach, -MAP + 1, MAP - 1),
  }
}

/** Sortie clock hits 0 → outbound flight (negative sortieT), then the body is culled. */
function leaveSortie(w: World, b: Body) {
  if (!b.alive || !casHull(b)) return
  // Already outbound (depart clock running).
  if (b.sortieT <= -1) return
  b.sortieT = -2.8
  toast(w, `${card(b.kind).name} away`, "veh")
}

function departAir(w: World, b: Body, dt: number) {
  const dx0 = b.x - w.ax
  const dy0 = b.y - w.ay
  const d = Math.hypot(dx0, dy0) || 1
  const pace = b.speed * 1.7 * dt
  b.x = clamp(b.x + (dx0 / d) * pace, -MAP, MAP)
  b.y = clamp(b.y + (dy0 / d) * pace, -MAP, MAP)
  b.moved = pace > 0.02
  b.vel = b.speed
  b.hdg = Math.atan2(dy0, dx0)
  const fx = Math.cos(b.hdg)
  if (Math.abs(fx) > 0.02) b.face = fx < 0 ? -1 : 1
}

function crowd(w: World, reach: number): Body | null {
  let best: Body | null = null
  let bestN = 0
  for (const o of w.bodies) {
    if (!o.alive || o.side === "player") continue
    if (Math.hypot(o.x - w.ax, o.y - w.ay) > reach) continue
    let n = 0
    for (const q of w.bodies) {
      if (!q.alive || q.side === "player") continue
      if (Math.hypot(q.x - o.x, q.y - o.y) <= 3.2) n++
    }
    if (n > bestN) {
      bestN = n
      best = o
    }
  }
  if (best) return best
  let near: Body | null = null
  let d0 = reach
  for (const o of w.bodies) {
    if (!o.alive || o.side === "player") continue
    const d = Math.hypot(o.x - w.ax, o.y - w.ay)
    if (d < d0) {
      d0 = d
      near = o
    }
  }
  return near
}

function blast(w: World, x: number, y: number, r: number, dmg: number, from: Side = "player") {
  stamp(w, x, y, "burn", "flash")
  stamp(w, x, y, "crater", "dust")
  for (const o of w.bodies) {
    if (!o.alive || o.side === from) continue
    if (Math.hypot(o.x - x, o.y - y) <= r) hurt(w, o, dmg, "flash", { x, y })
  }
  burst(w, x, y, "flash")
}

function bolts(w: World, dt: number) {
  const live: Bolt[] = []
  for (const b of w.bolts) {
    const sp = Math.hypot(b.vx, b.vy)
    const n = Math.max(1, Math.ceil((sp * dt) / 0.35))
    const h = dt / n
    let dead = false
    for (let i = 0; i < n && !dead; i++) {
      b.x += b.vx * h
      b.y += b.vy * h
      for (const p of w.props) {
        if (!p.alive || Math.hypot(p.x - b.x, p.y - b.y) > p.radius) continue
        dead = true
        break
      }
      if (dead) break
      for (const o of w.bodies) {
        if (!o.alive || o.side === b.side || o.boarded !== null) continue
        if (Math.hypot(o.x - b.x, o.y - b.y) > o.radius + 0.2) continue
        hurt(w, o, b.dmg, b.side === "rust" ? "oxide" : "blood", { x: b.x, y: b.y })
        dead = true
        break
      }
    }
    b.life -= dt
    if (!dead && b.life > 0) live.push(b)
  }
  w.bolts = live
}

function lobs(w: World, dt: number) {
  for (const lob of w.lobs) lob.t += dt
  const done = w.lobs.filter((lob) => lob.t >= lob.T)
  w.lobs = w.lobs.filter((lob) => lob.t < lob.T)
  for (const lob of done) blast(w, lob.tx, lob.ty, lob.aoe, lob.dmg, lob.side)
}

function mines(w: World, dt: number) {
  const live: Mine[] = []
  for (const m of w.mines) {
    m.t += dt
    if (m.t < 0.6) {
      live.push(m)
      continue
    }
    const hit = w.bodies.some(
      (o) =>
        o.alive &&
        o.side !== "player" &&
        !o.vehicle &&
        Math.hypot(o.x - m.x, o.y - m.y) < o.radius + 0.45,
    )
    if (hit) blast(w, m.x, m.y, 2.4, 30)
    else live.push(m)
  }
  w.mines = live
}

function bog(w: World, vehicle: boolean, kind = "", x = 0, y = 0, who?: Body) {
  if (kind === "hover" || who?.air || who?.gears.includes("jetpack")) return 1
  const row = WEATHER[w.weather]
  let s = who?.gears.includes("filter") ? 1 : 1 / (vehicle ? row.bog : row.move)
  for (const m of w.marshes) {
    if (Math.hypot(m.x - x, m.y - y) >= m.r) continue
    s *= vehicle ? 0.38 : 0.8
    break
  }
  return s
}

function layMarsh(w: World) {
  w.marshes = []
  const sheets = w.ground === "bog"
  const n = sheets ? 2 + ((w.rng() * 3) | 0) : 10 + ((w.rng() * 10) | 0)
  for (let i = 0; i < n; i++) {
    const at = corridor(w, 10)
    if (!at) continue
    w.marshes.push({ x: at.x, y: at.y, r: sheets ? 14 + w.rng() * 14 : 3.2 + w.rng() * 1.6 })
  }
}

function tails(w: World, dt: number) {
  const lead = commandHull(w, commandUnit(w)) ?? commandUnit(w)
  if (!lead) return
  for (const b of w.bodies) {
    if (!b.alive || !b.inSection || !b.follow || b.boarded !== null || b.stun > 0) continue
    if (b.air) {
      if (casHull(b) && b.sortieT <= 0) continue
      orbitAir(w, b, lead, dt)
      continue
    }
    const dx = lead.x - b.x
    const dy = lead.y - b.y
    const d = Math.hypot(dx, dy) || 1
    if (b.vehicle) {
      const back = lead.radius + b.radius + 2.2
      const tx = d > back ? lead.x - (dx / d) * back : b.x
      const ty = d > back ? lead.y - (dy / d) * back : b.y
      steer(w, b, tx, ty, dt)
      continue
    }
    const keep = 2.2
    if (d <= keep) continue
    const pace = b.speed * bog(w, false, "", b.x, b.y) * dt
    const m = Math.min(pace, d - keep)
    b.x = clamp(b.x + (dx / d) * m, -MAP, MAP)
    b.y = clamp(b.y + (dy / d) * m, -MAP, MAP)
    b.moved = m > 0.02
    b.hdg = Math.atan2(dy, dx)
    if (Math.abs(dx) > 0.02) b.face = dx < 0 ? -1 : 1
  }
}

function airRing(kind: string): { r: number; spin: number } {
  if (kind === "gunboat" || kind === "copter") return { r: 4.2, spin: 1.15 }
  if (kind === "gunship") return { r: 5.6, spin: 0.9 }
  if (kind === "rocket") return { r: 6.8, spin: 0.72 }
  if (kind === "bomber") return { r: 7.8, spin: 0.55 }
  if (kind === "hawk" || kind === "mid") return { r: 4.8, spin: 1.05 }
  return { r: 4.5, spin: 1 }
}

function orbitAir(w: World, b: Body, lead: Body, dt: number) {
  const ring = airRing(b.kind)
  let cx = lead.air || lead.id === b.id ? w.ax : lead.x
  let cy = lead.air || lead.id === b.id ? w.ay : lead.y
  if (b.vehicle || casHull(b)) {
    let foe: Body | null = null
    let best = 16
    for (const o of w.bodies) {
      if (!o.alive || o.side === "player" || o.boarded !== null) continue
      const d = Math.hypot(o.x - cx, o.y - cy)
      if (d < best) {
        best = d
        foe = o
      }
    }
    if (foe) {
      const pull = casHull(b) || b.kind === "gunboat" ? 0.4 : 0.25
      cx = cx + (foe.x - cx) * pull
      cy = cy + (foe.y - cy) * pull
    }
  }
  const ang = w.t * ring.spin + b.id * 1.7
  const tx = cx + Math.cos(ang) * ring.r
  const ty = cy + Math.sin(ang) * ring.r
  const dx = tx - b.x
  const dy = ty - b.y
  const d = Math.hypot(dx, dy) || 1
  const pace = b.speed * 1.15 * dt
  const m = Math.min(pace, d)
  b.x = clamp(b.x + (dx / d) * m, -MAP, MAP)
  b.y = clamp(b.y + (dy / d) * m, -MAP, MAP)
  b.moved = m > 0.02
  b.vel = b.speed
  b.hdg = ang + Math.PI / 2
  const fx = Math.cos(b.hdg)
  if (Math.abs(fx) > 0.02) b.face = fx < 0 ? -1 : 1
}

function stash(w: World, dt: number) {
  if (!w.stashOn && !w.craftOn && w.t >= w.stashAt) {
    w.stashOn = true
    w.stashHold = 0
    toast(w, "Stash marked", "loot")
  }
  if (!w.stashOn || w.craftOn) return
  const inside = zoneHeld(w, w.stashX, w.stashY, STASH_R)
  w.stashHold = inside ? w.stashHold + dt : 0
  if (w.stashHold < STASH_HOLD) return
  w.stashOn = false
  w.stashAt = 1e9
  if (!w.heroOffered && w.rng() < 0.35) offerHero(w)
  w.drops.push({
    id: w.nextId++,
    cardId: w.hidden.length ? "relic" : "salvage",
    x: w.stashX,
    y: w.stashY,
    bodyId: -1,
    kind: "loot",
    taken: false,
    cost: 0,
  })
  toast(w, "Stash open", "loot")
}

export function beams(w: World): Body[] {
  if (sun(w) >= NIGHT || w.vision !== "off") return []
  return w.bodies.filter(
    (b) => b.alive && b.inSection && b.side === "player" && !b.android && !b.vehicle && b.boarded === null,
  )
}

/** Living hostiles marked while a living player wears a Tracker. Ignores night and smoke. */
export function trackerTargets(w: World): Body[] {
  if (!w.bodies.some((b) => b.alive && b.side === "player" && b.gears.includes("tracker"))) return []
  return w.bodies.filter((b) => b.alive && (b.side === "feral" || b.side === "rust"))
}

function inBeam(w: World, x: number, y: number) {
  for (const b of beams(w)) {
    const dx = x - b.x
    const dy = y - b.y
    const d = Math.hypot(dx, dy)
    if (d < 0.35 || d > BEAM_R) continue
    if (Math.abs(angDiff(Math.atan2(dy, dx), b.hdg)) <= BEAM_ARC) return true
  }
  return inFlashLight(w, x, y)
}

/** Player muzzle flash is a brief omnidirectional combat light (hostile flashes stay visual-only). */
function inFlashLight(w: World, x: number, y: number) {
  for (const f of w.flashes) {
    if (f.light <= 0 || f.from == null) continue
    const src = w.bodies.find((b) => b.id === f.from)
    // Match beams: only the section's powder lights day-range sight.
    if (!src || src.side !== "player") continue
    const r = f.light * (0.5 + 0.5 * (f.life / f.max))
    if (Math.hypot(x - f.x, y - f.y) <= r) return true
  }
  return false
}

function sight(w: World, lit = false) {
  const hide = WEATHER[w.weather].conceal * 0.12
  let s = Math.max(0.35, 1 - hide)
  if (sun(w) < NIGHT) s *= w.vision === "off" ? (lit ? 1 : 0.4) : 1.2
  let spot = 0
  for (const b of w.bodies) {
    if (!b.alive || !b.inSection) continue
    let n = b.spot
    for (const have of b.gears) n += card(have).spot ?? 0
    if (n > spot) spot = n
  }
  if (spot) s *= 1 + 0.15 * spot
  return s
}

function craftWait(w: World) {
  return w.bodies.some((b) => b.alive && b.inSection && b.kind === "relay") ? CRAFT_WAIT * 0.5 : CRAFT_WAIT
}

function smoked(w: World, b: Body) {
  return w.smokes.some((s) => s.t > 0 && Math.hypot(b.x - s.x, b.y - s.y) < s.r)
}

function climate(w: World, dt: number) {
  w.weatherAt -= dt
  if (w.weatherAt > 0) return
  w.weather = w.rng() < 0.7 ? w.skyMain : w.skyAlt
  w.weatherAt = 36
  toast(w, w.weather.toUpperCase(), "line")
}

function grantThermal(w: World) {
  const have =
    w.bodies.some((b) => b.alive && b.inSection && b.android) ||
    w.bodies.some((b) => b.alive && b.inSection && b.gears.includes("therm_sight"))
  if (!have) return
  if (w.toolbar.some((t) => t.id === "thermal")) return
  w.toolbar.push({ id: "thermal", charges: 0, cd: 0, cdMax: 0 })
}

function grantNvg(w: World) {
  if (!w.bodies.some((b) => b.alive && b.inSection && b.nvg)) return
  if (w.toolbar.some((t) => t.id === "nvg")) return
  w.toolbar.push({ id: "nvg", charges: 0, cd: 0, cdMax: 0 })
}

function grantEwar(w: World) {
  if (!w.bodies.some((b) => b.alive && b.inSection && b.kind === "operator")) return
  const have = w.toolbar.find((t) => t.id === "ewar")
  if (have) {
    if (have.cdMax <= 0) have.cdMax = 22
    return
  }
  w.toolbar.push({ id: "ewar", charges: 0, cd: 0, cdMax: 22 })
}

function strikes(w: World, dt: number) {
  const live: Strike[] = []
  for (const s of w.strikes) {
    s.t -= dt
    if (s.t > 0) {
      live.push(s)
      continue
    }
    s.next -= dt
    if (s.next <= 0 && s.n > 0) {
      s.n--
      s.next = 0.18
      const a = w.rng() * Math.PI * 2
      const r = Math.sqrt(w.rng()) * 2.4
      blast(w, s.x + Math.cos(a) * r, s.y + Math.sin(a) * r, 2.2, s.dmg ?? 22)
    }
    if (s.n > 0) live.push(s)
  }
  w.strikes = live
}

function passes(w: World, dt: number) {
  const live: Pass[] = []
  for (const s of w.passes) {
    if (s.t > 0) {
      s.t -= dt
      live.push(s)
      continue
    }
    s.next -= dt
    if (s.next <= 0 && s.n > 0) {
      s.n--
      s.next = 0.14
      blast(w, s.x, s.y, s.r ?? 1.5, s.dmg ?? 24)
      const step = s.step ?? 1.6
      s.x += s.hx * step
      s.y += s.hy * step
    }
    if (s.n > 0) live.push(s)
  }
  w.passes = live
}

function digs(w: World, dt: number) {
  for (const b of w.bodies) {
    if (!b.alive || b.dig <= 0 || b.boarded !== null) continue
    for (const p of w.props) {
      if (!p.alive || Math.hypot(p.x - b.x, p.y - b.y) > p.radius + b.radius + 0.4) continue
      p.hp -= b.dig * dt
      if (p.hp <= 0) {
        p.alive = false
        p.hp = 0
      }
      break
    }
  }
}

function heals(w: World, dt: number) {
  for (const b of w.bodies) {
    if (!b.alive || b.heal <= 0 || b.boarded !== null) continue
    for (const u of w.bodies) {
      if (!u.alive || u.side !== "player" || u.vehicle || u.android || u.id === b.id) continue
      if (Math.hypot(u.x - b.x, u.y - b.y) > 3.2) continue
      u.hp = Math.min(u.maxHp, u.hp + b.heal * dt)
    }
  }
}

function ages(w: World, dt: number) {
  for (const s of w.toolbar) if (s.cd > 0) s.cd = Math.max(0, s.cd - dt)
  const gone: number[] = []
  for (const b of w.bodies) {
    if (b.boost > 0) b.boost = Math.max(0, b.boost - dt)
    if (b.stun > 0) b.stun = Math.max(0, b.stun - dt)
    if (b.alive && b.life > 0) {
      b.life -= dt
      if (b.life <= 0) kill(w, b)
    }
    if (b.alive && casHull(b)) {
      if (b.sortieT > 0) {
        b.sortieT -= dt
        if (b.sortieT <= 0) leaveSortie(w, b)
      } else if (b.sortieT < 0) {
        b.sortieT = Math.min(0, b.sortieT + dt)
        departAir(w, b, dt)
        if (b.sortieT >= 0) {
          b.alive = false
          b.hp = 0
          b.inSection = false
          gone.push(b.id)
        }
      }
    }
  }
  if (gone.length) {
    const drop = new Set(gone)
    w.bodies = w.bodies.filter((o) => !drop.has(o.id))
  }
  if (w.airMark) {
    w.airMark.t -= dt
    if (w.airMark.t <= 0) w.airMark = null
  }
  for (const s of w.smokes) s.t -= dt
  w.smokes = w.smokes.filter((s) => s.t > 0)
  for (const s of w.shots) s.life -= dt
  w.shots = w.shots.filter((s) => s.life > 0)
  if (w.shots.length > 48) w.shots.splice(0, w.shots.length - 48)
  for (const f of w.flashes) f.life -= dt
  w.flashes = w.flashes.filter((f) => f.life > 0)
  if (w.flashes.length > 64) w.flashes.splice(0, w.flashes.length - 64)
  for (const t of w.toasts) t.life -= dt
  w.toasts = w.toasts.filter((t) => t.life > 0)
  for (const t of w.tags) t.life -= dt
  w.tags = w.tags.filter((t) => t.life > 0)
}

function pushShot(w: World, x: number, y: number, tx: number, ty: number, lift = 0, from?: number) {
  w.shots.push({ x, y, tx, ty, life: 0.08, lift, from })
}

function pushFlash(w: World, x: number, y: number, hdg: number, gun: string | null | undefined, from?: number) {
  const def: FlashDef | null = flashOf(gun)
  if (!def) return
  w.flashes.push({
    x,
    y,
    hdg,
    life: def.life,
    max: def.life,
    shape: def.shape,
    core: def.core,
    rim: def.rim,
    along: def.along,
    across: def.across,
    light: def.light,
    from,
  })
}

/** World point at the held gun tip — along hdg from the body (hit/bolt spawn). View tracers use stamp tip. */
function muzzleOf(b: Body, gun?: string | null): [number, number] {
  const r =
    b.vehicle || b.air ? Math.max(0.5, b.radius * 0.85) : gunMuzzle(gun ?? gunId(b))
  return [b.x + Math.cos(b.hdg) * r, b.y + Math.sin(b.hdg) * r]
}

/** Hull/air muzzle along a shot bearing (chassis hdg stays with drive). */
function muzzleAlong(b: Body, aim: number): [number, number] {
  // Long-gun hulls need more reach than the collision radius.
  const r =
    b.kind === "mbt"
      ? 2.4
      : b.kind === "tank" || b.kind === "hex_siege"
        ? 1.9
        : b.kind === "ifv" || b.kind === "hex_line" || b.kind === "mlrs"
          ? 1.6
          : Math.max(0.55, b.radius * 1.15)
  return [b.x + Math.cos(aim) * r, b.y + Math.sin(aim) * r]
}

function pierce(w: World, b: Body, first: Body, tint: Burst["tint"]) {
  const dx = first.x - b.x
  const dy = first.y - b.y
  const d = Math.hypot(dx, dy) || 1
  let left = b.pierce
  const hit = new Set<number>([first.id])
  for (const o of w.bodies) {
    if (left <= 0) break
    if (!o.alive || hit.has(o.id) || o.side === b.side || o.boarded !== null) continue
    const ox = o.x - b.x
    const oy = o.y - b.y
    const along = (ox * dx + oy * dy) / d
    if (along <= 0 || along > b.range + 1.2) continue
    const lat = Math.abs(ox * -dy + oy * dx) / d
    if (lat > o.radius + 0.35) continue
    hurt(w, o, b.damage, tint, b)
    hit.add(o.id)
    left--
  }
}

function toast(w: World, msg: string, kind: string) {
  if (w.toasts.length > 4) w.toasts.shift()
  w.toasts.push({ msg, kind, life: 2.4 })
}

function noteFind(w: World, d: Drop) {
  if (w.unlocked.includes(d.cardId) || w.found.includes(d.cardId)) return false
  w.found.push(d.cardId)
  tag(w, d.x, d.y, `FIND ${card(d.cardId).name}`, "find")
  toast(w, `${card(d.cardId).name} found`, "pick")
  return true
}

const LINES = ["MUD HOLDS", "QUIET WIRE", "NO BIRDS"]

function tag(w: World, x: number, y: number, text: string, kind: string) {
  for (const t of w.tags) {
    if (t.kind !== kind) continue
    if (Math.hypot(t.x - x, t.y - y) > 2.5) continue
    t.x = x
    t.y = y
    t.text = text
    t.life = tagLife(kind)
    return
  }
  const flavour = kind === "line"
  if (flavour) {
    const old = w.tags.findIndex((t) => t.kind === "line")
    if (old >= 0) w.tags.splice(old, 1)
  } else if (w.tags.filter((t) => t.kind !== "line").length >= 5) {
    let oldest = -1
    let age = -1
    for (let i = 0; i < w.tags.length; i++) {
      if (w.tags[i].kind === "line") continue
      const lived = 2.6 - w.tags[i].life
      if (lived > age) {
        age = lived
        oldest = i
      }
    }
    if (oldest >= 0) w.tags.splice(oldest, 1)
  }
  const used = new Set(w.tags.map((t) => t.slot))
  let slot = 0
  while (used.has(slot)) slot++
  w.tags.push({ x, y, text, kind, life: tagLife(kind), slot })
}

function tagLife(kind: string) {
  if (kind === "line") return 3.8
  if (kind === "find" || kind === "loot" || kind === "bounty") return 3.4
  if (kind === "down" || kind === "chip") return 1.4
  return 2.6
}

function bounties(w: World) {
  if (!w.paidPurge && w.kills >= 8) {
    w.paidPurge = true
    w.credits += 20
    toast(w, "PURGE 8/8 +20 CR", "unit")
    tag(w, w.ax, w.ay, "PURGE 8/8", "bounty")
  }
  if (!w.paidHaul && w.loot >= 3) {
    w.paidHaul = true
    w.credits += 20
    toast(w, "HAUL 3/3 +20 CR", "gear")
    tag(w, w.ax, w.ay, "HAUL 3/3", "bounty")
  }
  const beat = Math.floor(w.t / 36)
  if (w.t > 10 && beat > w.lineBeat) {
    w.lineBeat = beat
    tag(w, w.ax, w.ay + 1.5, LINES[beat % LINES.length], "line")
  }
}

function limbs(vehicle: boolean, air = false): Limb[] {
  if (vehicle && air) return [{ id: "turret", on: true }]
  if (vehicle) {
    return [
      { id: "wheel", on: true },
      { id: "wheel", on: true },
      { id: "turret", on: true },
    ]
  }
  return [
    { id: "leg", on: true },
    { id: "leg", on: true },
    { id: "arm", on: true },
    { id: "arm", on: true },
    { id: "head", on: true },
  ]
}

function limbSpeed(b: Body) {
  const legs = b.parts.filter((p) => p.id === "leg")
  if (!legs.length) return b.speed
  const on = legs.filter((p) => p.on).length
  return b.speed * (0.35 + 0.65 * (on / legs.length))
}

function canFire(b: Body) {
  if (b.air) return b.alive
  if (b.vehicle) return b.parts.some((p) => p.id === "turret" && p.on)
  return b.parts.some((p) => p.id === "arm" && p.on)
}

function sever(w: World, b: Body, tint: Burst["tint"], fx: number, fy: number) {
  const open = b.parts.filter((p) => p.on && p.id !== "head")
  const holdGun = b.vehicle && b.hp > b.maxHp * 0.5
  const part = (holdGun ? open.find((p) => p.id !== "turret") : open[0]) ?? b.parts.find((p) => p.on)
  if (!part || (part.id === "turret" && holdGun)) return
  part.on = false
  const dx = b.x - fx
  const dy = b.y - fy
  const d = Math.hypot(dx, dy) || 1
  const sp = 5 + w.rng() * 7
  w.gibs.push({
    x: b.x,
    y: b.y,
    z: 0.45,
    vx: (dx / d) * sp + (w.rng() - 0.5) * 2,
    vy: (dy / d) * sp + (w.rng() - 0.5) * 2,
    vz: 4 + w.rng() * 5,
    part: part.id,
    kind: b.kind,
    tint,
    rest: false,
    side: b.side,
  })
  if (w.gibs.length > 64) w.gibs.splice(0, w.gibs.length - 64)
  tag(w, b.x, b.y, part.id.toUpperCase(), b.side === "player" ? "part" : "chip")
  if (part.id === "head") kill(w, b)
}

function stamp(w: World, x: number, y: number, kind: Mark["kind"], tint: Burst["tint"]) {
  w.marks.push({ x, y, kind, tint })
  if (w.marks.length > 120) w.marks.shift()
}

function gibs(w: World, dt: number) {
  for (const g of w.gibs) {
    if (g.rest) continue
    g.vz -= 16 * dt
    g.z += g.vz * dt
    g.x += g.vx * dt
    g.y += g.vy * dt
    if (g.z > 0) continue
    g.z = 0
    g.vz = -g.vz * 0.3
    g.vx *= 0.55
    g.vy *= 0.55
    if (g.vz < 1.5) {
      g.rest = true
      g.vz = 0
      stamp(w, g.x, g.y, "splat", g.tint)
    }
  }
}

function cull(w: World) {
  const dead = w.bodies.filter((b) => !b.alive && !(b.side === "player" && b.inSection))
  if (dead.length <= 32) return
  const drop = new Set(dead.slice(0, dead.length - 32).map((b) => b.id))
  w.bodies = w.bodies.filter((b) => !drop.has(b.id))
}

function hurt(w: World, b: Body, amount: number, tint: Burst["tint"], from?: { x: number; y: number }) {
  if (!b.alive || amount <= 0) return
  const dealt = amount * (1 - Math.min(0.75, b.armor))
  if (dealt <= 0) return
  b.hp -= dealt
  if (b.vehicle) w.hullDamage += dealt
  burst(w, b.x, b.y, tint)
  const ground = b.side === "rust" ? "oxide" : b.side === "feral" ? "blood" : tint
  stamp(w, b.x, b.y, tint === "flash" ? "burn" : "splat", ground)
  if (dealt >= 4) sever(w, b, tint, from?.x ?? b.x, from?.y ?? b.y - 1)
  if (!Number.isFinite(b.hp) || b.hp <= 0) kill(w, b)
}

function reap(w: World) {
  for (const b of w.bodies) if (b.alive && (!Number.isFinite(b.hp) || b.hp <= 0)) kill(w, b)
}

function kill(w: World, b: Body) {
  if (!b.alive) return
  b.alive = false
  b.hp = 0
  if (b.side === "player" && b.kind !== "sentry_gun") {
    w.lost++
    tag(w, b.x, b.y, "KIA", "kia")
    if (b.heroId && w.veteranIds.includes(b.heroId) && !w.buried.includes(b.heroId)) w.buried.push(b.heroId)
    if (b.inSection) toast(w, "Section casualty", "danger")
  } else if (b.side !== "player") {
    w.kills++
    w.nodeKills++
    w.credits += b.side === "rust" ? 8 : 4
    tag(w, b.x, b.y, "DOWN", "down")
  }
  if (b.vehicle) {
    for (const u of w.bodies) {
      if (u.boarded === b.id) {
        u.boarded = null
        u.x = b.x
        u.y = b.y
      }
    }
  }
  b.boarded = null
  if (b.side === "player" && !b.inSection) {
    w.drops = w.drops.filter((d) => d.bodyId !== b.id)
  }
}

function burst(w: World, x: number, y: number, tint: Burst["tint"]) {
  if (w.bursts.length > 96) w.bursts.shift()
  w.bursts.push({ x, y, tint })
}

function labels(w: World) {
  const aboard = w.bodies.some((b) => b.alive && b.boarded !== null)
  const seat = vehicles(w).some((v) => free(w, v))
  w.groupLabel = w.gap > 0 ? "TIGHT" : seat ? "BOARD" : "HELD"
  w.spreadLabel = aboard ? "EXIT" : w.gap < GAP_MAX ? "LOOSE" : "WIDE"
  const at = squadAt(w)
  const inLz = w.lzOn && zoneHeld(w, w.flareX, w.flareY, FLARE_R)
  let pathHold = 0
  let inPath = false
  if (w.pathOn) {
    for (const p of w.paths) {
      if (!p.open) continue
      if (zoneHeld(w, p.x, p.y, FLARE_R)) {
        inPath = true
        pathHold = p.hold
        break
      }
    }
  }
  const left = w.bodies.filter((b) => b.alive && b.inSection && b.side === "player").length
  if (w.craftOn) w.banner = `LOAD ${left}`
  else if (w.flareOn) w.banner = inLz ? `CRAFT ${Math.max(0, Math.ceil(craftWait(w) - w.flareHold))}s` : "HOLD THE LZ"
  else if (inPath) w.banner = `HOLD EXIT ${Math.max(0, Math.ceil(PATH_HOLD - pathHold))}s`
  else if (w.lzOn && inLz) w.banner = `ARM FLARE ${Math.max(0, Math.ceil(FLARE_ARM - w.flareArm))}s`
  else if (w.lzOn && w.pathOn) w.banner = "HOLD LZ · OR EXIT"
  else if (w.pathOn)
    w.banner = w.paths.filter((p) => p.open).length > 1 ? "REACH AN EXIT" : "REACH EXIT"
  else if (w.lzOn) w.banner = "REACH LZ"
  else if (w.stashOn && zoneHeld(w, w.stashX, w.stashY, STASH_R))
    w.banner = `STASH ${Math.max(0, Math.ceil(STASH_HOLD - w.stashHold))}s`
  else {
    const hull = w.sleepers.find((s) => !s.awake && Math.hypot(at.x - s.x, at.y - s.y) <= PICKUP + 1.5)
    if (hull) w.banner = `HULL ${Math.max(0, Math.ceil(SLEEPER_HOLD - hull.hold))}s`
    else w.banner = ""
  }
}

function feet(w: World): Body[] {
  return w.bodies.filter((b) => b.alive && b.inSection && !b.vehicle && b.boarded === null && !b.follow)
}

function vehicles(w: World): Body[] {
  return w.bodies.filter((b) => b.alive && b.inSection && b.vehicle).sort((a, b) => a.id - b.id)
}

function free(w: World, v: Body): boolean {
  let n = 0
  for (const b of w.bodies) if (b.alive && b.boarded === v.id) n++
  return n < v.seats
}

function touch(w: World, x: number, y: number): boolean {
  if (Math.hypot(w.ax - x, w.ay - y) <= PICKUP) return true
  return w.bodies.some(
    (b) => b.alive && b.inSection && Math.hypot(b.x - x, b.y - y) <= PICKUP,
  )
}

function hitProp(w: World, x: number, y: number, radius: number): Prop | null {
  for (const p of w.props) {
    if (!p.alive) continue
    if (Math.hypot(p.x - x, p.y - y) < p.radius + radius) return p
  }
  return null
}

function slot(i: number, n: number, radius: number): [number, number] {
  if (n <= 1) return [0, 0]
  const a = (i / n) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(a) * radius, Math.sin(a) * radius]
}

function scatter(w: World) {
  const ground = (GROUNDS as readonly string[]).includes(w.ground) ? (w.ground as Ground) : "open"
  const n = Math.round(320 * DENSE[ground])
  for (let i = 0; i < n; i++) {
    const at = cover(w)
    if (!at) continue
    const kind = pick(w.rng, PROP_W[ground]) as Prop["kind"]
    const radius = kind === "post" ? 0.5 : kind === "burnt_tree" ? 0.7 : kind === "teeth" ? 0.85 : 1.05
    w.props.push({
      id: w.props.length + 1,
      kind,
      x: at.x,
      y: at.y,
      hp: 30,
      radius,
      alive: true,
    })
  }
}

function rollField(w: World, node?: FieldNode) {
  const n = node ?? nodeOf(w)
  const band = BANDS[Math.min(BANDS.length - 1, w.depth)]
  w.ground = n.ground
  w.bearing = n.bearing
  w.pressure = pressureOf(n, band)
  w.apex = APEX[(w.rng() * APEX.length) | 0]
  w.escort = ESCORT[(w.rng() * ESCORT.length) | 0]
  const pair = skyPair(w.ground, w.rng)
  w.skyMain = pair[0]
  w.skyAlt = pair[1]
  w.weather = w.skyMain
  w.weatherAt = 52
  w.dayOff = DAY_OFF[(w.rng() * DAY_OFF.length) | 0]
  const exits = n.exits.length ? n.exits : [n.id]
  w.paths = exits.map((to) => {
    const dest = w.map.nodes.find((row) => row.id === to)
    const ang = dest ? neighborAngle(n, dest) : (w.bearing * Math.PI) / 4
    return { x: Math.cos(ang) * PATH_R, y: Math.sin(ang) * PATH_R, hold: 0, to, open: false }
  })
  const lz = lzAwayFromExits(w.paths)
  w.flareX = lz[0]
  w.flareY = lz[1]
  syncPathMirror(w)
  const base = Math.atan2(w.paths[0].y, w.paths[0].x)
  const c = Math.cos(base)
  const s = Math.sin(base)
  const side = w.rng() < 0.5 ? 1 : -1
  const off = 16 + w.rng() * 12
  const along = (w.rng() * 2 - 1) * 10
  w.stashX = -s * off * side + c * along
  w.stashY = c * off * side + s * along
  w.props = []
  w.marshes = []
  w.sleepers = []
  layMarsh(w)
  scatter(w)
  if (n.sleepers.length) {
    for (const s of n.sleepers) {
      if (s.awake) continue
      w.sleepers.push({
        id: w.nextId++,
        hull: s.hull,
        wake: s.wake,
        x: s.x,
        y: s.y,
        awake: false,
        hold: 0,
      })
    }
  } else {
    laySleepers(w)
    cacheSleepers(
      n,
      w.sleepers.map((s) => ({ hull: s.hull, wake: s.wake, x: s.x, y: s.y, awake: s.awake })),
    )
  }
  for (const loot of n.loot) {
    w.drops.push({
      id: w.nextId++,
      cardId: loot.kind,
      x: loot.x,
      y: loot.y,
      bodyId: -1,
      kind: "loot",
      taken: false,
      cost: 0,
    })
  }
  n.loot = []
}

function laySleepers(w: World) {
  const n = 1 + (w.rng() < 0.35 ? 1 : 0)
  for (let i = 0; i < n; i++) {
    let x = 0
    let y = 0
    let ok = false
    for (let t = 0; t < 12; t++) {
      x = (w.rng() * 2 - 1) * 28
      y = (w.rng() * 2 - 1) * 28
      if (Math.hypot(x, y) < 10) continue
      if (!clearMark(w, x, y)) continue
      if (hitProp(w, x, y, 1.4)) continue
      if (w.sleepers.some((s) => Math.hypot(s.x - x, s.y - y) < 10)) continue
      ok = true
      break
    }
    if (!ok) continue
    const [hull, wake] = SLEEPER_HULLS[(w.rng() * SLEEPER_HULLS.length) | 0]
    w.sleepers.push({ id: w.nextId++, hull, wake, x, y, awake: false, hold: 0 })
  }
}

function skyPair(ground: string, rng: () => number): [Weather, Weather] {
  if (ground === "timber") return ["clear", "rain"]
  if (ground === "yard") return ["dust", "fog"]
  if (ground === "bog") return rng() < 0.5 ? ["rain", "fog"] : ["fog", "rain"]
  if (ground === "teeth") return ["dust", "clear"]
  const a = SKY[(rng() * SKY.length) | 0]
  let b = SKY[(rng() * SKY.length) | 0]
  if (b === a) b = SKY[(SKY.indexOf(a) + 1) % SKY.length]
  return [a, b]
}

function sun(w: World) {
  return daylight(w.t + w.dayOff)
}

/** LZ mark in the widest angular gap from all path exits (not merely opposite exit 0). */
function lzAwayFromExits(paths: PathExit[]): [number, number] {
  if (!paths.length) return [0, -PATH_R]
  const angs = paths.map((p) => Math.atan2(p.y, p.x))
  let best = angs[0] + Math.PI
  let bestClear = -1
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2
    let clear = Infinity
    for (const e of angs) clear = Math.min(clear, Math.abs(angDiff(a, e)))
    if (clear > bestClear) {
      bestClear = clear
      best = a
    }
  }
  return [Math.cos(best) * PATH_R, Math.sin(best) * PATH_R]
}

function onSegment(x: number, y: number, w: World, reach: number) {
  const dx = w.pathX - w.flareX
  const dy = w.pathY - w.flareY
  const l2 = dx * dx + dy * dy || 1
  let t = ((x - w.flareX) * dx + (y - w.flareY) * dy) / l2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(x - (w.flareX + dx * t), y - (w.flareY + dy * t)) <= reach
}

function corridor(w: World, pad: number) {
  for (let n = 0; n < 12; n++) {
    const x = (w.rng() * 2 - 1) * 110
    const y = (w.rng() * 2 - 1) * 110
    if (!onSegment(x, y, w, 90)) continue
    if (Math.hypot(x, y) < pad) continue
    if (!clearMark(w, x, y)) continue
    return { x, y }
  }
  return null
}

function cover(w: World) {
  const ang = (w.bearing * Math.PI) / 4
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  for (let n = 0; n < 12; n++) {
    let x = 0
    let y = 0
    if (w.ground === "yard" || w.rng() < 0.7) {
      const lane = w.rng() < 0.5 ? 1 : -1
      const spread = w.ground === "timber" ? 14 : w.ground === "yard" ? 6 : 28
      const along = (w.rng() * 2 - 1) * (w.ground === "yard" ? 70 : 36)
      const perp = lane * (w.ground === "yard" ? 14 : 18) + (w.rng() * 2 - 1) * spread
      x = c * along - s * perp
      y = s * along + c * perp
    } else {
      x = (w.rng() * 2 - 1) * 110
      y = (w.rng() * 2 - 1) * 110
    }
    if (!onSegment(x, y, w, 90)) continue
    if (Math.hypot(x, y) < 6) continue
    if (!clearMark(w, x, y)) continue
    if (w.ground === "bog" && w.marshes.some((m) => Math.hypot(m.x - x, m.y - y) < m.r + 2)) continue
    return { x, y }
  }
  return null
}

// ponytail: full rebuild each tick. Hostile cap is 36; widen cells if that cap moves.
function rebuild(w: World) {
  w.hash.clear()
  for (const b of w.bodies) {
    if (!b.alive) continue
    const k = `${Math.floor(b.x / CELL)},${Math.floor(b.y / CELL)}`
    const list = w.hash.get(k)
    if (list) list.push(b)
    else w.hash.set(k, [b])
  }
}

function nearest(
  w: World,
  b: Body,
  reach: number,
  pred: (o: Body) => boolean,
): Body | null {
  const x0 = Math.floor((b.x - reach) / CELL)
  const x1 = Math.floor((b.x + reach) / CELL)
  const y0 = Math.floor((b.y - reach) / CELL)
  const y1 = Math.floor((b.y + reach) / CELL)
  let best: Body | null = null
  let bestD = reach
  for (let ix = x0; ix <= x1; ix++) {
    for (let iy = y0; iy <= y1; iy++) {
      const list = w.hash.get(`${ix},${iy}`)
      if (!list) continue
      for (const o of list) {
        if (o.id === b.id || !o.alive || !pred(o)) continue
        const d = Math.hypot(o.x - b.x, o.y - b.y)
        if (d <= b.radius + o.radius + reach && d < bestD) {
          bestD = d
          best = o
        }
      }
    }
  }
  return best
}

function shuffle<T>(rng: () => number, arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}
