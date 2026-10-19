# Changelog archive

Moved from `docs/changelog.md` when that file outgrows its cap.

- **2026-10-18 Feat:** the pause menu lists the keys. Group shows Q and spread shows E. `index.html`
- **2026-10-18 Fix:** red labels are squad losses. An enemy reads DOWN, in gray. `src/view/draw.ts`
- **2026-10-18 Fix:** a hull sitting on a ruin or a body takes no collision damage. `src/sim/world.ts`
- **2026-10-18 Fix:** only the first Cell is the Lead. The LZ arrow, its timers, the flare column, and the craft read on the field. An inbound drop lights its own flare. `src/view/draw.ts`
- **2026-10-18 Fix:** the starter soldier is named Lead. `src/content/catalog.ts`
- **2026-10-18 Fix:** health bars stay gray, turn gold, then red as a body is hurt. `src/view/draw.ts`
- **2026-10-18 Feat:** muffled distant thuds, with volume and mute in the system menu. `src/view/audio.ts`
- **2026-10-18 Fix:** the field camera sits at half its old zoom. `src/view/draw.ts`
- **2026-10-18 Fix:** the ABOARD / TIGHT / WIDE strip is gone. The group and spread buttons already say the next step. `index.html`
- **2026-10-18 Fix:** grouping no longer slides the mud. The flare arms, the craft waits, then the squad loads one by one. Corpses and parts keep the figure they came from. Space, Shift, and a press-hold stick are back. `src/sim/world.ts`
- **2026-10-18 Fix:** the craft timer runs while the commander stays in the LZ, the first unit is the squad center, deck copies keep their portraits, a short deploy says so, and the campaign can be restarted. `src/sim/world.ts`
- **2026-10-18 Fix:** research costs twenty deploys of the card. `src/content/catalog.ts`
- **2026-10-18 Fix:** corpses and parts draw as small ground marks. `src/view/draw.ts`
- **2026-10-18 Fix:** the LZ marks first. Reaching it lights the flare, then the craft needs a long still wait. `src/sim/world.ts`
- **2026-10-18 Fix:** Rust guns throw a bolt that can miss, and a feral bite needs contact. `src/sim/world.ts`
- **2026-10-18 Feat:** edge marks for drops, the flare, empty hulls, and stragglers. Research costs five deploys. Corpses and parts stay visible, and the phone toolbar sits clear of the stick. `src/view/draw.ts`
- **2026-10-18 Fix:** crewed hulls steer and accelerate instead of sliding with the stick. `src/sim/world.ts`
- **2026-10-18 Fix:** the file glides between tight and wide, and the wide camera pulls back further. `src/sim/world.ts`
- **2026-10-18 Fix:** the opening squad is the deck's units and vehicles, not three extra Cells. `src/sim/world.ts`
- **2026-10-18 Feat:** camera eases out as the file spreads. `src/view/draw.ts`
- **2026-10-18 Feat:** analysis brackets, and credits that buy researched finds for each deployment. `src/meta/profile.ts`
- **2026-10-18 Feat:** file spacing steps, ground marks, corpses, and parts that fly off a hit. `src/sim/world.ts`
- **2026-10-18 Fix:** figures are helmet, coat, rifle, and two legs. The old rows drew extra limbs. `src/view/sprites.ts`
- **2026-10-18 Design:** field and chrome back to drab no-man's-land. Prototype art was the wrong direction. `src/view/sprites.ts`
- **2026-10-18 Feat:** pixel field, counted deck, and the dropzone roster so a run is a battlefield. `src/view/draw.ts`
- **2026-10-18 Feat:** headless deck run so a seeded bot can play the section. `src/sim/world.ts`
