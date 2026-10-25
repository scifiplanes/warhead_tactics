import { card } from "../content/catalog"
import { BEAM_ARC, BEAM_R, CRAFT_WAIT, FLARE_ARM, FLARE_R, GAP_MAX, PATH_HOLD, beams, daylight, trackerTargets, type Body, type Burst, type Flash, type Inbound, type World } from "../sim/world"
import {
  footAnim,
  hullMotion,
  lastFoot,
  pruneAnim,
  pruneCables,
  swayCable,
  turretAim,
  type FootAnim,
  type FootHold,
  type SoftDraw,
} from "./anim"
import {
  actor,
  canLayer,
  cargo,
  drawLayered,
  groundTile,
  gunTipAt,
  icon,
  limbSprite,
  octo,
  scenery,
  vehicleArt,
  type Kit,
} from "./sprites"

function kitOf(b: { gears: string[] }): Kit {
  let primary: string | undefined
  let secondary: string | undefined
  const bits: string[] = []
  for (const id of b.gears) {
    const c = card(id)
    if (c.gun) {
      if (c.hand === "secondary") secondary ??= id
      else primary ??= id
    } else if (c.slot) bits.push(id)
  }
  return { gun: primary ?? secondary ?? "rifle", bits }
}

export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  tint: Burst["tint"]
}

const TINT: Record<Burst["tint"], string> = {
  blood: "#a32020",
  oxide: "#8a5040",
  dust: "#3a3630",
  flash: "#e1c15a",
}

let buf: HTMLCanvasElement | null = null
let shade: HTMLCanvasElement | null = null
let mudScaled: HTMLCanvasElement | null = null
let mudPx = 0
let dither: CanvasPattern | null = null
const SCALES = [2, 4, 8] as const
const SIZES = [1, 2, 3, 4] as const
const PATTERNS = ["bayer", "lines", "noise", "check"] as const
const INKS = ["black", "white", "mud", "oxide"] as const
const BLENDS = ["over", "mul", "add"] as const
const LAYERS = ["top", "ground"] as const
type Scale = (typeof SCALES)[number]
type Size = (typeof SIZES)[number]
type PatternKind = (typeof PATTERNS)[number]
type Ink = (typeof INKS)[number]
type Blend = (typeof BLENDS)[number]
type Layer = (typeof LAYERS)[number]
export type Dither = {
  on: boolean
  alpha: number
  cut: number
  scale: Scale
  size: Size
  levels: number
  spread: number
  pattern: PatternKind
  ink: Ink
  blend: Blend
  layer: Layer
}
const ditherSet: Dither = {
  on: true,
  alpha: 0.31,
  cut: 4,
  scale: 8,
  size: 1,
  levels: 32,
  spread: 1,
  pattern: "bayer",
  ink: "mud",
  blend: "over",
  layer: "top",
}
const INK: Record<Ink, string> = { black: "#0c0b09", white: "#a8a49c", mud: "#2e2a24", oxide: "#8a5040" }
const COMP: Record<Blend, GlobalCompositeOperation> = { over: "source-over", mul: "multiply", add: "lighter" }

export function ditherPrefs(): Dither {
  return { ...ditherSet }
}

function oneOf<T extends string | number>(v: unknown, ok: readonly T[]): T | undefined {
  return ok.includes(v as T) ? (v as T) : undefined
}

export function setDither(next: Partial<Dither>) {
  if (next.on !== undefined) ditherSet.on = next.on
  if (next.alpha !== undefined) ditherSet.alpha = Math.max(0, Math.min(1, next.alpha))
  if (next.cut !== undefined) ditherSet.cut = Math.max(0, Math.min(16, next.cut | 0))
  const scale = oneOf(next.scale, SCALES)
  const size = oneOf(next.size, SIZES)
  const pattern = oneOf(next.pattern, PATTERNS)
  const ink = oneOf(next.ink, INKS)
  const blend = oneOf(next.blend, BLENDS)
  const layer = oneOf(next.layer, LAYERS)
  if (scale) ditherSet.scale = scale
  if (size) ditherSet.size = size
  if (next.levels !== undefined) ditherSet.levels = Math.max(0, Math.min(256, next.levels | 0))
  if (next.spread !== undefined) ditherSet.spread = Math.max(0, Math.min(1, next.spread))
  if (pattern) ditherSet.pattern = pattern
  if (ink) ditherSet.ink = ink
  if (blend) ditherSet.blend = blend
  if (layer) ditherSet.layer = layer
  dither = null
}
let vignette: CanvasGradient | null = null
let vigW = 0
let vigH = 0
let eased = 0

export function burstsToParticles(parts: Particle[], bursts: Burst[]) {
  for (const b of bursts) {
    const n = b.tint === "flash" ? 16 : 8
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 4 + Math.random() * 10
      const max = 0.28 + Math.random() * 0.35
      parts.push({
        x: b.x,
        y: b.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: max,
        max,
        size: b.tint === "flash" ? 2 : 1,
        tint: b.tint,
      })
    }
  }
  if (parts.length > 400) parts.splice(0, parts.length - 400)
}

function mudTile(zoom: number) {
  const n = Math.max(1, Math.round(16 * zoom))
  if (mudScaled && mudPx === n) return mudScaled
  mudScaled = document.createElement("canvas")
  mudScaled.width = n
  mudScaled.height = n
  const bg = mudScaled.getContext("2d")!
  bg.imageSmoothingEnabled = false
  bg.drawImage(groundTile(), 0, 0, n, n)
  mudPx = n
  return mudScaled
}

function paintGround(g: CanvasRenderingContext2D, bw: number, bh: number, cx: number, cy: number, zoom: number) {
  const tile = mudTile(zoom)
  const n = tile.width
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.imageSmoothingEnabled = false
  g.fillStyle = "#221e1a"
  g.fillRect(0, 0, bw, bh)
  const span = 16
  const originX = Math.round(bw / 2 - cx * zoom)
  const originY = Math.round(bh / 2 + cy * zoom)
  const reachX = bw / (2 * zoom) + span
  const reachY = bh / (2 * zoom) + span
  const k0 = Math.floor((cx - reachX) / span)
  const k1 = Math.ceil((cx + reachX) / span)
  const jTop = Math.ceil((cy + reachY) / span)
  const jBot = Math.floor((cy - reachY) / span)
  for (let j = jTop; j >= jBot; j--) {
    const sy = originY - j * n
    for (let k = k0; k <= k1; k++) g.drawImage(tile, originX + k * n, sy, n, n)
  }
}

