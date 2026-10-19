export type Side = "player" | "feral" | "rust"

export type Stats = {
  hp: number
  speed: number
  range: number
  damage: number
  cooldown: number
  mobileFire: boolean
  deployNeed: number
  seats: number
  heavy: boolean
  armor: number
  radius: number
  vehicle: boolean
}

export type Fit = "unit" | "vehicle" | "section" | "any" | "deploy"

export type CardDef = {
  id: string
  name: string
  kind: "unit" | "vehicle" | "gear"
  deck: boolean
  max: number
  desc: string
  fits?: Fit
  armorAdd?: number
  rangeMul?: number
  rateMul?: number
  speedMul?: number
  hpMul?: number
  deployMul?: number
  ramMul?: number
  ramSelfMul?: number
  ability?: string
  charges?: number
  cd?: number
  lob?: boolean
  aoe?: number
  heal?: number
  healAdd?: number
  digAdd?: number
  pierce?: number
  dig?: number
  android?: boolean
  spot?: number
  follow?: boolean
  air?: boolean
  nvg?: boolean
  gun?: Gun
  stats?: Stats
}

export type Gun = {
  range: number
  damage: number
  cooldown: number
  mobileFire: boolean
  deployNeed: number
  lob?: boolean
  aoe?: number
  pierce?: number
}

export type HostileDef = {
  id: string
  name: string
  side: Side
  stats: Stats
  lob?: boolean
  aoe?: number
  pack?: number
  air?: boolean
}

const foot = (p: Partial<Stats>): Stats => ({
  hp: 36,
  speed: 5.5,
  range: 9,
  damage: 7,
  cooldown: 0.45,
  mobileFire: false,
  deployNeed: 0.8,
  seats: 0,
  heavy: false,
  armor: 0,
  radius: 0.45,
  vehicle: false,
  ...p,
})

function kit(p: Partial<CardDef> & { id: string; name: string; desc: string }): CardDef {
  return { kind: "gear", deck: true, max: 2, fits: "unit", ...p }
}

function rig(id: string, name: string, desc: string, stats: Stats, extra: Partial<CardDef> = {}): CardDef {
  return { id, name, kind: "vehicle", deck: true, max: 1, desc, stats, ...extra }
}

function man(id: string, name: string, desc: string, stats: Stats, extra: Partial<CardDef> = {}): CardDef {
  return { id, name, kind: "unit", deck: true, max: 1, desc, stats, ...extra }
}

function rust(id: string, name: string, stats: Partial<Stats>, extra: Partial<HostileDef> = {}): HostileDef {
  return { id, name, side: "rust", stats: foot({ mobileFire: true, deployNeed: 0, ...stats }), ...extra }
}

const blade = (damage: number, cooldown = 0.4): Gun => ({
  range: 1.6,
  damage,
  cooldown,
  mobileFire: true,
  deployNeed: 0,
})

const hull = (p: Partial<Stats>): Stats => ({
  hp: 140,
  speed: 14,
  range: 10,
  damage: 5,
  cooldown: 0.4,
  mobileFire: true,
  deployNeed: 0,
  seats: 4,
  heavy: false,
  armor: 0.15,
  radius: 1.15,
  vehicle: true,
  ...p,
})

export const STARTER = "cell_rifle"
export const DECK_CAP = 12
export const FORM_REPEAT = 0.45

