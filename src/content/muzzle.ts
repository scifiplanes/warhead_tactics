/** World-unit reach from body center to gun tip (shared by sim tracers and view stamp). */

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
  bow: 0.44,
  blade: 0.4,
  blade_long: 0.55,
}

export function gunMuzzle(gunId: string | null | undefined): number {
  if (!gunId) return 0.45
  const key = ALIAS[gunId] ?? gunId
  return REACH[key] ?? 0.45
}
