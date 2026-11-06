# AI Lab scene engine and renderer reuse

The AI Lab uses a self contained iframe renderer derived from the MIT-licensed
`floorplan-3d` project. The inspected upstream base is
`730ec0923a018fdf38b4687c5ef385c7dcac451f` (copyright 2026 wuyi).
`ai-lab/viewer/LICENSE.floorplan` preserves its complete MIT notice. The reusable
renderer also includes the existing local extensions for polygon walls, stairs,
columns, custom office tables, and multi-case camera framing; these extensions
are identified here as local work and are not attributed to the upstream base.
No private CNB editor, project report, screenshot, source drawing, or reference
floorplan JSON is included in tracked AI Lab source.

The local Three.js runtime is pinned to upstream `three@0.160.0` (r160), copied
unchanged from the existing local npm package distribution. It includes the
module build and only the required OrbitControls, PointerLockControls,
RoundedBoxGeometry, RoomEnvironment, CSS2DRenderer and BufferGeometryUtils addon
modules. Its upstream MIT license is retained in `ai-lab/vendor/three/LICENSE`.
The iframe import map uses `/viewer-assets/vendor/three/`; it makes no CDN calls.

## Compilation contract

`compile_pixel_scene(candidate,image_width,image_height,mm_per_pixel,project_id,
title='')` returns `(scene,validation)`. Candidate JSON is a complete legacy-shaped
scene with plan coordinates in **original image pixels**, using top-left image
origin. Walls are filled positive rectangles `[left,top,right,bottom,'e'|'i']`.
The compiler converts plan rectangles, polygons, anchors, furniture positions and
width/depth, door hinge/length, dimension chains, and font size exactly once.
Direction vectors, rotation degrees, normalized furniture outlines, feature
vertical `height` in mm, window heights in mm, and lintel heights in legacy meters
are preserved. Explicit input wall `i` becomes renderer-supported `n`; no bearing
classification is invented. Pixel-scale and image-size parameters must be finite
and positive. No baseline coordinates are substituted for model output.

The compiler supplies presentation defaults and stable missing IDs. The compiled
metadata has `coordinateUnits:'mm'` and `compiledBy:'ai-lab-pixel-compiler-v1'`;
feeding it to the pixel compiler again is rejected. Scene validation is read-only
and supports pre-existing legacy mm scenes without this new metadata marker.
Validation checks finite numbers, positive dimensions, enums, colors, IDs, safe
keys, simple polygons, triangulation, bounds, room overlap, optional envelope
containment, window-height arrays, and door direction vectors. Validation warnings
state that scale and area are estimates, not measured accuracy. Geometry validity
does not establish image-recognition fidelity, structural safety, or compliance.

`apply_scene_patch(scene,patch)` deliberately supports a narrow allowlist:

```json
{"operations":[
  {"op":"update_furniture","id":"f-001","changes":{"cx":2400,"rot":90}},
  {"op":"update_room","id":"room-001","changes":{"name":"Study","mat":"wood"}}
]}
```

Furniture changes allow `cx,cy,w,d,rot,color,name`; room changes allow `name,mat`.
Coordinates are existing mm and never recompiled. Unknown operations, fields and
IDs are rejected. The full result is validated before return; input is unchanged
on failure. New geometry, deletion, and arbitrary JSON Patch are outside this
initial contract.

## Scene, editable state and iframe boundary

`default_state(scene)` returns the exact legacy editable state shape:
`{furniture:[...],rooms:{roomId:{name,mat}},demolished:[],measures:[]}`.
`validate_state(scene,state)` enforces these four fields and supported values.
Backend persistence must validate state before saving; model output cannot add
scripts, URLs, arbitrary properties, or unsafe IDs. The full scene remains stored
independently, so reference baseline loading can retain all original geometry and
must be visibly labeled as a reference action rather than an AI generation.

The backend calls
`engine.viewer.render_viewer_html(scene,state,project_id,version)`.
This validates data and serializes exactly one inert JSON payload at the unique
`__AI_LAB_SCENE_JSON__` placeholder. It escapes `<`, `>`, `&`, U+2028 and U+2029;
model text cannot terminate its application/json script. Model strings inserted
into SVG or HTML are escaped; IDs, colors, types and materials also have schema
constraints. Local-storage and imported states pass a client-side gate, while
server validation remains authoritative. The constructor uses persisted server
state first, then isolated local state, then the actual scene's defaults.

There are no fixed case loader scripts, original-image file links, or default
example floorplans. Viewer-only defaults add optional camera/presentation fields
without inventing geometry or mutating stored scene data. Editable state,
language, and pane preferences are scoped under `ai-lab:<project>:v<version>`;
no original port-8000 case state keys are read or written.

The parent sends `{type:'ai-lab:get-state',requestId}` and receives
`{type:'ai-lab:state',requestId,state}`. The iframe sends
`{type:'ai-lab:ready'}` after 2D setup. Requests require the exact parent Window and
same origin, with a bounded string request ID; replies target the exact origin.
The renderer includes its own 2D/3D controls. On frame pagehide/unload it cancels
animation, disconnects observers and controls, disposes geometry, materials,
textures and renderer, and releases the WebGL context.

## Verification

Run `python tests/ai-lab-engine-test.py -v`. Set `AI_LAB_LEGACY_FIXTURES` to a
private directory containing `user-floorplan/floorplan.json`,
`tugendhat-ground/floorplan.json`, and `office-rounded/floorplan.json` for the
three-case compatibility check. Tests read these files without copying or
modifying them. Nine test groups cover scale conversion and double-compilation
rejection, invalid parameters, self-intersection, overlap/bounds, IDs/materials,
atomic patch allowlists, state/script-injection boundaries, JS syntax, and full
three-case compatibility. A skipped private-fixture test is not evidence that
compatibility passed; supply that environment variable for acceptance.
