import { expect, test } from "vitest"
import { CARDS, HOSTILES } from "../src/content/catalog"
import { policy } from "../src/bot/policy"
import { IDLE, MAP, makeRun, spawnBody, step, type Commands, type World } from "../src/sim/world"

const DECKS = [
  ["aegis", "apc", "plate", "frag", "k9", "jeep"],
  ["mg", "bike", "exo", "stun", "fpv", "hex_line"],
  ["medic", "hover", "copter", "killer", "smoke", "hex_siege"],
]

function play(seed: number, deck: string[]) {
  const notes: string[] = []
  const w = makeRun(seed, deck)
  const open = w.bodies.filter((b) => b.inSection).map((b) => b.kind)
  if (open.length !== 1 || open[0] !== "cell_rifle") notes.push(`open ${open.join(",")}`)
  const lead0 = w.bodies.find((b) => b.id === w.commander)
  const worn = (lead0?.gears ?? []).filter((id) => deck.includes(id)).length
  if (w.deckQueue.length + w.gearHold.length + worn !== deck.length) {
    notes.push(`queue ${w.deckQueue.length}`)
  }
  let guard = 0
  let overlap = 0
  while (w.phase === "run" && guard < 4200) {
    step(w, policy(w), 1 / 30)
    guard++
    for (const b of w.bodies) {
      if (!Number.isFinite(b.x) || !Number.isFinite(b.y) || !Number.isFinite(b.hp)) {
        notes.push(`nan ${b.kind}`)
        return notes
      }
      if (b.alive && (Math.abs(b.x) > MAP + 0.2 || Math.abs(b.y) > MAP + 0.2)) notes.push(`edge ${b.kind}`)
      if (b.alive && b.vehicle && b.hp > b.maxHp * 0.72) {
        const gun = b.parts.find((p) => p.id === "turret")
        if (gun && !gun.on) notes.push(`turret early ${b.kind} hp=${b.hp.toFixed(0)}`)
      }
    }
    const hulls = w.bodies.filter((b) => b.alive && b.vehicle && b.inSection)
    let deep = false
    for (let i = 0; i < hulls.length; i++) {
      for (let j = i + 1; j < hulls.length; j++) {
        const d = Math.hypot(hulls[i].x - hulls[j].x, hulls[i].y - hulls[j].y)
        if (d < (hulls[i].radius + hulls[j].radius) * 0.4) deep = true
      }
    }
    overlap = deep ? overlap + 1 : 0
    if (overlap > 50) notes.push(`stuck hulls t=${w.t.toFixed(1)}`)
    if (notes.length > 6) return notes
  }
  if (w.phase === "run") {
    const lead = w.bodies.find((b) => b.id === w.commander)
    notes.push(`open end t=${w.t.toFixed(1)} lead=${lead?.hp.toFixed(0) ?? "dead"}`)
  }
  return notes
}

test("playtest cycles stay bounded", () => {
  const notes: string[] = []
  const seeds = [1, 2, 3, 4, 7, 8, 11, 13, 19, 21]
  seeds.forEach((seed, i) => {
    const hit = play(seed, DECKS[i % DECKS.length])
    for (const line of hit) notes.push(`s${seed} ${line}`)
  })
  expect(notes, notes.join(" | ")).toEqual([])
})

const POOL = CARDS.filter((c) => c.deck && c.id !== "cell_rifle").map((c) => c.id)

function deckAt(n: number) {
  const deck: string[] = []
  for (let i = 0; i < 6; i++) deck.push(POOL[(n + i * 7) % POOL.length])
  return deck
}

function spot(w: World) {
  const c = w.bodies.find((b) => b.id === w.commander && b.alive)
  if (c?.boarded != null) {
    const hull = w.bodies.find((b) => b.id === c.boarded && b.alive)
    if (hull) return hull
  }
  return c
}

function toward(w: World, x: number, y: number): Commands {
  const cmd = policy(w)
  const s = spot(w)
  const dx = x - (s?.x ?? w.ax)
  const dy = y - (s?.y ?? w.ay)
  const d = Math.hypot(dx, dy)
  if (d > 1.1) {
    cmd.moveX = dx / d
    cmd.moveY = dy / d
  } else {
    cmd.moveX = 0
    cmd.moveY = 0
  }
  return cmd
}

function mark(notes: string[], line: string) {
  if (!notes.includes(line)) notes.push(line)
}

