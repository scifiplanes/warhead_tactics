import { CARDS, DECK_CAP, callSign, card, isHero, researchCost, type CardDef } from "./content/catalog"
import { applyWear, cardCost, deployCost, load, research, restart, save, settleHeroes, type Profile } from "./meta/profile"
import { policy } from "./bot/policy"
import {
  makeRun,
  step,
  takeBursts,
  balanceLine,
  daylight,
  type Commands,
  type Diff,
  type World,
} from "./sim/world"
import { audioPrefs, setAudio, thuds, unlockAudio } from "./view/audio"
import { burstsToParticles, ditherPrefs, draw, hpColor, paintDither, setDither, type Dither, type Particle } from "./view/draw"
import { preview } from "./view/sprites"

const canvas = document.querySelector<HTMLCanvasElement>("#view")!
const ctx = canvas.getContext("2d")!
const deckEl = document.querySelector<HTMLElement>("#deck")!
const cardsEl = document.querySelector<HTMLElement>("#cards")!
const deckList = document.querySelector<HTMLElement>("#deckList")!
const deckCount = document.querySelector<HTMLElement>("#deckCount")!
const hudEl = document.querySelector<HTMLElement>("#hud")!
const endEl = document.querySelector<HTMLElement>("#end")!
const pauseEl = document.querySelector<HTMLElement>("#paused")!
const seedEl = document.querySelector<HTMLInputElement>("#seed")!
const groupBtn = document.querySelector<HTMLButtonElement>("#group")!
const spreadBtn = document.querySelector<HTMLButtonElement>("#spread")!
const botBtn = document.querySelector<HTMLButtonElement>("#bot")!
const toolbarEl = document.querySelector<HTMLElement>("#toolbar")!
const rosterEl = document.querySelector<HTMLElement>("#roster")!
const toastsEl = document.querySelector<HTMLElement>("#toasts")!
const stick = document.querySelector<HTMLElement>("#stick")!
const knob = document.querySelector<HTMLElement>("#knob")!

const profile: Profile = load()
const deck: string[] = []
const keys = new Set<string>()
let world: World | null = null
let bot = false
let speed = 1
let groupDown = false
let spreadDown = false
let groupTap = false
let spreadTap = false
let ability: number | null = null
let stickX = 0
let stickY = 0
let stickId: number | null = null
let last = performance.now()
let toolSig = ""
let settled = false
const parts: Particle[] = []

const groups: [string, CardDef["kind"]][] = [
  ["SOLDIERS", "unit"],
  ["VEHICLES", "vehicle"],
  ["GEAR", "gear"],
]

function count(id: string) {
  return deck.filter((x) => x === id).length
}

