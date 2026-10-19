import { HERO_PRICE, STARTER, isHero, priceOf, researchCost, type Hero } from "../content/catalog"

const KEY = "warhead-tactics-profile"

export type Profile = {
  credits: number
  found: string[]
  known: string[]
  wear: Record<string, number>
  heroes: Hero[]
}

export function fresh(): Profile {
  return { credits: 0, found: [STARTER], known: [STARTER], wear: {}, heroes: [] }
}

export function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fresh()
    const p = JSON.parse(raw) as Profile
    if (!Array.isArray(p.found) || !Array.isArray(p.known) || typeof p.credits !== "number") return fresh()
    if (!p.known.includes(STARTER)) p.known.push(STARTER)
    if (!p.found.includes(STARTER)) p.found.push(STARTER)
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
    return p
  } catch {
    return fresh()
  }
}

export function restart(p: Profile) {
  const n = fresh()
  p.credits = n.credits
  p.found = n.found
  p.known = n.known
  p.wear = {}
  p.heroes = []
  save(p)
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

export function cardCost(id: string, wear = 0, copy = 0) {
  if (isHero(id)) return HERO_PRICE
  const base = priceOf(id)
  if (!base) return 0
  return base * (1 + Math.max(0, wear) + Math.max(0, copy))
}

export function deployCost(deck: string[], wear: Record<string, number> = {}) {
  const seen: Record<string, number> = {}
  let sum = 0
  for (const id of deck) {
    const n = seen[id] ?? 0
    seen[id] = n + 1
    sum += cardCost(id, wear[id] ?? 0, n)
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

export function research(p: Profile, id: string) {
  if (p.known.includes(id) || !p.found.includes(id)) return false
  const cost = researchCost(id)
  if (p.credits < cost) return false
  p.credits -= cost
  p.known.push(id)
  return true
}