export function draw(
  ctx: CanvasRenderingContext2D,
  w: World,
  width: number,
  height: number,
  parts: Particle[],
  dt: number,
) {
  const scale = width < 700 ? 3 : 4
  const bw = Math.max(160, Math.floor(width / scale))
  const bh = Math.max(120, Math.floor(height / scale))
  if (!buf) buf = document.createElement("canvas")
  if (buf.width !== bw || buf.height !== bh) {
    buf.width = bw
    buf.height = bh
    vignette = null
  }
  const g = buf.getContext("2d")
  if (!g) return
  g.imageSmoothingEnabled = false
  // Buffer blit is 1:1 native px — zoom only maps world→screen. Keep pre-pass bases
  // so stick travel (speed×zoom px/s) and field framing stay readable on mobile.
  const base = bw < 200 ? 4.5 : 6
  const open = Math.max(0, Math.min(1, w.gap / GAP_MAX))
  const target = base * (1 - 0.52 * open)
  if (!eased) eased = target
  eased += (target - eased) * Math.min(1, dt * 3.5)
  const zoom = eased
  const cam = cameraBody(w)
  const cx = cam?.x ?? w.ax
  const cy = cam?.y ?? w.ay
  const X = (x: number) => Math.round(bw / 2 + (x - cx) * zoom)
  const Y = (y: number) => Math.round(bh / 2 - (y - cy) * zoom)

  paintGround(g, bw, bh, cx, cy, zoom)
  if (ditherSet.on && ditherSet.layer === "ground") paintInk(g, bw, bh)

  g.fillStyle = "rgba(48,58,52,.55)"
  const viewX = bw / (2 * zoom) + 8
  const viewY = bh / (2 * zoom) + 8
  for (const m of w.marshes) {
    if (Math.abs(m.x - cx) > viewX || Math.abs(m.y - cy) > viewY) continue
    g.beginPath()
    g.ellipse(X(m.x), Y(m.y), m.r * zoom, m.r * zoom * 0.72, 0, 0, Math.PI * 2)
    g.fill()
  }

  for (const m of w.marks) paintMark(g, m, X, Y)
  // Remains are ground marks — under living bodies (and inside the grade pass).
  paintRemains(g, w, X, Y, zoom)

  for (const p of w.props) {
    if (Math.abs(p.x - cx) > viewX || Math.abs(p.y - cy) > viewY) continue
    const name = p.kind === "burnt_tree" ? "tree" : p.kind
    const spr = p.alive ? scenery(name, p.id) : scenery(p.kind === "burnt_tree" || p.kind === "post" ? "stump" : "rubble")
    if (!spr) continue
    // contact shadow under prop
    const px = X(p.x), py = Y(p.y)
    g.fillStyle = "rgba(10,8,6,0.22)"
    g.beginPath()
    g.ellipse(px, py, Math.max(3, Math.round(spr.width * 0.36)), Math.max(1, Math.round(spr.height * 0.14)), 0, 0, Math.PI * 2)
    g.fill()
    blit(g, spr, px, py)
  }

  for (const s of w.sleepers) {
    if (s.awake) continue
    if (Math.abs(s.x - cx) > viewX || Math.abs(s.y - cy) > viewY) continue
    const veh = vehicleArt(s.hull)
    const px = X(s.x)
    const py = Y(s.y)
    if (veh) {
      g.fillStyle = "rgba(10,8,6,0.22)"
      g.beginPath()
      g.ellipse(px, py, Math.round(veh.body.width * 0.36), Math.round(veh.body.height * 0.22), 0, 0, Math.PI * 2)
      g.fill()
      g.globalAlpha = 0.55
      g.drawImage(veh.body, px - veh.body.width / 2, py - veh.body.height / 2)
      g.globalAlpha = 1
      g.fillStyle = "#8a5040"
      g.fillRect(px - 1, py - veh.body.height / 2 - 2, 2, 2)
    } else {
      const spr = scenery("wreck", s.id)
      if (spr) blit(g, spr, px, py)
    }
  }

  for (const s of w.smokes) {
    g.fillStyle = "rgba(180,180,176,.28)"
    g.beginPath()
    g.arc(X(s.x), Y(s.y), s.r * zoom, 0, Math.PI * 2)
    g.fill()
  }

  for (const m of w.mines) {
    const spr = scenery("mine")
    if (spr) blit(g, spr, X(m.x), Y(m.y))
  }

  for (const d of w.drops) {
    if (d.kind === "loot") {
      paintCache(g, d.cardId, X(d.x), Y(d.y))
      continue
    }
    if (d.kind !== "gear") continue
    const fade = revealAlpha(w, 0, d.id)
    g.globalAlpha = fade < 1 ? fade : Math.floor(w.t * 4) % 2 === 0 ? 0.55 : 1
    const gx = X(d.x)
    const gy = Y(d.y)
    const mark = icon(d.cardId)
    if (d.skin === "item") {
      const spr = mark ?? scenery("crate")
      if (spr) blit(g, spr, gx, gy)
    } else {
      const box = scenery("crate")
      if (box) blit(g, box, gx, gy)
      if (mark) blit(g, mark, gx, gy - (box ? Math.max(4, (box.height / 2) | 0) : 6))
    }
    g.globalAlpha = 1
  }

  const bars: { x: number; y: number; hp: number | null; deploy: number | null }[] = []
  const bodies = w.bodies.filter((b) => b.boarded === null && b.alive).sort((a, c) => c.y - a.y)
  for (const b of bodies) {
    const x = X(b.x)
    const y = Y(b.y)
    g.globalAlpha = revealAlpha(w, b.id, 0)
    const lift = airLift(b)
    if (lift > 0) paintShadow(g, x, y, b)
    const veh = vehicleArt(b.kind)
    if (veh && lift === 0) {
      // ground contact shadow under hull
      g.fillStyle = "rgba(10,8,6,0.22)"
      g.beginPath()
      g.ellipse(x, y, Math.round(veh.body.width * 0.36), Math.round(veh.body.height * 0.22), 0, 0, Math.PI * 2)
      g.fill()
    }
    if (veh) {
      const hm = hullMotion(b, dt)
      g.save()
      g.translate(x, y - veh.body.height / 2 - lift - hm.bob)
      g.rotate(-b.hdg + hm.lean * 0.04)
      const hull = w.vision === "thermal" ? heatOf(veh.body) : veh.body
      g.drawImage(hull, -hull.width / 2, -hull.height / 2)
      const wheels = b.parts.filter((p) => p.id === "wheel" && !p.on).length
      if (wheels) {
        g.fillStyle = "#221e1a"
        g.fillRect(-6, veh.body.height / 2 - 4, wheels > 1 ? 12 : 4, 3)
      }
      if (b.parts.some((p) => p.id === "turret" && p.on)) {
        const want = aimOf(w, b.x, b.y)
        const aim = turretAim(b.id, want, dt)
        g.save()
        g.translate(veh.mount[0], veh.mount[1])
        g.rotate(aim + b.hdg)
        const tube = w.vision === "thermal" ? heatOf(veh.turret) : veh.turret
        g.drawImage(tube, -veh.pivot[0], -veh.pivot[1])
        g.restore()
      }
      g.restore()
    } else {
      const holds = lift > 0 ? [] : footholdsNear(w, b)
      const seek = softSeek(w, b)
      paintFoot(g, b, x, y, lift, zoom, footAnim(b, dt, b.hdg, holds, seek), w.vision === "thermal")
    }
    const deploy =
      !b.mobileFire && b.deployNeed > 0 && b.deploy < b.deployNeed ? Math.max(0, b.deploy / b.deployNeed) : null
    if (b.side === "player" || deploy !== null) {
      bars.push({ x, y: y - lift, hp: b.side === "player" ? Math.max(0, b.hp / b.maxHp) : null, deploy })
    }
    if (b.vehicle && b.seats > 0) {
      let n = 0
      for (const u of w.bodies) if (u.alive && u.boarded === b.id) n++
      const seats = Math.min(4, b.seats)
      for (let i = 0; i < seats; i++) {
        g.fillStyle = i < n ? "#a8a49c" : "#1a1612"
        g.fillRect(x - (seats * 3) / 2 + i * 3, y - 20, 2, 2)
      }
    }
    g.globalAlpha = 1
  }

  g.strokeStyle = "#d5d0c6"
  g.lineWidth = 1
  for (const s of w.shots) {
    g.globalAlpha = Math.max(0.2, s.life / 0.08)
    const lift = (s.lift || 0) * zoom
    const tip = s.from != null ? muzzleScreen(w, s.from, X, Y, zoom) : null
    const x0 = tip ? tip.x : X(s.x)
    const y0 = tip ? tip.y : Y(s.y) - 4 - lift
    g.beginPath()
    g.moveTo(x0, y0)
    g.lineTo(X(s.tx), Y(s.ty) - 4)
    g.stroke()
  }
  g.globalAlpha = 1

  for (const b of w.bolts) {
    g.fillStyle = b.side === "rust" ? "#8a5040" : "#a32020"
    g.fillRect(X(b.x) - 1, Y(b.y) - 4, 2, 2)
  }

  for (const lob of w.lobs) {
    const k = Math.min(1, lob.t / lob.T)
    const x = lob.x + (lob.tx - lob.x) * k
    const y = lob.y + (lob.ty - lob.y) * k
    const from = (lob.lift || 0) * zoom
    const arc = Math.sin(k * Math.PI) * (12 + from * 0.4)
    g.fillStyle = "#3a3a32"
    g.fillRect(X(x) - 1, Y(y) - from * (1 - k) - arc, 2, 2)
  }

  for (const s of w.strikes) {
    if (s.t > 0) continue
    g.fillStyle = "rgba(225,193,90,.28)"
    g.beginPath()
    g.arc(X(s.x), Y(s.y), 10, 0, Math.PI * 2)
    g.fill()
  }

  if (w.airMark && w.airMark.t > 0) {
    const mx = X(w.airMark.x)
    const my = Y(w.airMark.y)
    g.fillStyle = "#c4a060"
    g.fillRect(mx - 1, my - 4, 2, 8)
    g.fillRect(mx - 4, my - 1, 8, 2)
  }


  for (const p of parts) {
    p.life -= dt
    p.x += p.vx * dt
    p.y += p.vy * dt
  }
  for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1)
  for (const p of parts) {
    g.globalAlpha = Math.max(0, p.life / p.max)
    g.fillStyle = TINT[p.tint]
    // Hard pixel cores only (bible: soft bloom ≤2 px, keep contours).
    const s = Math.max(1, Math.min(3, p.size | 0))
    g.fillRect(X(p.x), Y(p.y), s, s)
  }
  g.globalAlpha = 1

  paintDrones(g, w, X, Y, dt)

  paintSky(g, w, bw, bh)
  paintNight(g, w, bw, bh, X, Y, zoom)
  // Beam glow sits on top of the field; redraw casters so the rifle still reads.
  for (const b of beams(w)) {
    if (b.vehicle || b.boarded !== null) continue
    const a = lastFoot(b.id) ?? footAnim(b, 0, b.hdg, footholdsNear(w, b), softSeek(w, b))
    paintFoot(g, b, X(b.x), Y(b.y), airLift(b), zoom, a, false)
  }

  const live = new Set<number>()
  for (const b of w.bodies) if (b.alive) live.add(b.id)
  pruneAnim(live)

  for (const s of w.passes) {
    const lead = s.t > 0 ? s.t * 10 : 0
    paintBird(g, X(s.x - s.hx * lead), Y(s.y - s.hy * lead), Math.atan2(s.hy, s.hx))
  }

  if (!vignette || vigW !== bw || vigH !== bh) {
    vignette = g.createRadialGradient(bw / 2, bh / 2, Math.min(bw, bh) * 0.35, bw / 2, bh / 2, Math.max(bw, bh) * 0.75)
    vignette.addColorStop(0, "rgba(0,0,0,0)")
    vignette.addColorStop(1, "rgba(0,0,0,.62)")
    vigW = bw
    vigH = bh
  }
  g.fillStyle = vignette
  g.fillRect(0, 0, bw, bh)

  if (ditherSet.on && ditherSet.levels >= 2) grade(g, bw, bh)

  paintBars(g, bars)

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(buf, 0, 0, width, height)
  if (ditherSet.on && ditherSet.layer === "top") {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.imageSmoothingEnabled = false
    paintInk(ctx, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()
  }
  paintTags(ctx, w, width, height, bw, bh, zoom, cx, cy)
  paintTracker(ctx, w, width, height, bw, bh, zoom, cx, cy)
  paintPins(ctx, w, width, height, bw, bh, zoom, cx, cy)
  paintSignals(ctx, w, width, height, bw, bh, zoom, cx, cy)
  // After grade/vignette so gold cores survive; CSS px so they read on phone.
  paintFlashes(ctx, w, width, height, bw, bh, zoom, cx, cy)
}

