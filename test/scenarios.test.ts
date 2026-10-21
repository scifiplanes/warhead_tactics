import { expect, test } from "vitest"
import { CARDS, DECK_CAP, FORM_REPEAT, STARTER, callSign, card, hostile, priceOf, researchCost, rollHero } from "../src/content/catalog"
import { applyWear, bankFinds, deployCost, fresh, research, restart, settleHeroes, stockOf } from "../src/meta/profile"
import { policy } from "../src/bot/policy"
import {
  CRAFT_WAIT,
  FLARE_ARM,
  GAP_MAX,
  LOAD_STEP,
  PATH_HOLD,
  IDLE,
  balanceLine,
  beams,
  discover,
  makeRun,
  offerHero,
  placeDrop,
  spawnBody,
  step,
  type Commands,
} from "../src/sim/world"

function quiet(seed = 1, deck: string[] = []) {
  const w = makeRun(seed, deck)
  w.nextHorde = 1e9
  w.nextDrop = 1e9
  w.flareAt = 1e9
  w.pathAt = 1e9
  w.stashAt = 1e9
  w.nextField = 1e9
  w.autoBoard = false
  w.dayOff = 0
  w.weather = "clear"
  w.weatherAt = 1e9
  return w
}

function go(w: ReturnType<typeof makeRun>, cmd: Commands, seconds: number) {
  const n = Math.max(1, Math.round(seconds / (1 / 30)))
  for (let i = 0; i < n; i++) step(w, cmd, 1 / 30)
}

const hold = (group: boolean, spread = false): Commands => ({
  ...IDLE,
  group,
  spread,
})

test("dropped unit dies if the player never arrives", () => {
  const near = quiet(3)
  placeDrop(near, "aegis", 0, 0)
  const joined = near.bodies.find((b) => b.kind === "aegis")!
  go(near, IDLE, 0.4)
  expect(joined.inSection).toBe(true)
  expect(joined.alive).toBe(true)

  const far = quiet(3)
  placeDrop(far, "aegis", 30, 0)
  const drop = far.bodies.find((b) => b.kind === "aegis")!
  for (let i = 0; i < 8; i++) {
    spawnBody(far, {
      kind: "shambler",
      x: 30,
      y: 0,
      speed: 0,
      damage: 8,
      cooldown: 0.3,
    })
  }
  go(far, IDLE, 6)
  expect(drop.inSection).toBe(false)
  expect(drop.alive).toBe(false)
  expect(far.lost).toBeGreaterThan(0)
  console.log("GATE drop-death ok")
})

test("a drop lands with a gun", () => {
  const w = quiet()
  for (const id of ["cell_rifle", "medic", "engr", "relay", "operator", "jtac", "truck", "hawk", "drill", "aegis"]) {
    placeDrop(w, id, 0, 0)
  }
  for (const b of w.bodies.filter((b) => !b.inSection)) {
    expect(b.range).toBeGreaterThan(0)
    expect(b.damage).toBeGreaterThan(0)
  }
  const cell = w.bodies.find((b) => b.kind === "cell_rifle" && !b.inSection)!
  expect(cell.gears).toContain("rifle")
  const truck = w.bodies.find((b) => b.kind === "truck")!
  expect(truck.mobileFire).toBe(true)
  expect(truck.gears).not.toContain("rifle")
  const hawk = w.bodies.find((b) => b.kind === "hawk")!
  expect(hawk.mobileFire).toBe(true)
  const aegis = w.bodies.find((b) => b.kind === "aegis")!
  expect(aegis.gears).not.toContain("rifle")
  expect(aegis.damage).toBe(5)
})

test("a drop holds at the crate and shoots", () => {
  const bare = quiet(3)
  const lead = bare.bodies.find((b) => b.kind === "cell_rifle")!
  lead.x = -30
  bare.ax = -30
  placeDrop(bare, "cell_rifle", 0, 0)
  spawnBody(bare, { kind: "shambler", x: 12, y: 0 })
  const cell = bare.bodies.find((b) => b.kind === "cell_rifle" && !b.inSection)!
  go(bare, IDLE, 2)
  expect(cell.alive).toBe(true)
  expect(Math.hypot(cell.x, cell.y)).toBeLessThan(1)

  const gun = quiet(3)
  const lead2 = gun.bodies.find((b) => b.kind === "cell_rifle")!
  lead2.x = -30
  gun.ax = -30
  placeDrop(gun, "aegis", 0, 0)
  const foe = spawnBody(gun, { kind: "shambler", x: 6, y: 0 })
  const aegis = gun.bodies.find((b) => b.kind === "aegis")!
  go(gun, IDLE, 2)
  expect(Math.hypot(aegis.x, aegis.y)).toBeLessThan(1)
  expect(aegis.fired).toBeGreaterThan(0)
  expect(foe.hp).toBeLessThan(foe.maxHp)
})

test("pickup is a short reach", () => {
  const w = quiet()
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.x = 0
  cell.y = 0
  w.ax = 0
  w.ay = 0
  placeDrop(w, "plate", 3.4, 0)
  go(w, IDLE, 0.2)
  expect(w.drops.some((d) => d.cardId === "plate" && !d.taken)).toBe(true)
  placeDrop(w, "stim", 2.4, 0)
  go(w, IDLE, 0.2)
  expect(cell.gears).toContain("stim")
})

test("gear fits an eligible body and shows on the toolbar", () => {
  const w = quiet()
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  const before = cell.armor
  placeDrop(w, "plate", 0.4, 0)
  go(w, IDLE, 0.3)
  expect(cell.gears).toContain("plate")
  expect(cell.armor).toBeGreaterThan(before)

  placeDrop(w, "frag", 0.2, 0.2)
  go(w, IDLE, 0.3)
  const frag = w.toolbar.find((t) => t.id === "frag")
  expect(frag).toBeTruthy()
  expect(frag!.charges).toBeGreaterThan(0)

  const foe = spawnBody(w, {
    kind: "shambler",
    x: 4,
    y: 0,
    speed: 0,
    damage: 0,
    hp: 80,
  })
  const hp = foe.hp
  step(w, { ...IDLE, ability: 0 }, 1 / 30)
  expect(foe.hp).toBeLessThan(hp)
  expect(w.toolbar.find((t) => t.id === "frag")!.charges).toBe(0)
  console.log("GATE gear-toolbar ok")
})

test("hold boards one body per tick and alternates vehicles", () => {
  const w = quiet()
  w.file = "tight"
  spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true })
  spawnBody(w, { kind: "plow", x: 0, y: 0, inSection: true })
  spawnBody(w, { kind: "aegis", x: 0, y: 0, inSection: true })
  spawnBody(w, { kind: "aegis", x: 0, y: 0, inSection: true })

  const boarded = () => w.bodies.filter((b) => b.alive && b.boarded !== null)
  step(w, hold(true), 1 / 30)
  expect(boarded()).toHaveLength(1)
  const first = boarded()[0].boarded
  step(w, hold(true), FORM_REPEAT - 0.05)
  expect(boarded()).toHaveLength(1)
  step(w, hold(true), 0.08)
  expect(boarded()).toHaveLength(2)
  const veh = new Set(boarded().map((b) => b.boarded))
  expect(veh.size).toBe(2)
  expect(veh.has(first)).toBe(true)
  expect(w.groupLabel).toBe("BOARD")
  console.log("GATE board-alternate ok")
})

test("the lead boards the fastest hull", () => {
  const w = quiet()
  w.file = "tight"
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  const jeep = spawnBody(w, { kind: "jeep", x: 0, y: 0, inSection: true })
  const apc = spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true })
  const other = spawnBody(w, { kind: "aegis", x: 0, y: 0, inSection: true })
  for (const b of [cell, jeep, apc]) {
    b.x = 0
    b.y = 0
  }
  expect(w.commander).toBe(cell.id)
  step(w, hold(true), 1 / 30)
  expect(cell.boarded).toBe(jeep.id)
  step(w, hold(true), FORM_REPEAT + 0.05)
  expect(other.boarded).toBe(apc.id)
})

test("spread disembarks before it loosens the file", () => {
  const w = quiet()
  w.file = "tight"
  const apc = spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true })
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  const aegis = spawnBody(w, { kind: "aegis", x: 0, y: 0, inSection: true })
  cell.boarded = apc.id
  aegis.boarded = apc.id

  step(w, hold(false, true), 1 / 30)
  const still = w.bodies.filter((b) => b.boarded === apc.id)
  expect(still).toHaveLength(1)
  expect(w.file).toBe("tight")
  expect(w.spreadLabel).toBe("EXIT")

  step(w, IDLE, 1 / 30)
  step(w, hold(false, true), 1 / 30)
  expect(w.bodies.some((b) => b.boarded !== null)).toBe(false)
  expect(w.file).toBe("tight")

  step(w, IDLE, 1 / 30)
  step(w, hold(false, true), 1 / 30)
  expect(w.file).toBe("loose")
  console.log("GATE spread-exit ok")
})

test("fast drive leaves a body behind", () => {
  const w = quiet()
  w.props.length = 0
  const apc = spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true })
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.boarded = apc.id
  const foot = spawnBody(w, { kind: "aegis", x: 0, y: 0, inSection: true })
  go(w, { ...IDLE, moveY: 1 }, 2)
  const gap = Math.hypot(foot.x - apc.x, foot.y - apc.y)
  expect(gap).toBeGreaterThan(8)
  expect(foot.boarded).toBeNull()
  expect(foot.alive).toBe(true)
  console.log("GATE leave-behind ok")
})

test("stand-to-fire stays silent until deploy completes", () => {
  const w = quiet()
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  const foe = spawnBody(w, {
    kind: "shambler",
    x: 4,
    y: 0,
    speed: 0,
    damage: 0,
    hp: 500,
  })
  go(w, IDLE, 2)
  const fired = cell.fired
  expect(fired).toBeGreaterThan(0)
  const hp = foe.hp
  go(w, { ...IDLE, moveY: 1 }, 0.35)
  expect(cell.fired).toBe(fired)
  expect(cell.deploy).toBe(0)
  expect(foe.hp).toBe(hp)
  go(w, IDLE, 0.35)
  expect(cell.fired).toBe(fired)
  go(w, IDLE, 1.2)
  expect(cell.fired).toBeGreaterThan(fired)
  console.log("GATE deploy-fire ok")
})

test("a bite reaches a hull skin and a zero-hp hull dies", () => {
  const bite = quiet()
  const tank = spawnBody(bite, { kind: "tank", x: 0, y: 0, inSection: true, damage: 0 })
  bite.bodies.find((b) => b.kind === "cell_rifle")!.boarded = tank.id
  bite.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  spawnBody(bite, {
    kind: "shambler",
    x: tank.radius + 0.3,
    y: 0,
    speed: 0,
    damage: 12,
    cooldown: 0.2,
    range: 1.2,
  })
  const before = tank.hp
  go(bite, IDLE, 0.25)
  expect(tank.hp).toBeLessThan(before)

  const wreck = quiet()
  const hull = spawnBody(wreck, { kind: "jeep", x: 0, y: 0, inSection: true, damage: 0, hp: 0 })
  expect(hull.alive).toBe(true)
  step(wreck, IDLE, 1 / 30)
  expect(hull.alive).toBe(false)
  console.log("GATE melee-hull-reach ok")
})