function check(w: World, notes: string[], overlap: { n: number }) {
  for (const b of w.bodies) {
    if (!Number.isFinite(b.x) || !Number.isFinite(b.y) || !Number.isFinite(b.hp) || !Number.isFinite(b.vel)) {
      mark(notes, `nan ${b.kind}`)
      return true
    }
    if (b.alive && (Math.abs(b.x) > MAP + 0.2 || Math.abs(b.y) > MAP + 0.2)) mark(notes, `edge ${b.kind}`)
    if (b.alive && b.vehicle && b.hp > b.maxHp * 0.72) {
      const gun = b.parts.find((p) => p.id === "turret")
      if (gun && !gun.on) mark(notes, `turret ${b.kind}`)
    }
    if (b.alive && b.boarded != null) {
      const ride = w.bodies.find((v) => v.id === b.boarded)
      if (ride && (ride.seats === 0 || ride.follow)) mark(notes, `aboard ${ride.kind}`)
    }
  }
  if (w.toolbar.length > 9) mark(notes, `toolbar ${w.toolbar.length}`)
  const hulls = w.bodies.filter((b) => b.alive && b.vehicle && b.inSection && !b.air)
  let deep = false
  for (let i = 0; i < hulls.length; i++) {
    for (let j = i + 1; j < hulls.length; j++) {
      const d = Math.hypot(hulls[i].x - hulls[j].x, hulls[i].y - hulls[j].y)
      if (d < (hulls[i].radius + hulls[j].radius) * 0.4) deep = true
    }
  }
  overlap.n = deep ? overlap.n + 1 : 0
  if (overlap.n > 50) {
    mark(notes, `stuck t=${w.t.toFixed(1)} d=${w.depth}`)
    return true
  }
  return false
}

function runOut(w: World, rounds: number) {
  const notes: string[] = []
  const overlap = { n: 0 }
  let guard = 0
  while (w.phase === "run" && guard < 12000) {
    const giveUp = w.lzOn && w.t > w.flareAt + 25
    const push = w.depth < rounds && !w.craftOn && !giveUp && (w.pathOn || w.t >= w.pathAt - 10)
    const exit = w.paths.find((p) => p.open) ?? w.paths[0] ?? { x: w.pathX, y: w.pathY }
    const cmd = push ? toward(w, exit.x, exit.y) : policy(w)
    try {
      step(w, cmd, 1 / 30)
    } catch (err) {
      notes.push(`throw ${err instanceof Error ? err.message : "err"}`)
      return notes
    }
    guard++
    if (check(w, notes, overlap)) return notes
  }
  if (w.phase === "run") {
    const foes = w.bodies.filter((b) => b.alive && b.side !== "player").length
    notes.push(`open t=${w.t.toFixed(0)} depth=${w.depth} path=${w.pathOn} lz=${w.lzOn} foes=${foes}`)
  }
  return notes
}

test("every card survives a scramble, three depths, and extract", () => {
  const notes: string[] = []
  const tally = { win: 0, lose: 0, open: 0, early: 0, depth: [0, 0, 0, 0, 0], winDepth: [0, 0, 0, 0, 0] }
  for (let n = 0; n < POOL.length; n++) {
    for (const seed of [n + 1, n + 40, n + 90]) {
      const w = makeRun(seed, deckAt(n + seed))
      const hit = runOut(w, 3)
      if (w.phase === "win") tally.win++
      else if (w.phase === "lose") tally.lose++
      else tally.open++
      const bucket = Math.min(4, w.depth)
      tally.depth[bucket]++
      if (w.phase === "win") tally.winDepth[bucket]++
      if (w.phase === "lose" && w.depth === 0 && w.t < 40) tally.early++
      for (const line of hit) mark(notes, `s${seed} ${deckAt(n + seed)[0]} ${line}`)
    }
  }
  const fight = makeRun(3, [])
  const lead = fight.bodies.find((b) => b.kind === "cell_rifle")!
  lead.damage = 0
  lead.hp = 4000
  HOSTILES.forEach((h, i) => {
    const a = (i / HOSTILES.length) * Math.PI * 2
    spawnBody(fight, { kind: h.id, x: Math.cos(a) * 8, y: Math.sin(a) * 8 })
  })
  const overlap = { n: 0 }
  for (let i = 0; i < 180; i++) {
    step(fight, IDLE, 1 / 30)
    if (check(fight, notes, overlap)) break
  }
  console.log(
    `SWEEP win=${tally.win} lose=${tally.lose} open=${tally.open} early=${tally.early} depth=${tally.depth.join(",")} winDepth=${tally.winDepth.join(",")} cards=${POOL.length}`,
  )
  console.log(`NOTES ${notes.slice(0, 8).join(" || ")}`)
  expect(notes, notes.slice(0, 12).join(" | ")).toEqual([])
}, 180000)