const CABLE = 7
const LIFT_T = 1.6
let liftWorld: World | null = null
let lastInbound: Inbound[] = []
let lifts: { x: number; y: number; w: number; h: number; t: number }[] = []

function cargoOf(w: World, f: Inbound) {
  const hero = w.heroes[f.cardId]
  if (hero) return cargo(hero.chassis)
  if (f.loot) return cargo(null)
  const kind = card(f.cardId).kind
  if (kind === "unit" || kind === "vehicle") return cargo(f.cardId)
  return cargo(f.cardId, true)
}

function paintDrone(
  g: CanvasRenderingContext2D,
  w: World,
  x: number,
  hook: number,
  span: number,
  ends: [number, number][],
  dt: number,
  keyBase: string,
  live: Set<string>,
) {
  const spr = octo(span, Math.floor(w.t * 20))
  g.drawImage(spr, Math.round(x - spr.width / 2), Math.round(hook - spr.height + 1))
  g.fillStyle = "#6a6860"
  ends.forEach(([ex, ey], i) => {
    const key = `${keyBase}:${i}`
    live.add(key)
    const pts = swayCable(key, x, hook, ex, ey, dt)
    for (let p = 1; p < pts.length; p++) {
      const a = pts[p - 1]
      const b = pts[p]
      const n = Math.max(1, Math.round(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y))))
      for (let k = 0; k <= n; k++) {
        g.fillRect(Math.round(a.x + ((b.x - a.x) * k) / n), Math.round(a.y + ((b.y - a.y) * k) / n), 1, 1)
      }
    }
  })
}

function paintDrones(g: CanvasRenderingContext2D, w: World, X: (x: number) => number, Y: (y: number) => number, dt: number) {
  if (liftWorld !== w) {
    liftWorld = w
    lastInbound = []
    lifts = []
  }
  for (const f of lastInbound) {
    if (w.inbound.includes(f) || !w.drops.some((d) => d.x === f.x && d.y === f.y)) continue
    const spr = cargoOf(w, f)
    lifts.push({ x: f.x, y: f.y, w: spr.width, h: spr.height, t: 0 })
  }
  lastInbound = [...w.inbound]
  for (const l of lifts) l.t += dt
  lifts = lifts.filter((l) => l.t < LIFT_T)

  const live = new Set<string>()
  for (const f of w.inbound) {
    const spr = cargoOf(w, f)
    const gx = X(f.x)
    const gy = Y(f.y)
    const alt = Math.round(f.t * 16)
    g.fillStyle = "rgba(0,0,0,.3)"
    g.fillRect(gx - 4 + Math.min(3, alt >> 4), gy, 8 - Math.min(6, alt >> 3), 1)
    blit(g, spr, gx, gy - alt)
    const top = gy - alt - spr.height + 2
    const half = Math.floor(spr.width / 2) - 1
    const key = `in:${f.cardId}:${f.x.toFixed(1)}:${f.y.toFixed(1)}`
    paintDrone(g, w, gx, top - CABLE, spr.width, [[gx - half, top], [gx + half, top]], dt, key, live)
  }

  for (let i = 0; i < lifts.length; i++) {
    const l = lifts[i]
    const k = l.t / LIFT_T
    const gx = X(l.x) + Math.round(k * k * 14)
    const hook = Y(l.y) - l.h + 2 - CABLE - Math.round(k * k * 60)
    g.globalAlpha = Math.max(0, 1 - k * k)
    paintDrone(g, w, gx, hook, l.w, [[gx - 1, hook + 4], [gx + 1, hook + 4]], dt, `lift:${i}:${l.x}:${l.y}`, live)
  }
  g.globalAlpha = 1
  pruneCables(live)
}

function airLift(b: { air: boolean; kind: string; vehicle: boolean }) {
  if (!b.air) return 0
  if (b.kind === "bomber") return 20
  if (b.kind === "rocket" || b.kind === "gunship") return 18
  if (b.kind === "gunboat" || b.kind === "copter") return 16
  return 14
}

function paintShadow(g: CanvasRenderingContext2D, x: number, y: number, b: { kind: string; radius: number }) {
  const rx = Math.max(4, Math.round(b.radius * 5 + 2))
  const ry = Math.max(2, Math.round(rx * 0.45))
  g.fillStyle = "rgba(10,8,6,0.38)"
  g.beginPath()
  g.ellipse(x + 1, y + 2, rx, ry, 0, 0, Math.PI * 2)
  g.fill()
}

function paintBars(g: CanvasRenderingContext2D, bars: { x: number; y: number; hp: number | null; deploy: number | null }[]) {
  for (const b of bars) {
    const dep = b.deploy !== null
    if (b.hp !== null) {
      const by = dep ? b.y - 11 : b.y - 9
      g.fillStyle = "#101010"
      g.fillRect(b.x - 4, by, 8, 1)
      g.fillStyle = hpColor(b.hp)
      g.fillRect(b.x - 4, by, Math.round(8 * b.hp), 1)
    }
    if (dep) {
      const k = Math.max(1, Math.round(8 * (b.deploy as number)))
      g.fillStyle = "#e8e2d0"
      g.fillRect(b.x - 4, b.y - 9, k, 1)
    }
  }
}

function paintBird(g: CanvasRenderingContext2D, x: number, y: number, ang: number) {
  g.save()
  g.translate(x, y)
  g.rotate(-ang)
  g.fillStyle = "#c8c4b8"
  g.fillRect(-10, -1, 20, 2)
  g.fillRect(-2, -6, 4, 8)
  g.restore()
}

function paintSky(g: CanvasRenderingContext2D, w: World, bw: number, bh: number) {
  const day = daylight(w.t + w.dayOff)
  if (w.weather === "fog") {
    g.fillStyle = "rgba(150,150,146,.22)"
    g.fillRect(0, 0, bw, bh)
  } else if (w.weather === "dust") {
    g.fillStyle = "rgba(90,70,40,.16)"
    g.fillRect(0, 0, bw, bh)
  } else if (w.weather === "rain" || w.weather === "snow") {
    g.fillStyle = "rgba(20,24,28,.12)"
    g.fillRect(0, 0, bw, bh)
  }
  const n = w.weather === "clear" ? 0 : 28
  g.fillStyle = w.weather === "snow" ? "#d5d0c6" : w.weather === "dust" ? "#8a7048" : "#9aa0a4"
  for (let i = 0; i < n; i++) {
    const x = ((i * 47 + w.t * (w.weather === "dust" ? 40 : 18)) % (bw + 8)) - 4
    const y = ((i * 29 + w.t * (w.weather === "snow" ? 8 : 50)) % (bh + 8)) - 4
    if (w.weather === "rain") g.fillRect(x, y, 1, 4)
    else g.fillRect(x, y, w.weather === "snow" ? 2 : 3, w.weather === "snow" ? 2 : 1)
  }
  if (w.vision === "nvg") {
    g.fillStyle = "rgba(36,92,48,.28)"
    g.fillRect(0, 0, bw, bh)
  } else if (w.vision === "thermal") {
    g.fillStyle = "rgba(28,46,72,.32)"
    g.fillRect(0, 0, bw, bh)
  }
}

