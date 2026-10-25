type Pal = Record<string, string>

/** Body only — held gun stamped from HOLD. 161 high-angle foreshortened stack. */
/** 16×13 idle/walk (shipped footprint) — denser clusters inside, no canvas growth. */
const SOLDIER = {
  idle: [
    "................",
    "......TT........",
    ".....THHHH......",
    "....HHVVHs......",
    "....HSSAAAC.....",
    "...cCCCCCCCc....",
    "...cCCCNNNCc....",
    "...cCCkkkCCc....",
    "...cCCCCACCc....",
    "...cCCCCCCM.....",
    "....LL.LL.......",
    "....L...L.......",
    "....BB.BB.......",
  ],
  walk: [
    // Subtle stride (HEAD language) — one step out, not a full split
    "................",
    "......TT........",
    ".....THHHH......",
    "....HHVVHs......",
    "....HSSAAAC.....",
    "...cCCCCCCCc....",
    "...cCCCNNNCc....",
    "...cCCkkkCCc....",
    "...cCCCCACCc....",
    "...cCCCCCCM.....",
    "....L..L........",
    "...LL....L......",
    "...BB.....B.....",
  ],
  dep: [
    "..............",
    "....TTHH......",
    "...HHVHs......",
    "...HSAAAC.....",
    "..cCCCCCCc....",
    "..cCCNNNCc....",
    "..cCCkkkCc....",
    "..cCCCCCM.....",
    "...L.L........",
    "...B..B.......",
  ],
}
/** Extra keys for 161 coat shade / sleeve mass / light dome. */
const ISO: Pal = { T: "#7a766e", V: "#1a1814", c: "#4e4a42", A: "#8a8680", N: "#4a4840", k: "#3a3834", s: "#1a1814", M: "#2a2824" }
const PALS: Record<string, Pal> = {
  cell_rifle: { ...ISO, H: "#6a6860", S: "#5a5448", C: "#6a655c", L: "#4a463c", B: "#1a1814" },
  medic: { ...ISO, H: "#6a6860", S: "#5a5448", C: "#6a6860", L: "#4e4c44", B: "#1a1814" },
  engr: { ...ISO, H: "#6a6860", S: "#5a5448", C: "#5a5448", L: "#4a4036", B: "#1a1814" },
  relay: { ...ISO, H: "#6a6860", S: "#5a5448", C: "#5a6058", L: "#444840", B: "#1a1814" },
  aegis: { ...ISO, H: "#5a6264", S: "#5a6058", C: "#5a6264", L: "#3e4648", B: "#1a1814", c: "#3e4648", A: "#8a9090", T: "#9aa0a0" },
  forge: { ...ISO, H: "#5a564e", S: "#5a5448", C: "#5a5448", c: "#3e3a34", N: "#3a3834", L: "#3e3a34", B: "#1a1814" },
  wisp: { ...ISO, H: "#6a7274", S: "#6a6e68", C: "#6a7274", L: "#5a6264", B: "#1a1814", c: "#4a5254", T: "#8a8e88" },
  killer: { ...ISO, H: "#4a4e50", S: "#3a3834", C: "#3a3e40", L: "#2a2c2a", B: "#141210", c: "#2a2c2a", A: "#5a5e60", T: "#6a6e70" },
  assassin: { ...ISO, H: "#3a3e40", S: "#2a2824", C: "#2a2e30", L: "#222422", B: "#121210", c: "#1a1c1e", A: "#4a4e50", T: "#5a5e60" },
  operator: { ...ISO, H: "#5a6058", S: "#5a5448", C: "#4a5650", L: "#3a4440", B: "#1a1814" },
  jtac: { ...ISO, H: "#6a6860", S: "#5a5448", C: "#5a564e", N: "#3a3834", L: "#4a4840", B: "#1a1814" },
}

type Stamp = { x: number; y: number; rows: string[]; pal: Pal }

/** Held silhouettes — dark wedge into the 161 gun pocket. */
const HOLD: Record<string, Stamp> = {
  rifle: { x: 9, y: 7, rows: ["WWW.", "WWWw", ".Wo."], pal: { W: "#1e1c18", w: "#12110f", o: "#8a8680" } },
  smg: { x: 9, y: 7, rows: ["WW.", "WWw", ".o."], pal: { W: "#1e1c18", w: "#12110f", o: "#8a8680" } },
  shotgun: { x: 9, y: 6, rows: [".WW", "WWW", "WWw", ".W."], pal: { W: "#3a342c", w: "#2a241c" } },
  sniper: { x: 9, y: 6, rows: ["..o.", "WWWWW", ".W..."], pal: { W: "#1a1814", o: "#5a5850" } },
  railgun: { x: 9, y: 6, rows: ["..o.", "WWWWQ", ".W..."], pal: { W: "#1a1814", o: "#5a5850", Q: "#a8a49c" } },
  mg: { x: 9, y: 6, rows: ["WWWW", "W.W.", "WW.."], pal: { W: "#2e2c28" } },
  pistol: { x: 10, y: 8, rows: ["W", "w"], pal: { W: "#3a3834", w: "#2a2824" } },
  gren: { x: 9, y: 7, rows: [".G.", "GGG"], pal: { G: "#4a463e" } },
  mortar: { x: 11, y: 4, rows: ["T", "T", "T", "T"], pal: { T: "#5a564e" } },
  bow: { x: 9, y: 6, rows: [".W.", "W.W", ".W."], pal: { W: "#6a5840" } },
  blade: { x: 9, y: 6, rows: ["..W", ".W.", "W.."], pal: { W: "#a8a49c" } },
  blade_long: { x: 9, y: 5, rows: ["...W", "..W.", ".W..", "W..."], pal: { W: "#c8c4bc" } },
}

