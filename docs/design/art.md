# Art bible — dense pixel illustration

Global visual language for every surface: characters, environments, props, items, UI, icons, VFX, animation, loading, promo. Original designs only. One style; do not re-invent per asset.

**Assumptions (from product):** mobile web · high-angle foreshortened field camera · survivors-run readability over spectacle.

---

## Pitch

Carefully shaped pixel clusters, stepped ramps with hue shift, and intentional density. Focal assets carry intricate cloth, metal, flesh, and ruin detail; quiet ground and distance stay simpler so hierarchy holds at phone size.

## Locked palette

Author in these stops. No off-ramp pastels, neon fills, or full-chroma skins.

| Role | Hex | Use |
|------|-----|-----|
| Ink | `#0c0b09` | silhouette holes, deep shade |
| Mud 0–3 | `#1a1612` `#221e1a` `#2e2a24` `#3a3630` | ground, ash, ruts |
| Coat 0–4 | `#2a2824` `#3a3832` `#4a4640` `#5a564e` `#6a655c` | cloth, drab, timber |
| Face | `#4a4640` `#5a5448` | muted skin only (1–2 px) |
| Steel 0–3 | `#1e1c18` `#3a3834` `#6e6e6e` `#a8a49c` | guns, hulls, chrome |
| Oxide | `#6a4030` `#8a5040` | Rust, burns, rare warn |
| Blood | `#5a1818` `#a32020` | splat, danger UI |
| Gold | `#e1c15a` | title, flare, toast, cooling count, health peak |
| Health mid/low | `#e1c15a` → `#a32020` | friendly bar only |
| Night | multiply toward `#0c0b09` | shade; never recolor sprites |

Color is scarce: gold, blood, oxide, health. Everything else is the drab ramp.

## Silhouette & proportion

- **Camera:** high-angle foreshortened mass — top face light, wall face darker. Not front mannequin, not flat side-view strips.
- **Infantry (focal):** head ~14–18% of body height · torso coat mass ~36–40% · legs ~36–40%. Stand-C plant: short wide boots, readable stance. Small vs hulls.
- **Friendlies:** dark gun wedge in a fixed pocket; wedge rotates to aim. Kit bits (optic/mag/brace/grip/muzzle) are 1–3 px marks on that wedge.
- **Ferals / flesh:** same foreshortened stack, dirtier ramps, no gun wedge.
- **Hulls / walkers / drones:** same mass language — top plate + thickness + one dark optic or hatch — not cubes or orthographic boxes. HEX is a bipedal mech (planted legs + torso), not a tracked box.
- **Props / ruins:** foundation chunks (L/U pad, slab, torn container); burnt timber, wire, wrecks, posts, teeth share unit foreshortening + contact blob.

## Material language

| Material | Cluster habit |
|----------|----------------|
| Cloth / coat | 3–5 step ramp; 1 px fold bands; sleeve darker than chest; no noise dither inside the figure |
| Foliage / timber | burnt verticals; edge shade; sparse ash speckles on ground only |
| Stone / ruin | light top face, mid wall, ink shade; broken corner steps of 1–2 px |
| Metal / gun | steel ramp; hard 1 px rim; optic as brighter pin |
| Flesh / feral | dirtier coat ramp; broken silhouette teeth; softer limb tips |
| Chrome UI | steel grayscale; gold/blood accents only |

## Lighting hierarchy

1. Key from above-forward (high-angle): tops of helmet, shoulders, hull plates lightest.
2. Form shade: 1 px edge dark on bodies and props.
3. Contact: small soft ground blob under feet / wheels / props (does not break pixel contour of the figure).
4. Night / weather: global multiply + sight cut; night beams are rare light.
5. Accents: flare column, pickup flash, health bar — gold; never flood the field.

## Asset specs (measurable)

Nearest-neighbor only. No bilinear, no AI upsample as final.

