import type { Pose } from "./sprites"

export type FootMode = "idle" | "move" | "deploy" | "fire" | "stun" | "crawl"

/** View-local foot motion. Sim stays headless; cache is keyed by body id. */
export type FootAnim = {
  mode: FootMode
  pose: Pose
  torso: Pose
  legs: Pose
  dx: number
  dy: number
  headDx: number
  headDy: number
  coatDx: number
  legsDx: number
  legsDy: number
  gunDx: number
  gunDy: number
  aimAng: number | null
  showHead: boolean
  showLegs: boolean
  showGun: boolean
  soft: SoftDraw | null
}

export type SoftDraw = {
  color: string
  tip: string
  chains: { x: number; y: number }[][]
}

export type FootHold = { x: number; y: number; r: number }

/** Optional tip seek target (nearest foe) for soft modules. */
export type SoftSeek = { x: number; y: number }

type Pt = { x: number; y: number; px: number; py: number }

type SoftGoal = "trail" | "cover" | "seek" | "billow" | "root" | "gait" | "hover"

type SoftSpec = {
  count: number
  segs: number
  rest: number
  color: string
  tip: string
  ay: number
  spread: number
  grav: number
  goal: SoftGoal
}

/** Stretch release when tip–root length exceeds rest×(segs−1)×k. */
const STRETCH_K = 1.35
const PLANT_SNAP = 0.14
const FOOT_REST = 0.4
const FOOT_STRETCH_K = 1.4
const FOOT_SNAP = 0.12

const BRACE: SoftSpec = {
  count: 1,
  segs: 3,
  rest: 0.3,
  color: "#3a342e",
  tip: "#2a2620",
  ay: 0.05,
  spread: 0,
  grav: 0.45,
  goal: "cover",
}

// Soft only for bodies whose stamp does not already read as whole — hover/billow/trail
// tips floated as detached pixels beside drones and walkers (color was irrelevant).
const SOFT: Record<string, SoftSpec> = {
  coil: { count: 1, segs: 5, rest: 0.38, color: "#2a3838", tip: "#6e6e6e", ay: 0, spread: 0, grav: 0.35, goal: "seek" },
  reach: { count: 2, segs: 5, rest: 0.5, color: "#24302c", tip: "#5a6a64", ay: 0.15, spread: 0.7, grav: 0.55, goal: "seek" },
  bloom: { count: 3, segs: 4, rest: 0.36, color: "#3a3832", tip: "#5a564e", ay: -0.05, spread: 1.1, grav: 0.55, goal: "root" },
  post: { count: 2, segs: 4, rest: 0.38, color: "#2a2820", tip: "#8a8680", ay: 0.1, spread: 0.8, grav: 0.5, goal: "root" },
}

/** No biped plant — hover / cloud / roll / rooted post. Soft may still run. */
const NO_FEET = new Set([
  "drone",
  "scoot",
  "kite",
  "fog",
  "copter",
  "hawk",
  "mid",
  "gunboat",
  "gunship",
  "rocket",
  "bomber",
  "cluster",
  "ball",
  "post",
])

type SoftChain = {
  pts: Pt[]
  plant: { x: number; y: number } | null
}

type FootSide = {
  plant: { x: number; y: number } | null
  tipX: number
  tipY: number
}

type Slot = {
  x: number
  y: number
  dist: number
  lean: number
  recoil: number
  fireKick: number
  fired: number
  hp: number
  stun: number
  lookX: number
  lookY: number
  holdLift: number
  holdSide: number
  soft: SoftChain[] | null
  brace: SoftChain[] | null
  feet: [FootSide, FootSide] | null
  chestX: number
  chestY: number
  headLagX: number
  headLagY: number
  impulseX: number
  impulseY: number
  breathT: number
}

const slots = new Map<number, Slot>()
const last = new Map<number, FootAnim>()
const turrets = new Map<number, number>()
const hullSlots = new Map<number, { hdg: number; bob: number; lean: number }>()

const STRIDE = 0.55
const LEAN_MAX = 1
const BOB = 0.65
const RECOIL_PEAK = 1.4
const RECOIL_DECAY = 11
const SOFT_DAMP = 0.86

type Part = { id: string; on: boolean }

type BodyIn = {
  id: number
  kind: string
  x: number
  y: number
  face: number
  hdg: number
  vel: number
  moved: boolean
  fired: number
  hp: number
  mobileFire: boolean
  deployNeed: number
  deploy: number
  stun: number
  parts: Part[]
  side: string
}