const HOLD_ALIAS: Record<string, string> = {
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

const OPTIC_BITS = new Set(["dot", "holo", "scope", "long", "reflex", "therm_sight", "lsight"])
const MAG_BITS = new Set(["drum", "box", "belt"])
const MUZZLE_LONG = new Set(["supp"])
const MUZZLE_WIDE = new Set(["brake", "comp", "flash"])
const BRACE_BITS = new Set(["bipod", "brace", "stock"])
const GRIP_BITS = new Set(["grip", "agrip", "fore", "stub", "stop"])

export type Kit = { gun?: string | null; bits?: string[] }

/** Flesh NPCs — same 161 foreshortening, dirtier mass, no gun wedge. */
const ZOMBIE = [
  [
    "................",
    "......h.........",
    ".....hhhh.......",
    "....hh.hh.......",
    "....h.cccc......",
    "...cccccccc.....",
    "...cccccccc.....",
    "...cccccc.......",
    "...ccccc........",
    "...ccc.c........",
    "...cc.c.c.......",
    "...c....c.......",
    "...b....b.......",
  ],
  [
    "................",
    "......h.........",
    ".....hhhh.......",
    "....hh.hh.......",
    "....h.cccc......",
    "...cccccccc.....",
    "...cccccccc.....",
    "...cccccc.......",
    "...ccccc........",
    "...c..c.c.......",
    "..c....c........",
    ".c......c.......",
    "b........b......",
  ],
]
const DOG = [
  [
    "................",
    "....hhhh........",
    "...hhhhh........",
    "...hh.hhh.......",
    "..hh.cccc.......",
    "..cccccccc......",
    "..cccccccc......",
    "..cccccc........",
    "..ccccc.........",
    "..cc.c.c........",
    "..c....c........",
    "..b....b........",
  ],
  [
    "................",
    "....hhhh........",
    "...hhhhh........",
    "...hh.hhh.......",
    "..hh.cccc.......",
    "..cccccccc......",
    "..cccccccc......",
    "..cccccc........",
    "..ccc.c.........",
    ".c....c.........",
    "c......c........",
    "b.......b.......",
  ],
]
const PIG = [
  [
    "................",
    ".....hhhh.......",
    "....hhhhh.......",
    "....hhhhhh......",
    "...hh.ccccc.....",
    "...ccccccccc....",
    "...ccccccccc....",
    "...cccccccc.....",
    "...ccccccc......",
    "...ccc.c.c......",
    "...cc...c.......",
    "...b....b.......",
  ],
  [
    "................",
    ".....hhhh.......",
    "....hhhhh.......",
    "....hhhhhh......",
    "...hh.ccccc.....",
    "...ccccccccc....",
    "...ccccccccc....",
    "...cccccccc.....",
    "...ccc.c.cc.....",
    "..cc....c.......",
    ".c.......c......",
    "b.........b.....",
  ],
]
const CORPSE: Pal = { h: "#4a4840", c: "#36322c", b: "#1a1612" }
const MUTANT = [
  [
    "................",
    ".....MMM........",
    "....MMMMM.......",
    "...MM.M.MM......",
    "...MMMMMMM......",
    "..MMMMMMMMM.....",
    "..MMMMMMMM......",
    "..MMMMMMM.......",
    "..MMMM.MM.......",
    "..MM.M..M.......",
    "..M....M........",
    ".MM...MM........",
  ],
  [
    "................",
    ".....MMM........",
    "....MMMMM.......",
    "...MM.M.MM......",
    "...MMMMMMM......",
    "..MMMMMMMMM.....",
    "..MMMMMMMM......",
    "..MMMM.MMM......",
    "..M.M...MM......",
    ".M.....M........",
    "M......M........",
    "MM....MM........",
  ],
]
const MP: Pal = { M: "#4a403c" }
/** Rust flyers — compact high-angle hull, not a flat cross. */
const DRONE = [
  [
    "........",
    "..xxxx..",
    ".xxxxxx.",
    "xxxoxxxx",
    ".xxxxxx.",
    "..x..x..",
  ],
  [
    "........",
    ".xx..xx.",
    ".xxxxxx.",
    "xxxoxxxx",
    ".xxxxxx.",
    "..xxxx..",
  ],
]
const DP: Pal = { x: "#3a3a38", o: "#2a4e4a" }
const SCOOT: Pal = { x: "#3a403e", o: "#6e6e6e" }
/** Walkers — foreshortened biped mass + single dark optic. */
const WALKER = [
  [
    "..............",
    "....XXXX......",
    "...XXXXXXo....",
    "..XXXXXXXX....",
    "..XXXXXXXX....",
    "...xxxxxx.....",
    "...XX..XX.....",
    "..xx....xx....",
    "..x......x....",
  ],
  [
    "..............",
    "....XXXX......",
    "...XXXXXXo....",
    "..XXXXXXXX....",
    "..XXXXXXXX....",
    "...xxxxxx.....",
    "....X..X......",
    "...xx..xx.....",
    "..x......x....",
  ],
]
const WP: Pal = { X: "#4a4844", x: "#2a2824", o: "#1e2820" }
/** Coil — continuum snake, low long mass. */
const COIL = [
  [
    "................",
    "................",
    "....xxxxx.......",
    "...xxxxxxxxxo...",
    "..xxxxxxxxxxxx..",
    "...xxxxxxxxxx...",
    "....xx..xxxx....",
    ".....x....xx....",
  ],
  [
    "................",
    "................",
    "...xxxxx........",
    "..xxxxxxxxxo....",
    ".xxxxxxxxxxxxx..",
    "..xxxxxxxxxxx...",
    "...xxx..xxx.....",
    "....xx....x.....",
  ],
]
const COIL_P: Pal = { x: "#3a4848", o: "#6e6e6e" }
/** Bloom — vine grower, wide base + tendrils. */
const BLOOM = [
  [
    "................",
    "......oo........",
    "....xxxxxx......",
    "...xxxxxxxxxx...",
    "..xxxxxxxxxxxx..",
    "...xxxxxxxxxx...",
    "..xx..xx..xx....",
    ".x....x....x....",
  ],
  [
    "................",
    ".....oo.........",
    "...xxxxxx.......",
    "..xxxxxxxxxx....",
    ".xxxxxxxxxxxx...",
    "..xxxxxxxxxx....",
    ".xx..xx..xx.....",
    "x....x....x.....",
  ],
]
const BLOOM_P: Pal = { x: "#4a5850", o: "#6a8870" }
/** Fog — soft milli swarm cloud, almost no hard edge. */
const FOG = [
  [
    "................",
    "...oooooo.......",
    "..oooooooo......",
    ".oooooooooo.....",
    "..oooooooo......",
    "...oooooo.......",
    "....oooo........",
  ],
  [
    "................",
    "....oooo........",
    "...oooooo.......",
    "..oooooooo......",
    ".oooooooooo.....",
    "..oooooooo......",
    "...oooooo.......",
  ],
]
const FOG_P: Pal = { o: "#9ab8b8" }
/** Amalgam — fused walker mass + oxide optic, split-core read. */
const AMALGAM = [
  [
    "................",
    "...XXXXXX.......",
    "..XXXXXXXX......",
    ".XXXXXXoXXX.....",
    ".XXXXXXXXXXX....",
    "..XXXXXXXxxx....",
    "...XX..XX.xx....",
    "..xx....xx......",
    ".x........x.....",
  ],
  [
    "................",
    "...XXXXXX.......",
    "..XXXXXXXX......",
    ".XXXXXXoXXX.....",
    ".XXXXXXXXXXX....",
    "..XXXXXXxxxx....",
    "....X..X.xx.....",
    "...xx..xx.......",
    "..x......x......",
  ],
]
const AMALGAM_P: Pal = { X: "#3a4448", x: "#243034", o: "#8a5040" }
/** High-angle crate — top face + foreshortened side. */
const CRATE = [
  "..CCCCCC..",
  ".CccccccC.",
  "CccccccccC",
  "CccCccCccC",
  "CCCCCCCCCC",
  "CccccccccC",
  "CccccccccC",
  ".CCCCCCCC.",
]
const GRAY: Pal = { K: "#8a8680", k: "#4a4844", S: "#c0c0c0", r: "#6a3030", B: "#2a2a28", y: "#6a6860", W: "#a0a098", G: "#5a564c", g: "#3a3834", M: "#6a6860", m: "#3a3834", L: "#8a8680", T: "#4a4844", t: "#2a2824", A: "#8a8680", R: "#3a3834", F: "#6a5a40", O: "#4a4030", n: "#8a8680", N: "#5a5854", p: "#6a3030", Q: "#a0a098" }
const GEAR: Record<string, [string[], Pal]> = {
  rifle: [[".......W", "......WW", "WWWWWWW.", ".WW....."], { ...GRAY, W: "#2a2824" }],
  mg: [["WWWWWWWW", "WWWWWWW.", ".WW.....", "..W....."], { ...GRAY, W: "#2e2c28" }],
  sniper: [["......WW", "WWWWWWWW", ".W......", ".W......"], { ...GRAY, W: "#1a1814" }],
  gren: [["..GG....", ".GGGG...", "GGGGGG..", ".GG....."], { ...GRAY, G: "#4a463e" }],
  mortar: [["TTTTTTTT", "..TT....", "..TT....", ".T..T..."], { ...GRAY, T: "#5a564e" }],
  pistol: [[".....W", "....WW", ".WWWW.", "..W..."], { ...GRAY, W: "#3a3834" }],
  revolver: [["....WW", "...WWW", ".WWWW.", "..WW.."], { ...GRAY, W: "#4a4038" }],
  autopistol: [["....WW", "...WWW", "WWWWW.", ".W.W.."], { ...GRAY, W: "#2e2c28" }],
  magnum: [[".....WW", "....WWW", ".WWWWW.", "..WW..."], { ...GRAY, W: "#1a1814" }],
  minismg: [["...WWWW", "..WWWWW", "WWWWW..", ".WW...."], { ...GRAY, W: "#3a3832" }],
  laserpistol: [[".....y", "....yy", ".WWyy.", "..W..."], { ...GRAY, W: "#5a5850", y: "#c4a060" }],
  smg: [["..WWWWW.", ".WWWWWW.", "WWWWWW..", ".WW....."], { ...GRAY, W: "#2a2824" }],
  shotgun: [[".....WW", "WWWWWWW", "WWWWWW.", ".WW...."], { ...GRAY, W: "#4a4030" }],
  autoshotgun: [["....WWW", "WWWWWWW", "WWWWWW.", "WW.W..."], { ...GRAY, W: "#3a342c" }],
  railgun: [["......WW", "WWWWWWWW", "WWWWWWW.", "...W...."], { ...GRAY, W: "#3a3834" }],
  plate: [[".KK..KK.", "KKKKKKKK", "KKkKKkKK", "KKKKKKKK", ".KKKKKK.", ".KKKKKK.", ".KKKKKK."], GRAY],
  dot: [["..SS..", ".SrrS.", ".SrrS.", "..SS.."], GRAY],
  holo: [[".SSSS.", "S....S", "S.rr.S", "S....S", ".SSSS."], GRAY],
  scope: [["..SSSS..", ".S....S.", "S......S", "S..rr..S", "S......S", ".S....S.", "..SSSS.."], GRAY],
  long: [["SSSSSSSS", "S......S", "S..rr..S", "S......S", "SSSSSSSS", "...WW..."], GRAY],
  reflex: [[".WWWW.", "W.SS.W", "WSrrSW", "W.SS.W", ".WWWW."], GRAY],
  therm_sight: [[".HHHH.", "H.hh.H", "H.hrrH", "H.hh.H", ".HHHH."], { ...GRAY, H: "#8a8680", h: "#c4a060" }],
  lsight: [["..SS..", ".SrrS.", ".SrRS.", "..SS.."], { ...GRAY, R: "#6a3030" }],
  grip: [["..WW..", ".WWWW.", "WW..WW", ".WWWW.", "..WW.."], GRAY],
  agrip: [["...WW.", "..WW..", ".WW...", "WW....", ".WW...", "..WW.."], GRAY],
  stub: [[".WWWW.", "WWWWWW", ".WWWW."], GRAY],
  stop: [["WW....", "WWWW..", "WWWWWW", "..WWWW", "....WW"], GRAY],
  fore: [["WWWWWW", "W....W", "WWWWWW", "..WW..", "..WW.."], GRAY],
  stick: [[".BB.", "BBBB", "BBBB", "BBBB", ".BB."], GRAY],
  drum: [["...BB...", "..BBBB..", ".BBBBBB.", ".BByyBB.", ".BByyBB.", ".BBBBBB.", "..BBBB..", "...BB..."], GRAY],
  box: [["BBBBBB", "ByyyBB", "ByyyBB", "BBBBBB"], GRAY],
  belt: [["BB.BB.BB", "BBBBBBBB", ".BBBBBB.", "..BBBB.."], GRAY],
  bipod: [["WWWWWWWW", "...WW...", "..W..W..", "..W..W..", ".W....W.", ".W....W.", "W......W"], GRAY],
  stock: [["WWWWWW..", "...WWW..", "....WW..", "....WW.."], GRAY],
  brace: [["..WWWW..", ".WW..WW.", "WW....WW", ".WW..WW.", "..WWWW.."], GRAY],
  fold: [["WWWW....", "...WWW..", "....WW..", "...WWW..", "WWWW...."], GRAY],
  brake: [["..WW..", ".WWWW.", "WWWWWW", ".W..W."], GRAY],
  supp: [["WWWWWWWW", ".WWWWWW.", "..WWWW.."], GRAY],
  comp: [[".W.W.W.", "WWWWWWW", ".W.W.W."], GRAY],
  flash: [["...W...", "..WWW..", ".WWWWW.", "WWWrWWW", ".WWWWW."], GRAY],
  stim: [["......nn", ".....nN.", "....GG..", "...GGG..", "..GGG...", ".GGG....", "pG......", "p......."], GRAY],
  plating: [["PPPPPPPP", "P.PPP.PP", "PPPPPPPP", "PP.PP.PP", ".PPPPPP.", "..PPPP..", "...PP..."], { ...GRAY, P: "#7a7870" }],
  ram: [["......Q.", ".....QQ.", "....QQQ.", "...QQQQ.", "...QQQQ.", "....QQQ.", ".....QQ.", "......Q."], GRAY],
  frag: [["...nn...", "..n.n...", "..GGG...", ".GGGGG..", ".GGGGG..", ".GGGGG..", "..GGG..."], GRAY],
  mines: [["...rr...", "..MMMM..", ".MMMMMM.", "MMMMMMMM", ".MMMMMM."], GRAY],
  sentry: [["...TTTTT", "..TTT...", ".TTTTT..", ".TtTTT..", "...L....", "..L.L...", ".L...L..", "L.....L."], GRAY],
  kit: [[".WWWWWW.", "WWW.WWWW", "WW.rr.WW", "WWW.WWWW", "WWWWWWWW", ".WWWWWW."], GRAY],
  radio: [["A.......", "A.......", "ARRRRRR.", "RRRRRRRR", "RRRRRRRR", "RRRRkkRR", "RRRRRRRR", "RRRRRRRR"], GRAY],
  nitro: [["..FF....", ".FFF....", "FF..SSSS", "F...SSSS", "FF..SSSS", ".FFF....", "..FF...."], GRAY],
  cas: [["........", "...BB...", "BBBBBBBB", "...BB...", "........"], GRAY],
  gunship: [["........", "..BBBB..", "BBBBBBBB", "..B..B..", "........"], GRAY],
  rocket: [["........", "...RR...", "..RRRR..", "RRRRRRRR", "...rr..."], { ...GRAY, R: "#5a5044", r: "#6a3030" }],
  bomber: [["........", ".BBBBBB.", "BBBBBBBB", ".B....B.", "........"], GRAY],
  laser: [["...yy...", "..y..y..", ".y....y.", "y..rr..y", ".y....y.", "..y..y..", "...yy..."], { ...GRAY, y: "#c4a060", r: "#6a3030" }],
  nvg: [[".GG..GG.", "G..GG..G", "G.gggg.G", "G.gGGg.G", "G.gggg.G", "G..GG..G", ".GG..GG."], { ...GRAY, G: "#8a8680", g: "#2f6a48" }],
  thermal: [[".HH..HH.", "H..HH..H", "H.hhhh.H", "H.hHHh.H", "H.hhhh.H", "H..HH..H", ".HH..HH."], { ...GRAY, H: "#8a8680", h: "#c4a060" }],
  thermite: [["...TT...", "..TTTT..", ".TTTTTT.", "..TTTT..", "...TT..."], { ...GRAY, T: "#6a5a40" }],
  emp: [["..E..E..", ".EE..EE.", "..EEEE..", ".EE..EE.", "..E..E.."], { ...GRAY, E: "#6e6e6e" }],
  smoke: [[".SSSSSS.", "SSSSSSSS", "SSSSSSSS", ".SSSSSS."], { ...GRAY, S: "#8a8a86" }],
  exo: [["E......E", "EEE..EEE", "E.EEEE.E", "E.E..E.E", "EEE..EEE", "E......E"], { ...GRAY, E: "#6a6860" }],
  stun: [["..SSSS..", ".S....S.", "S..ss..S", "S.s..s.S", ".S....S.", "..SSSS.."], { ...GRAY, S: "#8a8680", s: "#c4a060" }],
  fpv: [["..XX..", ".XXXX.", "XXXXXX", "..XX.."], { ...GRAY, X: "#5a5850" }],
  knife: [["......W", ".....W.", "....W..", "...W...", "..W...."], { ...GRAY, W: "#c8c4bc" }],
  kukri: [[".....WW", "....W..", "...W...", "..W....", ".W....."], { ...GRAY, W: "#b0a898" }],
  katana: [[".......W", "......W.", ".....W..", "....W...", "...W....", "..W....."], { ...GRAY, W: "#d0ccc4" }],
  machete: [["....WWW", "...W...", "..W....", ".W.....", "W......"], { ...GRAY, W: "#8a8680" }],
  sword: [["......W", ".....W.", "....W..", "...W...", "..WWW.."], { ...GRAY, W: "#a8a49c" }],
  axe: [["..WWWW.", "..WW...", ".WW....", "WW.....", "W......"], { ...GRAY, W: "#6a5848" }],
  stave: [["W......", "W......", "W......", "W......", "W......"], { ...GRAY, W: "#5a5854" }],
  baton: [["..WW...", "..WW...", "..WW...", "..WW..."], { ...GRAY, W: "#4a4844" }],
  bow: [["..WWW...", ".W...W..", "W.....W.", ".W...W.."], { ...GRAY, W: "#6a5840" }],
  warbow: [["...WWW..", "..W...W.", ".W.....W", "..W...W."], { ...GRAY, W: "#4a3828" }],
  at: [["..HHHH..", ".H....H.", "H..HH..H", ".H....H.", "..HHHH.."], { ...GRAY, H: "#6a3030" }],
  jetpack: [["..JJ....", ".JJJJ...", "JJ..JJ..", ".JJJJ...", "..JJ...."], { ...GRAY, J: "#6a6860" }],
  litter: [["LLLLLLLL", "L......L", "L......L", "LLLLLLLL"], { ...GRAY, L: "#8a8680" }],
  filter: [["...F....", "..FFF...", ".FFFFF..", "FFFFFFF."], { ...GRAY, F: "#5a6a60" }],
  ewar: [["E..EE..E", ".E....E.", "..EEEE..", ".E....E.", "E..EE..E"], { ...GRAY, E: "#6e6e6e" }],
  tracker: [["TT......TT", "T........T", "..........", "..........", "..........", "T........T", "TT......TT"], { ...GRAY, T: "#a8a49c" }],
}

export type Pose = "idle" | "walk" | "dep"
export type VehArt = {
  body: HTMLCanvasElement
  turret: HTMLCanvasElement
  pivot: [number, number]
  mount: [number, number]
}

const flips = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>()
const actors = new Map<string, HTMLCanvasElement>()
const armed = new Map<string, HTMLCanvasElement>()
const props = new Map<string, HTMLCanvasElement>()
const vehicles = new Map<string, VehArt>()
const previews = new Map<string, HTMLCanvasElement>()

function holdKey(gun: string | null | undefined) {
  if (!gun) return "rifle"
  return HOLD_ALIAS[gun] ?? (HOLD[gun] ? gun : "rifle")
}

function holdStamp(gun: string, pose: Pose): Stamp {
  const key = holdKey(gun)
  const base = HOLD[key] ?? HOLD.rifle
  // Mortar reads as a standing tube while deploying; else a short fat tube at the hip.
  if (key === "mortar" && pose !== "dep") {
    return { x: 10, y: 7, rows: ["TT", "TT"], pal: base.pal }
  }
  const dy = pose === "dep" ? 1 : 0
  return { x: base.x, y: base.y + dy, rows: base.rows, pal: base.pal }
}

function stampPaint(g: CanvasRenderingContext2D, s: Stamp) {
  s.rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const col = s.pal[r[x]]
      if (!col || r[x] === ".") continue
      g.fillStyle = col
      g.fillRect(s.x + x, s.y + y, 1, 1)
    }
  })
}