| Asset | Native size | Notes |
|-------|-------------|--------|
| Field buffer | CSS ÷3 (narrow) / ÷4 (wide); min ~160×120 | whole field pixel grid |
| Camera zoom | base **4.5** (narrow buf) / **6** (wide); eases out with gap | blit is 1:1 — do not cut zoom to “fit” huge sprites |
| Infantry / feral body | **16×13** idle/walk · **14×10** dep; canvas tight | dense coat clusters inside; no pad rows; widen ≤16; goat/crow have own head mass |
| Section / rust flyers | **8×6** family | drone / scoot / kite / flake / cluster distinct; copter / hawk / mid are section-only stamps |
| Gun HOLD stamp | rifle x:9 y:7; pocket on coat; parts readable at 1:1 | stock / receiver / barrel / optic |
| Named shell / hero still | **64×48** max | promo, load, extract portrait only |
| Hull (light → MBT) | **14×8** (bike) · **16×10** (steed/cart) · **18×10–12** (tube/pump) · **18×11** (jeep/buggy/cutter) · **20×11–12** (tech/suv/mule) · **22×14–16** (drill/mrap) · **24×14** (apc/ifv/mlrs) · **24×16** (tank/plow) · **26×18** (mbt) · **28×12** (truck) · **16×10** (ugv) · **22×18** (hex) | one stamp per deck hull; not padded doubles |
| Prop / ruin chunk | **18×16** (tree) · **26×12** (wire) · **22×14** (wreck) · **14×14** (post) · **22×12** (teeth) · **24×16** (ruin) · **10×6** (stump) · **12×6** (rubble) | top+wall faces; quieter than units |
| Ground tile / mud | **128×128** seamless | wet, rut, ash; quieter than figures |
| World hex cell | **64×64** per ground | open / timber / yard / bog / teeth; clipped to hex; light fog on unvisited |
| HUD / toolbar icon | **16×16** or **24×24** authored | never downscale a painting |
| Deck / research mark | **12×12** or **16×16** | one silhouette verb |
| Toast / plate type | VGA bitmap font; ≥12 CSS px | gold / ink / muted only |
| Touch target | ≥44 CSS px hit | icon may be smaller inside |
| VFX cell | 1–3 px cores; soft bloom ≤2 px | contour of sprite stays hard |
| Muzzle flash | 1–7 px along aim; shape per gun | rifle cross · SMG dot · shotgun cone · sniper spike · rail bolt · MG bloom · lob puff · rust taser zig-zag · rust oxide dot (later guns); also a radial night light; blades/bows none |
| Loading / promo key | same palette + foreshortening; 1–2 focal figures | no new style |

World footprint: keep shipped buffer sizes (table above). Densify with clusters inside the grid — never grow canvases to fake detail.

## UI / icons

- Author at 16 or 24; thin 1 px edge; fill from steel/coat ramps. Worn terminal, not stickers.
- One mass verb (gun wedge, crate, hull, chevron). No skulls, bones, emoji, comic props, thick outlines, or toy colors.
- Accents: gold flare / cooling digit; blood only for true danger — never bright candy red crosses.
- Cool-down: dim fill + gold digit; do not animate icon noise.
- Brackets, edge pins: 1 px lines, gold or ink; Tracker brackets empty.
- Intent marks: gold LZ pad + ring; steel EXIT chevron + ring (not oxide); stash is muted square.

## Motion

See also `docs/design/anim.md`. Style rules:

- Expressive but readable: hips → chest lag → head lag; idle breath id-phased.
- Foot plant / stretch; soft modules on weird hostiles; hull bob + turret lag.
- Frame budget: 2–4 walk frames; hold silhouette between frames — no flicker of 1 px ornaments.
- Recoil / hit: short chest kick; limbs stay clustered.
- Cables / soft tips: Verlet ok; drawn tips stay on-palette hard pixels.

## Mistakes to avoid

1. Random pixel noise or film grain inside silhouettes  
2. Inconsistent density (hero sharp, prop blob, icon photoreal)  
3. Detail that vanishes or strobes at ÷3–4 display  
4. NN / AI upscale of low-res as “detail”  
5. Front mannequin, tall stick props, coat-door slabs, flat wall-strip ruins  
6. Color spam (full chroma kits, rainbow HUD)  
7. Soft glow that erases pixel edges  
8. Downscaled paintings as toolbar icons  
9. Cartoon / sticker HUD (skulls, dynamite, thick outlines, candy fills)  
10. Copying another game’s characters, logos, or trademarked silhouettes  

## Production note

Every new asset is authored to this bible. Prior exploration PNGs under `docs/art-examples/` are not reference and must not steer style.