function paintNight(
  g: CanvasRenderingContext2D,
  w: World,
  bw: number,
  bh: number,
  X: (x: number) => number,
  Y: (y: number) => number,
  zoom: number,
) {
  if (w.vision !== "off") return
  const day = daylight(w.t + w.dayOff)
  const dusk = Math.max(0, Math.min(1, (0.72 - day) / 0.55))
  if (dusk <= 0) return
  if (!shade || shade.width !== bw || shade.height !== bh) {
    shade = document.createElement("canvas")
    shade.width = bw
    shade.height = bh
  }
  const s = shade.getContext("2d")
  if (!s) return
  s.setTransform(1, 0, 0, 1, 0, 0)
  s.clearRect(0, 0, bw, bh)
  s.fillStyle = `rgba(0,0,0,${0.62 * dusk})`
  s.fillRect(0, 0, bw, bh)
  s.globalCompositeOperation = "destination-out"
  s.fillStyle = "#000"
  for (const b of beams(w)) {
    // Apex at the stamp muzzle so the cone leaves the rifle when aimed up/deployed.
    const tip = muzzleScreen(w, b.id, X, Y, zoom)
    const x = tip?.x ?? X(b.x + Math.cos(b.hdg) * 0.45)
    const y = tip?.y ?? Y(b.y + Math.sin(b.hdg) * 0.45) - 4
    const ax = x + Math.cos(-b.hdg) * 2
    const ay = y + Math.sin(-b.hdg) * 2
    s.beginPath()
    s.moveTo(ax, ay)
    s.arc(ax, ay, BEAM_R * zoom, -b.hdg - BEAM_ARC, -b.hdg + BEAM_ARC)
    s.closePath()
    s.fill()
  }
  // Muzzle flashes punch real light holes in the night veil.
  for (const f of w.flashes) {
    if (f.light <= 0) continue
    const tip = f.from != null ? muzzleScreen(w, f.from, X, Y, zoom) : null
    const x = tip?.x ?? X(f.x)
    const y = tip?.y ?? Y(f.y) - 4
    const fade = 0.45 + 0.55 * (f.life / f.max)
    const r = f.light * zoom * fade
    const grd = s.createRadialGradient(x, y, 0, x, y, r)
    grd.addColorStop(0, "rgba(0,0,0,1)")
    grd.addColorStop(0.45, "rgba(0,0,0,0.9)")
    grd.addColorStop(1, "rgba(0,0,0,0)")
    s.fillStyle = grd
    s.beginPath()
    s.arc(x, y, r, 0, Math.PI * 2)
    s.fill()
  }
  s.globalCompositeOperation = "source-over"
  g.drawImage(shade, 0, 0)
  const glow = 0.14 * dusk
  if (glow > 0.01) {
    g.fillStyle = `rgba(214,196,150,${glow})`
    for (const b of beams(w)) {
      const tip = muzzleScreen(w, b.id, X, Y, zoom)
      const x = tip?.x ?? X(b.x + Math.cos(b.hdg) * 0.45)
      const y = tip?.y ?? Y(b.y + Math.sin(b.hdg) * 0.45) - 4
      const ax = x + Math.cos(-b.hdg) * 2
      const ay = y + Math.sin(-b.hdg) * 2
      g.beginPath()
      g.moveTo(ax, ay)
      g.arc(ax, ay, BEAM_R * zoom, -b.hdg - BEAM_ARC, -b.hdg + BEAM_ARC)
      g.closePath()
      g.fill()
    }
  }
  // Warm flash bloom in the punched light (scarce gold).
  for (const f of w.flashes) {
    if (f.light <= 0) continue
    const tip = f.from != null ? muzzleScreen(w, f.from, X, Y, zoom) : null
    const x = tip?.x ?? X(f.x)
    const y = tip?.y ?? Y(f.y) - 4
    const fade = f.life / f.max
    const r = f.light * zoom * (0.45 + 0.55 * fade)
    const a = (0.1 + 0.22 * fade) * dusk
    const grd = g.createRadialGradient(x, y, 0, x, y, r)
    grd.addColorStop(0, `rgba(225,193,90,${a})`)
    grd.addColorStop(0.4, `rgba(225,193,90,${a * 0.45})`)
    grd.addColorStop(1, "rgba(225,193,90,0)")
    g.fillStyle = grd
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
  }
}

function cameraBody(w: World) {
  const boss =
    w.bodies.find((b) => b.id === w.commander && b.alive) ??
    w.bodies.find((b) => b.alive && b.inSection && b.side === "player" && !b.vehicle)
  if (!boss) return null
  if (boss.boarded !== null) {
    const hull = w.bodies.find((b) => b.id === boss.boarded && b.alive)
    if (hull) return hull
  }
  return boss
}

function paintTags(
  ctx: CanvasRenderingContext2D,
  w: World,
  width: number,
  height: number,
  bw: number,
  bh: number,
  zoom: number,
  cx: number,
  cy: number,
) {
  if (!w.tags.length) return
  const sx = (x: number) => ((bw / 2 + (x - cx) * zoom) / bw) * width
  const sy = (y: number) => ((bh / 2 - (y - cy) * zoom) / bh) * height
  ctx.save()
  ctx.textBaseline = "top"
  ctx.lineWidth = 1
  for (const t of w.tags) {
    const x = sx(t.x)
    const y = sy(t.y)
    const flavour = t.kind === "line"
    const soft = flavour || t.kind === "down" || t.kind === "chip"
    const haul = t.kind === "find" || t.kind === "loot" || t.kind === "bounty"
    const pop = haul ? Math.min(1, t.life / 3.4) : 1
    const ang = -0.7 + t.slot * 0.42
    const rad = soft ? 40 : haul ? 78 + (1 - pop) * 18 : 70
    const px = x + Math.cos(ang) * rad
    const py = y + Math.sin(ang) * rad * 0.65
    const col =
      t.kind === "kia" || t.kind === "part"
        ? "#a32020"
        : haul
          ? "#e1c15a"
          : soft
            ? "#8a8a8a"
            : "#a8a49c"
    ctx.font = haul ? "14px VGA, monospace" : "12px VGA, monospace"
    ctx.globalAlpha = soft ? 0.4 : Math.max(0.3, Math.min(1, haul ? 0.45 + pop * 0.55 : t.life))
    ctx.strokeStyle = col
    ctx.beginPath()
    ctx.moveTo(x, y - 6)
    ctx.lineTo(px, py + 6)
    ctx.stroke()
    const arm = soft ? 6 : haul ? 12 + Math.round((1 - pop) * 4) : 10
    corner(ctx, x, y, -arm, -arm, 4, 4)
    corner(ctx, x, y, arm, -arm, -4, 4)
    corner(ctx, x, y, -arm, arm, 4, -4)
    corner(ctx, x, y, arm, arm, -4, -4)
    const tw = ctx.measureText(t.text).width
    const th = haul ? 16 : 14
    ctx.fillStyle = "rgba(0,0,0,.85)"
    ctx.fillRect(px, py, tw + 8, th)
    ctx.fillStyle = col
    ctx.fillText(t.text, px + 4, py + (haul ? 1 : 1))
  }
  ctx.restore()
}

function paintTracker(
  ctx: CanvasRenderingContext2D,
  w: World,
  width: number,
  height: number,
  bw: number,
  bh: number,
  zoom: number,
  cx: number,
  cy: number,
) {
  const marks = trackerTargets(w)
  if (!marks.length) return
  const { sx, sy } = screenOf(width, height, bw, bh, zoom, cx, cy)
  const col = "#a8a49c"
  const arm = 10
  ctx.save()
  ctx.lineWidth = 1
  ctx.strokeStyle = col
  ctx.globalAlpha = 0.7
  for (const b of marks) {
    const x = sx(b.x)
    const y = sy(b.y)
    if (x < 8 || x > width - 8 || y < 8 || y > height - 8) {
      edgeArrow(ctx, x, y, width, height, col)
      continue
    }
    corner(ctx, x, y, -arm, -arm, 4, 4)
    corner(ctx, x, y, arm, -arm, -4, 4)
    corner(ctx, x, y, -arm, arm, 4, -4)
    corner(ctx, x, y, arm, arm, -4, -4)
  }
  ctx.restore()
}

function corner(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, hx: number, hy: number) {
  ctx.beginPath()
  ctx.moveTo(x + dx, y + dy + hy)
  ctx.lineTo(x + dx, y + dy)
  ctx.lineTo(x + dx + hx, y + dy)
  ctx.stroke()
}

/** Muzzle flashes on the CSS canvas (after grade) so gold cores stay readable. */
function paintFlashes(
  ctx: CanvasRenderingContext2D,
  w: World,
  width: number,
  height: number,
  bw: number,
  bh: number,
  zoom: number,
  cx: number,
  cy: number,
) {
  if (!w.flashes.length) return
  const scale = width / bw
  const Xb = (x: number) => Math.round(bw / 2 + (x - cx) * zoom)
  const Yb = (y: number) => Math.round(bh / 2 - (y - cy) * zoom)
  const cell = Math.max(2, Math.round(scale))
  ctx.save()
  ctx.imageSmoothingEnabled = false
  for (const f of w.flashes) {
    const tip = f.from != null ? muzzleScreen(w, f.from, Xb, Yb, zoom) : null
    const ox = tip ? tip.x * scale : ((bw / 2 + (f.x - cx) * zoom) / bw) * width
    const oy = tip ? tip.y * scale : ((bh / 2 - (f.y - cy) * zoom) / bh) * height
    const a = Math.max(0, f.life / f.max)
    ctx.globalAlpha = 0.55 + 0.45 * a
    // World +y is screen -y.
    const fx = Math.cos(f.hdg)
    const fy = -Math.sin(f.hdg)
    const along = Math.max(1, Math.round(f.along * scale))
    const across = Math.max(1, Math.round(f.across * scale))
    const rim = f.rim ?? f.core
    const px = (dx: number, dy: number, col: string, big = false) => {
      const s = big ? cell + 1 : cell
      ctx.fillStyle = col
      ctx.fillRect(Math.round(ox + dx - s / 2), Math.round(oy + dy - s / 2), s, s)
    }
    paintFlashShape(f.shape, along, across, fx, fy, a, f.core, rim, px)
  }
  ctx.restore()
}