function bitPaint(g: CanvasRenderingContext2D, s: Stamp, bits: string[]) {
  if (!bits.length) return
  const optic = bits.some((id) => OPTIC_BITS.has(id))
  const mag = bits.some((id) => MAG_BITS.has(id))
  const longMuz = bits.some((id) => MUZZLE_LONG.has(id))
  const wideMuz = bits.some((id) => MUZZLE_WIDE.has(id))
  const brace = bits.some((id) => BRACE_BITS.has(id))
  const grip = bits.some((id) => GRIP_BITS.has(id))
  const gw = Math.max(...s.rows.map((r) => r.length))
  const gh = s.rows.length
  const mid = s.x + Math.max(0, (gw / 2) | 0)
  const muzzle = s.x + gw - 1
  if (optic) {
    g.fillStyle = "#8a8680"
    g.fillRect(mid, s.y - 1, 1, 1)
    if (bits.includes("lsight")) {
      g.fillStyle = "#6a3030"
      g.fillRect(mid + 1, s.y, 1, 1)
    }
  }
  if (mag) {
    g.fillStyle = "#3a3834"
    g.fillRect(s.x + 1, s.y + gh, 2, 1)
  }
  if (grip) {
    g.fillStyle = "#2a2824"
    g.fillRect(s.x + 1, s.y + Math.min(gh, 1), 1, 1)
  }
  if (brace) {
    g.fillStyle = "#2a2824"
    g.fillRect(s.x + Math.max(0, gw - 2), s.y + gh, 1, 1)
    g.fillRect(s.x + gw - 1, s.y + gh, 1, 1)
  }
  if (longMuz) {
    g.fillStyle = "#1a1814"
    g.fillRect(muzzle + 1, s.y + ((gh / 2) | 0), 2, 1)
  } else if (wideMuz) {
    g.fillStyle = "#4a4840"
    g.fillRect(muzzle + 1, s.y + ((gh / 2) | 0), 1, 1)
  }
}

function armSoldier(body: HTMLCanvasElement, pose: Pose, kit: Kit | undefined) {
  const gun = kit?.gun ?? "rifle"
  const bits = kit?.bits ?? []
  const s = holdStamp(gun, pose)
  const gw = Math.max(...s.rows.map((r) => r.length))
  const gh = s.rows.length
  const extra = bits.some((id) => MUZZLE_LONG.has(id)) ? 2 : bits.some((id) => MUZZLE_WIDE.has(id)) ? 1 : 0
  const under = bits.some((id) => MAG_BITS.has(id) || BRACE_BITS.has(id)) ? 1 : 0
  const top = bits.some((id) => OPTIC_BITS.has(id)) && s.y < 1 ? 1 : 0
  const stamped = { ...s, y: s.y + top }
  const w = Math.max(body.width, stamped.x + gw + extra)
  const h = Math.max(body.height + top, stamped.y + gh + under)
  const c = cv(w, h)
  const g = c.getContext("2d")!
  g.drawImage(body, 0, top)
  stampPaint(g, stamped)
  bitPaint(g, stamped, bits)
  return c
}

function cv(w: number, h: number) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  return c
}

function paint(rows: string[], pal: Pal) {
  const w = Math.max(...rows.map((r) => r.length))
  const c = cv(w, rows.length)
  const g = c.getContext("2d")!
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const col = pal[r[x]]
      if (!col) continue
      g.fillStyle = col
      g.fillRect(x, y, 1, 1)
    }
  })
  return c
}

/** Paint only keys in `allow` (layer split for procedural foot compose). */
function paintKeys(rows: string[], pal: Pal, allow: string) {
  const ok = new Set(allow)
  const w = Math.max(...rows.map((r) => r.length))
  const c = cv(w, rows.length)
  const g = c.getContext("2d")!
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      if (!ok.has(r[x])) continue
      const col = pal[r[x]]
      if (!col) continue
      g.fillStyle = col
      g.fillRect(x, y, 1, 1)
    }
  })
  return c
}

type LayerSet = { head: HTMLCanvasElement; coat: HTMLCanvasElement; legs: HTMLCanvasElement }
const layerPacks = new Map<string, LayerSet>()

const SOLDIER_HEAD = "THSVs"
const SOLDIER_COAT = "CcANkM"
const SOLDIER_LEGS = "LB"

function bakeLayers(kind: string, pose: Pose, rows: string[], pal: Pal, headK: string, coatK: string, legsK: string) {
  const head = paintKeys(rows, pal, headK)
  const coat = paintKeys(rows, pal, coatK)
  const legs = paintKeys(rows, pal, legsK)
  if (kind === "medic") {
    const g = coat.getContext("2d")!
    const dy = pose === "dep" ? -1 : 0
    rects(g, "#6a3030", [[6, 6 + dy, 1, 3], [5, 7 + dy, 3, 1]])
  }
  if (kind === "aegis" || kind === "forge" || kind === "wisp") {
    rects(head.getContext("2d")!, "#6e6e6e", [[6, pose === "dep" ? 1 : 2, 1, 1]])
  }
  shadeFlat(head)
  shadeFlat(coat)
  shadeFlat(legs)
  layerPacks.set(`${kind}:${pose}`, { head, coat, legs })
}

export function canLayer(kind: string): boolean {
  return layerPacks.has(`${kind}:idle`)
}

/** Offsets in unflipped sprite space; root blit still uses feet at (x,y). */
export type LayerOff = {
  torso: Pose
  legs: Pose
  headDx: number
  headDy: number
  coatDx: number
  legsDx: number
  legsDy: number
  gunDx: number
  gunDy: number
  /** World aim (atan2); gun rotates to match the shot. */
  aimAng: number | null
  showHead: boolean
  showLegs: boolean
  showGun: boolean
  flipX: boolean
}

type TipOff = Pick<LayerOff, "torso" | "coatDx" | "gunDx" | "gunDy" | "aimAng" | "flipX" | "showGun">

