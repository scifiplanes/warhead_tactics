/** World-unit reach from body center to gun tip, plus per-gun muzzle flash profiles. */

const ALIAS: Record<string, string> = {
  minismg: "smg",
  autopistol: "smg",
  autoshotgun: "shotgun",
  revolver: "pistol",
  magnum: "pistol",
  laserpistol: "pistol",
  warbow: "bow",
  knife: "blade",
  kukri: "blade",
  machete: "blade",
  baton: "blade",
  stave: "blade",
  katana: "blade_long",
  sword: "blade_long",
  axe: "blade_long",
  gren: "lob",
  mortar: "lob",
}

/** Approximate tip distance along aim for each HOLD silhouette. */
const REACH: Record<string, number> = {
  rifle: 0.52,
  smg: 0.42,
  shotgun: 0.48,
  sniper: 0.68,
  railgun: 0.68,
  mg: 0.55,
  pistol: 0.32,
  gren: 0.36,
  mortar: 0.4,
  lob: 0.38,
  bow: 0.44,
  blade: 0.4,
  blade_long: 0.55,
  mount: 0.55,
}

export type FlashShape = "cross" | "cone" | "spike" | "dot" | "bloom" | "bolt" | "puff"

/** Hard-pixel flash recipe — shape is the weapon signature; light is world-unit radius. */
export type FlashDef = {
  shape: FlashShape
  life: number
  core: string
  rim?: string
  /** Screen px along aim. */
  along: number
  /** Screen px across aim. */
  across: number
  /** Night light radius in world units. */
  light: number
}

const FLASH: Record<string, FlashDef | null> = {
  // compact brass pop (sizes are field-buffer px; view scales them up)
  rifle: { shape: "cross", life: 0.18, core: "#e1c15a", rim: "#f0e0a0", along: 5, across: 3, light: 5.5 },
  // tiny tight spark (reads as rate-of-fire)
  smg: { shape: "dot", life: 0.14, core: "#e1c15a", rim: "#f0e0a0", along: 3, across: 2, light: 3.8 },
  // wide petal fan
  shotgun: { shape: "cone", life: 0.2, core: "#e1c15a", rim: "#a8a49c", along: 4, across: 7, light: 7 },
  // long thin spike
  sniper: { shape: "spike", life: 0.22, core: "#e1c15a", rim: "#f0e0a0", along: 9, across: 2, light: 7.5 },
  // oxide electric bolt
  railgun: { shape: "bolt", life: 0.24, core: "#8a5040", rim: "#e1c15a", along: 10, across: 3, light: 8.5 },
  // heavier bloom
  mg: { shape: "bloom", life: 0.18, core: "#e1c15a", rim: "#f0e0a0", along: 6, across: 4, light: 6.5 },
  // short sidearm pop
  pistol: { shape: "cross", life: 0.16, core: "#e1c15a", rim: "#f0e0a0", along: 3, across: 2, light: 3.6 },
  // tube ash puff (lob) — dim
  lob: { shape: "puff", life: 0.2, core: "#a8a49c", rim: "#5a564e", along: 3, across: 4, light: 2.8 },
  // hull / android mount
  mount: { shape: "bloom", life: 0.18, core: "#e1c15a", rim: "#f0e0a0", along: 5, across: 3, light: 6 },
  // later rust gun spit — small oxide, reads apart from section brass
  oxide: { shape: "dot", life: 0.11, core: "#8a5040", rim: "#5a3830", along: 2, across: 1, light: 2.2 },
  // early rust taser — short pale zig-zag (not powder)
  taser: { shape: "bolt", life: 0.14, core: "#c8e8f0", rim: "#6a9088", along: 4, across: 2, light: 2.6 },
  // no powder flash
  bow: null,
  blade: null,
  blade_long: null,
}

/** Early rust tasers — electric bolt flash. */
const TASER_FLASH = new Set(["drone", "scoot", "kite"])

/** Later rust powder guns. */
const RUST_FLASH = new Set([
  "walker",
  "tract",
  "roller",
  "slab",
  "flake",
  "cluster",
  "post",
  "mast",
  "crowhead",
  "goathead",
])

export function gunFamily(gunId: string | null | undefined): string {
  if (!gunId) return "mount"
  return ALIAS[gunId] ?? gunId
}

export function gunMuzzle(gunId: string | null | undefined): number {
  const key = gunFamily(gunId)
  return REACH[key] ?? REACH.mount
}

/** Flash profile for a gun id / hull kind. Null = silent (blade, bow). */
export function flashOf(gunId: string | null | undefined): FlashDef | null {
  const key = gunFamily(gunId)
  if (TASER_FLASH.has(key)) return FLASH.taser
  if (RUST_FLASH.has(key)) return FLASH.oxide
  if (key in FLASH) return FLASH[key]
  // unknown ranged gear → rifle-like; hull kinds fall to mount
  if (REACH[key] != null && FLASH[key] === null) return null
  return FLASH.mount
}