function paintFlashShape(
  shape: Flash["shape"],
  along: number,
  across: number,
  fx: number,
  fy: number,
  a: number,
  core: string,
  rim: string,
  px: (dx: number, dy: number, col: string, big?: boolean) => void,
) {
  if (shape === "dot") {
    px(0, 0, core, true)
    if (a > 0.35) px(fx * along * 0.5, fy * along * 0.5, rim)
  } else if (shape === "cross") {
    px(0, 0, core, true)
    for (let i = 1; i <= along; i++) px(fx * i, fy * i, i <= 2 ? core : rim, i === 1)
    const nx = -fy
    const ny = fx
    for (let i = 1; i <= across; i++) {
      px(nx * i, ny * i, rim)
      px(-nx * i, -ny * i, rim)
    }
  } else if (shape === "spike") {
    px(0, 0, core, true)
    for (let i = 1; i <= along; i++) px(fx * i, fy * i, i < 4 ? core : rim, i < 2)
  } else if (shape === "cone") {
    px(0, 0, core, true)
    const nx = -fy
    const ny = fx
    for (let i = 1; i <= along + 1; i++) {
      const spread = Math.max(1, Math.round((across * i) / (along + 1)))
      for (let s = -spread; s <= spread; s++) {
        px(fx * i + nx * s, fy * i + ny * s, Math.abs(s) <= 1 ? core : rim, i === 1 && s === 0)
      }
    }
  } else if (shape === "bloom") {
    px(0, 0, core, true)
    px(fx >= 0 ? 2 : -2, 0, core)
    px(0, fy >= 0 ? 2 : -2, rim)
    for (let i = 1; i <= along; i++) px(fx * i, fy * i, i <= 2 ? core : rim, i === 1)
    const nx = -fy
    const ny = fx
    for (let i = 1; i <= across; i++) {
      px(nx * i, ny * i, rim)
      px(-nx * i, -ny * i, rim)
    }
  } else if (shape === "bolt") {
    px(0, 0, core, true)
    for (let i = 1; i <= along; i++) {
      const wobble = i % 2 === 0 ? 1 : -1
      px(fx * i + -fy * wobble * 2, fy * i + fx * wobble * 2, i < 4 ? core : rim, i < 2)
    }
  } else if (shape === "puff") {
    px(0, 0, core, true)
    px(across * 0.4, 0, rim)
    px(-across * 0.4, 0, rim)
    px(0, across * 0.4, rim)
    px(0, -across * 0.4, rim)
    px(fx * along, fy * along, rim)
  }
}

/** Screen muzzle from the same stamp rotate as `drawLayered`. */
function muzzleScreen(
  w: World,
  id: number,
  X: (x: number) => number,
  Y: (y: number) => number,
  _zoom: number,
): { x: number; y: number } | null {
  const b = w.bodies.find((o) => o.id === id && o.alive && o.boarded === null)
  if (!b || b.vehicle) return null
  const a = lastFoot(b.id) ?? footAnim(b, 0, b.hdg, footholdsNear(w, b), softSeek(w, b))
  const lift = airLift(b)
  const hover = b.kind === "drone" || b.kind === "scoot" ? -6 : 0
  const bob = lift > 0 ? -lift : hover + a.dy
  const fx = X(b.x) + a.dx
  const fy = Y(b.y) + bob
  return gunTipAt(
    b.kind,
    kitOf(b),
    {
      torso: a.torso,
      coatDx: a.coatDx,
      gunDx: a.gunDx,
      gunDy: a.gunDy,
      aimAng: a.aimAng,
      flipX: b.face < 0,
      showGun: a.showGun,
    },
    fx,
    fy,
  )
}

function paintFoot(
  g: CanvasRenderingContext2D,
  b: Body,
  x: number,
  y: number,
  lift: number,
  zoom: number,
  a: FootAnim,
  thermal: boolean,
) {
  const hover = b.kind === "drone" || b.kind === "scoot" ? -6 : 0
  const bob = lift > 0 ? -lift : hover + a.dy
  const px = x + a.dx
  const py = y + bob
  const kit = kitOf(b)
  if (a.soft) paintSoft(g, b, x, y, zoom, a.soft, thermal)
  if (canLayer(b.kind)) {
    if (lift === 0 && hover === 0) {
      g.fillStyle = "rgba(10,8,6,0.22)"
      g.beginPath()
      g.ellipse(x, y + 1, 5, 2, 0, 0, Math.PI * 2)
      g.fill()
    }
    const size = drawLayered(
      g,
      b.kind,
      kit,
      {
        torso: a.torso,
        legs: a.legs,
        headDx: a.headDx,
        headDy: a.headDy,
        coatDx: a.coatDx,
        legsDx: a.legsDx,
        legsDy: a.legsDy,
        gunDx: a.gunDx,
        gunDy: a.gunDy,
        aimAng: a.aimAng,
        showHead: a.showHead,
        showLegs: a.showLegs,
        showGun: a.showGun,
        flipX: b.face < 0,
      },
      px,
      py,
      thermal ? heatOf : undefined,
    )
    if (!size) {
      g.fillStyle = b.side === "player" ? "#a8a49c" : b.side === "rust" ? "#8a5040" : "#6a3030"
      g.fillRect(px - 2, py - 8 - lift, 4, 8)
    }
    return
  }
  const spr = actor(b.kind, a.pose, b.face < 0, kit)
  if (!spr) {
    g.fillStyle = b.side === "player" ? "#a8a49c" : b.side === "rust" ? "#8a5040" : "#6a3030"
    g.fillRect(px - 2, py - 8 - lift, 4, 8)
    return
  }
  if (lift === 0 && hover === 0) {
    const sr = Math.max(3, Math.round(spr.width * 0.4))
    g.fillStyle = "rgba(10,8,6,0.22)"
    g.beginPath()
    g.ellipse(x, y + 1, sr, Math.max(1, Math.round(sr * 0.3)), 0, 0, Math.PI * 2)
    g.fill()
  }
  blit(g, thermal ? heatOf(spr) : spr, px, py)
  gash(g, spr, px, py, b)
}

/** Soft chains under the body stamp so the mass still reads on top. */
function paintSoft(
  g: CanvasRenderingContext2D,
  b: Body,
  x: number,
  y: number,
  zoom: number,
  soft: SoftDraw,
  thermal: boolean,
) {
  const body = thermal ? "#f4e7a8" : soft.color
  const tip = thermal ? "#f4e7a8" : soft.tip
  // Skip points that leave the stamp footprint (detached “offset” pixels).
  const maxR = 6
  for (const chain of soft.chains) {
    for (let i = 1; i < chain.length; i++) {
      const p = chain[i]
      const sx = Math.round(x + (p.x - b.x) * zoom)
      const sy = Math.round(y - (p.y - b.y) * zoom)
      if (Math.hypot(sx - x, sy - y) > maxR) continue
      const last = i === chain.length - 1
      g.fillStyle = last ? tip : body
      g.fillRect(sx, sy, 1, 1)
    }
  }
}

const HOLD_KIND = new Set(["ruin", "wreck", "post", "teeth", "burnt_tree"])

function footholdsNear(w: World, b: Body): FootHold[] {
  const out: FootHold[] = []
  for (const p of w.props) {
    if (!p.alive || !HOLD_KIND.has(p.kind)) continue
    if (Math.hypot(p.x - b.x, p.y - b.y) > p.radius + 1.1) continue
    out.push({ x: p.x, y: p.y, r: p.radius })
  }
  return out
}

function softSeek(w: World, b: Body): { x: number; y: number } | null {
  let best = 16
  let hit: { x: number; y: number } | null = null
  for (const o of w.bodies) {
    if (!o.alive || o.boarded !== null || o.side === b.side) continue
    const d = Math.hypot(o.x - b.x, o.y - b.y)
    if (d < best) {
      best = d
      hit = { x: o.x, y: o.y }
    }
  }
  return hit
}

function gash(g: CanvasRenderingContext2D, spr: HTMLCanvasElement, x: number, y: number, b: { face: number; parts: { id: string; on: boolean }[] }) {
  const left = x - spr.width / 2
  const top = y - spr.height / 2
  g.fillStyle = "#221e1a"
  const legs = b.parts.filter((p) => p.id === "leg" && !p.on).length
  if (legs >= 1) g.fillRect(left + (b.face < 0 ? spr.width - 4 : 1), top + spr.height - 3, 2, 3)
  if (legs >= 2) g.fillRect(left + (b.face < 0 ? 1 : spr.width - 4), top + spr.height - 3, 2, 3)
  const arms = b.parts.filter((p) => p.id === "arm" && !p.on).length
  if (arms >= 1) g.fillRect(left + spr.width / 2, top + 4, 4, 2)
  if (!b.parts.some((p) => p.id === "head" && p.on) && b.parts.some((p) => p.id === "head")) g.fillRect(left + 1, top, 4, 3)
}