function tipLenPx(gun: string, pose: Pose, bits: string[]): { s: Stamp; tip: number; topPad: number; gh: number } {
  const s = holdStamp(gun, pose)
  const gw = Math.max(...s.rows.map((r) => r.length))
  const gh = s.rows.length
  const extra = bits.some((id) => MUZZLE_LONG.has(id)) ? 2 : bits.some((id) => MUZZLE_WIDE.has(id)) ? 1 : 0
  const topPad = bits.some((id) => OPTIC_BITS.has(id)) && s.y < 1 ? 1 : 0
  return { s, tip: gw - 1 + extra, topPad, gh }
}

/**
 * Screen-pixel gun tip for a foot blit at (x,y). Matches `drawLayered` grip + rotate
 * so tracers and beams leave the muzzle when deployed or aimed up/down.
 * `dx`/`dy` is the screen barrel unit vector (same space as tip).
 */
export function gunTipAt(
  kind: string,
  kit: Kit | undefined,
  off: TipOff,
  x: number,
  y: number,
): { x: number; y: number; dx: number; dy: number } | null {
  if (!off.showGun || !PALS[kind]) return null
  const torso = off.torso === "dep" && layerPacks.has(`${kind}:dep`) ? "dep" : "idle"
  const pack = layerPacks.get(`${kind}:${torso}`)
  if (!pack) return null
  const w = pack.coat.width
  const h = pack.coat.height
  const left = Math.round(x - w / 2)
  const top = Math.round(y - h + 2)
  const gun = kit?.gun ?? "rifle"
  const bits = kit?.bits ?? []
  const { s, tip, topPad, gh } = tipLenPx(gun, torso, bits)
  const rotateGun = off.aimAng !== null && holdKey(gun) !== "mortar"
  const gripX = s.x + off.gunDx + off.coatDx
  const gripY = s.y + topPad + off.gunDy + Math.max(0, (gh / 2) | 0)
  if (rotateGun) {
    const sx = off.flipX ? left + w - gripX : left + gripX
    const sy = top + gripY
    const ang = -off.aimAng!
    const dx = Math.cos(ang)
    const dy = Math.sin(ang)
    return {
      x: Math.round(sx + dx * tip),
      y: Math.round(sy + dy * tip),
      dx,
      dy,
    }
  }
  // Unrotated (mortar / no aim): tip at stamp muzzle, mirrored with the body.
  const tipX = s.x + off.gunDx + off.coatDx + tip
  const tipY = gripY
  const dx = off.flipX ? -1 : 1
  return {
    x: Math.round(off.flipX ? left + w - tipX : left + tipX),
    y: Math.round(top + tipY),
    dx,
    dy: 0,
  }
}

/** Draw layered 161 foot figure. Returns sprite size for shadows, or null. */
export function drawLayered(
  g: CanvasRenderingContext2D,
  kind: string,
  kit: Kit | undefined,
  off: LayerOff,
  x: number,
  y: number,
  tint?: (c: HTMLCanvasElement) => HTMLCanvasElement,
): { w: number; h: number } | null {
  const torso = off.torso === "dep" && layerPacks.has(`${kind}:dep`) ? "dep" : "idle"
  const legPose =
    off.legs === "walk" && layerPacks.has(`${kind}:walk`) ? "walk" : torso === "dep" && layerPacks.has(`${kind}:dep`) ? "dep" : "idle"
  const pack = layerPacks.get(`${kind}:${torso}`)
  const legPack = layerPacks.get(`${kind}:${legPose}`)
  if (!pack) return null
  const coat = tint ? tint(pack.coat) : pack.coat
  const head = tint ? tint(pack.head) : pack.head
  const legs = tint ? tint((legPack ?? pack).legs) : (legPack ?? pack).legs
  const w = coat.width
  const h = coat.height
  const left = Math.round(x - w / 2)
  const top = Math.round(y - h + 2)
  const gun = kit?.gun ?? "rifle"
  const bits = kit?.bits ?? []
  const rotateGun = off.showGun && PALS[kind] && off.aimAng !== null && holdKey(gun) !== "mortar"
  g.save()
  if (off.flipX) {
    g.translate(left + w, top)
    g.scale(-1, 1)
  } else {
    g.translate(left, top)
  }
  if (off.showLegs) g.drawImage(legs, off.legsDx, off.legsDy)
  g.drawImage(coat, off.coatDx, 0)
  if (off.showHead) g.drawImage(head, off.headDx, off.headDy)
  if (off.showGun && PALS[kind] && !rotateGun) {
    const s = holdStamp(gun, torso)
    const topPad = bits.some((id) => OPTIC_BITS.has(id)) && s.y < 1 ? 1 : 0
    const stamped = { ...s, x: s.x + off.gunDx + off.coatDx, y: s.y + topPad + off.gunDy }
    stampPaint(g, stamped)
    bitPaint(g, stamped, bits)
  }
  g.restore()
  if (rotateGun) {
    const s = holdStamp(gun, torso)
    const topPad = bits.some((id) => OPTIC_BITS.has(id)) && s.y < 1 ? 1 : 0
    const gh = s.rows.length
    const gripX = s.x + off.gunDx + off.coatDx
    const gripY = s.y + topPad + off.gunDy + Math.max(0, ((gh / 2) | 0))
    const sx = off.flipX ? left + w - gripX : left + gripX
    const sy = top + gripY
    // Canvas Y is down; world aim uses Y up — negate for screen rotate.
    g.save()
    g.translate(sx, sy)
    g.rotate(-off.aimAng!)
    const stamped = { ...s, x: 0, y: -((gh / 2) | 0) }
    stampPaint(g, stamped)
    bitPaint(g, stamped, bits)
    g.restore()
  }
  return { w, h }
}

function rects(g: CanvasRenderingContext2D, col: string, list: number[][]) {
  g.fillStyle = col
  for (const r of list) g.fillRect(r[0], r[1], r[2], r[3])
}

function flipped(c: HTMLCanvasElement) {
  const hit = flips.get(c)
  if (hit) return hit
  const f = cv(c.width, c.height)
  const g = f.getContext("2d")!
  g.translate(c.width, 0)
  g.scale(-1, 1)
  g.drawImage(c, 0, 0)
  flips.set(c, f)
  return f
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Darken opaque edge pixels whose right or bottom neighbour is transparent (multiply RGB ~0.72). */
function shadeFlat(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")
  if (!ctx) return
  const img = ctx.getImageData(0, 0, c.width, c.height)
  const d = img.data
  const w = c.width
  const h = c.height
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (d[i + 3] < 128) continue
      const rOk = x + 1 < w && d[(y * w + x + 1) * 4 + 3] >= 128
      const bOk = y + 1 < h && d[((y + 1) * w + x) * 4 + 3] >= 128
      if (!rOk || !bOk) {
        d[i] = Math.round(d[i] * 0.72)
        d[i + 1] = Math.round(d[i + 1] * 0.72)
        d[i + 2] = Math.round(d[i + 2] * 0.72)
      }
    }
  }
  ctx.putImageData(img, 0, 0)
}

/** Burnt timber — foreshortened trunk mass + broken crown, not a front stick. */
function tree(seed: number) {
  const c = cv(18, 16)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  const look = (rand() * 3) | 0
  const lean = ((rand() * 3) | 0) - 1
  // contact blob
  rects(g, "rgba(0,0,0,.4)", [[5, 14, 8, 2]])
  if (look === 1) {
    // snapped stump + low crown
    rects(g, "#1a1612", [[7 + lean, 8, 4, 6]])
    rects(g, "#2a241c", [[8 + lean, 9, 2, 4]])
    rects(g, "#14110e", [[4 + lean, 6, 5, 3], [9 + lean, 5, 4, 2], [6 + lean, 4, 3, 2]])
    shadeFlat(c)
    return c
  }
  if (look === 2) {
    // split trunk, two char limbs
    rects(g, "#1a1612", [[8 + lean, 5, 3, 9]])
    rects(g, "#2a241c", [[9 + lean, 6, 1, 7]])
    rects(g, "#14110e", [[3 + lean, 3, 3, 5], [12 + lean, 2, 3, 6], [6 + lean, 2, 2, 2]])
    shadeFlat(c)
    return c
  }
  // leaning burnt bole, foreshortened top
  rects(g, "#1a1612", [[7 + lean, 4, 4, 10]])
  rects(g, "#2a241c", [[8 + lean, 5, 2, 8]])
  rects(g, "#14110e", [[5 + lean, 2, 4, 3], [10 + lean, 1, 3, 3], [8 + lean, 0, 2, 2]])
  shadeFlat(c)
  return c
}

/** Wire — posts as short high-angle stubs, sagging strand. */
function wire(seed: number) {
  const c = cv(26, 12)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  // foreshortened post tops (wider) tapering down
  rects(g, "#1c1a16", [[1, 3, 3, 2], [1, 5, 2, 5], [12, 2, 3, 2], [12, 4, 2, 6], [23, 3, 3, 2], [23, 5, 2, 5]])
  rects(g, "#2a2824", [[2, 3, 1, 1], [13, 2, 1, 1], [24, 3, 1, 1]])
  for (let x = 3; x < 23; x++) {
    const sag = x < 8 || x > 18 ? 0 : x < 13 ? 1 : x < 16 ? 2 : 1
    g.fillStyle = rand() < 0.12 ? "#2a2824" : "#4a463e"
    g.fillRect(x, 4 + sag, 1, 1)
  }
  shadeFlat(c)
  return c
}

/** Wreck — collapsed hull wedge, high-angle plate + shade. */
function wreck(seed: number) {
  const c = cv(22, 14)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  rects(g, "rgba(0,0,0,.35)", [[2, 12, 16, 2]])
  // main mass foreshortened
  rects(g, "#2a2824", [[2, 5, 14, 6]])
  rects(g, "#3a3834", [[3, 4, 10, 3]])
  rects(g, "#1a1814", [[1, 7, 5, 3], [14, 6, 6, 4]])
  rects(g, "#141210", [[0, 10, 4, 2], [16, 10, 5, 2]])
  if (rand() > 0.5) rects(g, "#4a4840", [[8, 2, 3, 4]])
  else rects(g, "#4a4840", [[5, 3, 6, 2], [12, 3, 2, 3]])
  shadeFlat(c)
  return c
}

/** Post — short leaning stub with crossbar, not a tall stick. */
function post(seed: number) {
  const c = cv(14, 14)
  const g = c.getContext("2d")!
  const lean = ((rng(seed)() * 3) | 0) - 1
  rects(g, "rgba(0,0,0,.35)", [[4, 12, 6, 2]])
  rects(g, "#2a241c", [[6 + lean, 3, 3, 9]])
  rects(g, "#1a1612", [[7 + lean, 4, 1, 7]])
  rects(g, "#1a1612", [[2 + lean, 4, 9, 2], [3 + lean, 8, 2, 3]])
  shadeFlat(c)
  return c
}

/** Teeth — concrete blocks as foreshortened wedges. */
function teeth(seed: number) {
  const c = cv(22, 12)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  for (let i = 0; i < 3; i++) {
    const x = 1 + i * 7
    const h = 5 + ((rand() * 3) | 0)
    const top = 11 - h
    // top face (lighter) then body
    rects(g, "#6a655c", [[x + 1, top, 4, 1]])
    rects(g, i % 2 ? "#5a564e" : "#3a3832", [[x, top + 1, 5, h - 1]])
    rects(g, "#2a2824", [[x, top + h - 2, 5, 2]])
  }
  shadeFlat(c)
  return c
}