test("a bite scrapes a hull instead of chewing it", () => {
  const w = quiet()
  const tank = spawnBody(w, { kind: "tank", x: 0, y: 0, inSection: true, damage: 0 })
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.boarded = tank.id
  cell.damage = 0
  spawnBody(w, {
    kind: "pighead",
    x: 1.2,
    y: 0,
    speed: 0,
    damage: 10,
    cooldown: 0.2,
    range: 2,
  })
  const before = tank.hp
  go(w, IDLE, 0.22)
  const lost = before - tank.hp
  const scrape = Math.max(0.25, 0.9 - tank.armor)
  expect(lost).toBeCloseTo(10 * scrape * (1 - tank.armor), 5)
  console.log("GATE melee-hull scrape ok")
})

test("ram hurts the hull and only a heavy hull breaks a ruin", () => {
  const ram = quiet()
  ram.props.length = 0
  const apc = spawnBody(ram, { kind: "apc", x: 0, y: 0, inSection: true, damage: 0 })
  const cell = ram.bodies.find((b) => b.kind === "cell_rifle")!
  cell.boarded = apc.id
  const meat = spawnBody(ram, {
    kind: "shambler",
    x: 0,
    y: 0,
    speed: 0,
    damage: 0,
    hp: 40,
  })
  const hull = apc.hp
  apc.vel = 6
  step(ram, IDLE, 1 / 30)
  expect(meat.hp).toBeLessThan(40)
  expect(apc.hp).toBeLessThan(hull)

  const heavy = quiet()
  heavy.props.length = 0
  const plow = spawnBody(heavy, { kind: "plow", x: 0, y: 0, inSection: true, damage: 0 })
  const driver = heavy.bodies.find((b) => b.kind === "cell_rifle")!
  driver.boarded = plow.id
  const ruin = heavy.props.push({
    id: 900,
    kind: "ruin",
    x: 0,
    y: 4,
    hp: 30,
    radius: 1.05,
    alive: true,
  })
  void ruin
  const plowHp = plow.hp
  go(heavy, { ...IDLE, moveY: 1 }, 0.25)
  expect(plow.hdg).toBeGreaterThan(0.05)
  expect(Math.abs(plow.x)).toBeLessThan(0.5)
  go(heavy, { ...IDLE, moveY: 1 }, 2)
  expect(heavy.props.find((p) => p.kind === "ruin")!.alive).toBe(false)
  expect(plow.hp).toBeLessThan(plowHp)
  expect(plow.y).toBeGreaterThan(4)

  const light = quiet()
  light.props.length = 0
  const lightApc = spawnBody(light, { kind: "apc", x: 0, y: 0, inSection: true, damage: 0 })
  const foot = light.bodies.find((b) => b.kind === "cell_rifle")!
  foot.boarded = lightApc.id
  light.props.push({
    id: 901,
    kind: "ruin",
    x: 0,
    y: 4,
    hp: 30,
    radius: 1.05,
    alive: true,
  })
  const apcHp = lightApc.hp
  go(light, { ...IDLE, moveY: 1 }, 0.8)
  const wall = light.props.find((p) => p.kind === "ruin")!
  expect(wall.alive).toBe(true)
  expect(lightApc.hp).toBeLessThan(apcHp)
  expect(lightApc.y).toBeLessThan(3)
  console.log("GATE ram-prop ok")
})

test("a hull drives off after one bump", () => {
  const w = quiet()
  w.props.length = 0
  const apc = spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true, damage: 0 })
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.boarded = apc.id
  w.props.push({ id: 903, kind: "ruin", x: 0, y: 3, hp: 30, radius: 1.05, alive: true })
  go(w, { ...IDLE, moveY: 1 }, 0.7)
  const hitY = apc.y
  go(w, { ...IDLE, moveY: -1 }, 1)
  expect(apc.y).toBeLessThan(hitY - 0.8)
  expect(apc.alive).toBe(true)
})

test("a ruin stutter does not chew a hull down", () => {
  const w = quiet()
  w.props.length = 0
  const jeep = spawnBody(w, { kind: "jeep", x: 0, y: 0, inSection: true, damage: 0 })
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.boarded = jeep.id
  for (let i = 0; i < 4; i++) {
    w.props.push({
      id: 910 + i,
      kind: "ruin",
      x: (i % 2) * 1.1 - 0.55,
      y: 2.2 + Math.floor(i / 2) * 1.1,
      hp: 30,
      radius: 1.05,
      alive: true,
    })
  }
  const before = jeep.hp
  go(w, { ...IDLE, moveY: 1 }, 1.2)
  expect(jeep.alive).toBe(true)
  expect(before - jeep.hp).toBeLessThan(before * 0.35)
  console.log("GATE ruin-stutter ok")
})

test("holding the path opens a harder field", () => {
  const w = quiet()
  w.pathOn = true
  w.pathX = 0
  w.pathY = 0
  const foe = spawnBody(w, { kind: "shambler", x: 8, y: 0, hp: 40, damage: 0, speed: 0 })
  const before = w.diffHp
  go(w, IDLE, 0.4)
  expect(w.depth).toBe(0)
  expect(w.pathHold).toBeGreaterThan(0.2)
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.x = 20
  go(w, IDLE, 0.2)
  expect(w.pathHold).toBe(0)
  cell.x = 0
  cell.y = 0
  go(w, IDLE, PATH_HOLD + 0.2)
  expect(w.depth).toBe(1)
  expect(w.diffHp).toBeGreaterThan(before)
  expect(w.phase).toBe("run")
  expect(w.pathOn).toBe(false)
  expect(w.bodies.some((b) => b.id === foe.id)).toBe(false)
})

test("a parked hull takes no collision damage", () => {
  const w = quiet()
  w.props.length = 0
  const apc = spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true, damage: 0 })
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.boarded = apc.id
  apc.vel = 0
  w.props.push({ id: 902, kind: "ruin", x: 0, y: 1.6, hp: 30, radius: 1.05, alive: true })
  const hp = apc.hp
  go(w, { ...IDLE, moveY: 1 }, 1.5)
  expect(apc.hp).toBe(hp)
  expect(w.props[0].alive).toBe(true)

  const still = quiet()
  still.props.length = 0
  const hull = spawnBody(still, { kind: "apc", x: 0, y: 0, inSection: true, damage: 0 })
  still.bodies.find((b) => b.kind === "cell_rifle")!.boarded = hull.id
  hull.vel = 0
  const meat = spawnBody(still, { kind: "shambler", x: 0.2, y: 0, speed: 0, damage: 0, hp: 40 })
  const hullHp = hull.hp
  go(still, IDLE, 1)
  expect(hull.hp).toBe(hullHp)
  expect(meat.hp).toBe(40)
})

test("two crewed hulls keep a gap while driving", () => {
  const w = quiet()
  w.props.length = 0
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  const apc = spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true })
  const jeep = spawnBody(w, { kind: "jeep", x: 0, y: 0, inSection: true })
  const extra = spawnBody(w, { kind: "aegis", x: 0, y: 0, inSection: true })
  cell.boarded = apc.id
  extra.boarded = jeep.id
  apc.x = -20
  apc.y = 0
  jeep.x = -14
  jeep.y = 0
  cell.x = apc.x
  cell.y = apc.y
  extra.x = jeep.x
  extra.y = jeep.y
  const need = apc.radius + jeep.radius + 1.2
  let late = Infinity
  for (let i = 0; i < 90; i++) {
    step(w, { ...IDLE, moveX: 1 }, 1 / 30)
    if (i > 45) late = Math.min(late, Math.hypot(apc.x - jeep.x, apc.y - jeep.y))
  }
  expect(late).toBeGreaterThan(need)
  expect(apc.x).toBeGreaterThan(0)
  expect(jeep.vel).toBeGreaterThan(0)
})

test("joining unit waits before it boards", () => {
  const w = quiet()
  const apc = spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true })
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.boarded = apc.id
  placeDrop(w, "aegis", 0.3, 0)
  step(w, IDLE, 1 / 30)
  const join = w.bodies.find((b) => b.kind === "aegis")!
  expect(join.inSection).toBe(true)
  expect(join.boarded).toBeNull()
  go(w, IDLE, 0.4)
  expect(join.boarded).toBeNull()
  go(w, IDLE, 1.2)
  expect(join.boarded).toBe(apc.id)
})

test("a rust gun misses a body that steps off the shot", () => {
  const w = quiet()
  w.props.length = 0
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.x = 30
  cell.y = 30
  spawnBody(w, { kind: "scoot", x: 0, y: 0, speed: 0, damage: 8, cooldown: 10 })
  const dog = spawnBody(w, { kind: "doghead", x: 6, y: 0, speed: 0, damage: 0, hp: 40 })
  step(w, IDLE, 1 / 30)
  expect(w.bolts.length).toBe(1)
  dog.y = 4
  go(w, IDLE, 1.3)
  expect(dog.hp).toBe(40)
  expect(w.bolts.length).toBe(0)
})

test("three sides damage each other", () => {
  const w = quiet()
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.x = 30
  cell.y = 30
  w.ax = 30
  w.ay = 30
  const dog = spawnBody(w, { kind: "doghead", x: 0, y: 0, speed: 0, range: 2 })
  const scoot = spawnBody(w, { kind: "scoot", x: 0.4, y: 0, speed: 0 })
  const dogHp = dog.hp
  const scootHp = scoot.hp
  go(w, IDLE, 1.5)
  expect(dog.hp).toBeLessThan(dogHp)
  expect(scoot.hp).toBeLessThan(scootHp)
})

test("the flare arms, the craft waits, then the squad loads", () => {
  const w = quiet()
  w.lzOn = true
  w.flareX = 0
  w.flareY = 0
  const cell = w.bodies.find((b) => b.inSection)!
  const extra = spawnBody(w, { kind: "aegis", x: 1, y: 0, inSection: true })
  cell.x = 12
  cell.y = 0
  go(w, IDLE, 0.2)
  expect(w.flareOn).toBe(false)
  cell.x = 0
  cell.y = 0
  go(w, { ...IDLE, moveX: 1 }, 0.4)
  expect(w.flareOn).toBe(false)
  expect(w.flareArm).toBeGreaterThan(0.2)
  cell.x = 20
  go(w, IDLE, 0.2)
  expect(w.flareArm).toBe(0)
  cell.x = 0
  cell.y = 0
  extra.x = 1
  extra.y = 0
  w.ax = 0
  w.ay = 0
  go(w, IDLE, FLARE_ARM + 0.15)
  expect(w.flareOn).toBe(true)
  expect(w.phase).toBe("run")
  go(w, { ...IDLE, moveY: 1 }, 0.3)
  expect(w.flareHold).toBeGreaterThan(0.1)
  cell.x = 0
  cell.y = 0
  extra.x = 1
  extra.y = 0
  w.ax = 0
  w.ay = 0
  go(w, IDLE, CRAFT_WAIT + 0.2)
  expect(w.craftOn).toBe(true)
  expect(w.phase).toBe("run")
  expect(cell.alive || extra.alive).toBe(true)
  go(w, IDLE, LOAD_STEP * 2 + 0.4)
  expect(w.phase).toBe("win")
  expect(w.lost).toBe(0)
})