export function footAnim(
  b: BodyIn,
  dt: number,
  aim: number,
  holds: FootHold[] = [],
  seek: SoftSeek | null = null,
): FootAnim {
  let s = slots.get(b.id)
  if (!s) {
    s = {
      x: b.x,
      y: b.y,
      dist: (b.id % 7) * 0.13,
      lean: 0,
      recoil: 0,
      fireKick: 0,
      fired: b.fired,
      hp: b.hp,
      stun: b.stun,
      lookX: 0,
      lookY: 0,
      holdLift: 0,
      holdSide: 0,
      soft: null,
      brace: null,
      feet: null,
      chestX: 0,
      chestY: 0,
      headLagX: 0,
      headLagY: 0,
      impulseX: 0,
      impulseY: 0,
      breathT: (b.id % 11) * 0.7,
    }
    slots.set(b.id, s)
  }

  const step = Math.hypot(b.x - s.x, b.y - s.y)
  s.x = b.x
  s.y = b.y
  if (b.moved && step > 0) s.dist += step

  if (b.fired > s.fired) {
    s.recoil = RECOIL_PEAK
    s.fireKick = 1
    s.fired = b.fired
    s.impulseX -= Math.cos(aim) * 1.2
    s.impulseY += Math.sin(aim) * 1.2
  } else {
    s.recoil = Math.max(0, s.recoil - RECOIL_DECAY * dt)
    s.fireKick = Math.max(0, s.fireKick - dt * 8)
  }

  if (b.hp < s.hp) {
    const dmg = Math.min(24, s.hp - b.hp)
    const kick = Math.min(2.2, 0.35 + dmg * 0.12)
    s.impulseX -= Math.cos(b.hdg) * kick
    s.impulseY += Math.sin(b.hdg) * kick * 0.6 + kick * 0.35
  }
  s.hp = b.hp
  if (b.stun > 0 && s.stun <= 0) {
    s.impulseX += (b.face < 0 ? -1 : 1) * 1.4
    s.impulseY += 0.8
  }
  s.stun = b.stun

  s.impulseX *= Math.max(0, 1 - dt * 9)
  s.impulseY *= Math.max(0, 1 - dt * 9)
  if (Math.abs(s.impulseX) < 0.02) s.impulseX = 0
  if (Math.abs(s.impulseY) < 0.02) s.impulseY = 0

  const legsOn = b.parts.filter((p) => p.id === "leg" && p.on).length
  const hasLegPart = b.parts.some((p) => p.id === "leg")
  const legCount = hasLegPart ? legsOn : 2
  const armsOn = b.parts.some((p) => p.id === "arm" && p.on) || !b.parts.some((p) => p.id === "arm")
  const crawl = hasLegPart && legCount === 0
  const limp = hasLegPart && legCount === 1
  const liveLeg = limp ? (b.parts.findIndex((p) => p.id === "leg" && p.on) === 0 ? 0 : 1) : -1

  const deploying = !b.mobileFire && b.deployNeed > 0 && b.deploy > 0.05 && !b.moved
  const stunned = b.stun > 0
  const firing = s.fireKick > 0.15

  let mode: FootMode = "idle"
  if (stunned) mode = "stun"
  else if (crawl) mode = "crawl"
  else if (deploying) mode = "deploy"
  else if (firing && !b.moved) mode = "fire"
  else if (b.moved) mode = "move"

  const strideMul = limp ? 0.7 : crawl ? 0.45 : mode === "deploy" || mode === "stun" ? 0 : 1
  const speed = b.moved ? Math.max(b.vel, step / Math.max(dt, 1 / 120)) : 0
  let wantLean = speed > 0.4 ? LEAN_MAX : 0
  if (limp) wantLean += 0.6
  if (mode === "stun") wantLean = 1.2
  if (mode === "crawl") wantLean = 0.3
  s.lean += (wantLean - s.lean) * Math.min(1, dt * 8)

  const fx = Math.cos(aim) * (b.face < 0 ? -1 : 1)
  const wantLookX = mode === "stun" ? 0 : fx > 0.35 ? 1 : fx < -0.35 ? -1 : 0
  const wantLookY = mode === "stun" ? 1 : Math.sin(aim) > 0.35 ? -1 : Math.sin(aim) < -0.35 ? 1 : 0
  s.lookX += (wantLookX - s.lookX) * Math.min(1, dt * (mode === "fire" ? 10 : 6))
  s.lookY += (wantLookY - s.lookY) * Math.min(1, dt * (mode === "fire" ? 10 : 6))

  const hold = nearestHold(b.x, b.y, holds)
  let wantLift = 0
  let wantSide = 0
  if (hold && mode !== "stun" && mode !== "crawl") {
    const dx = hold.x - b.x
    const dy = hold.y - b.y
    const d = Math.hypot(dx, dy) || 0.0001
    const edge = d - hold.r
    wantLift = edge < 0.15 ? 1 : edge < 0.55 ? 0.5 : 0
    if (mode === "idle" || mode === "deploy" || mode === "fire") wantLift = Math.max(wantLift, edge < 0.4 ? 0.7 : 0)
    const localX = dx * (b.face < 0 ? -1 : 1)
    wantSide = Math.abs(localX) > 0.12 ? (localX > 0 ? 1 : -1) : 0
  }
  s.holdLift += (wantLift - s.holdLift) * Math.min(1, dt * 7)
  s.holdSide += (wantSide - s.holdSide) * Math.min(1, dt * 6)

  const phase = s.dist * STRIDE * strideMul + b.id * 0.17
  const gait = phase % 1

  let pose: Pose = "idle"
  let torso: Pose = "idle"
  let legs: Pose = "idle"
  if (mode === "deploy") {
    pose = "dep"
    torso = "dep"
    legs = "dep"
  } else if (mode === "stun" || mode === "crawl") {
    pose = "idle"
    torso = "idle"
    legs = "idle"
  } else if (mode === "move" || (mode === "fire" && b.moved)) {
    pose = gait < 0.5 ? "walk" : "idle"
    torso = "idle"
    legs = limp ? (gait < 0.65 ? "walk" : "idle") : gait < 0.5 ? "walk" : "idle"
  } else if (mode === "fire") {
    pose = "idle"
    torso = "idle"
    legs = "idle"
  }

  // Soft hangers + biped feet together (except air / roll / cloud / post).
  const useFeet = !crawl && !NO_FEET.has(b.kind)
  const feet = useFeet ? stepFeet(s, b, dt, hold, mode, gait, limp, liveLeg) : null
  if (!useFeet) s.feet = null

  const strideBob =
    mode === "move" || (b.moved && mode !== "stun")
      ? -Math.abs(Math.sin(gait * Math.PI * 2)) * BOB * (limp ? 0.7 : 1)
      : mode === "crawl"
        ? -0.3
        : 0

  s.breathT += dt * (mode === "move" ? 9 : 3.2)
  const breath =
    mode === "stun" || mode === "crawl" || mode === "move" ? 0 : Math.sin(s.breathT) * 0.35

  const faceSign = b.face < 0 ? -1 : 1
  const plantLean = feet ? feet.lean * faceSign : 0
  const hdgBias = Math.cos(b.hdg) * 0.35
  const kickX = Math.cos(aim) * s.recoil * 0.55
  const kickY = -Math.sin(aim) * s.recoil * 0.55

  const wantChestX =
    (s.lean + hdgBias + plantLean) * faceSign - kickX * faceSign + s.impulseX * faceSign + s.holdSide * 0.25
  const wantChestY =
    strideBob - Math.abs(kickY) - s.holdLift + breath + s.impulseY + (mode === "stun" ? 1 : 0) + (mode === "crawl" ? 1 : 0)
  s.chestX += (wantChestX - s.chestX) * Math.min(1, dt * 14)
  s.chestY += (wantChestY - s.chestY) * Math.min(1, dt * 14)

  const wantHeadX = s.lookX + s.chestX * 0.35 + (mode === "stun" ? faceSign : 0)
  const wantHeadY = s.lookY + breath * 0.5 + (mode === "crawl" ? 1 : 0) + s.chestY * 0.15
  s.headLagX += (wantHeadX - s.headLagX) * Math.min(1, dt * 8)
  s.headLagY += (wantHeadY - s.headLagY) * Math.min(1, dt * 8)

  const dx = Math.round(s.chestX)
  const dy = Math.round(s.chestY)
  const headDx = Math.round(s.headLagX - s.chestX * 0.2)
  const headDy = Math.round(s.headLagY - s.chestY * 0.15)
  const coatDx = Math.round(
    s.holdSide * 0.35 + (limp ? faceSign * 0.5 : 0) + (mode === "stun" ? faceSign : 0) + plantLean * 0.4 + s.chestX * 0.15,
  )

  // Gait is the walk/idle stamp swap only. Sliding the legs layer ±1px on a
  // 13px figure reads as slapstick (especially with coat/leg keys split).
  let legsDx = 0
  let legsDy = 0
  if (mode === "crawl") legsDy = -1
  else if (mode === "stun") legsDy = 1
  else if (limp && mode === "move") legsDx = faceSign // slight drag, not a stride slide


  const showHead = !b.parts.some((p) => p.id === "head") || b.parts.some((p) => p.id === "head" && p.on)
  const showLegs = !crawl && (!hasLegPart || legCount > 0)
  const showGun = armsOn && mode !== "stun" && mode !== "crawl"

  const creature = runSoft(s, "soft", SOFT[b.kind] ?? null, b, dt, hold, seek, mode, gait)
  const wantBrace =
    armsOn &&
    hold &&
    !crawl &&
    mode !== "stun" &&
    mode !== "move" &&
    (mode === "idle" || mode === "deploy" || mode === "fire") &&
    s.holdLift > 0.25
  const brace = wantBrace ? runSoft(s, "brace", BRACE, b, dt, hold, seek, mode, gait) : null
  if (!wantBrace) s.brace = null
  const soft = mergeSoft(creature, brace)

  const out: FootAnim = {
    mode,
    pose,
    torso,
    legs,
    dx,
    dy,
    headDx,
    headDy,
    coatDx,
    legsDx,
    legsDy,
    gunDx: 0,
    gunDy: mode === "fire" ? -Math.round(s.recoil * 0.3) : 0,
    aimAng: showGun ? aim : null,
    showHead,
    showLegs,
    showGun,
    soft,
  }
  last.set(b.id, out)
  return out
}