/**
 * Ruin — high-angle foundation / slab / container chunks (TS debris language).
 * Top face light, wall face mid, shade dark. Not a flat 2D wall strip.
 */
function ruin(seed: number) {
  const c = cv(24, 16)
  const g = c.getContext("2d")!
  const look = (rng(seed)() * 4) | 0
  const TOP = "#6a655c"
  const FACE = "#4a463e"
  const DARK = "#2a2824"
  const EDGE = "#1c1a18"
  const RIM = "#5a564e"
  rects(g, "rgba(0,0,0,.4)", [[2, 13, 18, 3]])

  if (look === 0) {
    // L-corner foundation
    // floor plate (top)
    rects(g, TOP, [[3, 8, 12, 5]])
    rects(g, RIM, [[3, 8, 12, 1], [3, 8, 1, 5]])
    // north wall (short riser, top + face)
    rects(g, TOP, [[3, 4, 12, 2]])
    rects(g, FACE, [[3, 6, 12, 2]])
    rects(g, EDGE, [[3, 4, 1, 4], [14, 4, 1, 4]])
    // west wall
    rects(g, TOP, [[3, 4, 3, 9]])
    rects(g, FACE, [[3, 6, 2, 7]])
    rects(g, DARK, [[3, 11, 3, 2]])
    // break in north wall
    rects(g, DARK, [[8, 4, 3, 4]])
    rects(g, EDGE, [[7, 4, 1, 3], [11, 5, 1, 2]])
  } else if (look === 1) {
    // U-pad with missing front
    rects(g, TOP, [[4, 7, 14, 5]])
    rects(g, RIM, [[4, 7, 14, 1]])
    rects(g, FACE, [[4, 10, 14, 2]])
    rects(g, DARK, [[4, 12, 14, 1]])
    // back wall
    rects(g, TOP, [[4, 3, 14, 2]])
    rects(g, FACE, [[4, 5, 14, 2]])
    rects(g, EDGE, [[4, 3, 1, 4], [17, 3, 1, 4]])
    // side stubs
    rects(g, TOP, [[4, 5, 3, 5], [15, 5, 3, 5]])
    rects(g, FACE, [[4, 7, 2, 4], [16, 7, 2, 4]])
    // crater bite in floor
    rects(g, DARK, [[9, 9, 4, 3]])
    rects(g, EDGE, [[9, 9, 4, 1]])
  } else if (look === 2) {
    // collapsed slab (angled top + thick edge)
    rects(g, TOP, [[2, 5, 10, 4], [8, 7, 10, 4], [14, 9, 6, 3]])
    rects(g, FACE, [[2, 9, 10, 3], [8, 11, 10, 2], [14, 12, 6, 2]])
    rects(g, DARK, [[2, 11, 8, 2], [16, 13, 5, 1]])
    rects(g, EDGE, [[2, 5, 1, 6], [11, 5, 1, 3], [17, 7, 1, 5]])
    // rebar nubs
    rects(g, RIM, [[5, 4, 1, 1], [12, 6, 1, 1], [18, 8, 1, 1]])
  } else {
    // wrecked container / industrial box (TS corner debris)
    rects(g, TOP, [[5, 3, 12, 5]])
    rects(g, RIM, [[5, 3, 12, 1], [5, 3, 1, 5]])
    rects(g, FACE, [[5, 8, 12, 5]])
    rects(g, DARK, [[5, 12, 12, 2]])
    rects(g, EDGE, [[5, 3, 1, 11], [16, 3, 1, 11], [5, 3, 12, 1]])
    // rib / panel lines
    rects(g, DARK, [[8, 4, 1, 3], [11, 4, 1, 3], [14, 4, 1, 3]])
    rects(g, "#3a3834", [[8, 9, 1, 3], [11, 9, 1, 3], [14, 9, 1, 3]])
    // torn corner
    rects(g, DARK, [[14, 3, 3, 3]])
    rects(g, EDGE, [[13, 3, 1, 2]])
    // door seam
    rects(g, EDGE, [[10, 8, 1, 5]])
  }
  shadeFlat(c)
  return c
}

function jeep(): VehArt {
  const b = cv(18, 11)
  const g = b.getContext("2d")!
  rects(g, "#141414", [[2, 0, 4, 2], [12, 0, 4, 2], [2, 9, 4, 2], [12, 9, 4, 2]])
  rects(g, "#4a4840", [[1, 1, 16, 9]])
  rects(g, "#2e2c28", [[1, 1, 16, 1], [1, 9, 16, 1], [1, 1, 1, 9]])
  rects(g, "#5a5850", [[12, 2, 5, 7]])
  rects(g, "#6a6860", [[11, 2, 1, 7]])
  rects(g, "#2a2824", [[2, 3, 8, 5]])
  shadeFlat(b)
  const t = cv(10, 5)
  const h = t.getContext("2d")!
  rects(h, "#3b4046", [[0, 1, 4, 3]])
  rects(h, "#1d2124", [[4, 2, 6, 1]])
  return { body: b, turret: t, pivot: [2, 2.5], mount: [-3, 0] }
}

function bike(): VehArt {
  const b = cv(14, 8)
  const g = b.getContext("2d")!
  rects(g, "#141414", [[1, 1, 3, 3], [10, 1, 3, 3]])
  rects(g, "#4a4840", [[3, 3, 8, 2]])
  rects(g, "#2e2c28", [[4, 2, 2, 2]])
  shadeFlat(b)
  const t = cv(8, 3)
  rects(t.getContext("2d")!, "#1d2124", [[2, 1, 6, 1]])
  return { body: b, turret: t, pivot: [1, 1.5], mount: [2, -1] }
}

function hover(): VehArt {
  const b = cv(16, 8)
  const g = b.getContext("2d")!
  rects(g, "#3a3834", [[1, 3, 14, 3]])
  rects(g, "#6a6860", [[2, 2, 10, 2]])
  rects(g, "#2a2824", [[0, 5, 16, 1]])
  shadeFlat(b)
  const t = cv(6, 3)
  rects(t.getContext("2d")!, "#1d2124", [[0, 1, 6, 1]])
  return { body: b, turret: t, pivot: [1, 1.5], mount: [1, -1] }
}

function apc(): VehArt {
  const b = cv(24, 14)
  const g = b.getContext("2d")!
  rects(g, "#141414", [[3, 0, 3, 2], [8, 0, 3, 2], [13, 0, 3, 2], [18, 0, 3, 2], [3, 12, 3, 2], [8, 12, 3, 2], [13, 12, 3, 2], [18, 12, 3, 2]])
  rects(g, "#4a4840", [[1, 1, 22, 12]])
  rects(g, "#2e2c28", [[1, 1, 22, 1], [1, 12, 22, 1], [1, 1, 1, 12]])
  rects(g, "#5a5850", [[18, 2, 5, 10]])
  rects(g, "#3a3834", [[8, 3, 9, 8]])
  shadeFlat(b)
  const t = cv(14, 7)
  const h = t.getContext("2d")!
  rects(h, "#3a3834", [[0, 0, 7, 7]])
  rects(h, "#1a1a18", [[7, 3, 7, 1]])
  return { body: b, turret: t, pivot: [3.5, 3.5], mount: [0, 0] }
}

function tank(): VehArt {
  const b = cv(24, 16)
  const g = b.getContext("2d")!
  rects(g, "#2a2a24", [[0, 0, 24, 3], [0, 13, 24, 3]])
  rects(g, "#3e3c36", [[1, 3, 22, 10]])
  rects(g, "#5a5850", [[19, 4, 4, 8]])
  shadeFlat(b)
  const t = cv(21, 10)
  const h = t.getContext("2d")!
  rects(h, "#4a4840", [[0, 1, 10, 8]])
  rects(h, "#1a1a18", [[10, 4, 9, 2]])
  return { body: b, turret: t, pivot: [5, 5], mount: [-1, 0] }
}

function truck(): VehArt {
  const b = cv(28, 12)
  const g = b.getContext("2d")!
  rects(g, "#141414", [[2, 0, 3, 2], [6, 0, 3, 2], [17, 0, 4, 2], [21, 0, 4, 2], [2, 10, 3, 2], [6, 10, 3, 2], [17, 10, 4, 2], [21, 10, 4, 2]])
  // bed
  rects(g, "#3a3834", [[1, 1, 16, 10]])
  // cab
  rects(g, "#4a4840", [[17, 1, 10, 10]])
  rects(g, "#5a5850", [[22, 2, 4, 8]])
  rects(g, "#2e2c28", [[17, 1, 1, 10], [1, 1, 27, 1], [1, 10, 27, 1], [1, 1, 1, 10]])
  shadeFlat(b)
  const t = cv(10, 5)
  const h = t.getContext("2d")!
  rects(h, "#3b4046", [[0, 1, 4, 3]])
  rects(h, "#1d2124", [[4, 2, 6, 1]])
  return { body: b, turret: t, pivot: [2, 2.5], mount: [4, 0] }
}

function mbt(): VehArt {
  const b = cv(26, 18)
  const g = b.getContext("2d")!
  // heavy track plates
  rects(g, "#2a2a24", [[0, 0, 26, 4], [0, 14, 26, 4]])
  rects(g, "#3e3c36", [[1, 4, 24, 10]])
  rects(g, "#5a5850", [[20, 5, 5, 8]])
  rects(g, "#2a2824", [[0, 6, 2, 6]])
  shadeFlat(b)
  // Longer tube so the muzzle reads past the glacis; pivot at cupola center.
  const t = cv(28, 12)
  const h = t.getContext("2d")!
  rects(h, "#4a4840", [[0, 2, 12, 8]])
  rects(h, "#1a1a18", [[12, 5, 16, 2]])
  return { body: b, turret: t, pivot: [6, 6], mount: [0, -1] }
}

function mlrs(): VehArt {
  const b = cv(24, 14)
  const g = b.getContext("2d")!
  rects(g, "#141414", [[3, 0, 3, 2], [8, 0, 3, 2], [13, 0, 3, 2], [18, 0, 3, 2], [3, 12, 3, 2], [8, 12, 3, 2], [13, 12, 3, 2], [18, 12, 3, 2]])
  rects(g, "#4a4840", [[1, 1, 22, 12]])
  rects(g, "#2e2c28", [[1, 1, 22, 1], [1, 12, 22, 1], [1, 1, 1, 12]])
  shadeFlat(b)
  // box launcher with four short tube openings
  const t = cv(14, 12)
  const h = t.getContext("2d")!
  rects(h, "#3a3834", [[0, 0, 12, 12]])
  rects(h, "#2a2824", [[0, 2, 1, 8], [11, 2, 1, 8]])
  rects(h, "#1a1a18", [[12, 2, 2, 2], [12, 5, 2, 2], [12, 8, 2, 2]])
  return { body: b, turret: t, pivot: [6, 6], mount: [0, 0] }
}

