# View foot / procedural motion

View-only (`src/view/anim.ts`). Sim stays headless. Cache keyed by body id.

## Infantry modes

| Mode | When |
|------|------|
| `stun` | `stun > 0` |
| `crawl` | no living legs |
| `reload` | powder mag empty, reload clock running |
| `deploy` | deploy weapon, not moving |
| `fire` | recent shot, standing |
| `move` | `moved` |
| `idle` | else |

Reload tips the gun, seats a 2×3 mag chip, and keeps a dep torso (walk legs if moving).

Path gait locks to travel. Recoil and hp/stun hits kick the chest. Gun wedge → `hdg`. Tracers, muzzle flashes, and night beams leave the stamp muzzle (`gunTipAt`), including deploy and aim-up. Flash shape is the weapon signature; at night every flash punches the veil, but only section flashes light combat sight (`src/content/muzzle.ts`).

## Chunks

Hips follow sim. Chest lags (lean, recoil, hit impulse, brace). Head lags chest (look + breath). Idle breath is id-phased. Layer offsets only on friendly soldiers — flesh stamps stay solid.

## Plant loop (stretch)

Swing → plant → load → release when tip–root > rest×segs×1.35 (soft) or foot rest×1.4 (biped).

- **Biped feet** — plant lean still feeds chest; leg *layer* slide is off (gait = walk/idle stamp only — ±1px leg slide looked comical at 13px).
- **Brace tip** — idle/deploy/fire near cover: drawn `cover` chain toward the hold.
- **Soft modules** — Verlet under the stamp.

## Soft modules

| Goal | Kinds |
|------|-------|
| `seek` | coil, reach |
| `root` | bloom, post |
| `cover` | infantry brace tip (any armed foot body at a hold) |
| *(none)* | hover / billow / trail / gait — tips floated off stamps as offset pixels |

No feet: drone, scoot, kite, fog, copter, hawk, mid, cluster, ball, post, airframes.

## Limbs

One leg → limp. Zero → crawl. No arms → no gun / no brace tip.

## Vehicles / cables

Hull bob + turn lean. Turret lag. Octacopter lines: pinned screen Verlet.
