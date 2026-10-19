import { card } from "../content/catalog"
import { BEAM_ARC, BEAM_R, CRAFT_WAIT, FLARE_ARM, FLARE_R, GAP_MAX, PATH_HOLD, beams, daylight, type Burst, type Inbound, type World } from "../sim/world"
import { actor, cargo, groundTile, limbSprite, octo, scenery, vehicleArt, type Pose } from "./sprites"

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
  oxide: "#3ecfc2",
  dust: "#d5d0c6",
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
const INK: Record<Ink, string> = { black: "#000", white: "#e8e2d0", mud: "#6a5a3a", oxide: "#3ecfc2" }
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
  g.fillStyle = "#2a2622"
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

  for (const p of w.props) {
    if (Math.abs(p.x - cx) > viewX || Math.abs(p.y - cy) > viewY) continue
    const name = p.kind === "burnt_tree" ? "tree" : p.kind
    const spr = p.alive ? scenery(name, p.id) : scenery(p.kind === "burnt_tree" || p.kind === "post" ? "stump" : "rubble")
    if (!spr) continue
    blit(g, spr, X(p.x), Y(p.y))
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
    const spr = scenery("crate")
    if (!spr) continue
    const fade = revealAlpha(w, 0, d.id)
    g.globalAlpha = fade < 1 ? fade : Math.floor(w.t * 4) % 2 === 0 ? 0.55 : 1
    blit(g, spr, X(d.x), Y(d.y))
    g.globalAlpha = 1
  }

  const bodies = w.bodies.filter((b) => b.boarded === null && b.alive).sort((a, c) => c.y - a.y)
  for (const b of bodies) {
    const x = X(b.x)
    const y = Y(b.y)
    g.globalAlpha = revealAlpha(w, b.id, 0)
    const veh = vehicleArt(b.kind)
    if (veh) {
      g.save()
      g.translate(x, y - veh.body.height / 2)
      g.rotate(-b.hdg)
      const hull = w.vision === "thermal" ? heatOf(veh.body) : veh.body
      g.drawImage(hull, -hull.width / 2, -hull.height / 2)
      const wheels = b.parts.filter((p) => p.id === "wheel" && !p.on).length
      if (wheels) {
        g.fillStyle = "#2a2622"
        g.fillRect(-6, veh.body.height / 2 - 4, wheels > 1 ? 12 : 4, 3)
      }
      if (b.parts.some((p) => p.id === "turret" && p.on)) {
        const aim = aimOf(w, b.x, b.y)
        g.save()
        g.translate(veh.mount[0], veh.mount[1])
        g.rotate(aim + b.hdg)
        const tube = w.vision === "thermal" ? heatOf(veh.turret) : veh.turret
        g.drawImage(tube, -veh.pivot[0], -veh.pivot[1])
        g.restore()
      }
      g.restore()
    } else {
      const pose: Pose = !b.mobileFire && b.deployNeed > 0 && b.deploy > 0.05 && !b.moved ? "dep" : b.moved ? "walk" : "idle"
      const frame = (Math.floor(w.t * 8) + b.id) % 2 === 0 && pose === "walk" ? "walk" : pose === "walk" ? "idle" : pose
      const spr = actor(b.kind, frame, b.face < 0)
      const bob = b.air || b.kind === "drone" || b.kind === "scoot" ? -6 : 0
      if (spr) {
        blit(g, w.vision === "thermal" ? heatOf(spr) : spr, x, y + bob)
        gash(g, spr, x, y + bob, b)
      }
      else {
        g.fillStyle = b.side === "player" ? "#c0c0c0" : b.side === "rust" ? "#3ecfc2" : "#6a3030"
        g.fillRect(x - 2, y - 8, 4, 8)
      }
    }
    if (!b.mobileFire && b.deployNeed > 0 && b.deploy < b.deployNeed) {
      const k = Math.max(1, Math.round(8 * (b.deploy / b.deployNeed)))
      g.fillStyle = "#e8e2d0"
      g.fillRect(x - 5, y - 9, k, 1)
    }
    if (b.vehicle || b.kind === "sentry_gun") {
      const frac = Math.max(0, b.hp / b.maxHp)
      g.fillStyle = "#101010"
      g.fillRect(x - 6, y - (b.vehicle ? 16 : 12), 12, 2)
      g.fillStyle = hpColor(frac)
      g.fillRect(x - 6, y - (b.vehicle ? 16 : 12), Math.round(12 * frac), 2)
    }
    if (b.vehicle && b.seats > 0) {
      let n = 0
      for (const u of w.bodies) if (u.alive && u.boarded === b.id) n++
      const seats = Math.min(4, b.seats)
      for (let i = 0; i < seats; i++) {
        g.fillStyle = i < n ? "#c0c0c0" : "#1a1612"
        g.fillRect(x - (seats * 3) / 2 + i * 3, y - 20, 2, 2)
      }
    }
    g.globalAlpha = 1
  }

  g.strokeStyle = "#d5d0c6"
  g.lineWidth = 1
  for (const s of w.shots) {
    g.globalAlpha = Math.max(0.2, s.life / 0.08)
    g.beginPath()
    g.moveTo(X(s.x), Y(s.y) - 6)
    g.lineTo(X(s.tx), Y(s.ty) - 4)
    g.stroke()
  }
  g.globalAlpha = 1

  for (const b of w.bolts) {
    g.fillStyle = b.side === "rust" ? "#3ecfc2" : "#a32020"
    g.fillRect(X(b.x) - 1, Y(b.y) - 1, 2, 2)
  }

  for (const lob of w.lobs) {
    const k = Math.min(1, lob.t / lob.T)
    const x = lob.x + (lob.tx - lob.x) * k
    const y = lob.y + (lob.ty - lob.y) * k
    const arc = Math.sin(k * Math.PI) * 10
    g.fillStyle = "#3a3a32"
    g.fillRect(X(x) - 1, Y(y) - arc, 2, 2)
  }

  for (const s of w.strikes) {
    if (s.t > 0) continue
    g.fillStyle = "rgba(225,193,90,.28)"
    g.beginPath()
    g.arc(X(s.x), Y(s.y), 10, 0, Math.PI * 2)
    g.fill()
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
    g.fillRect(X(p.x), Y(p.y), p.size, p.size)
  }
  g.globalAlpha = 1

  paintDrones(g, w, X, Y, dt)

  paintSky(g, w, bw, bh)
  paintNight(g, w, bw, bh, X, Y, zoom)

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

  paintRemains(g, w, X, Y, zoom)

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
  paintPins(ctx, w, width, height, bw, bh, zoom, cx, cy)
  paintSignals(ctx, w, width, height, bw, bh, zoom, cx, cy)
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
  return cargo(kind === "unit" || kind === "vehicle" ? f.cardId : null)
}

