# Changelog

Newest first. Older → `docs/changelog-archive.md`.

- **2026-10-23 Fix:** tracers and night beams leave the rotated gun tip (deploy / aim-up), not a flat body offset. `src/view/sprites.ts` `src/view/draw.ts` `src/sim/world.ts`
- **2026-10-23 Feat:** soft modules on every foot hostile, hover sway, drawn brace tip, hit/stun impulse, soft+biped together. `src/view/anim.ts` `docs/design/anim.md`
- **2026-10-23 Feat:** stretch plant loop for biped feet and soft tips, hips→chest→head lag, idle breath; hostiles and infantry. `src/view/anim.ts` `docs/design/anim.md`
- **2026-10-23 Feat:** foot modes (deploy/fire/stun/crawl/limp), soft tip goals, hull bob and turret lag, shared gun muzzle reach. `src/view/anim.ts` `src/view/draw.ts` `src/content/muzzle.ts` `docs/design/anim.md`
- **2026-10-23 Fix:** tracers and night beams leave from the gun tip, not the head. `src/sim/world.ts` `src/view/draw.ts`
- **2026-10-23 Fix:** gun wedge rotates to `hdg` toward the fire target, not a short-range guess. `src/sim/world.ts` `src/view/sprites.ts` `src/view/anim.ts` `src/view/draw.ts`
- **2026-10-23 Feat:** feet and soft tips plant toward nearby ruins, wrecks, posts, and teeth. `src/view/anim.ts` `src/view/draw.ts`
- **2026-10-23 Feat:** view foot system — 161 layers, path gait, soft chains on weird hostiles/walkers, sagging airdrop cables. `src/view/anim.ts` `src/view/sprites.ts` `src/view/draw.ts`
- **2026-10-22 Fix:** corpses, parts, and other ground marks draw under living bodies. `src/view/draw.ts`
- **2026-10-22 Feat:** deck body gear outfits the Lead at step-off and rides later unit or hull airdrops already fitted; laser sight joins the optic slot. `src/sim/world.ts` `src/content/catalog.ts` `src/view/sprites.ts`
- **2026-10-22 Feat:** composite goat/crow screens, holdout field finds, named shells Vos/Sten/Tave, distinct coil/bloom/fog/amalgam stacks, and rust sleeper hulls. `src/sim/world.ts` `src/content/catalog.ts` `src/view/sprites.ts`
- **2026-10-22 Fix:** ruins are high-angle foundation chunks (L/U/slab/container) with top face and thickness — not flat wall strips. `src/view/sprites.ts`
- **2026-10-22 Design:** ruins and props use 161 high-angle mass — foreshortened trees/wire/wrecks/posts/teeth/crate, contact blobs, edge shade. `src/view/sprites.ts`
- **2026-10-22 Design:** lock 161 high-angle stack for infantry and NPCs — foreshortened coat mass, ferals dirtier, walkers/drones same language; gun wedge on friendlies. `src/view/sprites.ts`
- **2026-10-22 Design:** richer mud (wet patches, ruts, ash), 1px edge shade on soldier and hull bodies, ground contact shadows for infantry/vehicles/props, heavier crater/burn/splat marks, distinct hull families (truck, MBT, MLRS, HEX, UGV, MRAP), walker single dark optic, dirtier corpse palette. `src/view/sprites.ts` `src/view/draw.ts`
- **2026-10-22 Design:** soldier sprites keep the old proportions with a muted face; the held gun is stamped from the loadout so rifle, SMG, shotgun, sniper, rail, MG, handgun, lob, bow, and blade read apart, and optic, mag, brace, grip, and muzzle mark the gun. `src/view/sprites.ts` `src/view/draw.ts`
- **2026-10-21 Design:** FPV hits harder and wider so the inbound reads as a real strike. `src/sim/world.ts`
- **2026-10-21 Design:** FPV is an over-the-horizon inbound like CAS, priced above a blade, and rides the JTAC and laser stack. `src/content/catalog.ts` `src/sim/world.ts`
- **2026-10-21 Fix:** Purge and Haul finish marks read 8/8 and 3/3; no progress chatter. `src/sim/world.ts`
- **2026-10-21 Fix:** the field HUD keeps only the clock; lost, drop, and bounty pills are gone. `src/main.ts` `index.html`
- **2026-10-21 Feat:** weapons have primary and secondary hands; combat picks by range and fire rules; handguns, SMG, shotguns, and rail join the roster. `src/content/catalog.ts` `src/sim/world.ts`
- **2026-10-21 Fix:** a blade uses its reach on flesh and no longer aims the lamp at gun-range ghosts. `src/sim/world.ts`
- **2026-10-21 Fix:** night beam glow no longer sits on the Lead's rifle; soldier gun pixels read on the mud. `src/view/draw.ts` `src/view/sprites.ts`
- **2026-10-21 Design:** research stock is economy-gated: no per-card max, copies stop at the deck cap, free-deploy cards still pay a rifle-floor research step. `src/content/catalog.ts` `src/meta/profile.ts`
- **2026-10-21 Feat:** research depth sets deck copies; each next research of a find costs another step and reads MORE; extract lists new research. `src/meta/profile.ts` `src/main.ts`
- **2026-10-21 Feat:** pending research is a count on the deck; the sheet groups by kind and puts affordable finds first. `src/main.ts` `index.html`
- **2026-10-21 Fix:** melee bites a hull's skin, and a 0 hp hull dies instead of pinning the pack. `src/sim/world.ts`
- **2026-10-21 Fix:** a ruin stutter no longer stacks scrapes into a quick kill. `src/sim/world.ts`
- **2026-10-21 Feat:** guns take optic, grip, mag, brace, and muzzle cards; a new gun dumps those parts onto the mud as themselves, not crates. `src/content/catalog.ts` `src/sim/world.ts` `src/view/draw.ts`
- **2026-10-21 Feat:** gunship, rocket, and bomber are toolbar call-ins: crate pickup, press spawns a circling sortie bird, one at a time, cooldown from the press. Gunboat stays leashed. `src/content/catalog.ts` `src/sim/world.ts`
- **2026-10-21 Fix:** a bite scrapes a hull, and the tank, plow, and HEX walkers hold more steel. `src/sim/world.ts` `src/content/catalog.ts`
- **2026-10-21 Feat:** airframes circle the Lead aloft with a ground shadow, pull toward a fight, and keep their guns; rocket and bomber lob from the air. `src/sim/world.ts` `src/view/draw.ts`
- **2026-10-21 Fix:** a hull scrapes cover for light wear instead of a hard hit. `src/sim/world.ts`
- **2026-10-21 Fix:** night shade eases in with dusk instead of snapping on. `src/view/draw.ts`
- **2026-10-21 Fix:** a cooling toolbar slot drains, dims its icon, and shows a gold count. `src/main.ts` `index.html`
- **2026-10-21 Fix:** friendly health bars share the deploy tick's slot and draw above night shade. The day cycle runs a bit longer. `src/view/draw.ts` `src/sim/world.ts`