function paintDeck() {
  const cost = deployCost(deck, profile.wear)
  deckCount.textContent = `${deck.length} / ${DECK_CAP}`
  const bank = document.querySelector("#bank")
  if (bank) bank.textContent = `CREDITS ${profile.credits}`
  const deployBtn = document.querySelector<HTMLButtonElement>("#deploy")
  const botDeploy = document.querySelector<HTMLButtonElement>("#deploy-bot")
  if (deployBtn) deployBtn.textContent = cost ? `DEPLOY ${cost} CR` : "DEPLOY"
  if (botDeploy) botDeploy.disabled = false
  const finds = document.querySelector("#finds")
  if (finds) {
    finds.replaceChildren()
    for (const row of CARDS.filter((c) => c.deck && profile.found.includes(c.id) && !profile.known.includes(c.id))) {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "ghost"
      const costR = researchCost(row.id)
      btn.textContent = `RESEARCH ${row.name} ${costR} CR`
      btn.disabled = profile.credits < costR
      btn.addEventListener("click", () => {
        if (!research(profile, row.id)) return
        save(profile)
        paintDeck()
      })
      finds.append(btn)
    }
  }
  cardsEl.replaceChildren()
  for (const [title, kind] of groups) {
    const h = document.createElement("h2")
    h.textContent = title
    const grid = document.createElement("div")
    grid.className = "grid"
    for (const row of CARDS.filter((c) => c.deck && c.kind === kind && profile.known.includes(c.id))) {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = `card${count(row.id) ? " on" : ""}`
      btn.append(preview(row.id, 44))
      const b = document.createElement("b")
      b.textContent = row.name
      const small = document.createElement("small")
      const price = cardCost(row.id, profile.wear[row.id] ?? 0, count(row.id))
      small.textContent = price ? `${price} CR` : ""
      const n = document.createElement("span")
      n.className = "n"
      n.textContent = count(row.id) ? `${count(row.id)}/${row.max}` : ""
      btn.append(b, small, n)
      btn.disabled = count(row.id) >= row.max || deck.length >= DECK_CAP
      btn.addEventListener("click", () => {
        if (count(row.id) >= row.max || deck.length >= DECK_CAP) return
        deck.push(row.id)
        paintDeck()
      })
      grid.append(btn)
    }
    cardsEl.append(h, grid)
  }
  if (profile.heroes.length) {
    const h = document.createElement("h2")
    h.textContent = "HEROES"
    const grid = document.createElement("div")
    grid.className = "grid"
    for (const hero of profile.heroes) {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = `card${count(hero.id) ? " on" : ""}`
      btn.append(preview(hero.chassis, 44))
      const b = document.createElement("b")
      b.textContent = hero.name
      const small = document.createElement("small")
      small.textContent = `${card(hero.chassis).name} · ${hero.gift.toUpperCase()}  ${cardCost(hero.id)} CR`
      const n = document.createElement("span")
      n.className = "n"
      n.textContent = count(hero.id) ? "1/1" : ""
      btn.append(b, small, n)
      btn.disabled = count(hero.id) >= 1 || deck.length >= DECK_CAP
      btn.addEventListener("click", () => {
        if (count(hero.id) >= 1 || deck.length >= DECK_CAP) return
        deck.push(hero.id)
        paintDeck()
      })
      grid.append(btn)
    }
    cardsEl.append(h, grid)
  }
  deckList.replaceChildren()
  for (let i = 0; i < DECK_CAP; i++) {
    const li = document.createElement("li")
    const id = deck[i]
    if (!id) {
      const empty = document.createElement("div")
      empty.className = "empty"
      li.append(empty)
    } else {
      const hero = isHero(id) ? profile.heroes.find((have) => have.id === id) : undefined
      const row = hero || isHero(id) ? undefined : card(id)
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = row ? (row.kind === "vehicle" ? "veh" : row.kind) : "unit"
      btn.append(preview(hero ? hero.chassis : row ? id : "cell_rifle", 28))
      btn.append(document.createTextNode(hero?.name ?? row?.name ?? id))
      btn.addEventListener("click", () => {
        deck.splice(i, 1)
        paintDeck()
      })
      li.append(btn)
    }
    deckList.append(li)
  }
}

paintDeck()

document.querySelector("#clear")!.addEventListener("click", () => {
  deck.length = 0
  paintDeck()
})
document.querySelector("#fill")!.addEventListener("click", () => {
  const pool = CARDS.filter((c) => c.deck && profile.known.includes(c.id))
  let guard = 0
  while (deck.length < DECK_CAP && pool.length && guard++ < 80) {
    const row = pool[(Math.random() * pool.length) | 0]
    if (count(row.id) >= row.max) continue
    if (deployCost(deck, profile.wear) + cardCost(row.id, profile.wear[row.id] ?? 0, count(row.id)) > profile.credits) continue
    deck.push(row.id)
  }
  paintDeck()
})
let restartArm = false
document.querySelector("#restart")!.addEventListener("click", () => {
  if (!restartArm) {
    restartArm = true
    warn("RESTART WIPES THE CAMPAIGN")
    return
  }
  restart(profile)
  deck.length = 0
  restartArm = false
  warn("")
  paintDeck()
})
document.querySelector("#deploy")!.addEventListener("click", () => start(false))
document.querySelector("#deploy-bot")!.addEventListener("click", () => start(true))
document.querySelector("#again")!.addEventListener("click", () => {
  endEl.classList.add("hidden")
  deckEl.classList.remove("hidden")
  hudEl.classList.add("hidden")
  world = null
})
document.querySelector("#pause")!.addEventListener("click", () => togglePause(true))
document.querySelector("#resume")!.addEventListener("click", () => togglePause(false))