function paintDrone(g: CanvasRenderingContext2D, w: World, x: number, hook: number, span: number, ends: [number, number][]) {
  const spr = octo(span, Math.floor(w.t * 20))
  g.drawImage(spr, Math.round(x - spr.width / 2), Math.round(hook - spr.height + 1))
  g.fillStyle = "#6a6860"
  for (const [ex, ey] of ends) {
    const n = Math.max(1, Math.round(Math.max(Math.abs(ex - x), ey - hook)))
    for (let i = 0; i <= n; i++) g.fillRect(Math.round(x + ((ex - x) * i) / n), Math.round(hook + ((ey - hook) * i) / n), 1, 1)
  }
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
    paintDrone(g, w, gx, top - CABLE, spr.width, [[gx - half, top], [gx + half, top]])
  }

  for (const l of lifts) {
    const k = l.t / LIFT_T
    const gx = X(l.x) + Math.round(k * k * 14)
    const hook = Y(l.y) - l.h + 2 - CABLE - Math.round(k * k * 60)
    g.globalAlpha = Math.max(0, 1 - k * k)
    paintDrone(g, w, gx, hook, l.w, [[gx - 1, hook + 4], [gx + 1, hook + 4]])
  }
  g.globalAlpha = 1
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
  if (daylight(w.t + w.dayOff) >= 0.45 || w.vision !== "off") return
  if (!shade || shade.width !== bw || shade.height !== bh) {
    shade = document.createElement("canvas")
    shade.width = bw
    shade.height = bh
  }
  const s = shade.getContext("2d")
  if (!s) return
  s.setTransform(1, 0, 0, 1, 0, 0)
  s.clearRect(0, 0, bw, bh)
  s.fillStyle = "rgba(0,0,0,.62)"
  s.fillRect(0, 0, bw, bh)
  s.globalCompositeOperation = "destination-out"
  s.fillStyle = "#000"
  for (const b of beams(w)) {
    const x = X(b.x)
    const y = Y(b.y)
    s.beginPath()
    s.moveTo(x, y)
    s.arc(x, y, BEAM_R * zoom, -b.hdg - BEAM_ARC, -b.hdg + BEAM_ARC)
    s.closePath()
    s.fill()
  }
  s.globalCompositeOperation = "source-over"
  g.drawImage(shade, 0, 0)
  g.fillStyle = "rgba(214,196,150,.14)"
  for (const b of beams(w)) {
    const x = X(b.x)
    const y = Y(b.y)
    g.beginPath()
    g.moveTo(x, y)
    g.arc(x, y, BEAM_R * zoom, -b.hdg - BEAM_ARC, -b.hdg + BEAM_ARC)
    g.closePath()
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
  ctx.font = "12px VGA, monospace"
  ctx.textBaseline = "top"
  ctx.lineWidth = 1
  for (const t of w.tags) {
    const x = sx(t.x)
    const y = sy(t.y)
    const flavour = t.kind === "line"
    const soft = flavour || t.kind === "down" || t.kind === "chip"
    const ang = -0.7 + t.slot * 0.42
    const rad = soft ? 40 : 70
    const px = x + Math.cos(ang) * rad
    const py = y + Math.sin(ang) * rad * 0.65
    const col =
      t.kind === "kia" || t.kind === "part"
        ? "#a32020"
        : t.kind === "find" || t.kind === "loot" || t.kind === "bounty"
          ? "#e1c15a"
          : soft
            ? "#8a8a8a"
            : "#c0c0c0"
    ctx.globalAlpha = soft ? 0.4 : Math.max(0.25, Math.min(1, t.life))
    ctx.strokeStyle = col
    ctx.beginPath()
    ctx.moveTo(x, y - 6)
    ctx.lineTo(px, py + 6)
    ctx.stroke()
    const arm = soft ? 6 : 10
    corner(ctx, x, y, -arm, -arm, 4, 4)
    corner(ctx, x, y, arm, -arm, -4, 4)
    corner(ctx, x, y, -arm, arm, 4, -4)
    corner(ctx, x, y, arm, arm, -4, -4)
    const tw = ctx.measureText(t.text).width
    ctx.fillStyle = "rgba(0,0,0,.78)"
    ctx.fillRect(px, py, tw + 6, 14)
    ctx.fillStyle = col
    ctx.fillText(t.text, px + 3, py + 1)
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

function gash(g: CanvasRenderingContext2D, spr: HTMLCanvasElement, x: number, y: number, b: { face: number; parts: { id: string; on: boolean }[] }) {
  const left = x - spr.width / 2
  const top = y - spr.height / 2
  g.fillStyle = "#2a2622"
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
      const spr = actor(b.kind, "idle", b.face < 0)
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
  const pins: { x: number; y: number; col: string }[] = []
  for (const d of w.drops) if (!d.taken) pins.push({ x: d.x, y: d.y, col: d.kind === "loot" ? "#8a8a8a" : "#e1c15a" })
  for (const b of w.bodies) {
    if (!b.alive) continue
    if (b.vehicle) {
      if (!w.bodies.some((u) => u.alive && u.boarded === b.id)) pins.push({ x: b.x, y: b.y, col: "#c0c0c0" })
    } else if (b.inSection && b.boarded === null && Math.hypot(b.x - cx, b.y - cy) > 10) {
      pins.push({ x: b.x, y: b.y, col: "#a32020" })
    }
  }
  for (const p of pins) edgeArrow(ctx, sx(p.x), sy(p.y), width, height, p.col)

  const seen: { x: number; y: number; text: string; d: number; hot: boolean }[] = []
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
    if (n >= 4) break
    const x = sx(s.x)
    const y = sy(s.y)
    if (x < 8 || x > width - 8 || y < 8 || y > height - 8) continue
    const tw = ctx.measureText(s.text).width
    ctx.fillStyle = "rgba(0,0,0,.78)"
    ctx.fillRect(x + 4, y - 16, tw + 6, 14)
    ctx.fillStyle = s.hot ? "#a32020" : "#8a8a8a"
    ctx.fillText(s.text, x + 7, y - 15)
    n++
  }
  ctx.restore()
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
  ctx.save()
  ctx.imageSmoothingEnabled = false
  for (const f of w.inbound) {
    const x = sx(f.x)
    const y = sy(f.y)
    markFlare(ctx, x, y, width, height, 72, w.t)
  }
  if (w.lzOn || w.flareOn) {
    const x = sx(w.flareX)
    const y = sy(w.flareY)
    const lzWord =
      w.banner.startsWith("FLARE") || w.banner.startsWith("CRAFT") || w.banner.startsWith("LOAD") || w.banner === "HOLD THE LZ"
        ? w.banner
        : "LZ"
    const word = lzWord
    const tip = edgeArrow(ctx, x, y, width, height, "#e1c15a")
    if (tip) plate(ctx, tip.x, tip.y - 28, word)
    else {
      const r = Math.max(28, FLARE_R * zoom * (width / bw))
      const p = !w.flareOn ? w.flareArm / FLARE_ARM : w.craftOn ? 1 : Math.min(1, w.flareHold / CRAFT_WAIT)
      ctx.strokeStyle = "#e1c15a"
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.45
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, p)))
      ctx.stroke()
      if (w.flareOn) column(ctx, x, y, 110, w.t)
      if (w.flareOn) paintCraft(ctx, x, y, w)
      plate(ctx, x, y - r - 26, word)
    }
  }
  if (w.pathOn) {
    const x = sx(w.pathX)
    const y = sy(w.pathY)
    const word = w.pathHold > 0.05 ? `PATH ${Math.max(0, Math.ceil(PATH_HOLD - w.pathHold))}s` : "PATH"
    const tip = edgeArrow(ctx, x, y, width, height, "#3ecfc2")
    if (tip) plate(ctx, tip.x, tip.y - 28, word, "#3ecfc2")
    else {
      const r = Math.max(28, FLARE_R * zoom * (width / bw))
      const p = Math.max(0, Math.min(1, w.pathHold / PATH_HOLD))
      ctx.strokeStyle = "#3ecfc2"
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.45
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p)
      ctx.stroke()
      plate(ctx, x, y - r - 26, word, "#3ecfc2")
    }
  }
  if (w.stashOn) {
    const x = sx(w.stashX)
    const y = sy(w.stashY)
    const word = w.stashHold > 0.05 ? w.banner : "STASH"
    const tip = edgeArrow(ctx, x, y, width, height, "#9a9a94")
    if (tip) plate(ctx, tip.x, tip.y - 28, word, "#9a9a94")
    else {
      const r = Math.max(22, 3 * zoom * (width / bw))
      const p = Math.max(0, Math.min(1, w.stashHold / 4))
      ctx.strokeStyle = "#9a9a94"
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.45
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p)
      ctx.stroke()
      plate(ctx, x, y - r - 22, word, "#9a9a94")
    }
  }
  ctx.restore()
}

