type Pal = Record<string, string>

const SOLDIER = {
  idle: ["..HH......", ".HHH......", "..SS......", ".CCCC.....", "CCCCCWWWWW", ".CCCC.....", ".CCCC.....", ".C..C.....", ".L..L.....", ".B..B....."],
  walk: ["..HH......", ".HHH......", "..SS......", ".CCCC.....", "CCCCCWWWWW", ".CCCC.....", ".CCCC.....", "..C.C.....", ".L...L....", "B....B...."],
  dep: ["..........", "..HH......", ".HHH......", "..SS......", ".CCCC.....", "CCCCCWWWWW", ".CCC......", ".LLLL.....", "BB....BB..", ".........."],
}
const PALS: Record<string, Pal> = {
  cell_rifle: { H: "#3a3832", S: "#a09078", C: "#7a7364", W: "#12110e", L: "#4a463c", B: "#1a1814" },
  medic: { H: "#3a3832", S: "#a09078", C: "#7a766c", W: "#12110e", L: "#4e4c44", B: "#1a1814" },
  engr: { H: "#3a3832", S: "#a09078", C: "#6a5a48", W: "#12110e", L: "#4a4036", B: "#1a1814" },
  relay: { H: "#3a3832", S: "#a09078", C: "#6a6e68", W: "#12110e", L: "#444840", B: "#1a1814" },
  aegis: { H: "#3a4044", S: "#b0b4ae", C: "#6a7274", W: "#12110e", L: "#3e4648", B: "#1a1814" },
  forge: { H: "#3a3834", S: "#9a9080", C: "#5a564c", W: "#12110e", L: "#3e3a34", B: "#1a1814" },
  wisp: { H: "#4a4e52", S: "#c0c4be", C: "#8a9294", W: "#12110e", L: "#5a6264", B: "#1a1814" },
  killer: { H: "#2a2c2e", S: "#908880", C: "#3a3e40", W: "#0e0e0c", L: "#2a2c2a", B: "#141210" },
  assassin: { H: "#1a1c1e", S: "#807870", C: "#2a2e30", W: "#0e0e0c", L: "#222422", B: "#121210" },
  operator: { H: "#3a4040", S: "#a0a498", C: "#5a6660", W: "#12110e", L: "#3a4440", B: "#1a1814" },
}

