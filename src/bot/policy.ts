import { FLARE_R, IDLE, daylight, type Commands, type World } from "../sim/world"

function here(w: World) {
  const c = w.bodies.find((b) => b.id === w.commander && b.alive)
  if (c && c.boarded !== null) {
    const hull = w.bodies.find((b) => b.id === c.boarded && b.alive)
    if (hull) return hull
  }
  return c
}

export function policy(w: World): Commands {
  const cmd: Commands = { ...IDLE }
  if (w.phase !== "run") return cmd
  const spot = here(w)
  const sx = spot?.x ?? w.ax
  const sy = spot?.y ?? w.ay
  if (w.lzOn || w.flareOn) {
    const inside = Math.hypot(sx - w.flareX, sy - w.flareY) <= FLARE_R
    const loose = w.bodies.some(
      (b) => b.alive && b.inSection && !b.vehicle && !b.follow && b.boarded === null,
    )
    let hx = 0
    let hy = 0
    let hd = Infinity
    if (!inside && loose) {
      for (const b of w.bodies) {
        if (!b.alive || !b.inSection || !b.vehicle) continue
        if (w.bodies.some((u) => u.alive && u.boarded === b.id)) continue
        if (Math.hypot(b.x - w.flareX, b.y - w.flareY) <= FLARE_R + b.radius) continue
        const d = Math.hypot(b.x - sx, b.y - sy)
        if (d < hd && d < 16) {
          hd = d
          hx = b.x
          hy = b.y
        }
      }
    }
    const tx = hd < Infinity ? hx : w.flareX
    const ty = hd < Infinity ? hy : w.flareY
    const dx = tx - sx
    const dy = ty - sy
    const d = Math.hypot(dx, dy)
    if (d > 1.2) {
      cmd.moveX = dx / d
      cmd.moveY = dy / d
    }
    if (hd < Infinity) cmd.group = true
    see(w, cmd)
    return cmd
  }
  let nearest = Infinity
  let ex = 0
  let ey = 0
  let enemies = 0
  for (const b of w.bodies) {
    if (!b.alive || b.side === "player") continue
    enemies++
    const d = Math.hypot(b.x - w.ax, b.y - w.ay)
    if (d < nearest) {
      nearest = d
      ex = b.x
      ey = b.y
    }
  }
  const planted = spot && !spot.mobileFire && spot.deployNeed > 0 && nearest < spot.range
  if (nearest < 2.6) {
    const d = nearest || 1
    cmd.moveX = (w.ax - ex) / d
    cmd.moveY = (w.ay - ey) / d
  } else if (!planted) {
    let best = Infinity
    let tx = 0
    let ty = 0
    for (const mark of [...w.drops, ...w.inbound]) {
      if (w.pathOn && Math.hypot(mark.x - w.pathX, mark.y - w.pathY) <= FLARE_R) continue
      const d = Math.hypot(mark.x - sx, mark.y - sy)
      if (d < best) {
        best = d
        tx = mark.x
        ty = mark.y
      }
    }
    if (best < 18 && best > 1) {
      cmd.moveX = (tx - sx) / best
      cmd.moveY = (ty - sy) / best
    }
  }
  const dismounted = w.bodies.some(
    (b) => b.alive && b.inSection && !b.vehicle && b.boarded === null,
  )
  const seat = w.bodies.some((v) => {
    if (!v.alive || !v.vehicle || !v.inSection) return false
    let n = 0
    for (const b of w.bodies) if (b.alive && b.boarded === v.id) n++
    return n < v.seats
  })
  if (enemies >= 4 && dismounted && seat) cmd.group = true
  const frag = w.toolbar.findIndex((t) => t.id === "frag" && t.charges > 0)
  if (frag >= 0 && nearest < 12) cmd.ability = frag
  see(w, cmd)
  return cmd
}

function see(w: World, cmd: Commands) {
  if (daylight(w.t) >= 0.45 || w.vision !== "off" || cmd.ability !== null) return
  const nvg = w.toolbar.findIndex((t) => t.id === "nvg")
  const th = w.toolbar.findIndex((t) => t.id === "thermal")
  const n = nvg >= 0 ? nvg : th
  if (n >= 0) cmd.ability = n
}