const systemEl = document.querySelector<HTMLElement>("#system")!
const volEl = document.querySelector<HTMLInputElement>("#vol")!
const muteBtn = document.querySelector<HTMLButtonElement>("#mute")!
function paintAudio() {
  const a = audioPrefs()
  volEl.value = String(Math.round(a.vol * 100))
  muteBtn.textContent = a.mute ? "MUTED" : "MUTE"
}
function openSystem() {
  unlockAudio()
  paintAudio()
  systemEl.classList.remove("hidden")
}
document.querySelector("#system-open")!.addEventListener("click", openSystem)
document.querySelector("#system-pause")!.addEventListener("click", openSystem)
document.querySelector("#system-close")!.addEventListener("click", () => systemEl.classList.add("hidden"))

const debugEl = document.querySelector<HTMLElement>("#debug")!
const ditherOn = document.querySelector<HTMLButtonElement>("#dither-on")!
const ditherAlpha = document.querySelector<HTMLInputElement>("#dither-alpha")!
const ditherCut = document.querySelector<HTMLInputElement>("#dither-cut")!
const ditherSpread = document.querySelector<HTMLInputElement>("#dither-spread")!
const ditherLevels = document.querySelector<HTMLInputElement>("#dither-levels")!
const swatch = document.querySelector<HTMLCanvasElement>("#dither-swatch")!
function choice(id: string, key: keyof Dither, values: (string | number)[]) {
  const row = document.querySelector("#" + id)!
  for (const v of values) {
    const btn = document.createElement("button")
    btn.type = "button"
    btn.textContent = String(v).toUpperCase()
    btn.dataset.value = String(v)
    btn.addEventListener("click", () => {
      setDither({ [key]: v } as Partial<Dither>)
      paintDebug()
    })
    row.append(btn)
  }
}
choice("dither-scale", "scale", [2, 4, 8])
choice("dither-size", "size", [1, 2, 3, 4])
choice("dither-pattern", "pattern", ["bayer", "lines", "noise", "check"])
choice("dither-ink", "ink", ["black", "white", "mud", "oxide"])
choice("dither-blend", "blend", ["over", "mul", "add"])
choice("dither-layer", "layer", ["top", "ground"])
function paintDebug() {
  const d = ditherPrefs()
  ditherOn.textContent = d.on ? "DITHER ON" : "DITHER OFF"
  ditherOn.classList.toggle("on", d.on)
  ditherAlpha.value = String(Math.round(d.alpha * 100))
  ditherCut.value = String(d.cut)
  ditherSpread.value = String(Math.round(d.spread * 100))
  ditherLevels.value = String(d.levels)
  document.querySelector("#dither-alpha-n")!.textContent = ditherAlpha.value
  document.querySelector("#dither-cut-n")!.textContent = ditherCut.value
  document.querySelector("#dither-spread-n")!.textContent = ditherSpread.value
  document.querySelector("#dither-levels-n")!.textContent = d.levels ? String(d.levels) : "OFF"
  for (const id of ["dither-scale", "dither-size", "dither-pattern", "dither-ink", "dither-blend", "dither-layer"]) {
    const key = id.slice("dither-".length) as keyof Dither
    document.querySelectorAll<HTMLButtonElement>("#" + id + " button").forEach((btn) => {
      btn.classList.toggle("on", btn.dataset.value === String(d[key]))
    })
  }
  const g = swatch.getContext("2d")
  if (!g) return
  const dpr = Math.min(2, devicePixelRatio || 1)
  const sw = Math.max(1, Math.floor((swatch.clientWidth || 280) * dpr))
  const sh = Math.max(1, Math.floor((swatch.clientHeight || 96) * dpr))
  if (swatch.width !== sw || swatch.height !== sh) {
    swatch.width = sw
    swatch.height = sh
  }
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.globalAlpha = 1
  g.globalCompositeOperation = "source-over"
  const ramp = g.createLinearGradient(0, 0, sw, 0)
  ramp.addColorStop(0, "#14180e")
  ramp.addColorStop(0.45, "#3d4a28")
  ramp.addColorStop(1, "#d5d0c6")
  g.fillStyle = ramp
  g.fillRect(0, 0, sw, sh)
  paintDither(g, sw, sh)
}
function openDebug() {
  debugEl.classList.remove("hidden")
  paintDebug()
}
document.querySelector("#debug-open")!.addEventListener("click", openDebug)
document.querySelector("#debug-pause")!.addEventListener("click", openDebug)
document.querySelector("#debug-close")!.addEventListener("click", () => debugEl.classList.add("hidden"))
ditherOn.addEventListener("click", () => {
  setDither({ on: !ditherPrefs().on })
  paintDebug()
})
ditherAlpha.addEventListener("input", () => {
  setDither({ alpha: Number(ditherAlpha.value) / 100 })
  paintDebug()
})
ditherCut.addEventListener("input", () => {
  setDither({ cut: Number(ditherCut.value) })
  paintDebug()
})
ditherSpread.addEventListener("input", () => {
  setDither({ spread: Number(ditherSpread.value) / 100 })
  paintDebug()
})
ditherLevels.addEventListener("input", () => {
  setDither({ levels: Number(ditherLevels.value) })
  paintDebug()
})
volEl.addEventListener("input", () => {
  unlockAudio()
  setAudio({ vol: Number(volEl.value) / 100, mute: audioPrefs().mute })
})
volEl.addEventListener("change", () => thuds([{ tint: "dust" }]))
muteBtn.addEventListener("click", () => {
  unlockAudio()
  const a = audioPrefs()
  setAudio({ vol: a.vol, mute: !a.mute })
  paintAudio()
  if (!audioPrefs().mute) thuds([{ tint: "dust" }])
})
paintAudio()
addEventListener("pointerdown", () => unlockAudio())

groupBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault()
  groupDown = true
  groupTap = true
  groupBtn.setPointerCapture(e.pointerId)
})
groupBtn.addEventListener("pointerup", () => (groupDown = false))
groupBtn.addEventListener("pointercancel", () => (groupDown = false))
spreadBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault()
  spreadDown = true
  spreadTap = true
  spreadBtn.setPointerCapture(e.pointerId)
})
spreadBtn.addEventListener("pointerup", () => (spreadDown = false))
spreadBtn.addEventListener("pointercancel", () => (spreadDown = false))
botBtn.addEventListener("click", () => {
  bot = !bot
  botBtn.textContent = bot ? "BOT ON" : "BOT OFF"
})

stick.addEventListener("pointerdown", (e) => {
  e.preventDefault()
  stickId = e.pointerId
  stick.setPointerCapture(e.pointerId)
  moveStick(e)
})
canvas.addEventListener("pointerdown", (e) => {
  if (!world || world.phase !== "run" || world.paused || stickId !== null) return
  const r = canvas.getBoundingClientRect()
  if (e.clientX - r.left > r.width * 0.62) return
  e.preventDefault()
  stickId = e.pointerId
  canvas.setPointerCapture(e.pointerId)
  stick.style.left = `${e.clientX - r.left - 56}px`
  stick.style.top = `${e.clientY - r.top - 56}px`
  stick.style.bottom = "auto"
  stick.style.display = "block"
  moveStick(e)
})
canvas.addEventListener("pointermove", (e) => {
  if (e.pointerId === stickId) moveStick(e)
})
canvas.addEventListener("pointerup", endStick)
canvas.addEventListener("pointercancel", endStick)
stick.addEventListener("pointermove", (e) => {
  if (e.pointerId === stickId) moveStick(e)
})
stick.addEventListener("pointerup", endStick)
stick.addEventListener("pointercancel", endStick)

function slotIndex(e: KeyboardEvent): number | null {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return null
  const hit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code)
  if (hit) return Number(hit[1]) - 1
  return e.key.length === 1 && e.key >= "1" && e.key <= "9" ? Number(e.key) - 1 : null
}

function arm(n: number) {
  if (!world || world.phase !== "run" || world.paused || !world.toolbar[n]) return
  ability = n
  const btn = toolbarEl.children[n]
  if (!(btn instanceof HTMLElement)) return
  btn.classList.add("hot")
  window.setTimeout(() => btn.classList.remove("hot"), 160)
}

addEventListener("keydown", (e) => {
  const slot = slotIndex(e)
  if (slot !== null && world?.phase === "run" && !world.paused) {
    e.preventDefault()
    arm(slot)
  }
  const key = e.key.toLowerCase()
  if (world && (key === " " || key === "shift" || key.startsWith("arrow"))) e.preventDefault()
  if (key === "escape" || key === "p") {
    togglePause()
    return
  }
  if (key === "f") speed = speed === 1 ? 2 : 1
  if (key === "t" && world && world.phase === "run") step(world, commands(), 30)
  keys.add(key)
})
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()))
addEventListener("resize", syncTouch)
syncTouch()

function syncTouch() {
  const coarse = matchMedia("(pointer: coarse)").matches || innerWidth < 700
  document.body.classList.toggle("touch", coarse)
}