export const CARDS: CardDef[] = [
  {
    id: "cell_rifle",
    name: "CELL",
    kind: "unit",
    deck: true,
    max: 3,
    desc: "Homunculus. Lands with a rifle. The first one is the Lead.",
    stats: foot({ range: 0, damage: 0, mobileFire: true, deployNeed: 0 }),
  },
  {
    id: "aegis",
    name: "AEGIS",
    kind: "unit",
    deck: true,
    max: 3,
    desc: "Android. Fires on the move. A medic cannot patch it.",
    android: true,
    stats: foot({
      hp: 48,
      speed: 6,
      range: 7.5,
      damage: 5,
      cooldown: 0.32,
      mobileFire: true,
      deployNeed: 0,
    }),
  },
  {
    id: "mg",
    name: "MG",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Fits a soldier. Sets, then shreds.",
    fits: "unit",
    gun: { range: 11, damage: 4, cooldown: 0.12, mobileFire: false, deployNeed: 1.1 },
  },
  {
    id: "sniper",
    name: "SNIPER",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Fits a soldier. Long shots pierce.",
    fits: "unit",
    gun: { range: 18, damage: 22, cooldown: 1.2, mobileFire: false, deployNeed: 0.9, pierce: 3 },
  },
  {
    id: "gren",
    name: "GRENADE",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Fits a soldier. Lobs while moving.",
    fits: "unit",
    gun: { range: 10, damage: 16, cooldown: 1.4, mobileFire: true, deployNeed: 0, lob: true, aoe: 2.4 },
  },
  {
    id: "medic",
    name: "MEDIC",
    kind: "unit",
    deck: true,
    max: 3,
    desc: "Patches soldiers nearby. Lands with a rifle.",
    heal: 8,
    stats: foot({ hp: 34, speed: 5.6, range: 0, damage: 0, mobileFire: true, deployNeed: 0 }),
  },
  {
    id: "mortar",
    name: "MORTAR",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Fits a soldier. Sets the tube. Long blasts.",
    fits: "unit",
    gun: { range: 22, damage: 26, cooldown: 2, mobileFire: false, deployNeed: 1.6, lob: true, aoe: 3.2 },
  },
  {
    id: "forge",
    name: "FORGE",
    kind: "unit",
    deck: true,
    max: 2,
    desc: "Android digger. Breaks cover. A medic cannot patch it.",
    android: true,
    dig: 8,
    stats: foot({
      hp: 44,
      speed: 4.6,
      range: 4.5,
      damage: 6,
      cooldown: 0.5,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.08,
    }),
  },
  {
    id: "wisp",
    name: "WISP",
    kind: "unit",
    deck: true,
    max: 2,
    desc: "Fast android scout. Opens the section's sight. A medic cannot patch it.",
    android: true,
    spot: 2,
    stats: foot({
      hp: 30,
      speed: 7.2,
      range: 14,
      damage: 5,
      cooldown: 0.55,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.06,
    }),
  },
  {
    id: "engr",
    name: "ENGINEER",
    kind: "unit",
    deck: true,
    max: 2,
    desc: "Breaks trees and ruins. Lands with a rifle.",
    dig: 9,
    stats: foot({ hp: 36, speed: 4.8, range: 0, damage: 0, mobileFire: true, deployNeed: 0 }),
  },
  {
    id: "relay",
    name: "RELAY",
    kind: "unit",
    deck: true,
    max: 2,
    desc: "The craft comes sooner while this body lives. Lands with a rifle.",
    stats: foot({ hp: 34, speed: 5.2, range: 0, damage: 0, mobileFire: true, deployNeed: 0 }),
  },
  {
    id: "k9",
    name: "RECONDOG",
    kind: "unit",
    deck: true,
    max: 1,
    desc: "Follows the Lead. Carries night sight.",
    follow: true,
    nvg: true,
    stats: foot({ hp: 28, speed: 7.4, range: 1.3, damage: 6, cooldown: 0.45, mobileFire: true, deployNeed: 0, radius: 0.4 }),
  },
  {
    id: "copter",
    name: "COPTER",
    kind: "unit",
    deck: true,
    max: 1,
    desc: "Follows from the air and opens sight.",
    follow: true,
    air: true,
    spot: 2,
    stats: foot({ hp: 22, speed: 9, range: 12, damage: 3, cooldown: 0.5, mobileFire: true, deployNeed: 0, radius: 0.35 }),
  },
  {
    id: "killer",
    name: "KILLER",
    kind: "unit",
    deck: true,
    max: 1,
    desc: "A leashed gun. Follows the Lead.",
    follow: true,
    stats: foot({ hp: 34, speed: 6.2, range: 13, damage: 8, cooldown: 0.4, mobileFire: true, deployNeed: 0 }),
  },
  {
    id: "jeep",
    name: "JEEP",
    kind: "vehicle",
    deck: true,
    max: 2,
    desc: "Three seats. Fast mounted gun.",
    stats: hull({ hp: 90, speed: 16, range: 9, damage: 4, cooldown: 0.16, seats: 3, armor: 0.05, radius: 1 }),
  },
  {
    id: "apc",
    name: "APC",
    kind: "vehicle",
    deck: true,
    max: 2,
    desc: "Four seats. Gun fires on the move.",
    stats: hull({}),
  },
  {
    id: "plow",
    name: "PLOW",
    kind: "vehicle",
    deck: true,
    max: 2,
    desc: "Heavy hull. Breaks trees and ruins.",
    stats: hull({
      hp: 180,
      speed: 10,
      range: 2.2,
      damage: 4,
      cooldown: 0.7,
      mobileFire: false,
      deployNeed: 1.1,
      seats: 1,
      heavy: true,
      armor: 0.25,
      radius: 1.2,
    }),
  },
  {
    id: "tank",
    name: "TANK",
    kind: "vehicle",
    deck: true,
    max: 2,
    desc: "Heavy hull. Main gun sets up.",
    stats: hull({
      hp: 220,
      speed: 8,
      range: 16,
      damage: 20,
      cooldown: 1.5,
      mobileFire: false,
      deployNeed: 1,
      seats: 3,
      heavy: true,
      armor: 0.3,
      radius: 1.3,
    }),
  },
  {
    id: "bike",
    name: "BIKE",
    kind: "vehicle",
    deck: true,
    max: 2,
    desc: "Two seats. Fastest hull.",
    stats: hull({ hp: 70, speed: 22, range: 8, damage: 4, cooldown: 0.2, seats: 2, armor: 0.05, radius: 0.85 }),
  },
  {
    id: "buggy",
    name: "BUGGY",
    kind: "vehicle",
    deck: true,
    max: 2,
    desc: "Three seats. Fast open hull.",
    stats: hull({ hp: 100, speed: 18, range: 9, damage: 5, cooldown: 0.22, seats: 3, armor: 0.1, radius: 1.05 }),
  },
  {
    id: "hover",
    name: "HOVER",
    kind: "vehicle",
    deck: true,
    max: 2,
    desc: "One seat. Ignores mud and rain.",
    stats: hull({ hp: 80, speed: 20, range: 8, damage: 4, cooldown: 0.24, seats: 1, armor: 0.06, radius: 0.8 }),
  },
  {
    id: "mrap",
    name: "MRAP",
    kind: "vehicle",
    deck: true,
    max: 2,
    desc: "Six seats. Thick wagon.",
    stats: hull({ hp: 200, speed: 12, range: 10, damage: 6, cooldown: 0.35, seats: 6, armor: 0.45, radius: 1.25 }),
  },
  {
    id: "hex_scout",
    name: "HEX SCOUT",
    kind: "vehicle",
    deck: true,
    max: 1,
    desc: "One seat. Slow armored walker.",
    stats: hull({
      hp: 160,
      speed: 8,
      range: 11,
      damage: 8,
      cooldown: 0.6,
      seats: 1,
      armor: 0.28,
      radius: 1.1,
    }),
  },
  {
    id: "hex_line",
    name: "HEX LINE",
    kind: "vehicle",
    deck: true,
    max: 1,
    desc: "Three seats. Crewed walker gun.",
    stats: hull({
      hp: 200,
      speed: 7,
      range: 14,
      damage: 12,
      cooldown: 0.9,
      mobileFire: false,
      deployNeed: 0.8,
      seats: 3,
      armor: 0.32,
      radius: 1.2,
    }),
  },
  {
    id: "hex_siege",
    name: "HEX SIEGE",
    kind: "vehicle",
    deck: true,
    max: 1,
    desc: "Heavy walker. Long gun. Breaks cover.",
    stats: hull({
      hp: 260,
      speed: 5,
      range: 18,
      damage: 22,
      cooldown: 1.7,
      mobileFire: false,
      deployNeed: 1.2,
      seats: 2,
      heavy: true,
      armor: 0.4,
      radius: 1.35,
    }),
  },
  {
    id: "rifle",
    name: "RIFLE",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Fits a soldier. Sets, then fires.",
    fits: "unit",
    gun: { range: 9, damage: 7, cooldown: 0.45, mobileFire: false, deployNeed: 0.8 },
  },
  {
    id: "plate",
    name: "PLATE",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Armor on the first bare soldier.",
    fits: "unit",
    armorAdd: 0.3,
  },
  {
    id: "scope",
    name: "SCOPE",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Weapon range +30%.",
    fits: "any",
    rangeMul: 1.3,
  },
  {
    id: "drum",
    name: "DRUM",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Fire rate +40%.",
    fits: "any",
    rateMul: 0.72,
  },
  {
    id: "bipod",
    name: "BIPOD",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Set-up time −60%. Needs a deploy weapon.",
    fits: "deploy",
    deployMul: 0.4,
  },
  {
    id: "stim",
    name: "STIM",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Soldier speed +20%.",
    fits: "unit",
    speedMul: 1.2,
  },
  {
    id: "plating",
    name: "PLATING",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Vehicle health +60%.",
    fits: "vehicle",
    hpMul: 1.6,
  },
  {
    id: "ram",
    name: "RAM",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Ram damage ×2.5. Ram wear −75%.",
    fits: "vehicle",
    ramMul: 2.5,
    ramSelfMul: 0.25,
  },
  {
    id: "frag",
    name: "FRAG",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "One blast on the thickest crowd.",
    fits: "section",
    ability: "frag",
    charges: 1,
  },
  {
    id: "mines",
    name: "MINES",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Four mines at the squad's feet.",
    fits: "section",
    ability: "mines",
    charges: 4,
  },
  {
    id: "sentry",
    name: "SENTRY",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Drops an auto-gun for 30s.",
    fits: "section",
    ability: "sentry",
    charges: 1,
  },
  {
    id: "kit",
    name: "KIT",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Heals the section. 30s cooldown.",
    fits: "section",
    ability: "kit",
    cd: 30,
  },
  {
    id: "radio",
    name: "RADIO",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "Six shells on a crowd. 45s cooldown.",
    fits: "section",
    ability: "radio",
    cd: 45,
  },
  {
    id: "cas",
    name: "CAS",
    kind: "gear",
    deck: true,
    max: 1,
    desc: "A gunship strafes along the crowd.",
    fits: "section",
    ability: "cas",
    cd: 50,
  },
  {
    id: "nvg",
    name: "NVG",
    kind: "gear",
    deck: true,
    max: 1,
    desc: "Night sight. Green. Off in daylight.",
    fits: "section",
    ability: "nvg",
  },
  {
    id: "thermal",
    name: "THERMAL",
    kind: "gear",
    deck: true,
    max: 1,
    desc: "Heat sight. A living android carries it. Off in daylight.",
    fits: "section",
    ability: "thermal",
  },
  {
    id: "nitro",
    name: "NITRO",
    kind: "gear",
    deck: true,
    max: 3,
    desc: "The driven hull sprints for 3s.",
    fits: "section",
    ability: "nitro",
    cd: 18,
  },
  {
    id: "thermite",
    name: "THERMITE",
    kind: "gear",
    deck: true,
    max: 2,
    desc: "One blast that ignores armor and breaks cover.",
    fits: "section",
    ability: "thermite",
    charges: 1,
  },
  {
    id: "emp",
    name: "EMP",
    kind: "gear",
    deck: true,
    max: 2,
    desc: "A charge that only bites Rust.",
    fits: "section",
    ability: "emp",
    charges: 1,
  },
  {
    id: "smoke",
    name: "SMOKE",
    kind: "gear",
    deck: true,
    max: 2,
    desc: "A cloud. Ranged hostiles lose the squad.",
    fits: "section",
    ability: "smoke",
    charges: 2,
  },
  {
    id: "exo",
    name: "EXO",
    kind: "gear",
    deck: true,
    max: 2,
    desc: "A frame. More speed, health, and armor.",
    fits: "unit",
    speedMul: 1.25,
    hpMul: 1.35,
    armorAdd: 0.12,
  },
  {
    id: "stun",
    name: "STUN",
    kind: "gear",
    deck: true,
    max: 2,
    desc: "Stops a crowd for a few seconds.",
    fits: "section",
    ability: "stun",
    charges: 1,
  },
  {
    id: "fpv",
    name: "FPV",
    kind: "gear",
    deck: true,
    max: 2,
    desc: "A small drone into the crowd.",
    fits: "section",
    ability: "fpv",
    charges: 1,
  },
  kit({ id: "knife", name: "KNIFE", desc: "A short blade. Replaces the gun.", gun: blade(4, 0.35) }),
  kit({ id: "kukri", name: "KUKRI", desc: "A heavy chopper. Replaces the gun.", gun: blade(5) }),
  kit({ id: "katana", name: "KATANA", desc: "A long cut. Replaces the gun.", gun: blade(9, 0.55) }),
  kit({ id: "machete", name: "MACHETE", desc: "A brush blade. Replaces the gun.", gun: blade(5) }),
  kit({ id: "sword", name: "SWORD", desc: "A short sword. Replaces the gun.", gun: blade(7, 0.45) }),
  kit({ id: "axe", name: "AXE", desc: "A breaching axe. Chews cover. Replaces the gun.", gun: blade(8, 0.5), digAdd: 2 }),
  kit({ id: "stave", name: "STAVE", desc: "An iron stave. Replaces the gun.", gun: blade(4, 0.45) }),
  kit({ id: "baton", name: "BATON", desc: "A light baton. Replaces the gun.", gun: blade(3, 0.3) }),
  kit({
    id: "bow",
    name: "BOW",
    desc: "A quiet recurve. Fires on the move.",
    gun: { range: 12, damage: 4, cooldown: 0.9, mobileFire: true, deployNeed: 0 },
  }),
  kit({
    id: "warbow",
    name: "WARBOW",
    desc: "A heavier bow. Fires on the move.",
    gun: { range: 15, damage: 6, cooldown: 1.1, mobileFire: true, deployNeed: 0 },
  }),
  kit({
    id: "at",
    name: "AT",
    desc: "Two armor-punching blasts.",
    fits: "section",
    ability: "at",
    charges: 2,
  }),
  kit({ id: "jetpack", name: "JETPACK", desc: "Faster, and the mud does not hold.", speedMul: 1.36 }),
  kit({ id: "litter", name: "LITTER", desc: "The bearer can patch a nearby soldier.", healAdd: 6 }),
  kit({ id: "filter", name: "FILTER", desc: "Weather stops slowing this soldier and softening their shots.", fits: "unit" }),
  kit({ id: "ewar", name: "EWAR", desc: "Jams Rust for a few seconds.", fits: "section", ability: "ewar", cd: 22 }),
  rig("truck", "TRUCK", "A big hauler. Lands with a light gun.", hull({ hp: 170, speed: 14, range: 0, damage: 0, seats: 6, armor: 0.15, radius: 1.3 })),
  rig("tech", "TECHNICAL", "A fast pintle.", hull({ hp: 120, speed: 17, range: 11, damage: 6, cooldown: 0.35, seats: 3, armor: 0.12, radius: 1.1 })),
  rig("suv", "SUV", "A fast hull. Lands with a light gun.", hull({ hp: 130, speed: 18, range: 0, damage: 0, seats: 4, armor: 0.2, radius: 1.1 })),
  rig("steed", "STEED", "A one-seat robohorse. Lands with a light gun.", hull({ hp: 80, speed: 20, range: 0, damage: 0, seats: 1, armor: 0.12, radius: 0.9 })),
  rig("cart", "CART", "A slow cargo robot. Lands with a light gun.", hull({ hp: 90, speed: 7, range: 0, damage: 0, seats: 1, armor: 0.1, radius: 0.95 })),
  rig("mule", "MULE", "A heavier cargo robot. Lands with a light gun.", hull({ hp: 120, speed: 6, range: 0, damage: 0, seats: 2, armor: 0.14, radius: 1.05 })),
  rig(
    "gunboat",
    "GUNBOAT",
    "Unmanned assault copter. Leashed to the Lead.",
    hull({ hp: 70, speed: 8, range: 13, damage: 8, cooldown: 0.35, seats: 0, armor: 0.2, radius: 0.55 }),
    { follow: true, air: true },
  ),
  rig(
    "mlrs",
    "MLRS",
    "A slow salvo.",
    hull({ hp: 180, speed: 8, range: 16, damage: 16, cooldown: 1.8, mobileFire: false, deployNeed: 1.2, seats: 2, armor: 0.22, radius: 1.3 }),
    { lob: true, aoe: 3.4 },
  ),
  rig("ifv", "IFV", "An armored troop hull with a gun.", hull({ hp: 240, speed: 9, range: 12, damage: 9, cooldown: 0.45, seats: 6, armor: 0.48, radius: 1.3 })),
  rig(
    "mbt",
    "MBT",
    "Heavier than the tank. Breaks cover.",
    hull({ hp: 340, speed: 5, range: 16, damage: 20, cooldown: 1.5, mobileFire: false, deployNeed: 1.1, seats: 3, heavy: true, armor: 0.58, radius: 1.4 }),
  ),
  rig(
    "ugv",
    "UGV",
    "Unmanned. Follows the Lead and shoots.",
    hull({ hp: 160, speed: 11, range: 12, damage: 7, cooldown: 0.4, seats: 0, armor: 0.3, radius: 1.05 }),
    { follow: true },
  ),
  rig(
    "tube",
    "60MM",
    "A towed mortar. Sets, then lobs.",
    hull({ hp: 80, speed: 4, range: 15, damage: 14, cooldown: 1.6, mobileFire: false, deployNeed: 1.4, seats: 1, armor: 0, radius: 0.9 }),
    { lob: true, aoe: 3.2 },
  ),
  rig("drill", "DRILL", "Chews cover. Breaks it by driving through. Lands with a light gun.", hull({ hp: 100, speed: 4, range: 0, damage: 0, seats: 1, heavy: true, armor: 0.08, radius: 0.95 }), { dig: 14 }),
  rig("pump", "PUMP", "A slow rig that digs what it touches. Lands with a light gun.", hull({ hp: 80, speed: 4, range: 0, damage: 0, seats: 1, armor: 0.05, radius: 0.9 }), { dig: 8 }),
  rig("cutter", "CUTTER", "A plasma torch on a slow hull. Lands with a light gun.", hull({ hp: 70, speed: 4, range: 0, damage: 0, seats: 1, armor: 0, radius: 0.85 }), { dig: 12 }),
  man("hawk", "HAWK", "Follows from the air and opens sight. Lands with a light gun.", foot({ hp: 24, speed: 9, range: 0, damage: 0, mobileFire: true, deployNeed: 0, radius: 0.35 }), { follow: true, air: true, spot: 2 }),
  man("mid", "MID", "A spotter in the air. Follows the Lead. Lands with a light gun.", foot({ hp: 20, speed: 10, range: 0, damage: 0, mobileFire: true, deployNeed: 0, radius: 0.32 }), { follow: true, air: true, spot: 3 }),
  man("assassin", "ASSASSIN", "A leashed blade. Follows the Lead.", foot({ hp: 40, speed: 8, range: 1.5, damage: 11, cooldown: 0.4, mobileFire: true, deployNeed: 0, armor: 0.06 }), { follow: true }),
  man("operator", "OPERATOR", "Jams Rust while this body lives. Lands with a rifle.", foot({ hp: 36, speed: 6.2, range: 0, damage: 0, mobileFire: true, deployNeed: 0, armor: 0.08 }), { spot: 1 }),
  {
    id: "sentry_gun",
    name: "SENTRY",
    kind: "unit",
    deck: false,
    max: 0,
    desc: "",
    stats: foot({
      hp: 40,
      speed: 0,
      range: 9,
      damage: 4,
      cooldown: 0.12,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.4,
    }),
  },
]