function mergeSoft(a: SoftDraw | null, b: SoftDraw | null): SoftDraw | null {
  if (!a) return b
  if (!b) return a
  return { color: a.color, tip: a.tip, chains: a.chains.concat(b.chains) }
}

function nearestHold(x: number, y: number, holds: FootHold[]): FootHold | null {
  let best: FootHold | null = null
  let bestD = 1.35
  for (const h of holds) {
    const d = Math.hypot(h.x - x, h.y - y)
    if (d < bestD && d < h.r + 0.85) {
      bestD = d
      best = h
    }
  }
  return best
}

/** Biped plant loop → layer offsets. Stretch release. */
function stepFeet(
  s: Slot,
  b: BodyIn,
  dt: number,
  hold: FootHold | null,
  mode: FootMode,
  gait: number,
  limp: boolean,
  liveLeg: number,
): { lean: number; legsDx: number; legsDy: number } {
  const gdt = Math.min(0.05, Math.max(0, dt))
  const fx = Math.cos(b.hdg)
  const fy = Math.sin(b.hdg)
  const px = -fy
  const py = fx
  const maxLen = FOOT_REST * FOOT_STRETCH_K

  if (!s.feet) {
    s.feet = [
      { plant: null, tipX: b.x - px * 0.15, tipY: b.y - py * 0.15 },
      { plant: null, tipX: b.x + px * 0.15, tipY: b.y + py * 0.15 },
    ]
  }

  let lean = 0
  let legsDx = 0
  let legsDy = 0
  const brace = hold && (mode === "idle" || mode === "deploy" || mode === "fire")

  for (let i = 0; i < 2; i++) {
    const foot = s.feet[i]
    const side = i === 0 ? -1 : 1
    if (limp && liveLeg >= 0 && i !== liveLeg) {
      foot.plant = null
      foot.tipX += (b.x - foot.tipX) * Math.min(1, gdt * 8)
      foot.tipY += (b.y - foot.tipY) * Math.min(1, gdt * 8)
      continue
    }
    if (mode === "stun") {
      foot.plant = null
      continue
    }

    const phase = gait * Math.PI * 2 + i * Math.PI
    const down = Math.sin(phase) > 0
    let tx = b.x + px * side * 0.18
    let ty = b.y + py * side * 0.18
    if (mode === "move") {
      const reach = down ? 0.28 : 0.08
      tx = b.x + fx * reach + px * side * 0.16
      ty = b.y + fy * reach + py * side * 0.16
    } else if (brace && hold) {
      tx = hold.x + px * side * 0.1
      ty = hold.y + py * side * 0.1
    }

    if (foot.plant) {
      const stretch = Math.hypot(foot.plant.x - b.x, foot.plant.y - b.y)
      if (stretch > maxLen || (mode === "move" && !down && stretch > FOOT_REST * 1.05)) {
        foot.tipX = foot.plant.x
        foot.tipY = foot.plant.y
        foot.plant = null
      }
    }

    if (foot.plant) {
      const lx = (foot.plant.x - b.x) * (b.face < 0 ? -1 : 1)
      lean += side * 0.35
      legsDx += lx > 0.08 ? 1 : lx < -0.08 ? -1 : 0
      if (s.holdLift > 0.4) legsDy = -1
    } else {
      foot.tipX += (tx - foot.tipX) * Math.min(1, gdt * 10)
      foot.tipY += (ty - foot.tipY) * Math.min(1, gdt * 10)
      const d = Math.hypot(foot.tipX - tx, foot.tipY - ty)
      const canPlant = mode === "move" ? down : mode !== "crawl"
      if (canPlant && d < FOOT_SNAP) {
        foot.plant = { x: tx, y: ty }
      }
      legsDx += Math.sin(phase) > 0.2 ? side : Math.sin(phase) < -0.2 ? -side : 0
    }
  }

  if (limp) lean += (liveLeg === 0 ? -1 : 1) * 0.5
  legsDx = Math.max(-1, Math.min(1, Math.round(legsDx / 2) + Math.round(s.holdSide)))
  if (mode === "crawl") legsDy = -1
  else if (mode === "stun") legsDy = 1
  else if (s.holdLift > 0.4) legsDy = -1
  else legsDy = Math.max(-1, Math.min(0, legsDy))

  return { lean, legsDx, legsDy }
}

