# AI Lab local API

Start from the isolated checkout with `powershell -File scripts/start-ai-lab-api.ps1` (Python 3.13, standard library only). The server binds exclusively to `127.0.0.1:8786`. Vite must proxy `/api/ai-lab/v1` and `/viewer-assets` to that port. It does not serve the checkout root, private config, SQLite, arbitrary files, or legacy case directories.

The designated private file is `.env.ai-lab.local` in the checkout root. Preferred keys:

```dotenv
AI_LAB_API_KEY=YOUR_PRIVATE_KEY
AI_LAB_GATEWAY_WIRE_MODE=responses
AI_LAB_GATEWAY_IMAGE_VERIFIED=0
AI_LAB_MODEL_TIMEOUT=90
AI_LAB_MAX_OUTPUT_TOKENS=12000
# Optional: leave absent to preserve the gateway's existing default.
# AI_LAB_REASONING_EFFORT=none
```

Root verified Responses text and image input on this gateway. The backend's separate image gate must still be set explicitly to `1` after evidence exists for the deployment. Default wire mode remains the originally documented `messages` shape; use `responses` for the verified protocol. No automatic cross-protocol or network retries occur. Requests go only to `https://etc.seedance-api.net/server/api/call`, model `deepseek-v4-1-flash-260910`. Keys are backend-only. A worker can make one generation call and at most one targeted geometry repair call; every provided usage value is recorded per call, absent usage and monetary cost remain null. Timeout is bounded to 5..180 seconds per call. A cancelled in-flight request may still incur vendor fees, but cannot commit a scene.

Optional `AI_LAB_REASONING_EFFORT=none|low|high|max` sends `reasoning:{effort:...}` only in Responses mode. An absent/empty option sends no new parameter; invalid values fail before network access. `none` has now been tested on this gateway with actual zero reasoning-token usage. This proves the parameter's effect for those requests, not scene quality. This option does not send `thinking`, change output limits, or add a retry. See [reasoning-notes.md](reasoning-notes.md) for the original evidence and bounded verification plan, and [model validation](../../docs/ai-lab-model-validation.md) for actual outcomes.

The current generation prompt version is `pixel-scene-v2`, defined by `PROMPT_VERSION` in `prompts.py` and exposed by health/job records. It makes original pixel bounds, polygon vertices, optional window-height arrays and compiled-mm repair diagnostics explicit. Historical `pixel-scene-v1` benchmark rows describe earlier tests; that version is not the current generation prompt. A prompt version and a successful geometry check do not constitute visual-quality acceptance.

Private data lives in `.local-ai-lab/{lab.sqlite3,assets/,baselines/}`. Each baseline is a private `baselines/<opaque-id>.json` containing `{title,scene,state?,sourceAsset?}`. Baseline IDs come from filenames, never external paths. Reference loading is explicitly stored as `baseline_reference`; chat edits retain that provenance as `baseline_reference_modified`, including subsequent edits and state saves. Actual model output is `generated`, and edits to generated scenes are `modified`.

Jobs expose `queued`, `running`, `succeeded`, `failed`, `cancelled`, or `needs_input`, with progress 0..100. POST jobs accepts an `Idempotency-Key` header or body `idempotencyKey`; key reuse with a different body returns 409. `baseVersion` enforces optimistic concurrency, including the final worker commit. On restart, queued work resumes and previously running work fails as interrupted; paid calls are not silently replayed.

An executed job always records `usage:{calls:[...],cost:null}`. An empty `calls` array explicitly means that task made no model call (for example a deterministic local edit); it does not estimate a zero monetary cost. Queued tasks, cancellation before execution, and historical unknown usage can remain null. Existing null records are not backfilled with guessed values.

The complete compiled legacy scene and separate renderer state are stored in every immutable version. Editor state has exactly `furniture`, `rooms`, `demolished`, `measures` and is checked by the engine. Saving editor state retains the full original scene, and chat modifications start from the latest editor furniture and room overrides. GET export includes both. No generated code is executed.

Current deterministic chat grammar (coordinates/sizes in mm): `把f1移动到1000,2000`, `f1旋转到90度`, `f1尺寸改为1200x600`, `r1改名为会议室`, `r1材质改为carpet`. Use unambiguous IDs, names, or furniture types. These exact forms work without a provider call. With a configured provider, other natural language (for example a relative move with an explicit distance) makes one text request to translate the instruction into the same restricted patch. The model receives current editable object properties, and cannot add/remove objects or modify geometry. Missing values, unsupported edits and ambiguity return `needs_input`; every model patch must pass the same engine validation and version transaction. Modification makes no repair call. Clients can also send `patch:{operations:[{op:'update_furniture',id:'f1',changes:{cx:1000}}]}` or `update_room` with `name`/`mat`. This is bounded conversational attribute editing, not general geometry editing.

Run `python tests/ai-lab-server.test.py` for no-network provider, persistence, cancellation, boundary, concurrency and engine integration regression checks. None of these tests demonstrates real model floorplan reconstruction quality. Local API has no user authentication or multi-user isolation and is not a public deployment.