export const HOSTILES: HostileDef[] = [
  {
    id: "shambler",
    name: "SHAMBLER",
    side: "feral",
    stats: foot({
      hp: 14,
      speed: 3.6,
      range: 1.15,
      damage: 5,
      cooldown: 0.55,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.42,
    }),
  },
  {
    id: "doghead",
    name: "DOGHEAD",
    side: "feral",
    stats: foot({
      hp: 20,
      speed: 7.2,
      range: 1.2,
      damage: 7,
      cooldown: 0.45,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.42,
    }),
  },
  {
    id: "pighead",
    name: "PIGHEAD",
    side: "feral",
    stats: foot({
      hp: 46,
      speed: 3.2,
      range: 1.35,
      damage: 11,
      cooldown: 0.7,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.55,
    }),
  },
  {
    id: "goathead",
    name: "GOATHEAD",
    side: "feral",
    stats: foot({
      hp: 18,
      speed: 5,
      range: 5.5,
      damage: 6,
      cooldown: 0.7,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.1,
      radius: 0.42,
    }),
  },
  {
    id: "crowhead",
    name: "CROWHEAD",
    side: "feral",
    lob: true,
    aoe: 1.8,
    stats: foot({
      hp: 16,
      speed: 5.4,
      range: 5,
      damage: 9,
      cooldown: 1.2,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.05,
      radius: 0.4,
    }),
  },
  {
    id: "mutant",
    name: "MUTANT",
    side: "feral",
    stats: foot({
      hp: 32,
      speed: 6.4,
      range: 1.35,
      damage: 9,
      cooldown: 0.5,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.55,
    }),
  },
  {
    id: "drone",
    name: "DRONE",
    side: "rust",
    stats: foot({
      hp: 16,
      speed: 7.4,
      range: 7,
      damage: 4,
      cooldown: 0.7,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.4,
    }),
  },
  {
    id: "walker",
    name: "WALKER",
    side: "rust",
    stats: foot({
      hp: 90,
      speed: 2.4,
      range: 9,
      damage: 12,
      cooldown: 1.4,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.7,
    }),
  },
  {
    id: "scoot",
    name: "SCOOT",
    side: "rust",
    stats: foot({
      hp: 24,
      speed: 8,
      range: 7,
      damage: 4,
      cooldown: 0.38,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.48,
    }),
  },
  {
    id: "tract",
    name: "TRACT",
    side: "rust",
    stats: foot({
      hp: 28,
      speed: 5,
      range: 7,
      damage: 7,
      cooldown: 0.8,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.18,
      radius: 0.5,
    }),
  },
  {
    id: "coil",
    name: "COIL",
    side: "rust",
    stats: foot({
      hp: 22,
      speed: 7.2,
      range: 1.2,
      damage: 8,
      cooldown: 0.45,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.12,
      radius: 0.42,
    }),
  },
  {
    id: "flake",
    name: "FLAKE",
    side: "rust",
    pack: 3,
    stats: foot({
      hp: 8,
      speed: 6.5,
      range: 1.15,
      damage: 4,
      cooldown: 0.4,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.02,
      radius: 0.32,
    }),
  },
  {
    id: "roller",
    name: "ROLLER",
    side: "rust",
    stats: foot({
      hp: 32,
      speed: 3.2,
      range: 8,
      damage: 7,
      cooldown: 0.7,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.14,
      radius: 0.55,
    }),
  },
  {
    id: "kite",
    name: "KITE",
    side: "rust",
    air: true,
    stats: foot({
      hp: 16,
      speed: 7.6,
      range: 10,
      damage: 5,
      cooldown: 0.55,
      mobileFire: true,
      deployNeed: 0,
      radius: 0.36,
    }),
  },
  {
    id: "slab",
    name: "SLAB",
    side: "rust",
    stats: foot({
      hp: 86,
      speed: 2.1,
      range: 6.5,
      damage: 11,
      cooldown: 1.1,
      mobileFire: true,
      deployNeed: 0,
      armor: 0.38,
      radius: 0.7,
    }),
  },
  rust("reach", "REACH", { hp: 36, speed: 4.2, range: 1.3, damage: 8, cooldown: 0.5, armor: 0.22, radius: 0.48 }),
  rust("mast", "MAST", { hp: 22, speed: 5, range: 9, damage: 9, cooldown: 0.7, armor: 0.1, radius: 0.4 }),
  rust("dray", "DRAY", { hp: 64, speed: 2.4, range: 1.3, damage: 10, cooldown: 0.7, armor: 0.35, radius: 0.65 }),
  rust("rust_plow", "RUST PLOW", { hp: 48, speed: 4.2, range: 1.3, damage: 9, cooldown: 0.55, armor: 0.28, radius: 0.6 }),
  rust("post", "POST", { hp: 40, speed: 0, range: 11, damage: 8, cooldown: 0.9, armor: 0.25, radius: 0.5 }),
  rust("bloom", "BLOOM", { hp: 28, speed: 2.2, range: 1.2, damage: 5, cooldown: 0.6, armor: 0.15, radius: 0.5 }),
  rust("cluster", "CLUSTER", { hp: 18, speed: 5.2, range: 6, damage: 5, cooldown: 0.55, armor: 0.12, radius: 0.36 }, { pack: 3 }),
  rust("fog", "FOG", { hp: 10, speed: 0, range: 1.4, damage: 6, cooldown: 0.45, radius: 0.7 }),
  rust("ball", "BALL", { hp: 70, speed: 7.5, range: 1.3, damage: 12, cooldown: 0.5, armor: 0.45, radius: 0.55 }),
  rust("amalgam", "AMALGAM", { hp: 52, speed: 3.4, range: 4, damage: 8, cooldown: 0.8, armor: 0.3, radius: 0.6 }),
]