test("a hull or a sentry with no unit loses, and a loaded hull still extracts", () => {
  const wiped = quiet()
  spawnBody(wiped, { kind: "jeep", x: 2, y: 0, inSection: true })
  spawnBody(wiped, { kind: "sentry_gun", x: -2, y: 0, inSection: true })
  wiped.bodies.find((b) => b.id === wiped.commander)!.alive = false
  wiped.credits = 80
  go(wiped, IDLE, 0.1)
  expect(wiped.phase).toBe("lose")
  expect(wiped.credits).toBe(0)

  const followed = quiet()
  spawnBody(followed, { kind: "k9", x: 1, y: 0, inSection: true })
  followed.bodies.find((b) => b.id === followed.commander)!.alive = false
  go(followed, IDLE, 0.1)
  expect(followed.phase).toBe("run")

  const w = quiet()
  w.lzOn = true
  w.flareOn = true
  w.craftOn = true
  w.flareX = 0
  w.flareY = 0
  const cell = w.bodies.find((b) => b.inSection)!
  cell.x = 0
  cell.y = 0
  spawnBody(w, { kind: "jeep", x: 1, y: 0, inSection: true })
  w.credits = 80
  go(w, IDLE, LOAD_STEP * 2 + 0.4)
  expect(w.phase).toBe("win")
  expect(w.credits).toBe(120)
})

test("extracted units, gear, and vehicles recoup their deployment cost", () => {
  const deck = ["jeep", "plate", "frag"]
  const wear = { jeep: 1 }
  const w = makeRun(1, deck, { wear })
  expect(w.deckPay.reduce((sum, n) => sum + n, 0)).toBe(deployCost(deck, wear))
  w.nextHorde = 1e9
  w.nextField = 1e9
  w.stashAt = 1e9
  w.pathAt = 1e9
  w.flareAt = 1e9
  w.autoBoard = false
  for (let n = 0; n < deck.length; n++) {
    w.nextDrop = 0
    go(w, IDLE, 0.05)
    const inbound = w.inbound[0]
    inbound.x = 0
    inbound.y = 0
    inbound.t = 0
    go(w, IDLE, 0.2)
  }
  const jeep = w.bodies.find((b) => b.kind === "jeep")!
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  expect(jeep.cost).toBe(140)
  expect(lead.gearPay.plate).toBe(20)
  expect(w.kitPay).toBe(25)
  w.autoBoard = false
  lead.boarded = null
  w.lzOn = true
  w.flareOn = true
  w.craftOn = true
  w.flareX = 0
  w.flareY = 0
  lead.x = 0
  lead.y = 0
  jeep.x = 30
  jeep.y = 0
  w.ax = 0
  w.ay = 0
  go(w, IDLE, LOAD_STEP + 0.2)
  expect(lead.out).toBe(true)
  expect(jeep.out).toBe(false)
  expect(w.phase).toBe("run")
  go(w, IDLE, 6.2)
  expect(w.phase).toBe("win")
  expect(jeep.inSection).toBe(false)
  expect(w.credits).toBe(40 + 20 + 25)
})

test("the first unit is the squad center", () => {
  const w = quiet()
  const med = w.bodies.find((b) => b.kind === "cell_rifle")!
  const aeg = spawnBody(w, { kind: "aegis", x: 0, y: 0, inSection: true })
  const jeep = spawnBody(w, { kind: "jeep", x: 0, y: 0, inSection: true })
  const apc = spawnBody(w, { kind: "apc", x: 0, y: 0, inSection: true })
  expect(w.commander).toBe(med.id)
  med.boarded = jeep.id
  aeg.boarded = apc.id
  jeep.x = 0
  jeep.y = 0
  apc.x = 20
  apc.y = 0
  w.ax = 0
  w.ay = 0
  w.props.length = 0
  go(w, { ...IDLE, moveY: 1 }, 0.6)
  expect(Math.hypot(w.ax - jeep.x, w.ay - jeep.y)).toBeLessThan(5)
  expect(Math.hypot(w.ax - apc.x, w.ay - apc.y)).toBeGreaterThan(8)
})

test("file closes a little per tap and a hit throws a part", () => {
  const w = quiet()
  expect(w.gap).toBe(GAP_MAX)
  step(w, hold(true), 1 / 30)
  expect(w.gap).toBeLessThan(GAP_MAX)
  expect(w.gap).toBeGreaterThan(GAP_MAX - 1)
  expect(w.file).toBe("loose")
  const foe = spawnBody(w, { kind: "shambler", x: 4, y: 0, speed: 0, damage: 0, hp: 80 })
  const parts = foe.parts.filter((p) => p.on).length
  go(w, IDLE, 1)
  expect(foe.parts.filter((p) => p.on).length).toBeLessThan(parts)
  expect(w.gibs.length).toBeGreaterThan(0)
  expect(w.marks.some((m) => m.kind === "splat")).toBe(true)
  foe.hp = 1
  go(w, IDLE, 0.5)
  expect(foe.alive).toBe(false)
  expect(w.bodies.some((b) => b.id === foe.id)).toBe(true)
})

test("field loot is not an upgrade drop", () => {
  const w = quiet()
  w.nextField = 0
  w.hidden = []
  step(w, IDLE, 1 / 30)
  expect(w.inbound.some((f) => f.loot)).toBe(false)
  const loot = w.drops.find((d) => d.kind === "loot")
  expect(loot && ["salvage", "intel", "sample"].includes(loot.cardId)).toBe(true)
})