function candidateFor(
  goal: SoftGoal,
  b: BodyIn,
  hold: FootHold | null,
  seek: SoftSeek | null,
  c: number,
  gait: number,
): { x: number; y: number } | null {
  if (goal === "billow" || goal === "hover") return null
  if (goal === "seek") return seek
  if (goal === "root") return hold && !b.moved ? { x: hold.x, y: hold.y } : null
  if (goal === "cover") return hold ? { x: hold.x, y: hold.y } : null
  if (goal === "trail") {
    if (!hold) return null
    if (Math.hypot(hold.x - b.x, hold.y - b.y) > hold.r + 0.45) return null
    return { x: hold.x, y: hold.y }
  }
  if (goal === "gait") {
    const phase = gait * Math.PI * 2 + c * Math.PI
    const side = c === 0 ? -1 : 1
    const fx = Math.cos(b.hdg)
    const fy = Math.sin(b.hdg)
    const px = -fy
    const py = fx
    if (hold && Math.hypot(hold.x - b.x, hold.y - b.y) < hold.r + 0.7) {
      return { x: hold.x + px * side * 0.12, y: hold.y + py * side * 0.12 }
    }
    const reach = Math.sin(phase) > 0 ? 0.22 : 0.06
    return { x: b.x + fx * reach + px * side * 0.2, y: b.y + fy * reach + py * side * 0.2 }
  }
  return null
}