export function callSign(kind: string, id: number, firstCell: number): string {
  return kind === STARTER && id === firstCell ? "LEAD" : card(kind).name
}

const HERO_GIVEN = ["KADE", "BEX", "ILSA", "DANNO", "PIKE", "WREN", "ODILE", "SABLE", "RIN", "HOLT", "QUILL", "BRAM"]
const HERO_FAMILY = ["VOS", "HARROW", "FREY", "STEN", "CORR", "RASK", "BROK", "TAVE", "KELL", "MOOR", "VANE", "PYKE"]
const HERO_CHASSIS = ["cell_rifle", "medic", "engr", "relay"] as const
const HERO_GIFTS = ["tough", "fast", "keen", "patch"] as const
const HERO_GUNS = ["rifle", "mg", "sniper"] as const

export type Hero = {
  id: string
  name: string
  chassis: (typeof HERO_CHASSIS)[number]
  gift: (typeof HERO_GIFTS)[number]
  gun: (typeof HERO_GUNS)[number]
}

export const HERO_PRICE = 80

export function isHero(id: string) {
  return id.startsWith("hero:")
}

export function rollHero(rng: () => number, taken: string[] = []): Hero {
  const chassis = HERO_CHASSIS[(rng() * HERO_CHASSIS.length) | 0]
  const gift = HERO_GIFTS[(rng() * HERO_GIFTS.length) | 0]
  const gun = HERO_GUNS[(rng() * HERO_GUNS.length) | 0]
  let name = ""
  const cap = HERO_GIVEN.length * HERO_FAMILY.length
  for (let i = 0; i < cap; i++) {
    name = `${HERO_GIVEN[(rng() * HERO_GIVEN.length) | 0]} ${HERO_FAMILY[(rng() * HERO_FAMILY.length) | 0]}`
    if (!taken.includes(name)) break
  }
  if (taken.includes(name)) name = `${name} ${taken.length + 1}`
  const id = `hero:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  return { id, name, chassis, gift, gun }
}

export function card(id: string): CardDef {
  const row = CARDS.find((c) => c.id === id)
  if (!row) throw new Error(`unknown card ${id}`)
  return row
}

export function hostile(id: string): HostileDef {
  const row = HOSTILES.find((c) => c.id === id)
  if (!row) throw new Error(`unknown hostile ${id}`)
  return row
}

const PRICE: Record<string, number> = {
  cell_rifle: 0,
  rifle: 20,
  aegis: 40,
  mg: 55,
  sniper: 55,
  gren: 40,
  medic: 40,
  mortar: 55,
  forge: 45,
  wisp: 35,
  engr: 40,
  relay: 30,
  jeep: 70,
  apc: 90,
  plow: 120,
  tank: 120,
  bike: 50,
  buggy: 60,
  hover: 55,
  mrap: 100,
  hex_scout: 90,
  hex_line: 110,
  hex_siege: 140,
  k9: 30,
  copter: 45,
  killer: 55,
  exo: 30,
  stun: 20,
  fpv: 35,
  plate: 20,
  scope: 20,
  drum: 20,
  bipod: 20,
  stim: 20,
  plating: 35,
  ram: 35,
  frag: 25,
  mines: 25,
  sentry: 35,
  kit: 25,
  radio: 35,
  cas: 40,
  nvg: 20,
  thermal: 25,
  nitro: 25,
  thermite: 30,
  emp: 35,
  smoke: 20,
  knife: 15,
  kukri: 18,
  katana: 28,
  machete: 18,
  sword: 22,
  axe: 24,
  stave: 16,
  baton: 12,
  bow: 20,
  warbow: 30,
  at: 30,
  jetpack: 35,
  litter: 20,
  filter: 20,
  ewar: 30,
  truck: 80,
  tech: 70,
  suv: 75,
  steed: 45,
  cart: 40,
  mule: 50,
  gunboat: 130,
  mlrs: 140,
  ifv: 150,
  mbt: 180,
  ugv: 100,
  tube: 60,
  drill: 55,
  pump: 45,
  cutter: 50,
  hawk: 40,
  mid: 50,
  assassin: 60,
  operator: 45,
}

export function priceOf(id: string) {
  return PRICE[id] ?? 0
}

export function paidFor(id: string, wear = 0, copy = 0) {
  if (isHero(id)) return HERO_PRICE
  const base = priceOf(id)
  if (!base) return 0
  return base * (1 + Math.max(0, wear) + Math.max(0, copy))
}

export function researchCost(id: string) {
  return priceOf(id) * 20
}
