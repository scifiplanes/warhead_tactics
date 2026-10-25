import { DECK_CAP, STARTER, isHero, paidFor, priceOf, researchCost, type Hero } from "../content/catalog"
import { diskCount, genMap, parseMap, type CampaignMap } from "./worldmap"

const KEY = "warhead-tactics-profile"

export type Profile = {
  credits: number
  found: string[]
  known: string[]
  /** Times researched; also the copy stock for the deck. */
  depth: Record<string, number>
  wear: Record<string, number>
  /** Consumable free deploy copies from finds hauled out on extract (RECOVERED). */
  salvage: Record<string, number>
  /** True after one-time grant of free stock for pre-recovered unlocks. */
  salvageBoot?: boolean
  heroes: Hero[]
  /** Seeded field graph; persists scars and residue across runs. */
  worldSeed: number
  map: CampaignMap | null
}

export function fresh(): Profile {
  const worldSeed = (Math.random() * 1e9) | 0 || 1
  return {
    credits: 0,
    found: [STARTER],
    known: [STARTER],
    depth: { [STARTER]: 1 },
    wear: {},
    salvage: {},
    salvageBoot: true,
    heroes: [],
    worldSeed,
    map: genMap(worldSeed),
  }
}

/**
 * Pre-recovered extracts only set known/depth. Grant one free RECOVERED copy each.
 * Research after this boot still pays for the first deploy.
 */
export function bootSalvage(p: Profile) {
  if (!p.salvage) p.salvage = {}
  if (p.salvageBoot) return
  for (const id of p.known) {
    if (id === STARTER || isHero(id) || priceOf(id) <= 0) continue
    if ((p.depth[id] ?? 0) < 1) continue
    if ((p.salvage[id] ?? 0) < 1) p.salvage[id] = 1
  }
  p.salvageBoot = true
}

export function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fresh()
    const p = JSON.parse(raw) as Profile
    if (!Array.isArray(p.found) || !Array.isArray(p.known) || typeof p.credits !== "number") return fresh()
    p.found = [...p.found]
    p.known = [...p.known]
    if (!p.known.includes(STARTER)) p.known.push(STARTER)
    if (!p.found.includes(STARTER)) p.found.push(STARTER)
    for (const id of p.known) if (!p.found.includes(id)) p.found.push(id)
    p.credits = Math.max(0, Math.floor(p.credits))
    const listed = p.heroes
    p.heroes = []
    if (Array.isArray(listed)) {
      for (const raw of listed) {
        const hero = keepHero(raw)
        if (hero && !p.heroes.some((have) => have.id === hero.id)) p.heroes.push(hero)
      }
    }
    const rawWear = p.wear
    p.wear = {}
    if (rawWear && typeof rawWear === "object") {
      for (const id of Object.keys(rawWear)) {
        const n = Math.floor(Number(rawWear[id]))
        if (n > 0) p.wear[id] = n
      }
    }
    const rawDepth = p.depth
    p.depth = {}
    if (rawDepth && typeof rawDepth === "object") {
      for (const id of Object.keys(rawDepth)) {
        const n = Math.floor(Number(rawDepth[id]))
        if (n > 0) p.depth[id] = n
      }
    }
    for (const id of p.known) {
      if (!p.depth[id]) p.depth[id] = 1
    }
    if (!p.depth[STARTER]) p.depth[STARTER] = 1
    const rawSalvage = p.salvage
    p.salvage = {}
    if (rawSalvage && typeof rawSalvage === "object") {
      for (const id of Object.keys(rawSalvage)) {
        const n = Math.floor(Number(rawSalvage[id]))
        if (n > 0) p.salvage[id] = n
      }
    }
    p.salvageBoot = Boolean(p.salvageBoot)
    bootSalvage(p)
    p.worldSeed = Math.max(1, Math.floor(Number(p.worldSeed) || 0) || ((Math.random() * 1e9) | 0) || 1)
    p.map = parseMap(p.map) ?? genMap(p.worldSeed)
    return p
  } catch {
    return fresh()
  }
}

export function ensureMap(p: Profile): CampaignMap {
  if (!p.map || p.map.nodes.length !== diskCount()) {
    p.map = genMap(p.worldSeed || 1)
  }
  return p.map
}

export function restart(p: Profile) {
  p.credits = 0
  p.found = [STARTER]
  p.known = [STARTER]
  p.depth = { [STARTER]: 1 }
  p.wear = {}
  p.salvage = {}
  p.salvageBoot = true
  p.heroes = []
  p.worldSeed = (Math.random() * 1e9) | 0 || 1
  p.map = genMap(p.worldSeed)
  save(p)
}

/** Banks new finds. Returns ids newly added to the research list. */
export function bankFinds(p: Profile, found: string[]): string[] {
  const added: string[] = []
  for (const id of found) {
    if (isHero(id) || p.found.includes(id)) continue
    p.found.push(id)
    added.push(id)
  }
  return added
}