function runSoft(
  s: Slot,
  key: "soft" | "brace",
  base: SoftSpec | null,
  b: BodyIn,
  dt: number,
  hold: FootHold | null,
  seek: SoftSeek | null,
  mode: FootMode,
  gait: number,
): SoftDraw | null {
  if (!base) {
    if (key === "soft") s.soft = null
    else s.brace = null
    return null
  }
  const speed = b.moved ? Math.max(0.2, b.vel) : 0
  const rest =
    base.goal === "billow" || base.goal === "hover"
      ? base.rest * (1 + Math.min(0.8, speed * 0.12))
      : base.rest
  let grav = base.grav
  if (base.goal === "billow" && !b.moved) grav -= 0.15
  if (base.goal === "root" && !b.moved) grav += 0.2
  if (base.goal === "hover") grav -= Math.min(0.2, speed * 0.03)
  const count = base.count
  const maxLen = rest * (base.segs - 1) * STRETCH_K

  let store = key === "soft" ? s.soft : s.brace
  const trail = b.hdg + Math.PI
  if (!store || store.length !== count || store[0]?.pts.length !== base.segs) {
    store = []
    for (let c = 0; c < count; c++) {
      const ang = trail + (count === 1 ? 0 : (c / Math.max(1, count - 1) - 0.5) * base.spread)
      const pts: Pt[] = []
      for (let i = 0; i < base.segs; i++) {
        const x = b.x + Math.cos(ang) * rest * i
        const y = b.y + Math.sin(ang) * rest * i + base.ay
        pts.push({ x, y, px: x, py: y })
      }
      store.push({ pts, plant: null })
    }
    if (key === "soft") s.soft = store
    else s.brace = store
  }

  const gdt = Math.min(0.05, Math.max(0, dt))
  const chains: { x: number; y: number }[][] = []
  for (let c = 0; c < count; c++) {
    const chain = store[c]
    if (!chain) continue
    const ang = trail + (count === 1 ? 0 : (c / Math.max(1, count - 1) - 0.5) * base.spread)
    let ax = b.x + Math.cos(ang) * 0.15
    let ay = b.y + base.ay
    if (base.goal === "gait") {
      const phase = gait * Math.PI * 2 + c * Math.PI
      ax = b.x + Math.cos(b.hdg + Math.PI / 2) * (c === 0 ? -0.2 : 0.2)
      ay = b.y - 0.05 + Math.sin(phase) * 0.08
    } else if (base.goal === "hover") {
      const phase = s.breathT * 1.7 + c * 2.1 + b.id * 0.3
      ax = b.x + Math.cos(phase) * 0.12 * (c === 0 ? -1 : 1)
      ay = b.y + base.ay + Math.sin(phase * 1.3) * 0.06
    } else if (base.goal === "cover") {
      ax = b.x + Math.cos(b.hdg + Math.PI / 2) * (b.face < 0 ? -0.12 : 0.12)
      ay = b.y + 0.05
    }
    const pts = chain.pts
    pts[0].px = pts[0].x
    pts[0].py = pts[0].y
    pts[0].x = ax
    pts[0].y = ay
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i]
      const vx = (p.x - p.px) * SOFT_DAMP
      const vy = (p.y - p.py) * SOFT_DAMP
      p.px = p.x
      p.py = p.y
      p.x += vx
      p.y += vy + grav * gdt
      if (base.goal === "billow" && b.moved) {
        p.x += Math.cos(trail) * speed * gdt * 0.08
        p.y += Math.sin(trail) * speed * gdt * 0.08
      }
    }

    const tip = pts[pts.length - 1]
    const cand = candidateFor(base.goal, b, hold, seek, c, gait)

    if (chain.plant) {
      tip.x = chain.plant.x
      tip.y = chain.plant.y
      const stretch = Math.hypot(tip.x - ax, tip.y - ay)
      if (
        stretch > maxLen ||
        mode === "stun" ||
        (base.goal === "root" && b.moved) ||
        (base.goal === "seek" && !seek) ||
        (base.goal === "cover" && !hold)
      ) {
        chain.plant = null
      }
    }

    if (!chain.plant && cand && mode !== "stun") {
      const pull =
        base.goal === "seek" ? 5 : base.goal === "root" || base.goal === "cover" ? 6 : base.goal === "gait" ? 7 : 4
      tip.x += (cand.x - tip.x) * Math.min(1, gdt * pull)
      tip.y += (cand.y - tip.y) * Math.min(1, gdt * pull)
      if (Math.hypot(tip.x - cand.x, tip.y - cand.y) < PLANT_SNAP) {
        chain.plant = { x: cand.x, y: cand.y }
        tip.x = cand.x
        tip.y = cand.y
      }
    } else if (!chain.plant && base.goal === "billow" && !b.moved) {
      tip.y += 0.25 * Math.min(1, gdt * 2)
    } else if (!chain.plant && base.goal === "hover") {
      const phase = s.breathT * 2.2 + c * 1.7
      const hx = b.x + Math.cos(phase) * rest * (base.segs - 1) * 0.55
      const hy = b.y + base.ay + Math.sin(phase * 0.9) * rest * 0.4
      tip.x += (hx - tip.x) * Math.min(1, gdt * 3)
      tip.y += (hy - tip.y) * Math.min(1, gdt * 3)
    }

    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const p = pts[i]
        const dx = p.x - a.x
        const dy = p.y - a.y
        const d = Math.hypot(dx, dy) || 0.0001
        const f = (d - rest) / d
        p.x -= dx * f
        p.y -= dy * f
      }
      pts[0].x = ax
      pts[0].y = ay
      if (chain.plant) {
        tip.x = chain.plant.x
        tip.y = chain.plant.y
      }
    }
    chains.push(pts.map((p) => ({ x: p.x, y: p.y })))
  }
  return { color: base.color, tip: base.tip, chains }
}