const fallen = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>()

function laid(spr: HTMLCanvasElement) {
  const hit = fallen.get(spr)
  if (hit) return hit
  const w = spr.width
  const h = spr.height
  const src = spr.getContext("2d")?.getImageData(0, 0, w, h).data
  const c = document.createElement("canvas")
  c.width = h
  c.height = w
  const g = c.getContext("2d")
  if (!src || !g) return spr
  const dst = g.createImageData(h, w)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4
      const d = (x * h + (h - 1 - y)) * 4
      dst.data[d] = src[s]
      dst.data[d + 1] = src[s + 1]
      dst.data[d + 2] = src[s + 2]
      dst.data[d + 3] = src[s + 3]
    }
  }
  g.putImageData(dst, 0, 0)
  fallen.set(spr, c)
  return c
}

function paintRemains(
  g: CanvasRenderingContext2D,
  w: World,
  X: (x: number) => number,
  Y: (y: number) => number,
  zoom: number,
) {
  for (const b of w.bodies) {
    if (b.alive || b.boarded !== null) continue
    if (b.side === "player" && !b.inSection) continue
    const x = X(b.x)
    const y = Y(b.y)
    if (b.vehicle) {
      const veh = vehicleArt(b.kind)
      if (!veh) continue
      g.save()
      g.translate(x, y - veh.body.height / 2)
      g.rotate(-b.hdg)
      g.drawImage(veh.body, -veh.body.width / 2, -veh.body.height / 2)
      if (b.parts.some((p) => p.id === "turret" && p.on))
        g.drawImage(veh.turret, veh.mount[0] - veh.pivot[0], veh.mount[1] - veh.pivot[1])
      g.restore()
    } else {
      const spr = actor(b.kind, "idle", b.face < 0, kitOf(b))
      if (!spr) continue
      blit(g, laid(spr), x, y)
    }
  }
  for (const gib of w.gibs) {
    const chip = limbSprite(gib.kind, gib.part)
    g.drawImage(chip, X(gib.x), Y(gib.y) - gib.z * zoom - chip.height)
  }
}

function screenOf(width: number, height: number, bw: number, bh: number, zoom: number, cx: number, cy: number) {
  return {
    sx: (x: number) => ((bw / 2 + (x - cx) * zoom) / bw) * width,
    sy: (y: number) => ((bh / 2 - (y - cy) * zoom) / bh) * height,
  }
}

function paintPins(
  ctx: CanvasRenderingContext2D,
  w: World,
  width: number,
  height: number,
  bw: number,
  bh: number,
  zoom: number,
  cx: number,
  cy: number,
) {
  const { sx, sy } = screenOf(width, height, bw, bh, zoom, cx, cy)
  const pins: { x: number; y: number; col: string; label?: string }[] = []
  for (const d of w.drops) {
    if (d.taken) continue
    if (d.kind === "loot") pins.push({ x: d.x, y: d.y, col: "#8a8a8a", label: d.cardId.toUpperCase() })
    else if (d.kind === "gear") pins.push({ x: d.x, y: d.y, col: "#e1c15a", label: card(d.cardId).name })
    else pins.push({ x: d.x, y: d.y, col: "#e1c15a" })
  }
  for (const b of w.bodies) {
    if (!b.alive) continue
    if (b.vehicle) {
      if (!w.bodies.some((u) => u.alive && u.boarded === b.id)) pins.push({ x: b.x, y: b.y, col: "#a8a49c" })
    } else if (b.inSection && b.boarded === null && Math.hypot(b.x - cx, b.y - cy) > 10) {
      pins.push({ x: b.x, y: b.y, col: "#a32020" })
    }
  }
  const pinMarks: SignalMark[] = pins.map((p) => ({
    x: sx(p.x),
    y: sy(p.y),
    col: p.col,
    word: p.label ?? "",
  }))
  for (const row of placeEdgePins(pinMarks, width, height, 40)) {
    if (!row.tip) continue
    paintEdgeArrow(ctx, row.tip.x, row.tip.y, row.tip.ang, row.mark.col)
    if (row.mark.word) plate(ctx, row.tip.x, row.tip.y - 28, row.mark.word, row.mark.col)
  }

  const seen: { x: number; y: number; text: string; d: number; hot: boolean; gold?: boolean }[] = []
  for (const d of w.drops) {
    if (d.taken || (d.kind !== "gear" && d.kind !== "loot")) continue
    seen.push({
      x: d.x,
      y: d.y,
      text: d.kind === "loot" ? d.cardId.toUpperCase() : card(d.cardId).name,
      d: Math.hypot(d.x - cx, d.y - cy),
      hot: false,
      gold: true,
    })
  }
  for (const b of w.bodies) {
    if (b.alive || b.boarded !== null) continue
    if (b.side === "player" && !b.inSection) continue
    seen.push({
      x: b.x,
      y: b.y,
      text: b.vehicle ? "WRECK" : "CORPSE",
      d: Math.hypot(b.x - cx, b.y - cy),
      hot: b.side === "player",
    })
  }
  for (const gib of w.gibs) {
    seen.push({
      x: gib.x,
      y: gib.y,
      text: gib.part.toUpperCase(),
      d: Math.hypot(gib.x - cx, gib.y - cy),
      hot: gib.side === "player",
    })
  }
  seen.sort((a, b) => a.d - b.d)
  ctx.save()
  ctx.font = "12px VGA, monospace"
  ctx.textBaseline = "top"
  let n = 0
  for (const s of seen) {
    if (n >= 6) break
    const x = sx(s.x)
    const y = sy(s.y)
    if (x < 8 || x > width - 8 || y < 8 || y > height - 8) continue
    const tw = ctx.measureText(s.text).width
    ctx.fillStyle = "rgba(0,0,0,.78)"
    ctx.fillRect(x + 4, y - 16, tw + 6, 14)
    ctx.fillStyle = s.gold ? "#e1c15a" : s.hot ? "#a32020" : "#8a8a8a"
    ctx.fillText(s.text, x + 7, y - 15)
    n++
  }
  ctx.restore()
}

const COL_LZ = "#e1c15a"
const COL_EXIT = "#c8c4bc"
const COL_STASH = "#9a9a94"

type SignalMark = {
  x: number
  y: number
  col: string
  word: string
  size?: number
  /** Field mark when the target is on-screen. */
  field?: () => void
}

function paintSignals(
  ctx: CanvasRenderingContext2D,
  w: World,
  width: number,
  height: number,
  bw: number,
  bh: number,
  zoom: number,
  cx: number,
  cy: number,
) {
  const { sx, sy } = screenOf(width, height, bw, bh, zoom, cx, cy)
  const scale = width / bw
  const marks: SignalMark[] = []
  for (const f of w.inbound) {
    const x = sx(f.x)
    const y = sy(f.y)
    const label = dropLabel(w, f)
    marks.push({
      x,
      y,
      col: COL_LZ,
      word: label,
      field: () => {
        column(ctx, x, y, 72, w.t)
        plate(ctx, x, y - 94, label)
      },
    })
  }
  if (w.pathOn) {
    const many = w.paths.length > 1
    w.paths.forEach((exit, i) => {
      if (!exit.open) return
      const x = sx(exit.x)
      const y = sy(exit.y)
      const left = Math.max(0, Math.ceil(PATH_HOLD - exit.hold))
      const name = many ? `EXIT ${i + 1}` : "EXIT"
      const word = exit.hold > 0.05 ? `HOLD ${name} ${left}s` : name
      marks.push({
        x,
        y,
        col: COL_EXIT,
        word,
        field: () => {
          const r = Math.max(32, FLARE_R * zoom * scale)
          const p = Math.max(0, Math.min(1, exit.hold / PATH_HOLD))
          holdRing(ctx, x, y, r, p, COL_EXIT)
          exitChevron(ctx, x, y, Math.atan2(-exit.y, exit.x), COL_EXIT, scale)
          plate(ctx, x, y - r - 28, word, COL_EXIT)
        },
      })
    })
  }
  if (w.stashOn) {
    const x = sx(w.stashX)
    const y = sy(w.stashY)
    const word = w.stashHold > 0.05 ? w.banner : "STASH"
    marks.push({
      x,
      y,
      col: COL_STASH,
      word,
      field: () => {
        const r = Math.max(24, 3 * zoom * scale)
        const p = Math.max(0, Math.min(1, w.stashHold / 4))
        holdRing(ctx, x, y, r, p, COL_STASH)
        stashMark(ctx, x, y, scale)
        plate(ctx, x, y - r - 24, word, COL_STASH)
      },
    })
  }
  if (w.lzOn || w.flareOn) {
    const x = sx(w.flareX)
    const y = sy(w.flareY)
    const word =
      w.banner.startsWith("ARM") ||
      w.banner.startsWith("CRAFT") ||
      w.banner.startsWith("LOAD") ||
      w.banner === "HOLD THE LZ"
        ? w.banner
        : "LZ"
    marks.push({
      x,
      y,
      col: COL_LZ,
      word,
      size: w.pathOn ? 1.35 : 1,
      field: () => {
        const r = Math.max(32, FLARE_R * zoom * scale)
        const p = !w.flareOn ? w.flareArm / FLARE_ARM : w.craftOn ? 1 : Math.min(1, w.flareHold / CRAFT_WAIT)
        holdRing(ctx, x, y, r, p, COL_LZ)
        lzPad(ctx, x, y, scale)
        if (w.flareOn) column(ctx, x, y, 110, w.t)
        if (w.flareOn) paintCraft(ctx, x, y, w)
        plate(ctx, x, y - r - 28, word, COL_LZ)
      },
    })
  }
  ctx.save()
  ctx.imageSmoothingEnabled = false
  const placed = placeEdgePins(marks, width, height)
  for (const row of placed) {
    if (row.tip) {
      paintEdgeArrow(ctx, row.tip.x, row.tip.y, row.tip.ang, row.mark.col, row.mark.size ?? 1)
      plate(ctx, row.tip.x, row.tip.y - 30, row.mark.word, row.mark.col)
    } else {
      row.mark.field?.()
    }
  }
  ctx.restore()
}