/**
 * Successful extract: bank every field find for research, but only cards hauled out on
 * the craft (`recovered`) become loadout-ready — each haul grants one free RECOVERED
 * deploy copy. Abandoned kit (spent sentry, left hulls, ground finds) stays research-only.
 * A wipe still only banks finds via `bankFinds`.
 */
export function unlockExtracted(p: Profile, found: string[], recovered: string[] = []): string[] {
  if (!p.salvage) p.salvage = {}
  bankFinds(p, found)
  const unlocked: string[] = []
  for (const id of recovered) {
    if (isHero(id)) continue
    if (!p.found.includes(id)) p.found.push(id)
    const fresh = !p.known.includes(id)
    if (fresh) {
      p.known.push(id)
      unlocked.push(id)
    }
    p.salvage[id] = (p.salvage[id] ?? 0) + 1
    p.depth[id] = Math.max(p.depth[id] ?? 0, p.salvage[id])
  }
  return unlocked
}

const HERO_CHASSIS = new Set(["cell_rifle", "medic", "engr", "relay"])
const HERO_GIFTS = new Set(["tough", "fast", "keen", "patch"])
const HERO_GUNS = new Set(["rifle", "mg", "sniper"])

function keepHero(raw: unknown): Hero | null {
  if (!raw || typeof raw !== "object") return null
  const h = raw as Hero
  if (typeof h.id !== "string" || !isHero(h.id) || typeof h.name !== "string" || !h.name) return null
  if (!HERO_CHASSIS.has(h.chassis) || !HERO_GIFTS.has(h.gift) || !HERO_GUNS.has(h.gun)) return null
  return { id: h.id, name: h.name, chassis: h.chassis, gift: h.gift, gun: h.gun }
}

export function settleHeroes(
  p: Profile,
  w: {
    phase: string
    bodies: { alive: boolean; inSection: boolean; heroId: string }[]
    heroes: Record<string, Hero>
    buried: string[]
  },
) {
  if (w.phase === "win") {
    for (const b of w.bodies) {
      if (!b.alive || !b.inSection || !b.heroId) continue
      if (p.heroes.some((hero) => hero.id === b.heroId)) continue
      const hero = w.heroes[b.heroId]
      if (hero) p.heroes.push(hero)
    }
  }
  if (w.buried.length) p.heroes = p.heroes.filter((hero) => !w.buried.includes(hero.id))
}

export function save(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* private mode */
  }
}

export function cardCost(id: string, wear = 0, copy = 0, salvage = 0) {
  if (copy < salvage) return 0
  return paidFor(id, wear, copy)
}

/** Deck button / deploy label: RECOVERED for free hauled-find stock, else CR. */
export function costLabel(id: string, wear = 0, copy = 0, salvage = 0) {
  if (copy < salvage && priceOf(id) > 0) return "RECOVERED"
  const n = cardCost(id, wear, copy, salvage)
  return n ? `${n} CR` : ""
}

export function deployCost(
  deck: string[],
  wear: Record<string, number> = {},
  salvage: Record<string, number> = {},
) {
  const seen: Record<string, number> = {}
  let sum = 0
  for (const id of deck) {
    const n = seen[id] ?? 0
    seen[id] = n + 1
    sum += cardCost(id, wear[id] ?? 0, n, salvage[id] ?? 0)
  }
  return sum
}

export function applyWear(p: Profile, deck: string[]) {
  const picked = new Set(deck.filter((id) => priceOf(id) > 0))
  for (const id of Object.keys(p.wear)) {
    if (picked.has(id)) continue
    p.wear[id] -= 1
    if (p.wear[id] <= 0) delete p.wear[id]
  }
  const copies: Record<string, number> = {}
  for (const id of deck) {
    if (priceOf(id) <= 0) continue
    copies[id] = (copies[id] ?? 0) + 1
  }
  for (const id of Object.keys(copies)) p.wear[id] = (p.wear[id] ?? 0) + copies[id]
}

/** Spend RECOVERED free copies used in this deck (win or wipe). Paid CR copies leave salvage alone. */
export function spendSalvage(p: Profile, deck: string[]) {
  if (!p.salvage) p.salvage = {}
  const used: Record<string, number> = {}
  for (const id of deck) {
    if (priceOf(id) <= 0) continue
    used[id] = (used[id] ?? 0) + 1
  }
  for (const id of Object.keys(used)) {
    const free = p.salvage[id] ?? 0
    if (free <= 0) continue
    const left = free - Math.min(free, used[id])
    if (left > 0) p.salvage[id] = left
    else delete p.salvage[id]
  }
}

/** How many copies the deck may take (research depth). */
export function stockOf(p: Profile, id: string) {
  if (isHero(id)) return 1
  return p.depth[id] ?? 0
}

export function research(p: Profile, id: string) {
  if (!p.found.includes(id) || isHero(id)) return false
  const depth = p.depth[id] ?? 0
  if (depth >= DECK_CAP) return false
  const cost = researchCost(id, depth)
  if (p.credits < cost) return false
  p.credits -= cost
  p.depth[id] = depth + 1
  if (!p.known.includes(id)) p.known.push(id)
  return true
}