function diff(): Diff {
  const picked = document.querySelector<HTMLInputElement>('input[name="diff"]:checked')
  const value = picked?.value
  return value === "easy" || value === "hard" ? value : "normal"
}

function warn(text: string) {
  const el = document.querySelector("#warn")
  if (el) el.textContent = text
}

function start(asBot: boolean) {
  const cost = deployCost(deck, profile.wear)
  if (cost > profile.credits) {
    warn(`SHORT ${cost - profile.credits} CR`)
    return
  }
  warn("")
  settled = false
  profile.credits -= cost
  applyWear(profile, deck)
  save(profile)
  bot = asBot
  speed = 1
  botBtn.textContent = bot ? "BOT ON" : "BOT OFF"
  const seed = Number(seedEl.value) || 1
  const hidden = CARDS.filter((c) => c.deck && !profile.found.includes(c.id)).map((c) => c.id)
  world = makeRun(seed, deck, { diff: diff(), hidden, known: profile.known, heroes: profile.heroes })
  parts.length = 0
  toolSig = ""
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  deckEl.classList.add("hidden")
  endEl.classList.add("hidden")
  pauseEl.classList.add("hidden")
  hudEl.classList.remove("hidden")
  last = performance.now()
}

function togglePause(force?: boolean) {
  if (!world || world.phase !== "run") return
  world.paused = force ?? !world.paused
  pauseEl.classList.toggle("hidden", !world.paused)
}

function endStick(e: PointerEvent) {
  if (e.pointerId !== stickId) return
  stickId = null
  stickX = 0
  stickY = 0
  knob.style.transform = "translate(0px, 0px)"
  stick.style.left = ""
  stick.style.top = ""
  stick.style.bottom = ""
  stick.style.display = ""
}

function moveStick(e: PointerEvent) {
  const r = stick.getBoundingClientRect()
  const dx = e.clientX - (r.left + r.width / 2)
  const dy = e.clientY - (r.top + r.height / 2)
  const mag = Math.hypot(dx, dy) || 1
  const lim = Math.min(36, mag)
  stickX = (dx / mag) * (lim / 36)
  stickY = -(dy / mag) * (lim / 36)
  knob.style.transform = `translate(${(dx / mag) * lim}px, ${(dy / mag) * lim}px)`
}

function commands(): Commands {
  if (bot && world) return policy(world)
  let x = 0
  let y = 0
  if (keys.has("a") || keys.has("arrowleft")) x -= 1
  if (keys.has("d") || keys.has("arrowright")) x += 1
  if (keys.has("w") || keys.has("arrowup")) y += 1
  if (keys.has("s") || keys.has("arrowdown")) y -= 1
  if (stickId !== null) {
    x = stickX
    y = stickY
  }
  const len = Math.hypot(x, y)
  if (len > 1) {
    x /= len
    y /= len
  }
  const group = groupDown || groupTap || keys.has("j") || keys.has("q") || keys.has(" ")
  const spread = spreadDown || spreadTap || keys.has("k") || keys.has("e") || keys.has("shift")
  groupTap = false
  spreadTap = false
  return { moveX: x, moveY: y, group, spread, ability }
}