/** Bipedal HEX mech — high-angle torso + thick planted legs (not a tracked hull). */
function hex(tier: "scout" | "line" | "siege"): VehArt {
  const HP: Pal = {
    T: "#6a6860",
    M: "#4a4840",
    D: "#2a2824",
    H: "#5a5850",
    L: "#3a3834",
    K: "#2e2c28",
    B: "#1a1a18",
    O: "#141410",
    A: "#5a5850",
  }
  // Angular pauldrons, cockpit optic, hip pods, knee joints, pad feet.
  const rows =
    tier === "scout"
      ? [
          "......................",
          ".....AA....AA.........",
          "....TTTTTTTTTT........",
          "...TTTTTOOTTTTT.......",
          "...TTTTTTTTTTTT.......",
          "....TTMMMMMMTT........",
          ".....TMMMMMMT.........",
          "......DDDDDD..........",
          ".....HHH..HHH.........",
          "....LLLL..LLLL........",
          "...LLLL....LLLL.......",
          "...LLLK....KLLL.......",
          "..LLL........LLL......",
          "..LL..........LL......",
          ".BBB..........BBB.....",
          ".BBBB........BBBB.....",
          "..BBB........BBB......",
          "......................",
        ]
      : tier === "line"
        ? [
            "......................",
            "....AAA....AAA........",
            "...TTTTTTTTTTTT.......",
            "..TTTTTOOTTTTTTT......",
            "..TTTTTTTTTTTTTT......",
            "...TTTMMMMMMTTT.......",
            "....TTMMMMMMTT........",
            ".....DDDDDDDD.........",
            "....HHHH..HHHH........",
            "...LLLLL..LLLLL.......",
            "..LLLLL....LLLLL......",
            "..LLLLK....KLLLL......",
            ".LLLL........LLLL.....",
            ".LLL..........LLL.....",
            "BBBB..........BBBB....",
            "BBBBB........BBBBB....",
            ".BBBB........BBBB.....",
            "..BBB........BBB......",
          ]
        : [
            "......................",
            "...AAAA....AAAA.......",
            "..TTTTTTTTTTTTTT......",
            ".TTTTTTTOOTTTTTTT.....",
            ".TTTTTTTTTTTTTTTT.....",
            "..TTTTMMMMMMTTTT......",
            "...TTTMMMMMMTTT.......",
            "....DDDDDDDDDD........",
            "...HHHHH..HHHHH.......",
            "..LLLLLL..LLLLLL......",
            ".LLLLLL....LLLLLL.....",
            ".LLLLLK....KLLLLL.....",
            "LLLLL........LLLLL....",
            "LLLL..........LLLL....",
            "BBBBB........BBBBB....",
            "BBBBBB......BBBBBB....",
            ".BBBBB......BBBBB.....",
            "..BBBB......BBBB......",
          ]
  const b = paint(rows, HP)
  shadeFlat(b)
  const barrel = tier === "scout" ? 6 : tier === "line" ? 9 : 13
  const t = cv(barrel + 6, tier === "siege" ? 8 : 6)
  const h = t.getContext("2d")!
  const th = t.height
  // Arm cuff + tube — mech shoulder gun, not a tank cupola
  rects(h, "#3a3834", [[0, 1, 5, th - 2]])
  rects(h, "#5a5850", [[1, 0, 4, 1]])
  rects(h, "#2a2824", [[0, th - 1, 5, 1], [2, 2, 2, th - 4]])
  rects(h, "#4a4840", [[4, Math.floor(th / 2) - 1, 3, 3]])
  rects(h, "#1a1a18", [[7, Math.floor(th / 2) - (tier === "siege" ? 1 : 0), barrel, tier === "siege" ? 3 : 2]])
  if (tier === "siege") rects(h, "#2a2824", [[7 + barrel - 3, Math.floor(th / 2) - 1, 3, 3]])
  const mountY = tier === "scout" ? -5 : tier === "line" ? -4.5 : -4
  return { body: b, turret: t, pivot: [2.5, th / 2], mount: [3, mountY] }
}

function ugv(): VehArt {
  const b = cv(16, 10)
  const g = b.getContext("2d")!
  rects(g, "#141414", [[1, 0, 3, 2], [5, 0, 3, 2], [9, 0, 3, 2], [1, 8, 3, 2], [5, 8, 3, 2], [9, 8, 3, 2]])
  rects(g, "#3e3c36", [[1, 2, 14, 6]])
  rects(g, "#2e2c28", [[1, 2, 14, 1], [1, 7, 14, 1]])
  rects(g, "#4a4840", [[8, 2, 6, 6]])
  shadeFlat(b)
  const t = cv(8, 4)
  const h = t.getContext("2d")!
  rects(h, "#3b4046", [[0, 1, 3, 2]])
  rects(h, "#1d2124", [[3, 1, 5, 1]])
  return { body: b, turret: t, pivot: [1.5, 2], mount: [0, -1] }
}

function mrap(): VehArt {
  const b = cv(22, 16)
  const g = b.getContext("2d")!
  rects(g, "#141414", [[2, 0, 4, 2], [8, 0, 4, 2], [14, 0, 4, 2], [2, 14, 4, 2], [8, 14, 4, 2], [14, 14, 4, 2]])
  rects(g, "#5a5850", [[1, 1, 20, 14]])
  rects(g, "#3a3834", [[1, 1, 20, 2], [1, 13, 20, 2], [1, 1, 2, 14]])
  rects(g, "#6a6860", [[16, 3, 5, 10]])
  shadeFlat(b)
  const t = cv(12, 6)
  const h = t.getContext("2d")!
  rects(h, "#3a3834", [[0, 0, 6, 6]])
  rects(h, "#1a1a18", [[6, 2, 6, 1]])
  return { body: b, turret: t, pivot: [3, 3], mount: [0, 0] }
}

function gunship() {
  const b = cv(16, 8)
  const g = b.getContext("2d")!
  rects(g, "#2a2824", [[0, 3, 9, 2]])
  rects(g, "#3a3834", [[5, 1, 8, 6]])
  rects(g, "#1a1a18", [[11, 3, 5, 2]])
  return b
}

function strafeBird() {
  const b = cv(18, 9)
  const g = b.getContext("2d")!
  rects(g, "#2a2824", [[0, 4, 11, 2]])
  rects(g, "#4a4840", [[4, 1, 10, 7]])
  rects(g, "#1a1a18", [[12, 3, 6, 3]])
  rects(g, "#6a6860", [[6, 0, 6, 1]])
  return b
}

function rocketBird() {
  const b = cv(16, 9)
  const g = b.getContext("2d")!
  rects(g, "#3a342c", [[1, 3, 10, 3]])
  rects(g, "#5a5044", [[4, 1, 8, 7]])
  rects(g, "#6a3030", [[12, 2, 4, 5]])
  return b
}

function bombBird() {
  const b = cv(18, 10)
  const g = b.getContext("2d")!
  rects(g, "#2a2824", [[2, 4, 12, 3]])
  rects(g, "#3e3c36", [[5, 1, 10, 8]])
  rects(g, "#1a1a18", [[0, 5, 4, 2]])
  rects(g, "#5a5850", [[14, 3, 4, 4]])
  return b
}

function vtol(frame: number) {
  const b = cv(48, 24)
  const g = b.getContext("2d")!
  rects(g, "#2a2824", [[9, 19, 2, 3], [37, 19, 2, 3], [6, 22, 8, 1], [34, 22, 8, 1]])
  rects(g, "#4a4844", [[4, 6, 40, 13]])
  rects(g, "#6a6860", [[4, 6, 40, 1]])
  rects(g, "#2a2824", [[4, 18, 40, 1], [4, 6, 1, 13], [43, 6, 1, 13]])
  rects(g, "#3a3834", [[15, 7, 1, 11], [24, 7, 1, 11], [33, 7, 1, 11], [5, 13, 6, 5], [12, 9, 2, 2], [26, 9, 2, 2]])
  rects(g, "#1a1a18", [[37, 8, 6, 3]])
  rects(g, "#6a6860", [[38, 8, 2, 1]])
  for (const px of [0, 36]) {
    rects(g, "#3a3834", [[px, 1, 12, 5], [px + 4, 6, 4, 2]])
    rects(g, "#5a5854", [[px, 1, 12, 1]])
    rects(g, frame ? "#8a8680" : "#5a5854", [[px + 1, 3, 10, 1]])
    rects(g, "#2a2824", [[px + 1, 5, 10, 1]])
  }
  return b
}

