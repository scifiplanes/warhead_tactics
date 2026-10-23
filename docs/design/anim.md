# View foot / procedural motion

View-only (`src/view/anim.ts`). Sim stays headless. Cache keyed by body id.

## Infantry modes

| Mode | When |
|------|------|
| `stun` | `stun > 0` |
| `crawl` | no living legs |
| `deploy` | deploy weapon, not moving |
| `fire` | recent shot, standing |
| `move` | `moved` |
| `idle` | else |

Path gait locks to travel. Recoil and hp/stun hits kick the chest. Gun wedge → `hdg`. Tracers and night beams leave the stamp muzzle (`gunTipAt`), including deploy and aim-up.

## Chunks

Hips follow sim. Chest lags (lean, recoil, hit impulse, brace). Head lags chest (look + breath). Idle breath is id-phased. 161 layer offsets only.

## Plant loop (stretch)

Swing → plant → load → release when tip–root > rest×segs×1.35 (soft) or foot rest×1.4 (biped).

- **Biped feet** — ground kinds not in the no-feet set; limp = one side; soft hangers run with feet.
- **Brace tip** — idle/deploy/fire near cover: drawn `cover` chain toward the hold.
- **Soft modules** — Verlet under the stamp.

## Soft modules

| Goal | Kinds |
|------|-------|
| `seek` | coil, reach |
| `root` | bloom, post |
| `gait` | walker, tract, dray, roller, slab, rust_plow, mutant |
| `trail` | amalgam, flake, ball, shambler, doghead, pighead, goathead |
| `billow` | fog, kite, mast, crowhead |
| `hover` | drone, scoot, copter, hawk, mid, cluster |
| `cover` | infantry brace tip (any armed foot body at a hold) |

No feet: drone, scoot, kite, fog, copter, hawk, mid, cluster, ball, post, airframes.

## Limbs

One leg → limp. Zero → crawl. No arms → no gun / no brace tip.

## Vehicles / cables

Hull bob + turn lean. Turret lag. Octacopter lines: pinned screen Verlet.