export function lastFoot(id: number): FootAnim | null {
  return last.get(id) ?? null
}

/** Ease turret angle toward want (world radians). */
export function turretAim(id: number, want: number, dt: number): number {
  let cur = turrets.get(id)
  if (cur === undefined) {
    turrets.set(id, want)
    return want
  }
  let d = want - cur
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  cur += d * Math.min(1, dt * 7)
  turrets.set(id, cur)
  return cur
}

export type HullMotion = { bob: number; lean: number }

/** Suspension bob + turn lean for crewed hulls. */
export function hullMotion(b: { id: number; hdg: number; vel: number; moved: boolean }, dt: number): HullMotion {
  let s = hullSlots.get(b.id)
  if (!s) {
    s = { hdg: b.hdg, bob: 0, lean: 0 }
    hullSlots.set(b.id, s)
  }
  let dH = b.hdg - s.hdg
  while (dH > Math.PI) dH -= Math.PI * 2
  while (dH < -Math.PI) dH += Math.PI * 2
  s.hdg = b.hdg
  const spd = Math.abs(b.vel)
  const wantBob = b.moved && spd > 0.4 ? Math.min(2, spd * 0.15) : 0
  const wantLean = Math.max(-1.5, Math.min(1.5, dH * 18))
  s.bob += (wantBob - s.bob) * Math.min(1, dt * 8)
  s.lean += (wantLean - s.lean) * Math.min(1, dt * 6)
  return { bob: s.bob, lean: s.lean }
}