function clock(t: number) {
  const s = Math.floor(t)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

function paintHud(w: World) {
  document.querySelector("#timer")!.textContent = `${clock(w.t)}  ${speed > 1 ? "2×  " : ""}lost ${w.lost}`
  const night = daylight(w.t) < 0.45
  const vis = w.vision === "nvg" ? " NVG" : w.vision === "thermal" ? " THERM" : night ? " NIGHT" : ""
  document.querySelector("#field")!.textContent = `${w.weather.toUpperCase()}${vis}`
  const dropIn = w.banner || `DROP ${Math.max(0, Math.ceil(w.nextDrop))}s`
  document.querySelector("#dropIn")!.textContent = dropIn
  document.querySelector("#kills")!.textContent = `KILLS ${w.kills}`
  const cr = document.querySelector("#credits")
  if (cr) cr.textContent = `CR ${profile.credits + w.credits}`
  const bounty = document.querySelector("#bounty")
  if (bounty) bounty.textContent = `PURGE ${Math.min(8, w.kills)}/8  HAUL ${Math.min(3, w.loot)}/3`
  document.querySelector("#group-label")!.textContent = w.groupLabel
  document.querySelector("#spread-label")!.textContent = w.spreadLabel

  const people = w.bodies.filter((b) => b.alive && b.inSection && b.side === "player")
  const firstCell = w.bodies.find((b) => b.kind === "cell_rifle")?.id ?? -1
  rosterEl.replaceChildren()
  for (const b of people) {
    const name = document.createElement("span")
    name.textContent = b.name || callSign(b.kind, b.id, firstCell)
    const bar = document.createElement("span")
    bar.className = "bar"
    const i = document.createElement("i")
    const frac = Math.max(0, b.hp / b.maxHp)
    i.style.width = `${frac * 100}%`
    i.style.background = hpColor(frac)
    bar.append(i)
    const st = document.createElement("span")
    st.textContent = b.boarded !== null ? "IN" : b.vehicle ? "HULL" : "UP"
    rosterEl.append(name, bar, st)
  }

  toastsEl.replaceChildren()
  for (const t of w.toasts) {
    const el = document.createElement("div")
    el.className = `toast ${t.kind}`
    el.textContent = t.msg
    toastsEl.append(el)
  }

  toolbarEl.hidden = w.toolbar.length === 0
  const sig = w.toolbar.map((s) => s.id).join(",")
  if (sig !== toolSig) {
    toolSig = sig
    toolbarEl.replaceChildren()
    for (let n = 0; n < 9; n++) {
      const slot = w.toolbar[n]
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = slot ? "tool" : "tool empty"
      if (!slot) {
        btn.disabled = true
        toolbarEl.append(btn)
        continue
      }
      const gear = CARDS.find((c) => c.ability === slot.id)
      if (gear) btn.append(preview(gear.id, 24))
      const k = document.createElement("span")
      k.className = "k"
      k.textContent = String(n + 1)
      const c = document.createElement("span")
      c.className = "c"
      btn.append(k, c)
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault()
        arm(n)
      })
      toolbarEl.append(btn)
    }
  }
  for (let n = 0; n < w.toolbar.length && n < 9; n++) {
    const slot = w.toolbar[n]
    const label = toolbarEl.children[n]?.querySelector(".c")
    if (!label) continue
    if (slot.id === "nvg" || slot.id === "thermal") label.textContent = w.vision === slot.id ? "ON" : ""
    else label.textContent = slot.cd > 0 ? slot.cd.toFixed(0) : slot.charges > 0 ? String(slot.charges) : ""
  }
}

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  resize()
  if (world && world.phase === "run" && !world.paused) {
    step(world, commands(), dt * speed)
    ability = null
    const hits = takeBursts(world)
    thuds(hits)
    burstsToParticles(parts, hits)
    if (world.phase !== "run") finish()
  }
  if (world) {
    draw(ctx, world, canvas.clientWidth, canvas.clientHeight, parts, dt)
    paintHud(world)
  } else {
    ctx.fillStyle = "#141810"
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  }
  requestAnimationFrame(frame)
}

function finish() {
  if (!world || settled) return
  settled = true
  document.querySelector("#end-title")!.textContent = world.phase === "win" ? "EXTRACT" : "LOST"
  document.querySelector("#end-line")!.textContent = balanceLine(world)
  const stats = document.querySelector("#end-stats")!
  stats.replaceChildren()
  const rows: [string, string][] = [
    ["TIME", clock(world.t)],
    ["KILLS", String(world.kills)],
    ["LOST", String(world.lost)],
    ["DROPS", String(world.dropsTaken)],
    ["HULL", world.hullDamage.toFixed(0)],
    ["CREDITS", `+${world.credits}`],
  ]
  profile.credits += world.credits
  world.credits = 0
  settleHeroes(profile, world)
  for (const id of world.found) if (!profile.found.includes(id) && !isHero(id)) profile.found.push(id)
  save(profile)
  paintDeck()
  for (const [k, v] of rows) {
    const dt = document.createElement("dt")
    const dd = document.createElement("dd")
    dt.textContent = k
    dd.textContent = v
    stats.append(dt, dd)
  }
  endEl.classList.remove("hidden")
}

function resize() {
  const dpr = Math.min(2, devicePixelRatio || 1)
  const w = Math.floor(canvas.clientWidth * dpr)
  const h = Math.floor(canvas.clientHeight * dpr)
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  syncTouch()
}

requestAnimationFrame(frame)