function markFlare(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, h: number, t: number) {
  const tip = edgeArrow(ctx, x, y, width, height, "#e1c15a")
  if (tip) plate(ctx, tip.x, tip.y - 28, "DROP")
  else column(ctx, x, y, h, t)
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

function edgeArrow(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  width: number,
  height: number,
  col: string,
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
  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(Math.atan2(dy, dx))
  ctx.fillStyle = "#000"
  ctx.beginPath()
  ctx.moveTo(16, 0)
  ctx.lineTo(-10, -12)
  ctx.lineTo(-10, 12)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.moveTo(11, 0)
  ctx.lineTo(-6, -8)
  ctx.lineTo(-6, 8)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
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
    g.fillStyle = "#141210"
    g.fillRect(x - 4, y - 2, 8, 4)
    g.fillStyle = "#3a342c"
    g.fillRect(x - 5, y - 1, 2, 2)
    g.fillRect(x + 3, y - 1, 2, 2)
    return
  }
  if (m.kind === "burn") {
    g.fillStyle = "#3a2a18"
    g.fillRect(x - 4, y - 2, 8, 4)
    g.fillStyle = "#1a1612"
    g.fillRect(x - 2, y - 1, 4, 2)
    return
  }
  g.fillStyle = m.tint === "oxide" ? "#2a5c58" : m.tint === "blood" ? "#6a3030" : "#3a342c"
  g.fillRect(x - 3, y - 1, 6, 2)
  g.fillRect(x - 1, y - 2, 2, 4)
  g.fillRect(x + 2, y + 1, 2, 2)
}

export function hpColor(frac: number) {
  if (frac > 0.55) return "#c0c0c0"
  if (frac > 0.28) return "#e1c15a"
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
