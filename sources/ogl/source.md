---
title: OGL
kind: source
pattern: 3d
page_type: landing
tags: [3d, webgl, open-source, minimal, shaders]
source_url: https://github.com/oframe/ogl
source_site: github.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 1.0.11
licence: Unlicense
s_look: 1
s_interact: 3
s_coverage: 3
s_a11y: 1
s_perf: 5
s_react: 2
s_bundle: 5
s_licence: 3
why_it_works: A tiny, readable WebGL layer (renderer, camera, geometry, glTF loader, orbit, instancing) that leaves shaders to you, ideal when every kilobyte counts and the visual is a custom shader effect.
use_when: Lightweight WebGL effects such as shader backgrounds, image distortions and particle fields, written by someone comfortable with GLSL.
avoid_when: You want realistic materials, lighting or shadows without writing shaders, or the team isn't fluent in GLSL.
alternatives: [threejs]
has_example: false
---

## Verdict
**The specialist for tiny shader effects.** It's 25 KB versus 160 KB for three.js, but realistic rendering is
all your own shader work. Use it for decorative WebGL; use three.js or React Three Fiber for anything product-like.

## Benchmark
4/4 tasks, only 1 with built-in features. **25.4 KB gz**, the smallest tested, and the fastest first frame
(174 ms on the software GPU). Code: `bench3d/libs/ogl.js`, which includes a hand-written lighting shader.

Found in the benchmark:
- The glTF loader assigns a debug "normals" shader; you write the material shader yourself.
- Our first shader rendered the product **black**: glTF colours are linear, and converting to sRGB is your
  job (fixed with a gamma step). This is typical of OGL: correct colour, lighting and shadows are manual.
- No environment lighting or shadows unless you build them, so the metal ring looks matte.
- Instanced attributes drew 2,000 cubes in one draw call.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 1 | No PBR, environment or shadows; colour management manual |
| Interactivity | 3 | Orbit and Raycast extras; hotspots manual |
| Coverage | 3 | Core, glTF, instancing, post, text, shadow extras; no PBR |
| Accessibility | 1 | Nothing built in |
| Performance | 5 | Minimal overhead; fastest first frame |
| React/Next fit | 2 | Imperative |
| Bundle size | 5 | 25.4 KB gz |
| Licence & health | 3 | Unlicense (public domain); small team, last release January 2025 |
