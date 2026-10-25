const KEY = "warhead-tactics-audio"

export type AudioPrefs = { vol: number; mute: boolean }

export function loadAudio(): AudioPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { vol: 0.55, mute: false }
    const p = JSON.parse(raw) as AudioPrefs
    const vol = typeof p.vol === "number" ? Math.min(1, Math.max(0, p.vol)) : 0.55
    return { vol, mute: Boolean(p.mute) }
  } catch {
    return { vol: 0.55, mute: false }
  }
}

function saveAudio(p: AudioPrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* private mode */
  }
}

let prefs = loadAudio()
let ctx: AudioContext | null = null
let bus: GainNode | null = null
let noise: AudioBuffer | null = null
let last = 0
let lastPop = 0

export function audioPrefs() {
  return prefs
}

export function setAudio(next: AudioPrefs) {
  prefs = { vol: Math.min(1, Math.max(0, next.vol)), mute: next.mute }
  saveAudio(prefs)
  if (bus) bus.gain.value = prefs.mute ? 0 : prefs.vol * 0.7
}

export function unlockAudio() {
  const c = context()
  if (c.state === "suspended") void c.resume()
}

function context() {
  if (ctx && bus) return ctx
  ctx = new AudioContext()
  const low = ctx.createBiquadFilter()
  low.type = "lowpass"
  low.frequency.value = 220
  low.Q.value = 0.5
  bus = ctx.createGain()
  bus.gain.value = prefs.mute ? 0 : prefs.vol * 0.7
  bus.connect(low)
  low.connect(ctx.destination)
  noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return ctx
}

export function thuds(bursts: { tint: string }[]) {
  if (!bursts.length || prefs.mute || prefs.vol <= 0) return
  const c = context()
  if (!bus || !noise || c.state !== "running") return
  const heavy = bursts.some((b) => b.tint === "flash" || b.tint === "dust")
  const now = c.currentTime
  if (now - last < (heavy ? 0.06 : 0.16)) return
  last = now
  const body = c.createOscillator()
  const gain = c.createGain()
  body.type = "sine"
  body.frequency.setValueAtTime(heavy ? 52 : 74, now)
  body.frequency.exponentialRampToValueAtTime(28, now + (heavy ? 0.5 : 0.26))
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(heavy ? 0.55 : 0.2, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (heavy ? 0.62 : 0.32))
  body.connect(gain)
  gain.connect(bus)
  body.start(now)
  body.stop(now + 0.7)
  const grit = c.createBufferSource()
  const veil = c.createGain()
  grit.buffer = noise
  veil.gain.setValueAtTime(heavy ? 0.22 : 0.08, now)
  veil.gain.exponentialRampToValueAtTime(0.0001, now + (heavy ? 0.4 : 0.18))
  grit.connect(veil)
  veil.connect(bus)
  grit.start(now)
  grit.stop(now + 0.45)
}

/** Muffled brass crack for section powder (hip and set). Quieter than hit thuds. */
export function pops(n: number) {
  if (n <= 0 || prefs.mute || prefs.vol <= 0) return
  const c = context()
  if (!bus || !noise || c.state !== "running") return
  const now = c.currentTime
  if (now - lastPop < 0.05) return
  lastPop = now
  const body = c.createOscillator()
  const gain = c.createGain()
  body.type = "triangle"
  body.frequency.setValueAtTime(420, now)
  body.frequency.exponentialRampToValueAtTime(90, now + 0.07)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)
  body.connect(gain)
  gain.connect(bus)
  body.start(now)
  body.stop(now + 0.12)
  const grit = c.createBufferSource()
  const veil = c.createGain()
  grit.buffer = noise
  veil.gain.setValueAtTime(0.06, now)
  veil.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
  grit.connect(veil)
  veil.connect(bus)
  grit.start(now)
  grit.stop(now + 0.08)
}