const ZOMBIE = [
  ["..hh......", ".hhh......", "..h.......", ".cccc.....", "cccc......", ".ccc......", ".c..c.....", ".b..b....."],
  ["..hh......", ".hhh......", "..h.......", ".cccc.....", "cccc......", ".ccc......", "..c.c.....", ".b...b...."],
]
const DOG = [
  ["hhh.......", "hhhh......", "..h.......", ".cccc.....", "cccc......", ".ccc......", ".c..c.....", ".b..b....."],
  ["hhh.......", "hhhh......", "..h.......", ".cccc.....", "cccc......", ".ccc......", "..c.c.....", ".b...b...."],
]
const PIG = [
  [".hhhh.....", "hhhhh.....", "..h.......", ".ccccc....", "ccccc.....", ".cccc.....", ".c...c....", ".b...b...."],
  [".hhhh.....", "hhhhh.....", "..h.......", ".ccccc....", "ccccc.....", ".cccc.....", "..c.c.....", ".b....b..."],
]
const CORPSE: Pal = { h: "#5a5048", c: "#3a342e", b: "#1c1814" }
const MUTANT = [
  ["..MMM.....", ".MMMMM....", "..M.M.....", ".MMMMM....", "MMMMM.....", ".MMMM.....", ".M...M....", "..M.M.....", ".MM.MM...."],
  ["..MMM.....", ".MMMMM....", "..M.M.....", ".MMMMM....", "MMMMM.....", ".MMMM.....", "..M.M.....", ".M...M....", "MM....MM.."],
]
const MP: Pal = { M: "#4a403c" }
const DRONE = [
  ["..xxxx..", ".xxxxxx.", "xxxoxxxx", ".xx..xx."],
  [".xx..xx.", ".xxxxxx.", "xxxoxxxx", "..x..x.."],
]
const DP: Pal = { x: "#3a3a38", o: "#2a4e4a" }
const SCOOT: Pal = { x: "#3a403e", o: "#3ecfc2" }
const WALKER = [
  ["..XXXXXX..", ".XXXXXXXX.", ".XXoXXoXX.", "XXXXXXXXXX", ".xxxxxxxx.", "..XX..XX..", "..x....x..", ".xx....xx."],
  ["..XXXXXX..", ".XXXXXXXX.", ".XXoXXoXX.", "XXXXXXXXXX", ".xxxxxxxx.", "...X..X...", "..xx..xx..", "..x....x.."],
]
const WP: Pal = { X: "#4a4844", x: "#2a2824", o: "#3ecfc2" }
const CRATE = ["CCCCCCCCC", "CcccCcccC", "CcccCcccC", "CCCCCCCCC", "CcccCcccC", "CcccCcccC", "CCCCCCCCC"]
const GRAY: Pal = { K: "#8a8680", k: "#4a4844", S: "#c0c0c0", r: "#6a3030", B: "#2a2a28", y: "#6a6860", W: "#a0a098", G: "#5a564c", g: "#3a3834", M: "#6a6860", m: "#3a3834", L: "#8a8680", T: "#4a4844", t: "#2a2824", A: "#8a8680", R: "#3a3834", F: "#6a5a40", O: "#4a4030", n: "#8a8680", N: "#5a5854", p: "#6a3030", Q: "#a0a098" }
const GEAR: Record<string, [string[], Pal]> = {
  rifle: [[".......W", "......WW", "WWWWWWW.", ".WW....."], { ...GRAY, W: "#2a2824" }],
  mg: [["WWWWWWWW", "WWWWWWW.", ".WW.....", "..W....."], { ...GRAY, W: "#2e2c28" }],
  sniper: [["......WW", "WWWWWWWW", ".W......", ".W......"], { ...GRAY, W: "#1a1814" }],
  gren: [["..GG....", ".GGGG...", "GGGGGG..", ".GG....."], { ...GRAY, G: "#4a463e" }],
  mortar: [["TTTTTTTT", "..TT....", "..TT....", ".T..T..."], { ...GRAY, T: "#5a564e" }],
  plate: [[".KK..KK.", "KKKKKKKK", "KKkKKkKK", "KKKKKKKK", ".KKKKKK.", ".KKKKKK.", ".KKKKKK."], GRAY],
  scope: [["..SSSS..", ".S....S.", "S......S", "S..rr..S", "S......S", ".S....S.", "..SSSS.."], GRAY],
  drum: [["...BB...", "..BBBB..", ".BBBBBB.", ".BByyBB.", ".BByyBB.", ".BBBBBB.", "..BBBB..", "...BB..."], GRAY],
  bipod: [["WWWWWWWW", "...WW...", "..W..W..", "..W..W..", ".W....W.", ".W....W.", "W......W"], GRAY],
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
  nvg: [[".GG..GG.", "G..GG..G", "G.gggg.G", "G.gGGg.G", "G.gggg.G", "G..GG..G", ".GG..GG."], { ...GRAY, G: "#8a8680", g: "#2f6a48" }],
  thermal: [[".HH..HH.", "H..HH..H", "H.hhhh.H", "H.hHHh.H", "H.hhhh.H", "H..HH..H", ".HH..HH."], { ...GRAY, H: "#8a8680", h: "#c4a060" }],
  thermite: [["...TT...", "..TTTT..", ".TTTTTT.", "..TTTT..", "...TT..."], { ...GRAY, T: "#6a5a40" }],
  emp: [["..E..E..", ".EE..EE.", "..EEEE..", ".EE..EE.", "..E..E.."], { ...GRAY, E: "#3ecfc2" }],
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
  ewar: [["E..EE..E", ".E....E.", "..EEEE..", ".E....E.", "E..EE..E"], { ...GRAY, E: "#3ecfc2" }],
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
const props = new Map<string, HTMLCanvasElement>()
const vehicles = new Map<string, VehArt>()
const previews = new Map<string, HTMLCanvasElement>()

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

function tree(seed: number) {
  const c = cv(16, 20)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  const look = (rand() * 3) | 0
  g.fillStyle = "rgba(0,0,0,.45)"
  g.fillRect(4, 18, 8, 2)
  if (look === 1) {
    rects(g, "#1a1612", [[6, 9, 4, 9]])
    rects(g, "#2a241c", [[7, 10, 1, 7]])
    rects(g, "#14110e", [[3, 8, 7, 2]])
    return c
  }
  if (look === 2) {
    rects(g, "#1a1612", [[7, 8, 2, 10], [4, 4, 2, 6], [10, 3, 2, 7]])
    rects(g, "#2a241c", [[7, 9, 1, 8]])
    return c
  }
  const lean = (rand() * 3) | 0
  rects(g, "#1a1612", [[6 + lean, 4, 3, 15]])
  rects(g, "#2a241c", [[7 + lean, 4, 1, 14]])
  rects(g, "#14110e", [[4 + lean, 6, 3, 2], [10 + lean, 3, 2, 3], [8 + lean, 1, 2, 2]])
  return c
}

function wire(seed: number) {
  const c = cv(24, 12)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  rects(g, "#1c1a16", [[0, 4, 2, 7], [11, 3, 2, 8], [22, 4, 2, 7]])
  for (let x = 1; x < 23; x++) {
    const sag = x % 5 < 3 ? 0 : 1
    g.fillStyle = rand() < 0.15 ? "#2a2824" : "#4a463e"
    g.fillRect(x, 5 + sag, 1, 1)
  }
  return c
}

function wreck(seed: number) {
  const c = cv(22, 12)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  rects(g, "#2a2824", [[1, 5, 16, 4]])
  rects(g, "#1a1814", [[2, 3, 7, 3], [14, 6, 5, 2]])
  rects(g, "#141210", [[0, 8, 4, 2], [15, 8, 4, 2]])
  if (rand() > 0.5) rects(g, "#3a3834", [[8, 1, 2, 5]])
  else rects(g, "#3a3834", [[6, 4, 4, 2]])
  return c
}

function post(seed: number) {
  const c = cv(14, 18)
  const g = c.getContext("2d")!
  const lean = (rng(seed)() * 3) | 0
  rects(g, "#2a241c", [[6 + lean, 2, 2, 15]])
  rects(g, "#1a1612", [[2, 4, 9, 1], [3, 8, 1, 4]])
  return c
}

function teeth(seed: number) {
  const c = cv(20, 10)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  for (let i = 0; i < 3; i++) {
    const x = 1 + i * 6
    const h = 4 + ((rand() * 3) | 0)
    g.fillStyle = i % 2 ? "#5a564e" : "#3a3832"
    g.fillRect(x, 9 - h, 4, h)
    g.fillStyle = "#6a655c"
    g.fillRect(x + 1, 9 - h, 2, 1)
  }
  return c
}

function ruin(seed: number) {
  const c = cv(22, 18)
  const g = c.getContext("2d")!
  const rand = rng(seed)
  g.fillStyle = "rgba(0,0,0,.35)"
  g.fillRect(1, 14, 21, 3)
  if (rand() < 0.45) {
    for (let i = 0; i < 7; i++) {
      const x = 2 + ((rand() * 15) | 0)
      const y = 9 + ((rand() * 5) | 0)
      g.fillStyle = i % 2 ? "#4a463e" : "#2e2c28"
      g.fillRect(x, y, 2 + ((rand() * 3) | 0), 2)
    }
    return c
  }
  let h = 6 + ((rand() * 5) | 0)
  for (let x = 1; x < 21; x++) {
    if (rand() < 0.3) h = Math.max(1, Math.min(11, h + ((rand() * 5) | 0) - 2))
    if (rand() < 0.08) h = 1
    for (let y = 15 - h; y < 15; y++) {
      const row = y - (15 - h)
      let col = row === 0 ? "#6a655c" : "#4a463e"
      if (row > 0 && (y % 3 === 0 || (x + ((y / 3) | 0) % 2) % 5 === 0)) col = "#2e2c28"
      if (x === 20 || x === 1) col = "#1c1a18"
      g.fillStyle = col
      g.fillRect(x, y, 1, 1)
    }
  }
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
  const t = cv(21, 10)
  const h = t.getContext("2d")!
  rects(h, "#4a4840", [[0, 1, 10, 8]])
  rects(h, "#1a1a18", [[10, 4, 9, 2]])
  return { body: b, turret: t, pivot: [5, 5], mount: [-1, 0] }
}

function gunship() {
  const b = cv(16, 8)
  const g = b.getContext("2d")!
  rects(g, "#2a2824", [[0, 3, 9, 2]])
  rects(g, "#3a3834", [[5, 1, 8, 6]])
  rects(g, "#1a1a18", [[11, 3, 5, 2]])
  return b
}

function heli() {
  const b = cv(32, 14)
  const g = b.getContext("2d")!
  rects(g, "#2a2824", [[0, 6, 15, 2], [0, 3, 2, 8]])
  rects(g, "#3a3834", [[12, 2, 17, 10], [14, 1, 13, 12], [29, 4, 2, 6]])
  rects(g, "#6a6860", [[26, 4, 3, 6]])
  return b
}

function boot() {
  for (const id of Object.keys(PALS)) {
    for (const pose of ["idle", "walk", "dep"] as Pose[]) {
      const c = paint(SOLDIER[pose], PALS[id])
      if (id === "medic") {
        const g = c.getContext("2d")!
        const dy = pose === "dep" ? 1 : 0
        rects(g, "#6a3030", [[2, 4 + dy, 1, 2], [1, 5 + dy, 3, 1]])
      }
      if (id === "aegis" || id === "forge" || id === "wisp") rects(c.getContext("2d")!, "#3ecfc2", [[2, pose === "dep" ? 1 : 0, 1, 1]])
      actors.set(`${id}:${pose}`, c)
    }
  }
  ZOMBIE.forEach((rows, i) => actors.set(`shambler:${i ? "walk" : "idle"}`, paint(rows, CORPSE)))
  DOG.forEach((rows, i) => actors.set(`doghead:${i ? "walk" : "idle"}`, paint(rows, CORPSE)))
  PIG.forEach((rows, i) => actors.set(`pighead:${i ? "walk" : "idle"}`, paint(rows, { ...CORPSE, h: "#6a5848" })))
  MUTANT.forEach((rows, i) => actors.set(`mutant:${i ? "walk" : "idle"}`, paint(rows, MP)))
  DRONE.forEach((rows, i) => {
    actors.set(`drone:${i ? "walk" : "idle"}`, paint(rows, DP))
    actors.set(`scoot:${i ? "walk" : "idle"}`, paint(rows, SCOOT))
  })
  WALKER.forEach((rows, i) => actors.set(`walker:${i ? "walk" : "idle"}`, paint(rows, WP)))
  DOG.forEach((rows, i) => actors.set(`goathead:${i ? "walk" : "idle"}`, paint(rows, { ...CORPSE, h: "#6a6058" })))
  DRONE.forEach((rows, i) => actors.set(`crowhead:${i ? "walk" : "idle"}`, paint(rows, { x: "#4a4844", o: "#6a3030" })))
  WALKER.forEach((rows, i) => actors.set(`tract:${i ? "walk" : "idle"}`, paint(rows, { X: "#3a4848", x: "#2a3434", o: "#3ecfc2" })))
  DOG.forEach((rows, i) => actors.set(`coil:${i ? "walk" : "idle"}`, paint(rows, { h: "#3a4848", c: "#2a3434", b: "#1a1814" })))
  DRONE.forEach((rows, i) => actors.set(`flake:${i ? "walk" : "idle"}`, paint(rows, { x: "#5a6a6a", o: "#3ecfc2" })))
  WALKER.forEach((rows, i) => actors.set(`roller:${i ? "walk" : "idle"}`, paint(rows, { X: "#4a4844", x: "#2e2c28", o: "#6a6860" })))
  DRONE.forEach((rows, i) => actors.set(`kite:${i ? "walk" : "idle"}`, paint(rows, { x: "#6a6860", o: "#3ecfc2" })))
  WALKER.forEach((rows, i) => actors.set(`slab:${i ? "walk" : "idle"}`, paint(rows, { X: "#3a3834", x: "#2a2824", o: "#5a5850" })))
  DOG.forEach((rows, i) => actors.set(`k9:${i ? "walk" : "idle"}`, paint(rows, { h: "#6a6860", c: "#4a4840", b: "#1a1814" })))
  DRONE.forEach((rows, i) => actors.set(`copter:${i ? "walk" : "idle"}`, paint(rows, { x: "#5a5854", o: "#8a8680" })))
  DRONE.forEach((rows, i) => actors.set(`hawk:${i ? "walk" : "idle"}`, paint(rows, { x: "#4a4038", o: "#6a3030" })))
  actors.set("gunboat:idle", gunship())
  actors.set("gunboat:walk", gunship())
  DRONE.forEach((rows, i) => actors.set(`mid:${i ? "walk" : "idle"}`, paint(rows, { x: "#3a4044", o: "#3ecfc2" })))
  WALKER.forEach((rows, i) => actors.set(`reach:${i ? "walk" : "idle"}`, paint(rows, { X: "#3a4844", x: "#24302c", o: "#5a6a64" })))
  WALKER.forEach((rows, i) => actors.set(`mast:${i ? "walk" : "idle"}`, paint(rows, { X: "#4a5858", x: "#2a3838", o: "#8aa0a0" })))
  WALKER.forEach((rows, i) => actors.set(`dray:${i ? "walk" : "idle"}`, paint(rows, { X: "#3a3834", x: "#22201c", o: "#6a6860" })))
  WALKER.forEach((rows, i) => actors.set(`rust_plow:${i ? "walk" : "idle"}`, paint(rows, { X: "#3a4440", x: "#242c28", o: "#5a6a60" })))
  WALKER.forEach((rows, i) => actors.set(`post:${i ? "walk" : "idle"}`, paint(rows, { X: "#4a4840", x: "#2a2820", o: "#8a8680" })))
  DRONE.forEach((rows, i) => actors.set(`bloom:${i ? "walk" : "idle"}`, paint(rows, { x: "#4a5850", o: "#6a8870" })))
  DRONE.forEach((rows, i) => actors.set(`cluster:${i ? "walk" : "idle"}`, paint(rows, { x: "#5a6868", o: "#3ecfc2" })))
  DRONE.forEach((rows, i) => actors.set(`fog:${i ? "walk" : "idle"}`, paint(rows, { x: "#8a8a86", o: "#c0c0bc" })))
  WALKER.forEach((rows, i) => actors.set(`ball:${i ? "walk" : "idle"}`, paint(rows, { X: "#2a2c2e", x: "#1a1c1e", o: "#5a5854" })))
  WALKER.forEach((rows, i) => actors.set(`amalgam:${i ? "walk" : "idle"}`, paint(rows, { X: "#3a4448", x: "#243034", o: "#3ecfc2" })))
  actors.set("sentry_gun:idle", paint(GEAR.sentry[0], GEAR.sentry[1]))
  for (let i = 0; i < 6; i++) props.set(`tree:${i}`, tree(11 + i * 17))
  for (let i = 0; i < 4; i++) props.set(`ruin:${i}`, ruin(40 + i * 19))
  for (let i = 0; i < 3; i++) {
    props.set(`wire:${i}`, wire(7 + i * 13))
    props.set(`wreck:${i}`, wreck(19 + i * 11))
    props.set(`post:${i}`, post(3 + i * 9))
    props.set(`teeth:${i}`, teeth(29 + i * 15))
  }
  const stump = cv(7, 4)
  rects(stump.getContext("2d")!, "#3a2a1c", [[1, 1, 5, 2]])
  props.set("stump:0", stump)
  const rubble = cv(10, 5)
  rects(rubble.getContext("2d")!, "#3a342c", [[1, 3, 3, 1], [5, 2, 3, 2], [3, 3, 2, 1]])
  props.set("rubble:0", rubble)
  props.set("crate:0", paint(CRATE, { C: "#3a3428", c: "#5a5044" }))
  props.set("heli:0", heli())
  props.set("mine:0", paint(GEAR.mines[0], GEAR.mines[1]))
  vehicles.set("jeep", jeep())
  vehicles.set("apc", apc())
  vehicles.set("plow", tank())
  vehicles.set("tank", tank())
  vehicles.set("bike", bike())
  vehicles.set("buggy", jeep())
  vehicles.set("hover", hover())
  vehicles.set("mrap", apc())
  vehicles.set("hex_scout", tank())
  vehicles.set("hex_line", tank())
  vehicles.set("hex_siege", tank())
  vehicles.set("truck", apc())
  vehicles.set("tech", jeep())
  vehicles.set("suv", jeep())
  vehicles.set("steed", bike())
  vehicles.set("cart", jeep())
  vehicles.set("mule", apc())
  vehicles.set("mlrs", tank())
  vehicles.set("ifv", apc())
  vehicles.set("mbt", tank())
  vehicles.set("ugv", tank())
  vehicles.set("tube", tank())
  vehicles.set("drill", tank())
  vehicles.set("pump", jeep())
  vehicles.set("cutter", jeep())
  for (const id of Object.keys(GEAR)) actors.set(`gear:${id}`, paint(GEAR[id][0], GEAR[id][1]))
}

boot()

export function actor(kind: string, pose: Pose, flipX: boolean): HTMLCanvasElement | null {
  const use = pose === "dep" && actors.has(`${kind}:dep`) ? "dep" : pose === "walk" && actors.has(`${kind}:walk`) ? "walk" : "idle"
  const c = actors.get(`${kind}:${use}`) ?? actors.get(`${kind}:idle`)
  if (!c) return null
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
  if (kind === "drone" || kind === "scoot" || kind === "walker") return { head: "#3ecfc2", skin: "#3ecfc2", body: "#3a403e", limb: "#2a2824", boot: "#1a1a18" }
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

export function cargo(kind: string | null): HTMLCanvasElement {
  const key = kind ?? ""
  const hit = cargos.get(key)
  if (hit) return hit
  const c = (kind && (actor(kind, "idle", false) ?? vehicleFlat(kind))) || scenery("crate")!
  cargos.set(key, c)
  return c
}

function vehicleFlat(id: string) {
  const v = vehicles.get(id)
  if (!v) return null
  const c = cv(v.body.width + 6, v.body.height + 8)
  const g = c.getContext("2d")!
  g.drawImage(v.body, 3, 4)
  g.drawImage(v.turret, 3 + v.mount[0] + 8, 4 + v.mount[1])
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
  const cols = ["#241f1c", "#1c1916", "#322c28", "#3a342c", "#201c18"]
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = cols[(rand() * cols.length) | 0]
    g.fillRect((rand() * 128) | 0, (rand() * 128) | 0, 1, 1)
  }
  for (let i = 0; i < 14; i++) {
    const x = 2 + ((rand() * 124) | 0)
    const y = 3 + ((rand() * 122) | 0)
    g.fillStyle = "#3a342c"
    g.fillRect(x, y, 1, 2)
  }
  return mud
}