test("a weapon is gear and replaces the gun", () => {
  const w = quiet()
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  expect(lead.gears).toContain("rifle")
  expect(lead.damage).toBe(7)
  const bare = spawnBody(w, { kind: "medic", x: 1, y: 0, inSection: true })
  expect(bare.damage).toBe(0)
  placeDrop(w, "mg", 1, 0)
  go(w, IDLE, 0.3)
  expect(bare.gears).toContain("mg")
  expect(bare.cooldown).toBeLessThan(0.2)
  expect(lead.gears).toContain("rifle")
  placeDrop(w, "sniper", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("sniper")
  expect(lead.gears.includes("rifle")).toBe(false)
  expect(lead.pierce).toBe(3)
  expect(card("gren").gun?.lob).toBe(true)
  expect(card("mortar").kind).toBe("gear")
})

test("gun attachments shed onto the mud as items when the gun is replaced", () => {
  const w = quiet()
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  placeDrop(w, "plate", 0.2, 0)
  placeDrop(w, "scope", 0.3, 0)
  placeDrop(w, "grip", 0.4, 0)
  go(w, IDLE, 0.4)
  expect(lead.gears).toContain("plate")
  expect(lead.gears).toContain("scope")
  expect(lead.gears).toContain("grip")
  expect(lead.range).toBeCloseTo(9 * 1.3, 5)
  placeDrop(w, "sniper", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("sniper")
  expect(lead.gears).toContain("plate")
  expect(lead.gears.includes("scope")).toBe(false)
  expect(lead.gears.includes("grip")).toBe(false)
  expect(lead.range).toBe(18)
  const shed = w.drops.filter((d) => !d.taken && d.skin === "item")
  expect(shed.map((d) => d.cardId).sort()).toEqual(["grip", "scope"])
  const scopeDrop = shed.find((d) => d.cardId === "scope")!
  lead.x = scopeDrop.x
  lead.y = scopeDrop.y
  w.ax = lead.x
  w.ay = lead.y
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("scope")
  expect(lead.range).toBeCloseTo(18 * 1.3, 5)
})

test("a second optic replaces the first and sheds it as an item", () => {
  const w = quiet()
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  placeDrop(w, "scope", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("scope")
  expect(lead.range).toBeCloseTo(11.7, 5)
  placeDrop(w, "dot", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("dot")
  expect(lead.gears.includes("scope")).toBe(false)
  expect(lead.range).toBe(9)
  expect(lead.cooldown).toBeCloseTo(0.45 * 0.88, 5)
  expect(w.drops.some((d) => !d.taken && d.cardId === "scope" && d.skin === "item")).toBe(true)
})

test("blades reject gun attachments and bows accept them", () => {
  const blade = quiet()
  const lead = blade.bodies.find((b) => b.kind === "cell_rifle")!
  placeDrop(blade, "katana", 0.2, 0)
  go(blade, IDLE, 0.3)
  expect(lead.gears).toContain("katana")
  expect(lead.gears.includes("rifle")).toBe(false)
  placeDrop(blade, "scope", 0.2, 0)
  go(blade, IDLE, 0.3)
  expect(lead.gears.includes("scope")).toBe(false)
  expect(blade.drops.some((d) => !d.taken && d.cardId === "scope")).toBe(true)

  const bow = quiet(2)
  const cell = bow.bodies.find((b) => b.kind === "cell_rifle")!
  placeDrop(bow, "bow", 0.2, 0)
  go(bow, IDLE, 0.3)
  placeDrop(bow, "grip", 0.2, 0)
  go(bow, IDLE, 0.3)
  expect(cell.gears).toContain("bow")
  expect(cell.gears).toContain("grip")
})

test("bipod needs a deploy weapon", () => {
  const w = quiet()
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  placeDrop(w, "gren", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("gren")
  placeDrop(w, "bipod", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears.includes("bipod")).toBe(false)
  placeDrop(w, "rifle", 0.2, 0)
  go(w, IDLE, 0.3)
  placeDrop(w, "bipod", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("bipod")
  expect(lead.deployNeed).toBeCloseTo(0.8 * 0.4, 5)
})

test("every gun attachment has a slot and a price", () => {
  const ids = [
    "dot",
    "holo",
    "scope",
    "long",
    "reflex",
    "therm_sight",
    "grip",
    "agrip",
    "stub",
    "stop",
    "fore",
    "stick",
    "drum",
    "box",
    "belt",
    "bipod",
    "stock",
    "brace",
    "fold",
    "brake",
    "supp",
    "comp",
    "flash",
  ]
  for (const id of ids) {
    const c = card(id)
    expect(c.kind).toBe("gear")
    expect(c.slot).toBeTruthy()
    expect(priceOf(id)).toBeGreaterThan(0)
  }
})

test("a field commits to one ground's cover", () => {
  const seen = new Set<string>()
  const mixes = new Set<string>()
  for (let seed = 1; seed <= 20; seed++) {
    const w = makeRun(seed, [])
    const kinds = [...new Set(w.props.map((p) => p.kind))].sort()
    mixes.add(kinds.join(","))
    for (const id of kinds) seen.add(id)
  }
  expect([...seen].sort()).toEqual(["burnt_tree", "post", "ruin", "teeth", "wire", "wreck"])
  expect(mixes.size).toBeGreaterThan(1)
})

test("deck cards wait in the airdrop queue", () => {
  const w = makeRun(1, ["aegis", "medic", "plate"])
  const kinds = w.bodies.filter((b) => b.inSection).map((b) => b.kind)
  expect(kinds).toEqual(["cell_rifle"])
  expect(w.deckQueue.slice().sort()).toEqual(["aegis", "medic", "plate"])
})

test("airdrops land a walk apart", () => {
  const w = makeRun(3, ["plate", "mg", "stim"])
  w.nextHorde = 1e9
  w.nextField = 1e9
  w.flareAt = 1e9
  w.pathAt = 1e9
  w.stashAt = 1e9
  go(w, IDLE, 8.2)
  expect(w.inbound).toHaveLength(1)
  const first = w.inbound[0]
  expect(Math.hypot(first.x - w.ax, first.y - w.ay)).toBeGreaterThan(20)
  go(w, IDLE, 12)
  const pending = [...w.inbound, ...w.drops.filter((d) => !d.taken && d.kind !== "loot")]
  expect(pending).toHaveLength(1)
  go(w, IDLE, 4)
  const spots = [...w.inbound, ...w.drops.filter((d) => !d.taken && d.kind !== "loot")]
  expect(spots.length).toBeGreaterThanOrEqual(2)
  expect(Math.hypot(spots[0].x - spots[1].x, spots[0].y - spots[1].y)).toBeGreaterThan(18)
})

test("kills and loot pay credits, and a find stays locked until research", () => {
  const w = quiet()
  const foe = spawnBody(w, { kind: "shambler", x: 3, y: 0, speed: 0, damage: 0, hp: 1 })
  go(w, IDLE, 2)
  expect(foe.alive).toBe(false)
  expect(w.credits).toBeGreaterThanOrEqual(4)
  expect(w.tags.some((t) => t.text === "DOWN")).toBe(true)
  w.drops.push({ id: 900, cardId: "intel", x: 0, y: 0, bodyId: -1, kind: "loot", taken: false, cost: 0 })
  const before = w.credits
  go(w, IDLE, 0.2)
  expect(w.credits).toBe(before + 18)
  expect(w.tags.some((t) => t.text === "INTEL")).toBe(true)
  placeDrop(w, "mg", 0.3, 0)
  go(w, IDLE, 0.4)
  expect(w.found).toContain("mg")
  expect(w.tags.some((t) => t.text === "FIND")).toBe(true)
  const p = fresh()
  expect(deployCost(["cell_rifle"])).toBe(0)
  expect(priceOf("aegis")).toBeGreaterThan(0)
  expect(researchCost("aegis")).toBe(priceOf("aegis") * 20)
  expect(researchCost("aegis", 1)).toBe(priceOf("aegis") * 40)
  p.found.push("aegis")
  p.credits = researchCost("aegis") - 1
  expect(research(p, "aegis")).toBe(false)
  p.credits = researchCost("aegis")
  expect(research(p, "aegis")).toBe(true)
  expect(p.known).toContain("aegis")
  expect(stockOf(p, "aegis")).toBe(1)
  expect(deployCost(["aegis"])).toBe(priceOf("aegis"))
})

test("researching again raises the cost and adds a copy", () => {
  const p = fresh()
  expect(stockOf(p, "cell_rifle")).toBe(1)
  expect(researchCost("cell_rifle", 1)).toBe(20 * 20 * 2)
  p.found.push("aegis")
  const base = researchCost("aegis", 0)
  p.credits = base
  expect(research(p, "aegis")).toBe(true)
  expect(stockOf(p, "aegis")).toBe(1)
  const next = researchCost("aegis", p.depth.aegis)
  expect(next).toBe(base * 2)
  p.credits = next - 1
  expect(research(p, "aegis")).toBe(false)
  p.credits = next
  expect(research(p, "aegis")).toBe(true)
  expect(stockOf(p, "aegis")).toBe(2)
  expect(p.depth.aegis).toBe(2)
  p.depth.aegis = DECK_CAP
  p.credits = researchCost("aegis", DECK_CAP)
  expect(research(p, "aegis")).toBe(false)
  expect(stockOf(p, "aegis")).toBe(DECK_CAP)
})

test("extract banks finds as researchable, not buyable", () => {
  const profile = fresh()
  restart(profile)
  expect(profile.found).not.toBe(profile.known)
  expect(profile.known).toEqual([STARTER])
  const finds = ["jeep", "tank", "mg", "plate", "bipod", "stim", "plating", "mines", "nitro"]
  const hidden = CARDS.filter((c) => c.deck && !profile.found.includes(c.id)).map((c) => c.id)
  const w = makeRun(1, [STARTER], { hidden, known: profile.known })
  expect(w.found).not.toBe(profile.known)
  expect(w.found).toEqual([])
  expect(w.unlocked).toEqual([STARTER])
  expect(w.unlocked).not.toBe(profile.known)
  for (const id of finds) {
    placeDrop(w, id, 0, 0)
    go(w, IDLE, 0.5)
  }
  for (const id of finds) expect(w.found).toContain(id)
  expect(profile.known).toEqual([STARTER])
  const added = bankFinds(profile, w.found)
  expect(added).toEqual(finds)
  expect(bankFinds(profile, w.found)).toEqual([])
  for (const id of finds) {
    expect(profile.found).toContain(id)
    expect(profile.known).not.toContain(id)
    expect(stockOf(profile, id)).toBe(0)
  }
  const shop = CARDS.filter((c) => c.deck && profile.known.includes(c.id)).map((c) => c.id)
  const researchable = CARDS.filter(
    (c) => c.deck && profile.found.includes(c.id) && (profile.depth[c.id] ?? 0) < DECK_CAP,
  ).map((c) => c.id)
  expect(shop).toEqual([STARTER])
  for (const id of finds) {
    expect(shop).not.toContain(id)
    expect(researchable).toContain(id)
  }
  expect(research(profile, "jeep")).toBe(false)
  profile.credits = researchCost("jeep")
  expect(research(profile, "jeep")).toBe(true)
  expect(profile.known).toContain("jeep")
  expect(stockOf(profile, "jeep")).toBe(1)
})

test("attrition stacks on a card kept in the deck and cools when it sits out", () => {
  const p = fresh()
  const base = priceOf("aegis")
  expect(deployCost(["aegis", "aegis"], p.wear)).toBe(base + base * 2)
  applyWear(p, ["aegis"])
  expect(p.wear.aegis).toBe(1)
  expect(deployCost(["aegis"], p.wear)).toBe(base * 2)
  applyWear(p, ["aegis", "aegis"])
  expect(p.wear.aegis).toBe(3)
  expect(deployCost(["aegis"], p.wear)).toBe(base * 4)
  applyWear(p, ["plate"])
  expect(p.wear.aegis).toBe(2)
  expect(p.wear.plate).toBe(1)
  applyWear(p, [])
  applyWear(p, [])
  expect(p.wear.aegis).toBeUndefined()
  expect(p.wear.plate).toBeUndefined()
  p.wear.jeep = 2
  restart(p)
  expect(p.wear.jeep).toBeUndefined()
  expect(p.credits).toBe(0)
})

test("medic patches a wounded cell", () => {
  for (const id of [
    "mg",
    "sniper",
    "gren",
    "medic",
    "mortar",
    "jeep",
    "tank",
    "dot",
    "holo",
    "scope",
    "long",
    "reflex",
    "therm_sight",
    "grip",
    "agrip",
    "stub",
    "stop",
    "fore",
    "stick",
    "drum",
    "box",
    "belt",
    "bipod",
    "stock",
    "brace",
    "fold",
    "brake",
    "supp",
    "comp",
    "flash",
    "stim",
    "plating",
    "ram",
    "mines",
    "sentry",
    "kit",
    "radio",
    "nitro",
  ]) {
    expect(card(id).id).toBe(id)
  }
  for (const id of ["mutant", "drone", "walker"]) expect(hostile(id).id).toBe(id)
  const w = quiet()
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.hp = 10
  spawnBody(w, { kind: "medic", x: 0.4, y: 0, inSection: true })
  go(w, IDLE, 1)
  expect(cell.hp).toBeGreaterThan(10)
})

test("only the first cell is the lead", () => {
  const w = makeRun(1, ["cell_rifle", "cell_rifle"])
  const cells = w.bodies.filter((b) => b.kind === "cell_rifle")
  expect(card("cell_rifle").name).toBe("CELL")
  expect(cells).toHaveLength(1)
  expect(w.deckQueue.filter((id) => id === "cell_rifle")).toHaveLength(2)
  const extra = spawnBody(w, { kind: "cell_rifle", x: 1, y: 0, inSection: true })
  expect(callSign(cells[0].kind, cells[0].id, cells[0].id)).toBe("LEAD")
  expect(callSign(extra.kind, extra.id, cells[0].id)).toBe("CELL")
})

test("a discovered card fades into its spot", () => {
  const w = quiet()
  spawnBody(w, { kind: "shambler", x: 30, y: 0, damage: 0, speed: 0, hp: 80 })
  discover(w, "aegis", 30, 0)
  discover(w, "jeep", 20, 16)
  discover(w, "plate", -18, 12)
  expect(w.inbound).toHaveLength(0)
  const man = w.bodies.find((b) => b.kind === "aegis")!
  const jeep = w.bodies.find((b) => b.kind === "jeep")!
  const plate = w.drops.find((d) => d.cardId === "plate")!
  expect(Math.hypot(man.x - 30, man.y)).toBeGreaterThan(4)
  expect(Math.hypot(jeep.x - 20, jeep.y - 16)).toBeGreaterThan(4)
  expect(Math.hypot(plate.x + 18, plate.y - 12)).toBeGreaterThan(4)
  go(w, IDLE, 0.5)
  expect(man.fired).toBe(0)
  go(w, IDLE, 1.4)
  expect(Math.hypot(man.x - 30, man.y)).toBeLessThan(0.25)
  expect(Math.hypot(jeep.x - 20, jeep.y - 16)).toBeLessThan(0.25)
  expect(Math.hypot(plate.x + 18, plate.y - 12)).toBeLessThan(0.25)
  expect(w.reveals).toHaveLength(0)
})

test("an inbound drop flares before it lands", () => {
  const w = quiet(1, ["plate"])
  w.nextDrop = 0.02
  go(w, IDLE, 0.1)
  expect(w.inbound.some((f) => f.cardId === "plate")).toBe(true)
  expect(w.drops.some((d) => d.cardId === "plate")).toBe(false)
  go(w, IDLE, 3.2)
  expect(w.drops.some((d) => d.cardId === "plate")).toBe(true)
  expect(w.inbound.some((f) => f.cardId === "plate")).toBe(false)
})

test("a squad loss reads KIA and an enemy reads DOWN", () => {
  const down = quiet()
  down.props.length = 0
  const shooter = down.bodies.find((b) => b.kind === "cell_rifle")!
  shooter.deploy = shooter.deployNeed
  shooter.cool = 0
  spawnBody(down, { kind: "shambler", x: 2, y: 0, hp: 1, damage: 0, speed: 0 })
  step(down, IDLE, 1 / 30)
  expect(down.tags.some((t) => t.text === "DOWN" && t.kind === "down")).toBe(true)
  expect(down.tags.some((t) => t.text === "KIA")).toBe(false)

  const kia = quiet()
  kia.props.length = 0
  const cell = kia.bodies.find((b) => b.kind === "cell_rifle")!
  cell.hp = 1
  spawnBody(kia, { kind: "shambler", x: 0.2, y: 0, hp: 40, damage: 40, speed: 0 })
  step(kia, IDLE, 1 / 30)
  expect(kia.tags.some((t) => t.text === "KIA" && t.kind === "kia")).toBe(true)
  expect(kia.tags.some((t) => t.text === "DOWN")).toBe(false)
})

test("weather slows the file, cuts sight, and weakens fire", () => {
  const dry = quiet()
  const wet = quiet()
  wet.weather = "rain"
  go(dry, { ...IDLE, moveY: 1 }, 1)
  go(wet, { ...IDLE, moveY: 1 }, 1)
  expect(wet.ay).toBeLessThan(dry.ay - 0.3)

  const shot = (kind: "clear" | "rain") => {
    const w = quiet()
    w.weather = kind
    const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
    cell.deploy = cell.deployNeed
    cell.cool = 0
    const foe = spawnBody(w, { kind: "shambler", x: 4, y: 0, hp: 80, damage: 0, speed: 0 })
    step(w, IDLE, 1 / 30)
    return 80 - foe.hp
  }
  expect(shot("rain")).toBeLessThan(shot("clear"))

  const fog = quiet()
  fog.weather = "fog"
  const cell = fog.bodies.find((b) => b.kind === "cell_rifle")!
  cell.deploy = cell.deployNeed
  spawnBody(fog, { kind: "shambler", x: 8, y: 0, hp: 80, damage: 0, speed: 0 })
  step(fog, IDLE, 1 / 30)
  expect(cell.fired).toBe(0)

  const snap = quiet()
  snap.weatherAt = 0
  step(snap, IDLE, 1 / 30)
  expect(snap.weatherAt).toBeGreaterThan(30)
  expect(snap.toasts.some((t) => t.msg === snap.weather.toUpperCase())).toBe(true)
})

test("night cuts sight until NVG or thermal, and daylight shuts both", () => {
  const dark = quiet()
  dark.t = 90
  const cell = dark.bodies.find((b) => b.kind === "cell_rifle")!
  cell.deploy = cell.deployNeed
  spawnBody(dark, { kind: "shambler", x: 0, y: 6, hp: 80, damage: 0, speed: 0 })
  step(dark, IDLE, 1 / 30)
  expect(cell.fired).toBe(0)
  dark.toolbar.push({ id: "nvg", charges: 0, cd: 0, cdMax: 0 })
  step(dark, { ...IDLE, ability: 0 }, 1 / 30)
  expect(dark.vision).toBe("nvg")
  step(dark, IDLE, 1 / 30)
  expect(cell.fired).toBeGreaterThan(0)

  const both = quiet()
  both.t = 90
  both.toolbar.push({ id: "nvg", charges: 0, cd: 0, cdMax: 0 }, { id: "thermal", charges: 0, cd: 0, cdMax: 0 })
  step(both, { ...IDLE, ability: 0 }, 1 / 30)
  expect(both.vision).toBe("nvg")
  step(both, { ...IDLE, ability: 1 }, 1 / 30)
  expect(both.vision).toBe("thermal")
  step(both, { ...IDLE, ability: 1 }, 1 / 30)
  expect(both.vision).toBe("off")

  const day = quiet()
  day.vision = "thermal"
  day.toolbar.push({ id: "thermal", charges: 0, cd: 0, cdMax: 0 })
  step(day, { ...IDLE, ability: 0 }, 1 / 30)
  expect(day.vision).toBe("off")
  expect(day.toasts.some((t) => t.msg === "Daylight")).toBe(true)

  const aegis = quiet()
  spawnBody(aegis, { kind: "aegis", x: 0, y: 0, inSection: true })
  step(aegis, IDLE, 1 / 30)
  expect(aegis.toolbar.some((t) => t.id === "thermal")).toBe(true)
  aegis.t = 90
  expect(policy(aegis).ability).toBe(0)
})

test("a flesh soldier lights a beam at night", () => {
  const day = quiet()
  expect(beams(day)).toHaveLength(0)

  const lit = quiet()
  lit.t = 90
  const cell = lit.bodies.find((b) => b.kind === "cell_rifle")!
  cell.deploy = cell.deployNeed
  cell.hdg = 0
  const foe = spawnBody(lit, { kind: "shambler", x: 6, y: 0, hp: 80, damage: 0, speed: 0 })
  step(lit, IDLE, 1 / 30)
  expect(beams(lit).map((b) => b.id)).toEqual([cell.id])
  expect(cell.fired).toBeGreaterThan(0)
  expect(foe.hp).toBeLessThan(foe.maxHp)

  const aim = quiet()
  aim.t = 90
  const cellA = aim.bodies.find((b) => b.kind === "cell_rifle")!
  cellA.deploy = cellA.deployNeed
  cellA.hdg = 0
  spawnBody(aim, { kind: "shambler", x: 0, y: 3.5, hp: 80, damage: 0, speed: 0 })
  step(aim, IDLE, 1 / 30)
  expect(cellA.fired).toBeGreaterThan(0)
  expect(cellA.hdg).toBeCloseTo(Math.PI / 2, 1)

  const off = quiet()
  off.t = 90
  const cell2 = off.bodies.find((b) => b.kind === "cell_rifle")!
  cell2.deploy = cell2.deployNeed
  cell2.hdg = 0
  spawnBody(off, { kind: "shambler", x: 0, y: 6, hp: 80, damage: 0, speed: 0 })
  step(off, IDLE, 1 / 30)
  expect(cell2.fired).toBe(0)

  const machine = quiet()
  machine.t = 90
  const lead = machine.bodies.find((b) => b.kind === "cell_rifle")!
  lead.x = -20
  lead.hdg = Math.PI
  const aeg = spawnBody(machine, { kind: "aegis", x: 0, y: 0, inSection: true })
  aeg.hdg = 0
  spawnBody(machine, { kind: "shambler", x: 6, y: 0, hp: 80, damage: 0, speed: 0 })
  step(machine, IDLE, 1 / 30)
  expect(beams(machine).some((b) => b.android)).toBe(false)
  expect(aeg.fired).toBe(0)

  const back = quiet()
  back.t = 90
  const cell3 = back.bodies.find((b) => b.kind === "cell_rifle")!
  cell3.damage = 0
  cell3.hdg = 0
  const goat = spawnBody(back, { kind: "goathead", x: 4.5, y: 0, speed: 0 })
  step(back, IDLE, 1 / 30)
  expect(goat.fired).toBeGreaterThan(0)

  const aside = quiet()
  aside.t = 90
  const cell4 = aside.bodies.find((b) => b.kind === "cell_rifle")!
  cell4.damage = 0
  cell4.hdg = 0
  const shy = spawnBody(aside, { kind: "goathead", x: 0, y: 4.5, speed: 0 })
  step(aside, IDLE, 1 / 30)
  expect(shy.fired).toBe(0)

  lit.vision = "nvg"
  expect(beams(lit)).toHaveLength(0)
})

test("CAS strafes along the crowd", () => {
  const w = quiet()
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.damage = 0
  const line = spawnBody(w, { kind: "shambler", x: 6, y: 0, hp: 80, damage: 0, speed: 0 })
  const flank = spawnBody(w, { kind: "shambler", x: 0, y: 6, hp: 80, damage: 0, speed: 0 })
  w.toolbar.push({ id: "cas", charges: 0, cd: 0, cdMax: 50 })
  step(w, { ...IDLE, ability: 0 }, 1 / 30)
  expect(w.passes).toHaveLength(1)
  expect(w.strikes).toHaveLength(0)
  go(w, IDLE, 2.5)
  expect(line.hp).toBeLessThan(80)
  expect(flank.hp).toBe(80)
})

test("JTAC, timed CAS airframes, laser, and FPV inbound", () => {
  for (const id of ["jtac", "gunship", "rocket", "bomber", "laser", "fpv"]) {
    expect(card(id).deck).toBe(true)
    expect(priceOf(id)).toBeGreaterThan(0)
  }
  expect(priceOf("fpv")).toBeGreaterThan(priceOf("knife"))
  expect(card("fpv").cd).toBe(46)
  expect(card("fpv").charges).toBeUndefined()
  for (const id of ["gunship", "rocket", "bomber"] as const) {
    expect(card(id).kind).toBe("gear")
    expect(card(id).ability).toBe(id)
    expect(card(id).fits).toBe("section")
  }
  expect(card("gunship").sortie).toBe(24)
  expect(card("gunship").cd).toBe(45)
  expect(card("rocket").sortie).toBe(20)
  expect(card("rocket").cd).toBe(48)
  expect(card("bomber").sortie).toBe(18)
  expect(card("bomber").cd).toBe(52)
  expect(card("rocket").lob).toBe(true)
  expect(card("bomber").lob).toBe(true)
  expect(card("gunboat").kind).toBe("vehicle")
  expect(card("gunboat").sortie).toBeUndefined()

  const birds = quiet()
  birds.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  spawnBody(birds, { kind: "shambler", x: 5, y: 0, hp: 200, damage: 0, speed: 0 })
  birds.toolbar.push(
    { id: "gunship", charges: 0, cd: 0, cdMax: 45 },
    { id: "rocket", charges: 0, cd: 0, cdMax: 48 },
    { id: "bomber", charges: 0, cd: 0, cdMax: 52 },
  )
  step(birds, { ...IDLE, ability: 0 }, 1 / 30)
  expect(birds.toolbar[0].cd).toBeCloseTo(45, 5)
  step(birds, { ...IDLE, ability: 1 }, 1 / 30)
  expect(birds.toolbar[1].cd).toBeCloseTo(48, 5)
  step(birds, { ...IDLE, ability: 2 }, 1 / 30)
  expect(birds.toolbar[2].cd).toBeCloseTo(52, 5)
  const ship = birds.bodies.find((b) => b.kind === "gunship" && b.alive)!
  const pod = birds.bodies.find((b) => b.kind === "rocket" && b.alive)!
  const bomb = birds.bodies.find((b) => b.kind === "bomber" && b.alive)!
  expect(ship.follow).toBe(true)
  expect(ship.air).toBe(true)
  expect(ship.seats).toBe(0)
  expect(ship.sortieT).toBeCloseTo(24, 0)
  expect(pod.lob).toBe(true)
  expect(bomb.lob).toBe(true)
  expect(bomb.sortieT).toBeCloseTo(18, 0)
  expect(pod.parts.every((p) => p.id === "turret")).toBe(true)
  const ox = pod.x
  const oy = pod.y
  const beforeBusy = birds.toasts.length
  step(birds, { ...IDLE, ability: 1 }, 1 / 30)
  expect(birds.toasts.some((t) => t.msg === "Busy")).toBe(true)
  expect(birds.toasts.length).toBeGreaterThan(beforeBusy)
  go(birds, IDLE, 0.4)
  expect(ship.fired + pod.fired + bomb.fired).toBeGreaterThan(0)
  expect(birds.lobs.some((l) => l.lift > 0)).toBe(true)
  go(birds, IDLE, 1)
  expect(Math.hypot(pod.x - ox, pod.y - oy)).toBeGreaterThan(1.5)
  go(birds, IDLE, 25)
  expect(ship.alive).toBe(false)
  expect(pod.alive).toBe(false)
  expect(bomb.alive).toBe(false)
  expect(birds.lost).toBe(0)
  birds.toolbar[1].cd = 0
  step(birds, { ...IDLE, ability: 1 }, 1 / 30)
  expect(birds.bodies.some((b) => b.alive && b.kind === "rocket")).toBe(true)

  const boat = quiet()
  boat.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  const hull = spawnBody(boat, { kind: "gunboat", x: 1.6, y: 0, inSection: true })
  expect(hull.sortieT).toBe(0)
  go(boat, IDLE, 25)
  expect(hull.alive).toBe(true)

  const long = quiet()
  long.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  spawnBody(long, { kind: "jtac", x: 0.4, y: 0, inSection: true })
  long.toolbar.push({ id: "gunship", charges: 0, cd: 0, cdMax: 45 })
  step(long, { ...IDLE, ability: 0 }, 1 / 30)
  expect(long.toolbar[0].cd).toBeCloseTo(31.5, 5)
  const hot = long.bodies.find((b) => b.kind === "gunship" && b.alive)!
  expect(hot.sortieT).toBeCloseTo(30, 5)

  const cold = quiet()
  cold.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  const line = spawnBody(cold, { kind: "shambler", x: 6, y: 0, hp: 200, damage: 0, speed: 0 })
  cold.toolbar.push({ id: "cas", charges: 0, cd: 0, cdMax: 50 })
  step(cold, { ...IDLE, ability: 0 }, 1 / 30)
  expect(cold.toolbar[0].cd).toBe(50)
  go(cold, IDLE, 2.5)
  const coldHp = line.hp

  const warm = quiet()
  warm.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  spawnBody(warm, { kind: "jtac", x: 0.3, y: 0, inSection: true })
  const mark = spawnBody(warm, { kind: "shambler", x: 6, y: 0, hp: 200, damage: 0, speed: 0 })
  warm.toolbar.push({ id: "cas", charges: 0, cd: 0, cdMax: 50 })
  step(warm, { ...IDLE, ability: 0 }, 1 / 30)
  expect(warm.toolbar[0].cd).toBeCloseTo(35, 5)
  go(warm, IDLE, 2.5)
  expect(mark.hp).toBeLessThan(coldHp)

  const paint = quiet()
  paint.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  const painted = spawnBody(paint, { kind: "shambler", x: 0, y: 8, hp: 120, damage: 0, speed: 0 })
  const other = spawnBody(paint, { kind: "shambler", x: 8, y: 0, hp: 120, damage: 0, speed: 0 })
  paint.toolbar.push({ id: "laser", charges: 0, cd: 0, cdMax: 18 }, { id: "cas", charges: 0, cd: 0, cdMax: 50 })
  step(paint, { ...IDLE, ability: 0 }, 1 / 30)
  expect(paint.airMark).not.toBeNull()
  expect(paint.airMark!.y).toBeCloseTo(painted.y, 0)
  step(paint, { ...IDLE, ability: 1 }, 1 / 30)
  expect(paint.airMark).toBeNull()
  expect(paint.passes[0].y).toBeCloseTo(painted.y, 0)
  go(paint, IDLE, 2.5)
  expect(painted.hp).toBeLessThan(other.hp)

  const fpvCold = quiet()
  fpvCold.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  const a = spawnBody(fpvCold, { kind: "shambler", x: 6, y: 0, hp: 80, damage: 0, speed: 0 })
  fpvCold.toolbar.push({ id: "fpv", charges: 0, cd: 0, cdMax: 46 })
  step(fpvCold, { ...IDLE, ability: 0 }, 1 / 30)
  expect(fpvCold.toolbar[0].cd).toBe(46)
  expect(fpvCold.toasts.some((t) => t.msg === "FPV inbound")).toBe(true)
  go(fpvCold, IDLE, 1.5)
  const fpvHp = a.hp

  const fpvHot = quiet()
  fpvHot.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  spawnBody(fpvHot, { kind: "jtac", x: 0.3, y: 0, inSection: true })
  const b = spawnBody(fpvHot, { kind: "shambler", x: 6, y: 0, hp: 80, damage: 0, speed: 0 })
  fpvHot.toolbar.push({ id: "fpv", charges: 0, cd: 0, cdMax: 46 })
  step(fpvHot, { ...IDLE, ability: 0 }, 1 / 30)
  expect(fpvHot.toolbar[0].cd).toBeCloseTo(32.2, 5)
  expect(fpvHot.passes[0].dmg).toBeCloseTo(90, 5)
  go(fpvHot, IDLE, 1.5)
  expect(b.hp).toBeLessThan(fpvHp)

  const fpvPaint = quiet()
  fpvPaint.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  const paintedFoe = spawnBody(fpvPaint, { kind: "shambler", x: 0, y: 8, hp: 120, damage: 0, speed: 0 })
  const otherFoe = spawnBody(fpvPaint, { kind: "shambler", x: 8, y: 0, hp: 120, damage: 0, speed: 0 })
  fpvPaint.toolbar.push({ id: "laser", charges: 0, cd: 0, cdMax: 18 }, { id: "fpv", charges: 0, cd: 0, cdMax: 46 })
  step(fpvPaint, { ...IDLE, ability: 0 }, 1 / 30)
  step(fpvPaint, { ...IDLE, ability: 1 }, 1 / 30)
  expect(fpvPaint.passes[0].y).toBeCloseTo(paintedFoe.y, 0)
  go(fpvPaint, IDLE, 1.5)
  expect(paintedFoe.hp).toBeLessThan(otherFoe.hp)
})

test("goathead shoots and crowhead gnats land on the squad", () => {
  const guns = quiet()
  const cell = guns.bodies.find((b) => b.kind === "cell_rifle")!
  cell.damage = 0
  const goat = spawnBody(guns, { kind: "goathead", x: 5, y: 0 })
  const shambler = spawnBody(guns, { kind: "shambler", x: 5, y: 2, speed: 0 })
  go(guns, IDLE, 0.4)
  expect(goat.fired).toBeGreaterThan(0)
  expect(shambler.fired).toBe(0)

  const gnats = quiet()
  const lead = gnats.bodies.find((b) => b.kind === "cell_rifle")!
  lead.damage = 0
  const before = lead.hp
  spawnBody(gnats, { kind: "crowhead", x: 3, y: 0 })
  go(gnats, IDLE, 1.5)
  expect(lead.hp).toBeLessThan(before)
})

test("androids, a digger, a wisp, and a relay", () => {
  const w = quiet()
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.hp = 10
  const aegis = spawnBody(w, { kind: "aegis", x: 0.4, y: 0, inSection: true })
  const forge = spawnBody(w, { kind: "forge", x: 0.2, y: 0.2, inSection: true })
  aegis.hp = 10
  forge.hp = 10
  spawnBody(w, { kind: "medic", x: 0, y: 0.3, inSection: true })
  w.props.length = 0
  w.props.push({ id: 77, kind: "ruin", x: 0.6, y: 0.2, hp: 30, radius: 1.05, alive: true })
  go(w, IDLE, 1)
  expect(cell.hp).toBeGreaterThan(10)
  expect(aegis.hp).toBe(10)
  expect(forge.hp).toBe(10)
  expect(w.props[0].hp).toBeLessThan(30)
  const wisp = quiet()
  spawnBody(wisp, { kind: "wisp", x: 0, y: 0, inSection: true })
  step(wisp, IDLE, 1 / 30)
  expect(wisp.toolbar.some((t) => t.id === "thermal")).toBe(true)

  const fog = quiet()
  fog.weather = "fog"
  const rifle = fog.bodies.find((b) => b.kind === "cell_rifle")!
  rifle.deploy = rifle.deployNeed
  spawnBody(fog, { kind: "shambler", x: 8, y: 0, hp: 80, damage: 0, speed: 0 })
  step(fog, IDLE, 1 / 30)
  expect(rifle.fired).toBe(0)
  spawnBody(fog, { kind: "wisp", x: 0, y: 0, inSection: true })
  step(fog, IDLE, 1 / 30)
  expect(rifle.fired).toBeGreaterThan(0)

  const hold = (withRelay: boolean) => {
    const run = quiet()
    run.lzOn = true
    run.flareOn = true
    run.flareX = 0
    run.flareY = 0
    if (withRelay) spawnBody(run, { kind: "relay", x: 0, y: 0, inSection: true })
    go(run, IDLE, 10)
    return run.craftOn
  }
  expect(hold(true)).toBe(true)
  expect(hold(false)).toBe(false)
  expect(card("engr").dig).toBeGreaterThan(0)
})

test("the lead takes the bike, and a hoverbike ignores rain", () => {
  const w = quiet()
  w.file = "tight"
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  const bike = spawnBody(w, { kind: "bike", x: 0, y: 0, inSection: true })
  spawnBody(w, { kind: "jeep", x: 0.2, y: 0, inSection: true })
  for (const b of w.bodies) {
    b.x = 0
    b.y = 0
  }
  step(w, hold(true), 1 / 30)
  expect(cell.boarded).toBe(bike.id)

  const ride = (kind: string) => {
    const run = quiet()
    run.weather = "rain"
    run.props.length = 0
    const hull = spawnBody(run, { kind, x: 0, y: 0, inSection: true, damage: 0 })
    const lead = run.bodies.find((b) => b.kind === "cell_rifle")!
    lead.boarded = hull.id
    lead.x = 0
    lead.y = 0
    go(run, { ...IDLE, moveY: 1 }, 1.5)
    return hull.y
  }
  expect(ride("hover")).toBeGreaterThan(ride("jeep") + 1)
})

test("flake swarms, tract shoots, coil bites", () => {
  const w = quiet()
  spawnBody(w, { kind: "flake", x: 10, y: 0 })
  expect(w.bodies.filter((b) => b.kind === "flake")).toHaveLength(3)
  const cell = w.bodies.find((b) => b.kind === "cell_rifle")!
  cell.damage = 0
  const tract = spawnBody(w, { kind: "tract", x: 6, y: 0 })
  const coil = spawnBody(w, { kind: "coil", x: 4, y: 2, speed: 0 })
  go(w, IDLE, 0.4)
  expect(tract.fired).toBeGreaterThan(0)
  expect(coil.fired).toBe(0)
})

test("thermite ignores armor, EMP bites only Rust, smoke hides the squad, a relic is a find", () => {
  const hot = quiet()
  const cell = hot.bodies.find((b) => b.kind === "cell_rifle")!
  cell.damage = 0
  const foe = spawnBody(hot, { kind: "shambler", x: 3, y: 0, hp: 80, damage: 0, speed: 0 })
  foe.armor = 0.5
  hot.props.length = 0
  hot.props.push({ id: 88, kind: "ruin", x: 3, y: 0.4, hp: 30, radius: 0.4, alive: true })
  hot.toolbar.push({ id: "thermite", charges: 1, cd: 0, cdMax: 0 })
  step(hot, { ...IDLE, ability: 0 }, 1 / 30)
  expect(foe.hp).toBe(40)
  expect(hot.props[0].alive).toBe(false)

  const emp = quiet()
  emp.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  const rust = spawnBody(emp, { kind: "drone", x: 2, y: 0, hp: 40, damage: 0, speed: 0 })
  const meat = spawnBody(emp, { kind: "shambler", x: 2, y: 1, hp: 40, damage: 0, speed: 0 })
  emp.toolbar.push({ id: "emp", charges: 1, cd: 0, cdMax: 0 })
  step(emp, { ...IDLE, ability: 0 }, 1 / 30)
  expect(rust.hp).toBeLessThan(40)
  expect(meat.hp).toBe(40)

  const veil = quiet()
  const rifle = veil.bodies.find((b) => b.kind === "cell_rifle")!
  rifle.damage = 0
  rifle.hp = 200
  const goat = spawnBody(veil, { kind: "goathead", x: 5, y: 0 })
  veil.smokes.push({ x: 0, y: 0, r: 4.5, t: 6 })
  go(veil, IDLE, 0.4)
  expect(goat.fired).toBe(0)
  const pot = quiet()
  pot.toolbar.push({ id: "smoke", charges: 2, cd: 0, cdMax: 0 })
  step(pot, { ...IDLE, ability: 0 }, 1 / 30)
  expect(pot.smokes).toHaveLength(1)
  veil.smokes = []
  go(veil, IDLE, 0.5)
  expect(goat.fired).toBeGreaterThan(0)

  const find = quiet()
  const credits = find.credits
  find.hidden = ["mg"]
  find.drops.push({ id: 50, cardId: "relic", x: 0.4, y: 0, bodyId: -1, kind: "loot", taken: false, cost: 0 })
  go(find, IDLE, 0.3)
  expect(find.found).toContain("mg")
  expect(find.credits).toBe(credits)
  expect(find.loot).toBe(0)
})

test("late rust, leashes, marsh, stash, and the new tools", () => {
  for (const id of ["k9", "copter", "killer", "hex_line", "hex_siege", "exo", "stun", "fpv"]) {
    expect(card(id).id).toBe(id)
  }
  for (const id of ["roller", "kite", "slab"]) expect(hostile(id).id).toBe(id)
  expect(card("hex_siege").stats?.heavy).toBe(true)
  expect(card("k9").nvg).toBe(true)

  const guns = quiet()
  const cell = guns.bodies.find((b) => b.kind === "cell_rifle")!
  cell.damage = 0
  cell.hp = 400
  const roller = spawnBody(guns, { kind: "roller", x: 6, y: 0 })
  const kite = spawnBody(guns, { kind: "kite", x: 7, y: 1 })
  go(guns, IDLE, 0.5)
  expect(roller.fired).toBeGreaterThan(0)
  expect(kite.air).toBe(true)
  expect(kite.fired).toBeGreaterThan(0)

  const file = quiet()
  const lead = file.bodies.find((b) => b.kind === "cell_rifle")!
  const dog = spawnBody(file, { kind: "k9", x: 12, y: 0, inSection: true })
  const bird = spawnBody(file, { kind: "copter", x: 14, y: 0, inSection: true })
  go(file, IDLE, 1.2)
  expect(file.toolbar.some((t) => t.id === "nvg")).toBe(true)
  expect(Math.hypot(dog.x - lead.x, dog.y - lead.y)).toBeLessThan(8)
  expect(Math.hypot(bird.x - lead.x, bird.y - lead.y)).toBeLessThan(10)
  expect(dog.boarded).toBeNull()

  const mud = (kind: string) => {
    const run = quiet()
    run.marshes = [{ x: 0, y: 4, r: 8 }]
    run.props.length = 0
    const hull = spawnBody(run, { kind, x: 0, y: 0, inSection: true, damage: 0 })
    const boss = run.bodies.find((b) => b.kind === "cell_rifle")!
    boss.boarded = hull.id
    go(run, { ...IDLE, moveY: 1 }, 1.2)
    return hull.y
  }
  expect(mud("hover")).toBeGreaterThan(mud("jeep") + 1)

  const hold = quiet()
  hold.stashAt = 0
  const boss = hold.bodies.find((b) => b.kind === "cell_rifle")!
  go(hold, IDLE, 0.1)
  expect(hold.stashOn).toBe(true)
  boss.x = hold.stashX
  boss.y = hold.stashY
  hold.ax = hold.stashX
  hold.ay = hold.stashY
  const pay = hold.credits
  go(hold, IDLE, 4.2)
  expect(hold.stashOn).toBe(false)
  expect(hold.credits).toBeGreaterThan(pay)

  const kit = quiet()
  const rifle = kit.bodies.find((b) => b.kind === "cell_rifle")!
  const before = rifle.speed
  placeDrop(kit, "exo", 0.2, 0)
  go(kit, IDLE, 0.3)
  expect(rifle.speed).toBeGreaterThan(before)

  const halt = quiet()
  const shooter = halt.bodies.find((b) => b.kind === "cell_rifle")!
  shooter.damage = 0
  shooter.hp = 200
  const goat = spawnBody(halt, { kind: "goathead", x: 4, y: 0 })
  halt.toolbar.push({ id: "stun", charges: 1, cd: 0, cdMax: 0 })
  step(halt, { ...IDLE, ability: 0 }, 1 / 30)
  expect(goat.stun).toBeGreaterThan(1)
  const fired = goat.fired
  go(halt, IDLE, 0.6)
  expect(goat.fired).toBe(fired)

  const drone = quiet()
  drone.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  const foe = spawnBody(drone, { kind: "shambler", x: 6, y: 0, hp: 80, damage: 0, speed: 0 })
  drone.toolbar.push({ id: "fpv", charges: 0, cd: 0, cdMax: 46 })
  step(drone, { ...IDLE, ability: 0 }, 1 / 30)
  expect(drone.passes).toHaveLength(1)
  go(drone, IDLE, 1.5)
  expect(foe.hp).toBeLessThan(80)

  const hull = quiet()
  hull.props.length = 0
  const tank = spawnBody(hull, { kind: "tank", x: 0, y: 0, inSection: true, damage: 0 })
  const bite = spawnBody(hull, { kind: "shambler", x: 0.2, y: 0, speed: 0, damage: 40, hp: 400 })
  const cellGun = hull.bodies.find((b) => b.kind === "cell_rifle")!
  cellGun.damage = 0
  cellGun.x = 18
  go(hull, IDLE, 0.8)
  expect(tank.hp).toBeGreaterThan(tank.maxHp * 0.5)
  expect(tank.parts.some((p) => p.id === "turret" && p.on)).toBe(true)
  expect(bite.fired).toBeGreaterThan(0)

  const leave = quiet()
  leave.lzOn = true
  leave.flareOn = true
  leave.craftOn = true
  const stay = leave.bodies.find((b) => b.kind === "cell_rifle")!
  stay.x = 0
  stay.y = -30
  const parked = spawnBody(leave, { kind: "jeep", x: 24, y: 24, inSection: true, damage: 0 })
  go(leave, IDLE, LOAD_STEP + 6.5)
  expect(leave.phase).toBe("win")
  expect(leave.lost).toBe(0)
  expect(parked.alive).toBe(true)
  expect(parked.inSection).toBe(false)
})

test("the rest of the roster is gear, hulls, and rust", () => {
  const ids = [
    "knife", "kukri", "katana", "machete", "sword", "axe", "stave", "baton", "bow", "warbow",
    "pistol", "revolver", "autopistol", "magnum", "minismg", "laserpistol",
    "smg", "shotgun", "autoshotgun", "railgun",
    "at", "jetpack", "litter", "filter", "ewar", "truck", "tech", "suv", "steed", "cart", "mule",
    "gunboat", "gunship", "rocket", "bomber", "mlrs", "ifv", "mbt", "ugv", "tube", "drill", "pump", "cutter",
    "hawk", "mid", "assassin", "operator", "jtac", "laser",
  ]
  for (const id of ids) {
    expect(card(id).deck).toBe(true)
    expect(priceOf(id)).toBeGreaterThan(0)
  }
  for (const id of ["reach", "mast", "dray", "rust_plow", "post", "bloom", "cluster", "fog", "ball", "amalgam"]) {
    expect(hostile(id).side).toBe("rust")
  }
  expect(card("mbt").stats?.heavy).toBe(true)
  expect(card("hawk").air).toBe(true)
  expect(card("gunboat").kind).toBe("vehicle")
  expect(card("gunboat").stats?.seats).toBe(0)
  expect(card("gunboat").air).toBe(true)
  expect(card("gunship").kind).toBe("gear")
  expect(card("rocket").kind).toBe("gear")
  expect(card("bomber").kind).toBe("gear")
  expect(card("gunboat").follow).toBe(true)
  expect(card("ugv").stats?.seats).toBe(0)
  expect(card("ugv").follow).toBe(true)
  expect(card("drill").dig).toBeGreaterThan(0)
  expect(card("mlrs").lob).toBe(true)
  expect(hostile("cluster").pack).toBe(3)
  expect(hostile("post").stats.speed).toBe(0)

  const armed = quiet()
  const lead = armed.bodies.find((b) => b.kind === "cell_rifle")!
  armed.drops.push({ id: 80, cardId: "axe", x: 0.2, y: 0, bodyId: 0, kind: "gear", taken: false, cost: 0 })
  go(armed, IDLE, 0.3)
  expect(lead.gears).toContain("axe")
  expect(lead.gears.includes("rifle")).toBe(false)
  expect(lead.dig).toBe(2)
  armed.drops.push({ id: 81, cardId: "litter", x: 0.2, y: 0, bodyId: 0, kind: "gear", taken: false, cost: 0 })
  go(armed, IDLE, 0.3)
  expect(lead.heal).toBe(6)

  const pack = quiet()
  pack.props = []
  const cell = pack.bodies.find((b) => b.kind === "cell_rifle")!
  const pace = cell.speed
  pack.drops.push({ id: 82, cardId: "jetpack", x: 0.2, y: 0, bodyId: 0, kind: "gear", taken: false, cost: 0 })
  go(pack, IDLE, 0.3)
  expect(cell.speed).toBeGreaterThan(pace)
  pack.weather = "snow"
  pack.marshes = [{ x: 0, y: 0, r: 20 }]
  const x0 = pack.ax
  go(pack, { ...IDLE, moveX: 1 }, 1)
  expect(pack.ax - x0).toBeGreaterThan(4.6)

  const veil = quiet()
  veil.props = []
  veil.drops.push({ id: 83, cardId: "filter", x: 0.2, y: 0, bodyId: 0, kind: "gear", taken: false, cost: 0 })
  go(veil, IDLE, 0.3)
  veil.weather = "snow"
  const f0 = veil.ax
  go(veil, { ...IDLE, moveX: 1 }, 1)
  expect(veil.ax - f0).toBeGreaterThan(5)

  const punch = quiet()
  punch.bodies.find((b) => b.kind === "cell_rifle")!.damage = 0
  const slab = spawnBody(punch, { kind: "slab", x: 3, y: 0 })
  const before = slab.hp
  punch.toolbar = [{ id: "at", charges: 2, cd: 0, cdMax: 0 }]
  go(punch, { ...IDLE, ability: 0 }, 0.1)
  expect(slab.hp).toBeLessThan(before - 40)

  const jam = quiet()
  jam.props = []
  jam.marshes = []
  spawnBody(jam, { kind: "operator", x: 1, y: 0, inSection: true })
  const bird = spawnBody(jam, { kind: "hawk", x: 14, y: 0, inSection: true })
  const ship = spawnBody(jam, { kind: "gunboat", x: 8, y: 1, inSection: true })
  const ugv = spawnBody(jam, { kind: "ugv", x: 14, y: 0, inSection: true })
  ugv.hdg = Math.PI
  spawnBody(jam, { kind: "shambler", x: 5, y: 1, speed: 0 })
  go(jam, IDLE, 2)
  expect(jam.toolbar.some((t) => t.id === "ewar")).toBe(true)
  expect(Math.hypot(bird.x, bird.y)).toBeLessThan(10)
  expect(ship.air).toBe(true)
  expect(ship.fired).toBeGreaterThan(0)
  expect(jam.bodies.some((b) => b.boarded === ship.id)).toBe(false)
  expect(Math.hypot(ship.x, ship.y)).toBeLessThan(8)
  expect(jam.bodies.some((b) => b.boarded === ugv.id)).toBe(false)
  expect(Math.hypot(ugv.x, ugv.y)).toBeLessThan(8)

  const dig = quiet()
  const prop = dig.props.find((p) => p.alive)!
  const hp = prop.hp
  spawnBody(dig, { kind: "drill", x: prop.x, y: prop.y, inSection: true })
  go(dig, IDLE, 0.4)
  expect(prop.hp).toBeLessThan(hp)

  const nest = quiet()
  const hold = nest.bodies.find((b) => b.kind === "cell_rifle")!
  hold.damage = 0
  hold.hp = 500
  const gun = spawnBody(nest, { kind: "post", x: 8, y: 0 })
  const flock = spawnBody(nest, { kind: "cluster", x: 20, y: 20 })
  go(nest, IDLE, 1)
  expect(gun.x).toBe(8)
  expect(gun.fired).toBeGreaterThan(0)
  expect(nest.bodies.filter((b) => b.kind === "cluster")).toHaveLength(3)
  expect(flock.alive).toBe(true)
})

test("seeded autoplay prints a balance line", () => {
  const w = makeRun(7, ["aegis", "apc", "plate", "frag"])
  let guard = 0
  while (w.phase === "run" && guard < 4000) {
    step(w, policy(w), 1 / 30)
    guard++
  }
  expect(w.phase === "win" || w.phase === "lose").toBe(true)
  const line = balanceLine(w)
  expect(line).toMatch(/result=(win|lose)/)
  expect(line).toMatch(/lost=\d+/)
  expect(line).toMatch(/drops=\d+/)
  expect(line).toMatch(/hull=\d+/)
  console.log(line)
  console.log("GATE autoplay ok")
})

test("a stash hero is a named soldier the campaign can keep", () => {
  let n = 0
  const rng = () => ((n = n + 1) * 17 % 100) / 100
  const first = rollHero(rng, [])
  n = 0
  expect(rollHero(rng, [])).toEqual(first)
  n = 0
  rollHero(rng, [])
  expect(rollHero(rng, [first.name]).name).not.toBe(first.name)

  const a = quiet(4)
  const b = quiet(4)
  const hero = offerHero(a)!
  expect(offerHero(b)).toEqual(hero)
  const body = a.bodies.find((x) => x.heroId === hero.id)!
  expect(body.name).toBe(hero.name)
  expect(body.gears).toContain(hero.gun)
  expect(body.damage).toBeGreaterThan(0)
  const base = card(hero.chassis)
  if (hero.gift === "tough") expect(body.maxHp).toBeCloseTo(base.stats.hp * 1.18)
  if (hero.gift === "fast") expect(body.speed).toBeCloseTo(base.stats.speed * 1.12)
  if (hero.gift === "keen") expect(body.spot).toBe((base.spot ?? 0) + 1)
  if (hero.gift === "patch") expect(body.heal).toBe((base.heal ?? 0) + 6)
  expect(deployCost([hero.id])).toBe(80)

  const kept = fresh()
  body.inSection = false
  a.phase = "win"
  settleHeroes(kept, a)
  expect(kept.heroes).toHaveLength(0)
  body.inSection = true
  settleHeroes(kept, a)
  expect(kept.heroes.map((h) => h.id)).toEqual([hero.id])

  const again = makeRun(9, [hero.id], { heroes: kept.heroes })
  placeDrop(again, hero.id, 4, 0)
  const back = again.bodies.find((x) => x.heroId === hero.id)!
  expect(back.name).toBe(hero.name)
  back.damage = 0
  back.inSection = true
  spawnBody(again, { kind: "shambler", x: back.x, y: back.y, damage: 500, speed: 0, cooldown: 0.05 })
  go(again, IDLE, 0.5)
  expect(back.alive).toBe(false)
  expect(again.buried).toContain(hero.id)
  settleHeroes(kept, again)
  expect(kept.heroes).toHaveLength(0)

  let offered = false
  for (let seed = 1; seed < 60 && !offered; seed++) {
    const w = quiet(seed)
    w.stashAt = 0
    const lead = w.bodies.find((x) => x.kind === "cell_rifle")!
    lead.x = w.stashX
    lead.y = w.stashY
    w.ax = w.stashX
    w.ay = w.stashY
    go(w, IDLE, 4.3)
    offered = w.heroOffered
  }
  expect(offered).toBe(true)
})

test("seeds field different ground, and depth 0 stays off the heavy list", () => {
  const heavy = new Set([
    "walker",
    "kite",
    "reach",
    "mast",
    "dray",
    "rust_plow",
    "post",
    "bloom",
    "cluster",
    "fog",
    "ball",
    "amalgam",
  ])
  const grounds = new Set<string>()
  const bearings = new Set<number>()
  let trees = 0
  let teeth = 0
  for (let seed = 1; seed <= 24; seed++) {
    const w = makeRun(seed, [])
    grounds.add(w.ground)
    bearings.add(w.bearing)
    expect(Math.hypot(w.pathX, w.pathY)).toBeCloseTo(30, 4)
    expect(w.flareX).toBeCloseTo(-w.pathX, 4)
    expect(w.flareY).toBeCloseTo(-w.pathY, 4)
    const ang = Math.atan2(w.pathY, w.pathX)
    const off = Math.abs(-Math.sin(ang) * w.stashX + Math.cos(ang) * w.stashY)
    expect(off).toBeGreaterThanOrEqual(16)
    expect(off).toBeLessThanOrEqual(28)
    expect(["drift", "skirmish"]).toContain(w.pressure)
    expect(w.weather).toBe(w.skyMain)
    trees += w.props.filter((p) => p.kind === "burnt_tree").length
    teeth += w.props.filter((p) => p.kind === "teeth").length
    w.flareAt = 1e9
    w.pathAt = 1e9
    w.stashAt = 1e9
    const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
    lead.hp = 1e6
    lead.damage = 0
    for (let i = 0; i < 40 * 30; i++) step(w, IDLE, 1 / 30)
    for (const b of w.bodies) if (b.side !== "player") expect(heavy.has(b.kind)).toBe(false)
  }
  expect(grounds.size).toBeGreaterThan(1)
  expect(bearings.size).toBeGreaterThan(1)
  expect(trees).toBeGreaterThan(0)
  expect(teeth).toBeGreaterThan(0)

  const w = makeRun(1, [])
  w.nextHorde = 1e9
  w.pathOn = true
  w.pathX = 0
  w.pathY = 0
  go(w, IDLE, PATH_HOLD + 0.2)
  expect(w.depth).toBe(1)
  expect(["herd", "coil"]).toContain(w.pressure)
})

test("starting cell armed", () => {
  const w = quiet()
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  expect(lead.gears).toContain("rifle")
  expect(lead.damage).toBe(7)
  expect(lead.range).toBe(9)
  expect(lead.mobileFire).toBe(false)
})

test("a knife fits beside the rifle and cuts close while the rifle holds the range", () => {
  const w = quiet()
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  placeDrop(w, "knife", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("knife")
  expect(lead.gears).toContain("rifle")
  expect(card("knife").hand).toBe("secondary")
  expect(lead.range).toBe(9)
  expect(lead.mobileFire).toBe(false)
  const near = spawnBody(w, {
    kind: "shambler",
    x: card("knife").gun!.range + 0.2,
    y: 0,
    speed: 0,
    damage: 0,
    hp: 40,
  })
  const fired = lead.fired
  go(w, IDLE, 0.5)
  expect(lead.fired).toBeGreaterThan(fired)
  expect(near.hp).toBeLessThan(40)
  expect(lead.sideCool).toBeGreaterThan(0)
})

test("a handgun secondary fires on the move and swaps only the sidearm", () => {
  const w = quiet()
  w.props = []
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  placeDrop(w, "pistol", 0.2, 0)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("rifle")
  expect(lead.gears).toContain("pistol")
  const foe = spawnBody(w, { kind: "shambler", x: 4, y: 0, speed: 0, damage: 0, hp: 80 })
  const fired = lead.fired
  go(w, { ...IDLE, moveX: 1 }, 0.6)
  expect(lead.fired).toBeGreaterThan(fired)
  expect(foe.hp).toBeLessThan(80)
  placeDrop(w, "magnum", lead.x + 0.2, lead.y)
  go(w, IDLE, 0.3)
  expect(lead.gears).toContain("rifle")
  expect(lead.gears).toContain("magnum")
  expect(lead.gears.includes("pistol")).toBe(false)
})

test("a new primary keeps the secondary", () => {
  const w = quiet()
  const lead = w.bodies.find((b) => b.kind === "cell_rifle")!
  placeDrop(w, "knife", 0.2, 0)
  placeDrop(w, "smg", 0.3, 0)
  go(w, IDLE, 0.4)
  expect(lead.gears).toContain("smg")
  expect(lead.gears).toContain("knife")
  expect(lead.gears.includes("rifle")).toBe(false)
  expect(lead.mobileFire).toBe(true)
})