/** Space off-screen intent pins along the rim so none bury another. */
function placeEdgePins(marks: SignalMark[], width: number, height: number, gap = 48) {
  const m = 36
  type Hit = { mark: SignalMark; x: number; y: number; ang: number; side: "t" | "b" | "l" | "r" }
  const hits: Hit[] = []
  const onScreen: { mark: SignalMark; tip: null }[] = []
  for (const mark of marks) {
    if (mark.x >= m && mark.x <= width - m && mark.y >= m && mark.y <= height - m) {
      onScreen.push({ mark, tip: null })
      continue
    }
    const cx = width / 2
    const cy = height / 2
    const dx = mark.x - cx
    const dy = mark.y - cy
    const s = Math.min((width / 2 - m) / Math.max(1e-4, Math.abs(dx)), (height / 2 - m) / Math.max(1e-4, Math.abs(dy)))
    const x = cx + dx * s
    const y = cy + dy * s
    const dT = Math.abs(y - m)
    const dB = Math.abs(y - (height - m))
    const dL = Math.abs(x - m)
    const dR = Math.abs(x - (width - m))
    const nearest = Math.min(dT, dB, dL, dR)
    const side = nearest === dT ? "t" : nearest === dB ? "b" : nearest === dL ? "l" : "r"
    hits.push({ mark, x, y, ang: Math.atan2(dy, dx), side })
  }
  const bySide: Record<"t" | "b" | "l" | "r", Hit[]> = { t: [], b: [], l: [], r: [] }
  for (const h of hits) bySide[h.side].push(h)
  const spread = (list: Hit[], axis: "x" | "y", lo: number, hi: number) => {
    list.sort((a, b) => a[axis] - b[axis])
    for (let i = 1; i < list.length; i++) {
      if (list[i][axis] - list[i - 1][axis] < gap) list[i][axis] = list[i - 1][axis] + gap
    }
    for (let i = list.length - 2; i >= 0; i--) {
      if (list[i + 1][axis] - list[i][axis] < gap) list[i][axis] = list[i + 1][axis] - gap
    }
    for (const h of list) h[axis] = Math.max(lo, Math.min(hi, h[axis]))
  }
  spread(bySide.t, "x", m, width - m)
  for (const h of bySide.t) h.y = m
  spread(bySide.b, "x", m, width - m)
  for (const h of bySide.b) h.y = height - m
  spread(bySide.l, "y", m, height - m)
  for (const h of bySide.l) h.x = m
  spread(bySide.r, "y", m, height - m)
  for (const h of bySide.r) h.x = width - m
  return [
    ...onScreen,
    ...hits.map((h) => ({ mark: h.mark, tip: { x: h.x, y: h.y, ang: h.ang } as { x: number; y: number; ang: number } })),
  ]
}

function holdRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, p: number, col: string) {
  ctx.strokeStyle = col
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, p)))
  ctx.stroke()
}

/** Outward chevron at an exit — the hold place you walk into. */
function exitChevron(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, col: string, scale: number) {
  const s = Math.max(10, 11 * scale * 0.35)
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ang)
  ctx.fillStyle = "#0c0b09"
  ctx.beginPath()
  ctx.moveTo(s + 2, 0)
  ctx.lineTo(-s * 0.55, -s * 0.75)
  ctx.lineTo(-s * 0.55, s * 0.75)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.moveTo(s, 0)
  ctx.lineTo(-s * 0.45, -s * 0.65)
  ctx.lineTo(-s * 0.45, s * 0.65)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function lzPad(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = Math.max(6, 7 * scale * 0.35)
  ctx.fillStyle = "#0c0b09"
  ctx.fillRect(x - s - 1, y - 2, s * 2 + 2, 4)
  ctx.fillRect(x - 2, y - s - 1, 4, s * 2 + 2)
  ctx.fillStyle = COL_LZ
  ctx.fillRect(x - s, y - 1, s * 2, 2)
  ctx.fillRect(x - 1, y - s, 2, s * 2)
  ctx.fillRect(x - 3, y - 3, 6, 6)
}

function stashMark(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = Math.max(5, 5 * scale * 0.35)
  ctx.fillStyle = "#0c0b09"
  ctx.fillRect(x - s - 1, y - s - 1, s * 2 + 2, s * 2 + 2)
  ctx.fillStyle = COL_STASH
  ctx.fillRect(x - s, y - s, s * 2, s * 2)
  ctx.fillStyle = "#0c0b09"
  ctx.fillRect(x - s + 2, y - 1, s * 2 - 4, 2)
}

function dropLabel(w: World, f: Inbound) {
  if (f.loot) return "LOOT"
  const hero = w.heroes[f.cardId]
  if (hero) return hero.name
  return card(f.cardId).name
}

function column(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, t: number) {
  ctx.fillStyle = "#e1c15a"
  ctx.fillRect(x - 2, y - h, 4, h)
  ctx.fillRect(x - 7, y - h, 14, 4)
  ctx.fillStyle = Math.floor(t * 6) % 2 === 0 ? "#fff6d0" : "#e1c15a"
  ctx.fillRect(x - 3, y - h - 6, 6, 5)
}

function paintCraft(ctx: CanvasRenderingContext2D, x: number, y: number, w: World) {
  const vtol = scenery("vtol", Math.floor(w.t * 20) % 2)
  if (!vtol) return
  const k = w.craftOn ? 1 : Math.min(1, w.flareHold / CRAFT_WAIT)
  const dw = vtol.width * 3
  const dh = vtol.height * 3
  const left = x - dw / 2
  const top = y - (1 - k) * 200 - dh + 6
  ctx.drawImage(vtol, left, top, dw, dh)
  ctx.fillStyle = "#e1c15a"
  ctx.fillRect(left + dw / 2 - 3, top + 12, 6, 6)
}

function plate(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, col = "#e1c15a") {
  ctx.font = "16px VGA, monospace"
  ctx.textBaseline = "top"
  const tw = ctx.measureText(text).width
  const px = Math.max(8, Math.min(x - tw / 2, ctx.canvas.width - tw - 16))
  const py = Math.max(8, Math.min(y, ctx.canvas.height - 28))
  ctx.globalAlpha = 1
  ctx.fillStyle = "rgba(0,0,0,.85)"
  ctx.fillRect(px, py, tw + 8, 20)
  ctx.fillStyle = col
  ctx.fillText(text, px + 4, py + 2)
}