function boot() {
  for (const id of Object.keys(PALS)) {
    for (const pose of ["idle", "walk", "dep"] as Pose[]) {
      const c = paint(SOLDIER[pose], PALS[id])
      if (id === "medic") {
        const g = c.getContext("2d")!
        const dy = pose === "dep" ? -1 : 0
        rects(g, "#6a3030", [[6, 6 + dy, 1, 3], [5, 7 + dy, 3, 1]])
      }
      if (id === "aegis" || id === "forge" || id === "wisp") rects(c.getContext("2d")!, "#6e6e6e", [[6, pose === "dep" ? 1 : 2, 1, 1]])
      shadeFlat(c)
      actors.set(`${id}:${pose}`, c)
      bakeLayers(id, pose, SOLDIER[pose], PALS[id], SOLDIER_HEAD, SOLDIER_COAT, SOLDIER_LEGS)
    }
  }
  const npc = (rows: string[], pal: Pal) => {
    const c = paint(rows, pal)
    shadeFlat(c)
    return c
  }
  // Flesh NPCs stay solid stamps — layer splits (head/coat/legs) read as offset parts
  // on dirty 16×13 masses. Soft trail tips still run under the stamp via anim.ts.
  const flesh = (kind: string, frames: string[][], pal: Pal) => {
    frames.forEach((rows, i) => {
      const pose: Pose = i ? "walk" : "idle"
      actors.set(`${kind}:${pose}`, npc(rows, pal))
    })
  }
  flesh("shambler", ZOMBIE, CORPSE)
  flesh("doghead", DOG, CORPSE)
  flesh("pighead", PIG, { ...CORPSE, h: "#6a5848" })
  flesh("goathead", DOG, { ...CORPSE, h: "#6a6058" })
  flesh("k9", DOG, { h: "#6a6860", c: "#4a4840", b: "#1a1814" })
  MUTANT.forEach((rows, i) => actors.set(`mutant:${i ? "walk" : "idle"}`, npc(rows, MP)))
  DRONE.forEach((rows, i) => {
    actors.set(`drone:${i ? "walk" : "idle"}`, npc(rows, DP))
    actors.set(`scoot:${i ? "walk" : "idle"}`, npc(rows, SCOOT))
  })
  WALKER.forEach((rows, i) => actors.set(`walker:${i ? "walk" : "idle"}`, npc(rows, WP)))
  DRONE.forEach((rows, i) => actors.set(`crowhead:${i ? "walk" : "idle"}`, npc(rows, { x: "#4a4844", o: "#6a3030" })))
  WALKER.forEach((rows, i) => actors.set(`tract:${i ? "walk" : "idle"}`, npc(rows, { X: "#3a4848", x: "#2a3434", o: "#6e6e6e" })))
  COIL.forEach((rows, i) => actors.set(`coil:${i ? "walk" : "idle"}`, npc(rows, COIL_P)))
  DRONE.forEach((rows, i) => actors.set(`flake:${i ? "walk" : "idle"}`, npc(rows, { x: "#5a6a6a", o: "#6e6e6e" })))
  WALKER.forEach((rows, i) => actors.set(`roller:${i ? "walk" : "idle"}`, npc(rows, { X: "#4a4844", x: "#2e2c28", o: "#6a6860" })))
  DRONE.forEach((rows, i) => actors.set(`kite:${i ? "walk" : "idle"}`, npc(rows, { x: "#6a6860", o: "#6e6e6e" })))
  WALKER.forEach((rows, i) => actors.set(`slab:${i ? "walk" : "idle"}`, npc(rows, { X: "#3a3834", x: "#2a2824", o: "#5a5850" })))
  DRONE.forEach((rows, i) => actors.set(`copter:${i ? "walk" : "idle"}`, npc(rows, { x: "#5a5854", o: "#8a8680" })))
  DRONE.forEach((rows, i) => actors.set(`hawk:${i ? "walk" : "idle"}`, npc(rows, { x: "#4a4038", o: "#6a3030" })))
  actors.set("gunboat:idle", gunship())
  actors.set("gunboat:walk", gunship())
  actors.set("gunship:idle", strafeBird())
  actors.set("gunship:walk", strafeBird())
  actors.set("rocket:idle", rocketBird())
  actors.set("rocket:walk", rocketBird())
  actors.set("bomber:idle", bombBird())
  actors.set("bomber:walk", bombBird())
  DRONE.forEach((rows, i) => actors.set(`mid:${i ? "walk" : "idle"}`, npc(rows, { x: "#3a4044", o: "#6e6e6e" })))
  WALKER.forEach((rows, i) => actors.set(`reach:${i ? "walk" : "idle"}`, npc(rows, { X: "#3a4844", x: "#24302c", o: "#5a6a64" })))
  WALKER.forEach((rows, i) => actors.set(`mast:${i ? "walk" : "idle"}`, npc(rows, { X: "#4a5858", x: "#2a3838", o: "#8aa0a0" })))
  WALKER.forEach((rows, i) => actors.set(`dray:${i ? "walk" : "idle"}`, npc(rows, { X: "#3a3834", x: "#22201c", o: "#6a6860" })))
  WALKER.forEach((rows, i) => actors.set(`rust_plow:${i ? "walk" : "idle"}`, npc(rows, { X: "#3a4440", x: "#242c28", o: "#5a6a60" })))
  WALKER.forEach((rows, i) => actors.set(`post:${i ? "walk" : "idle"}`, npc(rows, { X: "#4a4840", x: "#2a2820", o: "#8a8680" })))
  BLOOM.forEach((rows, i) => actors.set(`bloom:${i ? "walk" : "idle"}`, npc(rows, BLOOM_P)))
  DRONE.forEach((rows, i) => actors.set(`cluster:${i ? "walk" : "idle"}`, npc(rows, { x: "#5a6868", o: "#6e6e6e" })))
  FOG.forEach((rows, i) => actors.set(`fog:${i ? "walk" : "idle"}`, npc(rows, FOG_P)))
  WALKER.forEach((rows, i) => actors.set(`ball:${i ? "walk" : "idle"}`, npc(rows, { X: "#2a2c2e", x: "#1a1c1e", o: "#5a5854" })))
  AMALGAM.forEach((rows, i) => actors.set(`amalgam:${i ? "walk" : "idle"}`, npc(rows, AMALGAM_P)))
  actors.set("sentry_gun:idle", paint(GEAR.sentry[0], GEAR.sentry[1]))
  for (let i = 0; i < 6; i++) props.set(`tree:${i}`, tree(11 + i * 17))
  for (let i = 0; i < 4; i++) props.set(`ruin:${i}`, ruin(40 + i * 19))
  for (let i = 0; i < 3; i++) {
    props.set(`wire:${i}`, wire(7 + i * 13))
    props.set(`wreck:${i}`, wreck(19 + i * 11))
    props.set(`post:${i}`, post(3 + i * 9))
    props.set(`teeth:${i}`, teeth(29 + i * 15))
  }
  const stump = cv(10, 6)
  rects(stump.getContext("2d")!, "rgba(0,0,0,.35)", [[2, 4, 6, 2]])
  rects(stump.getContext("2d")!, "#3a2a1c", [[2, 1, 6, 3]])
  rects(stump.getContext("2d")!, "#2a1e14", [[3, 2, 4, 2]])
  rects(stump.getContext("2d")!, "#4a3828", [[3, 1, 4, 1]])
  shadeFlat(stump)
  props.set("stump:0", stump)
  const rubble = cv(12, 6)
  rects(rubble.getContext("2d")!, "#3a342c", [[1, 3, 4, 2], [6, 2, 4, 3], [4, 4, 3, 1]])
  rects(rubble.getContext("2d")!, "#5a5044", [[2, 3, 2, 1], [7, 2, 2, 1]])
  shadeFlat(rubble)
  props.set("rubble:0", rubble)
  {
    const crate = paint(CRATE, { C: "#3a3428", c: "#5a5044" })
    shadeFlat(crate)
    props.set("crate:0", crate)
  }
  props.set("vtol:0", vtol(0))
  props.set("vtol:1", vtol(1))
  props.set("mine:0", paint(GEAR.mines[0], GEAR.mines[1]))
  vehicles.set("jeep", jeep())
  vehicles.set("apc", apc())
  vehicles.set("plow", tank())
  vehicles.set("tank", tank())
  vehicles.set("bike", bike())
  vehicles.set("buggy", jeep())
  vehicles.set("hover", hover())
  vehicles.set("mrap", mrap())
  vehicles.set("hex_scout", hex("scout"))
  vehicles.set("hex_line", hex("line"))
  vehicles.set("hex_siege", hex("siege"))
  vehicles.set("truck", truck())
  vehicles.set("tech", jeep())
  vehicles.set("suv", jeep())
  vehicles.set("steed", bike())
  vehicles.set("cart", jeep())
  vehicles.set("mule", apc())
  vehicles.set("mlrs", mlrs())
  vehicles.set("ifv", apc())
  vehicles.set("mbt", mbt())
  vehicles.set("ugv", ugv())
  vehicles.set("tube", tank())
  vehicles.set("drill", tank())
  vehicles.set("pump", jeep())
  vehicles.set("cutter", jeep())
  for (const id of Object.keys(GEAR)) actors.set(`gear:${id}`, paint(GEAR[id][0], GEAR[id][1]))
}

boot()

export function actor(kind: string, pose: Pose, flipX: boolean, kit?: Kit): HTMLCanvasElement | null {
  const use = pose === "dep" && actors.has(`${kind}:dep`) ? "dep" : pose === "walk" && actors.has(`${kind}:walk`) ? "walk" : "idle"
  const body = actors.get(`${kind}:${use}`) ?? actors.get(`${kind}:idle`)
  if (!body) return null
  let c = body
  if (PALS[kind]) {
    const gun = kit?.gun ?? "rifle"
    const bits = kit?.bits ?? []
    const key = `${kind}:${use}:${holdKey(gun)}:${[...bits].sort().join("+")}`
    let hit = armed.get(key)
    if (!hit) {
      hit = armSoldier(body, use, { gun, bits })
      armed.set(key, hit)
    }
    c = hit
  }
  return flipX ? flipped(c) : c
}

export function vehicleArt(kind: string): VehArt | null {
  return vehicles.get(kind) ?? null
}

export function scenery(kind: string, n = 0): HTMLCanvasElement | null {
  if (kind === "tree") return props.get(`tree:${n % 6}`) ?? null
  if (kind === "ruin") return props.get(`ruin:${n % 4}`) ?? null
  return props.get(`${kind}:${n % 3}`) ?? props.get(`${kind}:0`) ?? null
}

export function icon(id: string): HTMLCanvasElement | null {
  return actors.get(`gear:${id}`) ?? null
}

const limbs = new Map<string, HTMLCanvasElement>()

function tone(kind: string) {
  const pal = PALS[kind]
  if (pal) return { head: pal.H, skin: pal.S, body: pal.C, limb: pal.L, boot: pal.B }
  if (kind === "pighead") return { head: "#6a5848", skin: "#6a5848", body: "#3a342e", limb: "#3a342e", boot: "#1c1814" }
  if (kind === "mutant") return { head: "#4a403c", skin: "#4a403c", body: "#4a403c", limb: "#3a342e", boot: "#2a2420" }
  if (kind === "drone" || kind === "scoot" || kind === "walker") return { head: "#6e6e6e", skin: "#6e6e6e", body: "#3a403e", limb: "#2a2824", boot: "#1a1a18" }
  return { head: "#5a5048", skin: "#5a5048", body: "#3a342e", limb: "#3a342e", boot: "#1c1814" }
}

export function limbSprite(kind: string, part: string): HTMLCanvasElement {
  const key = `${kind}:${part}`
  const hit = limbs.get(key)
  if (hit) return hit
  const t = tone(kind)
  const c =
    part === "head"
      ? paint([".HH.", "HHSH", ".HH."], { H: t.head, S: t.skin })
      : part === "arm"
        ? paint(["CCCCC", ".CCC."], { C: t.body })
        : part === "leg"
          ? paint(["LL", "LL", "LL", "BB", "BB"], { L: t.limb, B: t.boot })
          : part === "wheel"
            ? paint([".WWW.", "WKKKW", "WKKKW", ".WWW."], { W: "#2a2a24", K: "#5a5850" })
            : vehicleArt(kind)?.turret ?? paint(["TTTTTTTT", "..TTTT.."], { T: "#3a3834" })
  limbs.set(key, c)
  return c
}

function copyCanvas(src: HTMLCanvasElement) {
  const c = cv(src.width, src.height)
  c.getContext("2d")!.drawImage(src, 0, 0)
  return c
}

export function preview(id: string, size: number): HTMLCanvasElement {
  const key = `${id}:${size}`
  const hit = previews.get(key)
  if (hit) return copyCanvas(hit)
  const src = actor(id, "idle", false) ?? icon(id) ?? vehicleFlat(id) ?? scenery("crate")!
  const c = cv(size, size)
  const g = c.getContext("2d")!
  g.imageSmoothingEnabled = false
  const fit = (size * 0.9) / Math.max(src.width, src.height)
  const dw = Math.max(1, Math.round(src.width * fit))
  const dh = Math.max(1, Math.round(src.height * fit))
  g.drawImage(src, ((size - dw) / 2) | 0, ((size - dh) / 2) | 0, dw, dh)
  previews.set(key, c)
  return copyCanvas(c)
}

const octos = new Map<string, HTMLCanvasElement>()

