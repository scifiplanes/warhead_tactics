const KEY = "warhead-tactics-audio"

/** Tiny silent WAV — opens the media channel on older iOS. */
const SILENCE =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="

export type AudioPrefs = { vol: number; mute: boolean }

type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

type AudioSessionNav = Navigator & {
  audioSession?: { type: string }
}

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
let media: HTMLAudioElement | null = null

export function audioPrefs() {
  return prefs
}

export function setAudio(next: AudioPrefs) {
  prefs = { vol: Math.min(1, Math.max(0, next.vol)), mute: next.mute }
  saveAudio(prefs)
  if (bus) bus.gain.value = prefs.mute ? 0 : prefs.vol * 0.85
}

function AudioCtor(): typeof AudioContext | null {
  const w = window as WebkitWindow
  return window.AudioContext || w.webkitAudioContext || null
}

/** iOS 17+: Web Audio defaults to ambient and dies under the mute switch. */
function setPlaybackSession() {
  try {
    const nav = navigator as AudioSessionNav
    if (nav.audioSession) nav.audioSession.type = "playback"
  } catch {
    /* unsupported */
  }
}

/** Older iOS: a media element pull puts Web Audio on the audible channel. */
function unlockMediaElement() {
  if (!media) {
    media = new Audio(SILENCE)
    media.setAttribute("playsinline", "true")
    media.volume = 0.01
  }
  void media.play().catch(() => {})
}

/** Build graph only from a user gesture — never from rAF (iOS stays suspended). */
function ensureGraph(): AudioContext | null {
  if (ctx && bus && noise) return ctx
  const Ctor = AudioCtor()
  if (!Ctor) return null
  ctx = new Ctor()
  // Muffled, but mid enough for phone speakers (old 220Hz cut killed pops/thuds).
  const low = ctx.createBiquadFilter()
  low.type = "lowpass"
  low.frequency.value = 1100
  low.Q.value = 0.6
  bus = ctx.createGain()
  bus.gain.value = prefs.mute ? 0 : prefs.vol * 0.85
  bus.connect(low)
  low.connect(ctx.destination)
  noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return ctx
}

/** Near-silent buffer started in-gesture so Safari treats the graph as live. */
function tickPrime(c: AudioContext) {
  if (!bus || !noise) return
  const now = c.currentTime
  const grit = c.createBufferSource()
  const veil = c.createGain()
  grit.buffer = noise
  veil.gain.value = 0.0001
  grit.connect(veil)
  veil.connect(bus)
  grit.start(now)
  grit.stop(now + 0.03)
}

/** Call from pointer/touch/click. Awaits resume so a follow-up thud can play. */
export async function unlockAudio() {
  setPlaybackSession()
  unlockMediaElement()
  const c = ensureGraph()
  if (!c) return
  tickPrime(c)
  const state = c.state as string
  if (state === "suspended" || state === "interrupted") {
    try {
      await c.resume()
    } catch {
      /* gesture lost */
    }
    if (ctx) tickPrime(ctx)
  }
}

function live(): AudioContext | null {
  if (!ctx || !bus || !noise) return null
  const state = ctx.state as string
  if (state === "suspended" || state === "interrupted") {
    setPlaybackSession()
    void ctx.resume()
    return null
  }
  if (ctx.state !== "running") return null
  return ctx
}

export function thuds(bursts: { tint: string }[]) {
  if (!bursts.length || prefs.mute || prefs.vol <= 0) return
  const c = live()
  if (!c || !bus || !noise) return
  const heavy = bursts.some((b) => b.tint === "flash" || b.tint === "dust")
  const now = c.currentTime
  if (now - last < (heavy ? 0.06 : 0.16)) return
  last = now
  // Fundamentals in the phone-speaker band; grit carries the "distant mud" read.
  const body = c.createOscillator()
  const gain = c.createGain()
  body.type = "sine"
  body.frequency.setValueAtTime(heavy ? 130 : 190, now)
  body.frequency.exponentialRampToValueAtTime(heavy ? 55 : 70, now + (heavy ? 0.45 : 0.24))
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(heavy ? 0.7 : 0.32, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (heavy ? 0.55 : 0.28))
  body.connect(gain)
  gain.connect(bus)
  body.start(now)
  body.stop(now + 0.6)
  const grit = c.createBufferSource()
  const veil = c.createGain()
  grit.buffer = noise
  veil.gain.setValueAtTime(heavy ? 0.28 : 0.12, now)
  veil.gain.exponentialRampToValueAtTime(0.0001, now + (heavy ? 0.35 : 0.16))
  grit.connect(veil)
  veil.connect(bus)
  grit.start(now)
  grit.stop(now + 0.4)
}

/** Muffled brass crack for section powder (hip and set). Quieter than hit thuds. */
export function pops(n: number) {
  if (n <= 0 || prefs.mute || prefs.vol <= 0) return
  const c = live()
  if (!c || !bus || !noise) return
  const now = c.currentTime
  if (now - lastPop < 0.05) return
  lastPop = now
  const body = c.createOscillator()
  const gain = c.createGain()
  body.type = "triangle"
  body.frequency.setValueAtTime(520, now)
  body.frequency.exponentialRampToValueAtTime(140, now + 0.07)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)
  body.connect(gain)
  gain.connect(bus)
  body.start(now)
  body.stop(now + 0.12)
  const grit = c.createBufferSource()
  const veil = c.createGain()
  grit.buffer = noise
  veil.gain.setValueAtTime(0.1, now)
  veil.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
  grit.connect(veil)
  veil.connect(bus)
  grit.start(now)
  grit.stop(now + 0.08)
}