function paintEdgeArrow(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  ang: number,
  col: string,
  size = 1,
) {
  const k = Math.max(0.85, size)
  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(ang)
  ctx.fillStyle = "#0c0b09"
  ctx.beginPath()
  ctx.moveTo(16 * k, 0)
  ctx.lineTo(-10 * k, -12 * k)
  ctx.lineTo(-10 * k, 12 * k)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.moveTo(11 * k, 0)
  ctx.lineTo(-6 * k, -8 * k)
  ctx.lineTo(-6 * k, 8 * k)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/** Legacy single-pin helper (Tracker / stray calls). Prefer placeEdgePins for sets. */
function edgeArrow(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  width: number,
  height: number,
  col: string,
  size = 1,
): { x: number; y: number } | null {
  const m = 36
  if (sx >= m && sx <= width - m && sy >= m && sy <= height - m) return null
  const cx = width / 2
  const cy = height / 2
  const dx = sx - cx
  const dy = sy - cy
  const s = Math.min((width / 2 - m) / Math.max(1e-4, Math.abs(dx)), (height / 2 - m) / Math.max(1e-4, Math.abs(dy)))
  const px = cx + dx * s
  const py = cy + dy * s
  paintEdgeArrow(ctx, px, py, Math.atan2(dy, dx), col, size)
  return { x: px, y: py }
}

function paintMark(
  g: CanvasRenderingContext2D,
  m: { x: number; y: number; kind: string; tint: string },
  X: (x: number) => number,
  Y: (y: number) => number,
) {
  const x = X(m.x)
  const y = Y(m.y)
  if (m.kind === "crater") {
    // darker hole
    g.fillStyle = "#141210"
    g.fillRect(x - 5, y - 3, 10, 6)
    g.fillStyle = "#0e0c0a"
    g.fillRect(x - 3, y - 2, 6, 4)
    // dithered rim speckles in mud browns
    g.fillStyle = "#3a342c"
    g.fillRect(x - 6, y - 1, 2, 2)
    g.fillRect(x + 4, y - 1, 2, 2)
    g.fillRect(x - 2, y - 4, 3, 1)
    g.fillRect(x, y + 3, 3, 1)
    g.fillStyle = "#2a241c"
    g.fillRect(x - 7, y, 1, 2)
    g.fillRect(x + 5, y - 2, 2, 1)
    g.fillRect(x - 3, y + 3, 2, 1)
    return
  }
  if (m.kind === "burn") {
    // charred hole
    g.fillStyle = "#141210"
    g.fillRect(x - 5, y - 2, 10, 5)
    g.fillStyle = "#0e0c0a"
    g.fillRect(x - 3, y - 1, 6, 3)
    // ash rim
    g.fillStyle = "#3a342c"
    g.fillRect(x - 6, y - 1, 2, 2)
    g.fillRect(x + 4, y - 1, 2, 1)
    g.fillStyle = "#2a241c"
    g.fillRect(x - 2, y - 3, 3, 1)
    g.fillRect(x + 1, y + 3, 2, 1)
    return
  }
  // blood / splat / oxide — speckle cluster
  const main = m.tint === "oxide" ? "#2a5c58" : m.tint === "blood" ? "#6a3030" : "#3a342c"
  const dark = m.tint === "oxide" ? "#1a3c38" : m.tint === "blood" ? "#4a2020" : "#2a241c"
  g.fillStyle = main
  g.fillRect(x - 5, y - 1, 10, 2)
  g.fillRect(x - 1, y - 3, 2, 6)
  g.fillRect(x - 4, y - 2, 2, 1)
  g.fillRect(x + 2, y + 2, 3, 1)
  g.fillStyle = dark
  g.fillRect(x - 6, y, 2, 1)
  g.fillRect(x + 4, y - 2, 2, 1)
  g.fillRect(x - 3, y + 3, 2, 1)
  g.fillRect(x + 1, y - 4, 2, 1)
  g.fillRect(x + 3, y + 1, 2, 2)
  g.fillRect(x - 4, y - 3, 1, 2)
}

export function hpColor(frac: number) {
  if (frac > 0.55) return "#e1c15a"
  if (frac > 0.28) return "#8a5040"
  return "#a32020"
}

function paintCache(g: CanvasRenderingContext2D, kind: string, x: number, y: number) {
  if (kind === "relic") {
    g.fillStyle = "#e1c15a"
    g.fillRect(x - 2, y - 9, 4, 4)
    return
  }
  if (kind === "intel") {
    g.fillStyle = "#e1c15a"
    g.fillRect(x - 3, y - 8, 6, 4)
    return
  }
  if (kind === "sample") {
    g.fillStyle = "#6a6860"
    g.fillRect(x - 1, y - 9, 3, 6)
    g.fillStyle = "#3a3428"
    g.fillRect(x - 2, y - 10, 5, 2)
    return
  }
  g.fillStyle = "#5a5850"
  g.fillRect(x - 4, y - 6, 5, 3)
  g.fillRect(x - 1, y - 8, 4, 2)
}

const heats = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>()

function heatOf(spr: HTMLCanvasElement) {
  const hit = heats.get(spr)
  if (hit) return hit
  const c = document.createElement("canvas")
  c.width = spr.width
  c.height = spr.height
  const cg = c.getContext("2d")
  if (!cg) return spr
  cg.drawImage(spr, 0, 0)
  cg.globalCompositeOperation = "source-atop"
  cg.fillStyle = "#f4e7a8"
  cg.globalAlpha = 0.72
  cg.fillRect(0, 0, c.width, c.height)
  heats.set(spr, c)
  return c
}

function revealAlpha(w: World, bodyId: number, dropId: number) {
  for (const r of w.reveals) {
    if (bodyId && r.bodyId === bodyId) return Math.max(0, Math.min(1, r.t / r.dur))
    if (dropId && r.dropId === dropId) return Math.max(0, Math.min(1, r.t / r.dur))
  }
  return 1
}

function blit(g: CanvasRenderingContext2D, c: HTMLCanvasElement, x: number, y: number) {
  g.drawImage(c, Math.round(x - c.width / 2), Math.round(y - c.height + 2))
}

function aimOf(w: World, x: number, y: number) {
  let best = 12
  let ang = 0
  for (const o of w.bodies) {
    if (!o.alive || o.side === "player" || o.boarded !== null) continue
    const d = Math.hypot(o.x - x, o.y - y)
    if (d < best) {
      best = d
      ang = Math.atan2(-(o.y - y), o.x - x)
    }
  }
  return ang
}

export function paintDither(g: CanvasRenderingContext2D, w: number, h: number) {
  if (!ditherSet.on) return
  if (ditherSet.levels >= 2) grade(g, w, h)
  paintInk(g, w, h)
}

function paintInk(g: CanvasRenderingContext2D, w: number, h: number) {
  if (ditherSet.alpha <= 0 || ditherSet.cut >= 16) return
  if (!dither) dither = pattern(g)
  if (!dither) return
  g.save()
  g.globalAlpha = ditherSet.alpha
  g.globalCompositeOperation = COMP[ditherSet.blend]
  g.fillStyle = dither
  g.fillRect(0, 0, w, h)
  g.restore()
}

const mats = new Map<number, number[]>()

function matOf(n: number) {
  let m = mats.get(n)
  if (!m) mats.set(n, (m = bayer(n)))
  return m
}

function thresh(x: number, y: number) {
  const s = ditherSet.size
  const n = ditherSet.scale
  const cx = Math.floor(x / s)
  const cy = Math.floor(y / s)
  if (ditherSet.pattern === "lines") return ((cx + cy) % n) / n
  if (ditherSet.pattern === "check") return (cx + cy) % 2 === 0 ? 0.75 : 0.25
  if (ditherSet.pattern === "noise") return (hash(cx, cy) % 256) / 256
  const mat = matOf(n)
  return mat[(cy % n) * n + (cx % n)] / (n * n)
}

function grade(g: CanvasRenderingContext2D, w: number, h: number) {
  const img = g.getImageData(0, 0, w, h)
  const d = img.data
  const span = ditherSet.levels - 1
  const spread = ditherSet.spread
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = 0.5 + (thresh(x, y) - 0.5) * spread
      const i = (y * w + x) * 4
      d[i] = band(d[i], t, span)
      d[i + 1] = band(d[i + 1], t, span)
      d[i + 2] = band(d[i + 2], t, span)
    }
  }
  g.putImageData(img, 0, 0)
}

function band(v: number, t: number, span: number) {
  const idx = Math.max(0, Math.min(span, Math.floor((v / 255) * span + t)))
  return Math.round((idx * 255) / span)
}

function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0
  h = Math.imul(h ^ (h >> 13), 1274126177)
  return (h ^ (h >> 16)) >>> 0
}

function bayer(n: number): number[] {
  if (n <= 1) return [0]
  const prev = bayer(n / 2)
  const h = n / 2
  const out = new Array<number>(n * n)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < h; x++) {
      const v = prev[y * h + x]
      out[y * n + x] = 4 * v
      out[y * n + x + h] = 4 * v + 2
      out[(y + h) * n + x] = 4 * v + 3
      out[(y + h) * n + x + h] = 4 * v + 1
    }
  }
  return out
}

function pattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const n = ditherSet.scale
  const s = ditherSet.size
  const cells = ditherSet.pattern === "noise" ? 32 : n
  const c = document.createElement("canvas")
  c.width = cells * s
  c.height = cells * s
  const g = c.getContext("2d")
  if (!g) return null
  const mat = matOf(n)
  const gate = (ditherSet.cut / 16) * n * n
  const step = ditherSet.cut >= 12 ? 4 : ditherSet.cut >= 4 ? 2 : 1
  g.fillStyle = INK[ditherSet.ink]
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      let on = false
      if (ditherSet.pattern === "bayer") on = mat[(y % n) * n + (x % n)] >= gate
      else if (ditherSet.pattern === "lines") on = ((x + y) % n) / n >= ditherSet.cut / 16
      else if (ditherSet.pattern === "check") on = (x + y) % step === 0
      else on = hash(x, y) % 16 >= ditherSet.cut
      if (on) g.fillRect(x * s, y * s, s, s)
    }
  }
  return ctx.createPattern(c, "repeat")
}