export function pruneAnim(live: Set<number>) {
  for (const id of slots.keys()) if (!live.has(id)) slots.delete(id)
  for (const id of last.keys()) if (!live.has(id)) last.delete(id)
  for (const id of turrets.keys()) if (!live.has(id)) turrets.delete(id)
  for (const id of hullSlots.keys()) if (!live.has(id)) hullSlots.delete(id)
}

const cableSlots = new Map<string, Pt[]>()

export function swayCable(
  key: string,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  dt: number,
  segs = 5,
): { x: number; y: number }[] {
  const n = Math.max(3, segs)
  let pts = cableSlots.get(key)
  const span = Math.hypot(bx - ax, by - ay)
  const rest = (span / Math.max(1, n - 1)) * 1.1
  if (!pts || pts.length !== n) {
    pts = []
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const x = ax + (bx - ax) * t
      const y = ay + (by - ay) * t
      pts.push({ x, y, px: x, py: y })
    }
    cableSlots.set(key, pts)
  }

  const lastI = n - 1
  pts[0].x = ax
  pts[0].y = ay
  pts[0].px = ax
  pts[0].py = ay
  pts[lastI].px = pts[lastI].x
  pts[lastI].py = pts[lastI].y
  pts[lastI].x = bx
  pts[lastI].y = by

  const gdt = Math.min(0.05, Math.max(0, dt))
  for (let i = 1; i < lastI; i++) {
    const p = pts[i]
    const vx = (p.x - p.px) * 0.88
    const vy = (p.y - p.py) * 0.88
    p.px = p.x
    p.py = p.y
    p.x += vx
    p.y += vy + 55 * gdt
  }

  for (let pass = 0; pass < 3; pass++) {
    for (let i = 1; i < n; i++) {
      const a = pts[i - 1]
      const p = pts[i]
      const dx = p.x - a.x
      const dy = p.y - a.y
      const d = Math.hypot(dx, dy) || 0.0001
      const f = (d - rest) / d
      if (i === 1) {
        p.x -= dx * f
        p.y -= dy * f
      } else if (i === lastI) {
        a.x += dx * f
        a.y += dy * f
      } else {
        p.x -= dx * f * 0.5
        p.y -= dy * f * 0.5
        a.x += dx * f * 0.5
        a.y += dy * f * 0.5
      }
    }
    pts[0].x = ax
    pts[0].y = ay
    pts[lastI].x = bx
    pts[lastI].y = by
  }

  return pts.map((p) => ({ x: p.x, y: p.y }))
}

export function pruneCables(live: Set<string>) {
  for (const k of cableSlots.keys()) if (!live.has(k)) cableSlots.delete(k)
}
