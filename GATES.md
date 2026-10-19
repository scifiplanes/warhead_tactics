# Gates: warhead tactics slice

OWNS: src/**, test/**, docs/**, public/**, index.html, package.json, vite.config.ts, tsconfig.json

Scope: first playable deck run, headless checks, mobile web shell

- [x] G0: ledger lint reports LINT OK
  CHECK: node /Users/pavlosavchuk/.claude/skills/unlazy/scripts/gate-lint.mjs GATES.md
  EXPECT: LINT OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=435cc5c9b957c673e7d946aca6ab0ea64f70c46ba3828e07364982241c0fcb96; exit=0; EXPECT=matched; output-sha256=48630b7361dd44ee870917b12c3d19b9d7bdea738aaca16bb04d4cab83b772d2; output-bytes=8; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G1: a dropped unit dies when the player never arrives
  CHECK: npx vitest run -t "dropped unit dies if the player never arrives"
  EXPECT: GATE drop-death ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=be820c7c37c3c52321d8932c7e4b349130280037b77725d16c7f9f7dcc675c81; exit=0; EXPECT=matched; output-sha256=49bffecf4cbd888dc2dfe45738e592453884f4cadc4ad38c836779e4815ddbea; output-bytes=616; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G2: gear fits an eligible body and the toolbar lists frag
  CHECK: npx vitest run -t "gear fits an eligible body and shows on the toolbar"
  EXPECT: GATE gear-toolbar ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=4bddda726fbfd4195fe58f018c6ccc57a4de63ff4a3cf09f5a32761583791700; exit=0; EXPECT=matched; output-sha256=76cd76a45b7bc2aa4721bc556082302d73ee8bb56156e0f7d277f5069b8f95aa; output-bytes=624; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G3: holding group boards one body per tick onto alternating vehicles
  CHECK: npx vitest run -t "hold boards one body per tick and alternates vehicles"
  EXPECT: GATE board-alternate ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=e7b483e44a5e32561acc04a5280c53c5990f45856c598f467af66c2db0483600; exit=0; EXPECT=matched; output-sha256=edd57b001cdad6253ba287f6de9db97edf0fed8ae9e51e363029d679fd0bcfb9; output-bytes=629; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G4: spread disembarks a body before the file goes loose
  CHECK: npx vitest run -t "spread disembarks before it loosens the file"
  EXPECT: GATE spread-exit ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=5808fc0ce57e25242c92ccacb8ed1fe76f7235a0fa7ff279c976b502cab3beec; exit=0; EXPECT=matched; output-sha256=207ce699ca8504a9b6786f4b6729a4a938f4590f83145e4ef22450c4dd47553f; output-bytes=616; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G5: a fast drive leaves a dismounted body behind
  CHECK: npx vitest run -t "fast drive leaves a body behind"
  EXPECT: GATE leave-behind ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=dbf2964b919bc9cb260044fa4860bf27e021d69139bd90e670cc825a5fe7a06c; exit=0; EXPECT=matched; output-sha256=02a71db61705b023cc74193d3de3a33079ed3c3cf21bb1e17dfaedd00084c31b; output-bytes=604; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G6: a stand-to-fire gun stays silent until deploy finishes and movement resets it
  CHECK: npx vitest run -t "stand-to-fire stays silent until deploy completes"
  EXPECT: GATE deploy-fire ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=68b582cc313e912b81f53fcb35735d04b6cca54a58f495e98e40be4473a73330; exit=0; EXPECT=matched; output-sha256=a56884f9240ed8ab28f07091c881b985aa649e0eb5837fd7d50324e788fe233c; output-bytes=621; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G7: a ram hurts the hull, a heavy hull breaks a ruin, a light hull does not
  CHECK: npx vitest run -t "ram hurts the hull and only a heavy hull breaks a ruin"
  EXPECT: GATE ram-prop ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=f07b63d20bd1a5b5bdcc4cdead2ec3c2ea63a2e8d31cd4d3987cf7f592a15765; exit=0; EXPECT=matched; output-sha256=afeb4be2b9e8193a81c4bd2057a4ade28c67f38e4696d86dd63c00fc19bc785d; output-bytes=623; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G8: seeded autoplay ends win or lose and prints a balance line
  CHECK: npx vitest run -t "seeded autoplay prints a balance line"
  EXPECT: /result=(win|lose)/
  EVIDENCE: automatic-evidence=v1; definition-sha256=713042a2cb97aaeb1aa10715d5c13da5c661998193cf111460ffc4796d694128; exit=0; EXPECT=matched; output-sha256=71b77ba0f5d10e35d5374d8f7d716aceada55dadbf5a97dee89bee6495fc9b50; output-bytes=657; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G9: the full test suite passes
  CHECK: npm test
  EXPECT: GATE autoplay ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=8c080612371d61c17df6b534425f3ab7298b3b96c7a208459d64b7e5b3147c49; exit=0; EXPECT=matched; output-sha256=d8ddcacf81f2e97a1cf4e4a53fd227484ac8b65ef72755694e900f6c7b782ea5; output-bytes=1375; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries

- [x] G10: production build emits dist/index.html
  CHECK: npm run build && node --input-type=module -e "import fs from 'node:fs'; fs.accessSync('dist/index.html'); console.log('BUILD ok')"
  EXPECT: BUILD ok
  EVIDENCE: automatic-evidence=v1; definition-sha256=069569fcd618458900c2f643a789c1caa07f3edbb63fff21aca538f9f0f4cfdd; exit=0; EXPECT=matched; output-sha256=7a296bd338dfe5628f803dd630629c47cf164ba854b4299a6b11823f3d5b1ac3; output-bytes=471; shell=/bin/sh; cwd=/Users/pavlosavchuk/Library/CloudStorage/Dropbox/!PARA/PROJECTS/Personal success/gdesign/Warhead tactics; path=32660b05a880/20 entries