export function octo(span: number, frame: number): HTMLCanvasElement {
  const w = Math.max(22, span + 4) | 0
  const key = `${w}:${frame & 1}`
  const hit = octos.get(key)
  if (hit) return hit
  const c = cv(w, 9)
  const g = c.getContext("2d")!
  const mid = w / 2
  const back = [0.3, 0.7].flatMap((k) => [k * mid - 2, w - k * mid - 2])
  const front = [0, 0.45].flatMap((k) => [k * mid, w - k * mid - 3])
  rects(g, frame & 1 ? "#8a8680" : "#5a5854", [...back.map((x) => [Math.round(x), 0, 4, 1]), ...front.map((x) => [Math.round(x), 2, 3, 1])])
  rects(g, "#2a2824", [...back.map((x) => [Math.round(x) + 1, 1, 1, 3]), ...front.map((x) => [Math.round(x) + 1, 3, 1, 1])])
  rects(g, "#4a4844", [[1, 4, w - 2, 1]])
  rects(g, "#5a5854", [[Math.round(mid) - 3, 3, 6, 4]])
  rects(g, "#2a2824", [[Math.round(mid) - 2, 5, 4, 1], [Math.round(mid) - 1, 7, 2, 2]])
  octos.set(key, c)
  return c
}

const cargos = new Map<string, HTMLCanvasElement>()

export function cargo(kind: string | null, gear = false): HTMLCanvasElement {
  const key = gear ? `g:${kind ?? ""}` : (kind ?? "")
  const hit = cargos.get(key)
  if (hit) return hit
  if (gear && kind) {
    const box  = scenery("crate")!
    const mark = icon(kind)
    if (!mark) {
      cargos.set(key, box)
      return box
    }
    const c = cv(Math.max(box.width, mark.width), box.height + mark.height)
    const g = c.getContext("2d")!
    g.drawImage(box,  ((c.width - box.width)  / 2) | 0, mark.height)
    g.drawImage(mark, ((c.width - mark.width) / 2) | 0, 0)
    cargos.set(key, c)
    return c
  }
  const c = (kind && (actor(kind, "idle", false) ?? vehicleFlat(kind))) || scenery("crate")!
  cargos.set(key, c)
  return c
}

function vehicleFlat(id: string) {
  const v = vehicles.get(id)
  if (!v) return null
  const padX = 4
  const padY = 4
  const c = cv(v.body.width + padX * 2 + 8, v.body.height + padY * 2 + 6)
  const g = c.getContext("2d")!
  const ox = padX + 4
  const oy = padY + 3
  g.drawImage(v.body, ox, oy)
  const cx = ox + v.body.width / 2
  const cy = oy + v.body.height / 2
  g.drawImage(v.turret, cx + v.mount[0] - v.pivot[0], cy + v.mount[1] - v.pivot[1])
  return c
}

let mud: HTMLCanvasElement | null = null

export function groundTile() {
  if (mud) return mud
  mud = cv(128, 128)
  const g = mud.getContext("2d")!
  const rand = rng(7)
  g.fillStyle = "#2a2622"
  g.fillRect(0, 0, 128, 128)
  // base speckles
  const cols = ["#241f1c", "#1c1916", "#322c28", "#3a342c", "#201c18"]
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = cols[(rand() * cols.length) | 0]
    g.fillRect((rand() * 128) | 0, (rand() * 128) | 0, 1, 1)
  }
  // original vertical edge marks
  for (let i = 0; i < 14; i++) {
    const x = 2 + ((rand() * 124) | 0)
    const y = 3 + ((rand() * 122) | 0)
    g.fillStyle = "#3a342c"
    g.fillRect(x, y, 1, 2)
  }
  // large wet / darker patches (8–12 clusters)
  const patchCount = 8 + ((rand() * 5) | 0)
  for (let i = 0; i < patchCount; i++) {
    const px = 4 + ((rand() * 120) | 0)
    const py = 4 + ((rand() * 120) | 0)
    const sw = 4 + ((rand() * 7) | 0)
    const sh = Math.max(3, sw - 2)
    g.fillStyle = rand() > 0.5 ? "#1a1612" : "#221e1a"
    g.fillRect(px, py, sw, sh)
  }
  // faint ruts (~6 short horizontal 1px lines, roughly parallel)
  for (let i = 0; i < 6; i++) {
    const rx = 3 + ((rand() * 110) | 0)
    const ry = 4 + ((rand() * 120) | 0)
    const rw = 6 + ((rand() * 10) | 0)
    g.fillStyle = "#1c1814"
    g.fillRect(rx, ry, rw, 1)
    if (rand() > 0.5) g.fillRect(rx + 2, ry + 2, rw - 3, 1)
  }
  // sparse ash speckles (lighter, fewer than mud speckles)
  for (let i = 0; i < 180; i++) {
    g.fillStyle = rand() > 0.5 ? "#3a342c" : "#4a463e"
    g.fillRect((rand() * 128) | 0, (rand() * 128) | 0, 1, 1)
  }
  return mud
}

const HEX_CELL = 64
const hexArtCache = new Map<string, HTMLCanvasElement>()

/** World-map hex cell art — dense mud + ground props, art-bible palette. */
export function hexTerrain(ground: string, seed: number) {
  const key = `${ground}:${seed & 7}`
  const hit = hexArtCache.get(key)
  if (hit) return hit
  const n = HEX_CELL
  const c = cv(n, n)
  const g = c.getContext("2d")!
  const rand = rng((seed | 0) * 997 + (ground.charCodeAt(0) || 1) * 131)
  const mud0 = "#1a1612"
  const mud1 = "#221e1a"
  const mud2 = "#2e2a24"
  const mud3 = "#3a3630"
  const coat = "#4a4640"
  const ash = "#5a564e"
  const lite = "#6a655c"
  const oxide = "#6a4030"
  const ink = "#0c0b09"
  // ground-tinted base so cell type reads at map scale
  g.fillStyle = ground === "bog" ? "#242820" : ground === "teeth" ? mud3 : mud2
  g.fillRect(0, 0, n, n)
  for (let i = 0; i < 900; i++) {
    g.fillStyle = [mud0, mud1, mud2, mud3, ash][(rand() * 5) | 0]
    g.fillRect((rand() * n) | 0, (rand() * n) | 0, 1, 1)
  }
  for (let i = 0; i < 8; i++) {
    const px = 2 + ((rand() * (n - 12)) | 0)
    const py = 2 + ((rand() * (n - 10)) | 0)
    const sw = 5 + ((rand() * 10) | 0)
    g.fillStyle = rand() > 0.45 ? mud0 : mud1
    g.fillRect(px, py, sw, Math.max(3, sw - 2))
  }
  for (let i = 0; i < 5; i++) {
    const rx = 2 + ((rand() * (n - 18)) | 0)
    const ry = 4 + ((rand() * (n - 10)) | 0)
    const rw = 10 + ((rand() * 14) | 0)
    g.fillStyle = mud0
    g.fillRect(rx, ry, rw, 1)
    if (rand() > 0.35) g.fillRect(rx + 1, ry + 2, rw - 2, 1)
  }

  if (ground === "timber") {
    for (let t = 0; t < 4; t++) {
      const x = 4 + t * 15 + ((rand() * 3) | 0)
      const lean = ((rand() * 3) | 0) - 1
      rects(g, ink, [
        [x + lean, 14, 5, 36],
        [x - 3 + lean, 8, 7, 6],
        [x + 4 + lean, 6, 6, 7],
        [x + lean, 4, 4, 4],
      ])
      rects(g, mud1, [[x + 1 + lean, 16, 3, 28]])
      rects(g, mud3, [[x - 2 + lean, 10, 4, 3], [x + 5 + lean, 7, 3, 3]])
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = mud0
      g.fillRect((rand() * n) | 0, 36 + ((rand() * 22) | 0), 1 + ((rand() * 2) | 0), 1)
    }
  } else if (ground === "yard") {
    rects(g, lite, [[6, 28, 22, 7]])
    rects(g, ash, [[6, 35, 22, 8]])
    rects(g, coat, [[6, 43, 22, 6]])
    rects(g, mud1, [[5, 48, 24, 4], [26, 30, 6, 14]])
    rects(g, mud3, [[10, 26, 12, 3]])
    rects(g, mud2, [[36, 32, 18, 8]])
    rects(g, ash, [[37, 28, 12, 5]])
    rects(g, oxide, [[38, 36, 4, 3], [46, 34, 3, 3]])
    rects(g, ink, [[36, 40, 18, 3]])
    rects(g, mud1, [[28, 12, 4, 16], [25, 14, 10, 3]])
    rects(g, coat, [[29, 12, 2, 2]])
  } else if (ground === "bog") {
    for (let i = 0; i < 10; i++) {
      const px = 2 + ((rand() * (n - 16)) | 0)
      const py = 6 + ((rand() * (n - 20)) | 0)
      const sw = 10 + ((rand() * 16) | 0)
      g.fillStyle = i % 2 ? "#2a3024" : "#1c2018"
      g.fillRect(px, py, sw, 4 + ((rand() * 5) | 0))
    }
    for (let i = 0; i < 14; i++) {
      const x = 3 + ((rand() * (n - 6)) | 0)
      const y = 8 + ((rand() * (n - 18)) | 0)
      const h = 5 + ((rand() * 6) | 0)
      rects(g, "#3a4034", [[x, y, 2, h]])
      rects(g, "#4a5044", [[x, y, 2, 1]])
    }
    for (let i = 0; i < 90; i++) {
      g.fillStyle = rand() > 0.5 ? "#1a1e16" : mud0
      g.fillRect((rand() * n) | 0, (rand() * n) | 0, 1, 1)
    }
  } else if (ground === "teeth") {
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 3; i++) {
        const x = 4 + i * 18 + (row % 2) * 6
        const y = 8 + row * 16
        const h = 11 + ((rand() * 4) | 0)
        rects(g, lite, [[x + 1, y, 8, 2]])
        rects(g, ash, [[x, y + 2, 10, h - 3]])
        rects(g, coat, [[x, y + h - 1, 10, 3]])
        rects(g, mud1, [[x, y + h + 1, 10, 2]])
        rects(g, mud3, [[x + 3, y + 3, 3, 2]])
      }
    }
  } else {
    for (let i = 0; i < 4; i++) {
      const rx = 3 + ((rand() * 24) | 0)
      const ry = 10 + i * 12 + ((rand() * 4) | 0)
      g.fillStyle = mud0
      g.fillRect(rx, ry, 28 + ((rand() * 14) | 0), 2)
      g.fillRect(rx + 2, ry + 3, 24, 1)
    }
    rects(g, mud1, [[14, 36, 10, 5], [38, 22, 8, 6], [44, 40, 7, 4]])
    rects(g, ash, [[16, 34, 6, 2]])
    for (let i = 0; i < 50; i++) {
      g.fillStyle = ash
      g.fillRect((rand() * n) | 0, (rand() * n) | 0, 1, 1)
    }
  }

  shadeFlat(c)
  hexArtCache.set(key, c)
  return c
}
