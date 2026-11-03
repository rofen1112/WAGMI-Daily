# WAGMI GitHub Radar - 2026-07-17

Run time: 2026-07-17 08:35:41 +08:00

Recovery status:

- Same-day files were first created by an earlier recovery run at `08:18`, then refreshed after the AI daily snapshot was backfilled to today's date.
- `C:\Users\Administrator\.codex\automations\wagmi-github\memory.md` still did not contain a completed `2026-07-17` record at rerun time.
- This rerun kept the same verified repo observations, but revalidated the daily radar against a current same-day AI upstream snapshot so the final status can move from `warning` to `success`.

Input status:

- Read successfully:
  - `data/main/index.json`
  - `data/dev/ai-events-latest.json`
  - `data/dev/candidates.json`
  - `data/dev/candidate-decisions.json`
  - `data/dev/github-radar-latest.json`
  - `reports/ai-events-2026-07-17.md`
  - `reports/github-radar-2026-07-16.md`
- Upstream readiness check:
  - `data/dev/ai-events-latest.json` now has `asOf` = `2026-07-17` and `run.status` = `success`.
  - Today is Friday `2026-07-17`, so `data/dev/ai-weekly-latest.json` was not required.
  - `data/dev/candidate-decisions.json` is an empty array, so no approved / observe / rejected overrides were applied in this run.
- Result: GitHub verification completed again after the AI upstream catch-up and now qualifies as a same-day `success` run.

## Followed Projects Status

App inventory still contains placeholder URLs under `github.com/example/...`, so those rows remain excluded from recommendation logic.

| Project | Repo in app | 2026-07-17 status | Recommendation impact | Risk |
| --- | --- | --- | --- | --- |
| RoomAgent Studio | `github.com/example/room-agent-studio` | Not a real verified repo | Keep `pending` | Placeholder stats are unusable |
| SplatMap Viewer | `github.com/example/splatmap-viewer` | Not a real verified repo | Keep `pending` | Placeholder stats are unusable |
| Designer CLI | `github.com/example/designer-cli` | Not a real verified repo | Keep `pending` | Placeholder stats are unusable |
| Agent Runtime Kit | `github.com/example/agent-runtime-kit` | Not a real verified repo | Keep `pending` | Placeholder stats are unusable |

## Watched Repo Changes Since 2026-07-16

| Repo | Stars / Forks | Recent commit / release | Issue activity | README / Demo change | Level change | Risk note |
| --- | --- | --- | --- | --- | --- | --- |
| [github/copilot-cli](https://github.com/github/copilot-cli) | `10,964 / 1,779`; up from `10,949 / 1,774` | Push `2026-07-16`; latest release [`v1.0.71`](https://github.com/github/copilot-cli/releases/tag/v1.0.71) on `2026-07-16` | Open issues `1,905`; latest open-issue update seen `2026-07-16` | README touchpoint still `2026-02-25`; no homepage/demo field | `A+` stays | Release cadence remains strong, but support noise is still very high |
| [github/copilot-sdk](https://github.com/github/copilot-sdk) | `9,636 / 1,318`; up from `9,510 / 1,305` | Push `2026-07-16`; latest release [`rust/v1.0.7`](https://github.com/github/copilot-sdk/releases) on `2026-07-16` | Open issues `240`; latest open-issue update seen `2026-07-17` | README touchpoint still `2026-07-01`; no homepage/demo field | `A+` stays | Strong infra signal, but multi-SDK release-train churn remains real |
| [xai-org/grok-build](https://github.com/xai-org/grok-build) | `12,035 / 2,048`; new tracked entry | Push `2026-07-16`; no release yet | Open issues `0` | README touchpoint `2026-07-16`; no homepage/demo field | New `A` tracked repo | New repo velocity is exceptional, but operational quality signals are still immature |
| [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | `1,610 / 124`; up from `1,599 / 124` | Push `2026-07-16`; latest release [`1.1.3`](https://github.com/google-antigravity/antigravity-cli/releases/tag/1.1.3) on `2026-07-16` | Open issues `478`; latest open-issue update seen `2026-07-17` | README touchpoint still `2026-06-07`; no homepage field | `A+` stays | Freshness remains good, but issue load keeps climbing |
| [google-gemini/starter-applets](https://github.com/google-gemini/starter-applets) | `1,346 / 452`; down from `1,347 / 452` | Last push still `2026-07-03`; no release | Open issues `27`; latest open-issue update still `2026-07-03` | Homepage remains [aistudio.google.com/starter-apps](https://aistudio.google.com/starter-apps); README commit remains old (`2024-12-23`) | `B` stays | Official related code only; still not the exact AI Studio product repo |
| [mira-wm/mira](https://github.com/mira-wm/mira) | `410 / 21`; up from `403 / 21` | Last push still `2026-07-12`; release [`v1.0`](https://github.com/mira-wm/mira/releases/tag/v1.0) stays `2026-07-05` | Open issues `2`; latest issue update seen `2026-07-13` | README touchpoint still `2026-07-12`; homepage stays [mira-wm.com](https://mira-wm.com/) | `B+` stays | Momentum continues, but maintainer/community depth is still small |
| [alibaba-damo-academy/RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D) | `60 / 3`; up from `59 / 3` | Push `2026-07-16`; no release | Open issues `1`; latest issue update seen `2026-07-13` | README touchpoint updated to `2026-07-16`; no homepage/demo field | `B+` stays | Research-stage risk remains and release discipline is still absent |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | `138,000 / 22,145`; up from `137,984 / 22,248` in stars | Push `2026-07-15`; latest release [`v2.1.211`](https://github.com/anthropics/claude-code/releases/tag/v2.1.211) on `2026-07-15` | Open issues `11,859`; latest open-issue update seen `2026-07-17` | README touchpoint still `2026-01-12`; homepage stays [code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview) | `A` stays | Operational noise remains extreme; issue volume alone is not a quality score |
| [meshy-dev/meshy-3d-agent](https://github.com/meshy-dev/meshy-3d-agent) | `50 / 8`; flat vs `2026-07-16` | Last push still `2026-06-24`; latest release [`v0.4.0`](https://github.com/meshy-dev/meshy-3d-agent/releases/tag/v0.4.0) stays `2026-06-24` | Open issues `1`; latest issue update seen `2026-06-13` | README touchpoint still `2026-06-24`; no homepage/demo field | `B` stays | Official but still too early and too quiet for promotion |
| [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR) | `6,734 / 862`; up from `6,731 / 860` | Last push still `2026-06-04`; no release | Open issues `103`; latest issue update seen `2026-07-16` | README touchpoint still `2026-06-04`; no homepage/demo field | `B` stays | Useful anchor repo, but code freshness is weak |

## Candidate Queue Updates

These checks were driven by `data/dev/candidates.json`, the carried-forward GitHub radar queue, and all candidate rows bundled in `data/dev/ai-events-latest.json`.

| Candidate | Result | Recommendation | Notes |
| --- | --- | --- | --- |
| `xai-org/grok-build` | Confirmed exact repo: [xai-org/grok-build](https://github.com/xai-org/grok-build) | Promote into tracked inventory | Official xAI announcement plus strong repo metrics crossed the tracked-project threshold in this run |
| `OpenAI GPT-Red preprint / eval assets` | No exact public paper/code repo confirmed | Keep `pending` | The official post names the project, but this run still found no stable paper or code URL |
| `Thinking Machines Tinker cookbook` | No stable official owner/repo confirmed | Keep `pending` | The Tinker page points to GitHub cookbook material, but the exact repository still was not resolved |
| `kinfey/Multi-AI-Agents-Cloud-Native` | Exact repo remains confirmed | Keep as verified candidate, not yet promoted | Current scale is still small at `26` stars and `10` forks |
| `NousResearch/hermes-agent` | Exact repo remains confirmed | Keep as verified candidate, not yet promoted | Popularity is very large, but category fit and quality signals still need a cleaner decision |
| `GitHub Copilot cloud agent` | No exact standalone public repo confirmed | Keep `pending` | Treat as product capability, not a clean repo entity yet |
| `OpenAI Programmatic Tool Calling` example repo | No official exact repo confirmed | Keep `pending` | Search still resolves to third-party demos and discussions only |
| `OpenAI multi-agent beta` example repo | No official exact repo confirmed | Keep `pending` | Keep pending until OpenAI exposes a public code anchor |
| `AI floor-plan / room-design CAD export` | No exact public repo confirmed | Keep `pending` | Still a workflow/theme lane rather than a verified repo |

## Recommendation Changes

- Added one new tracked repo on `2026-07-17`:
  - `xai-org/grok-build` at level `A`
- No existing tracked repo changed level in this run.
- No candidate decisions were applied because `data/dev/candidate-decisions.json` is still empty.

## Risk Notes

- App-level followed projects still point to placeholder repos, so they remain excluded from recommendation logic.
- Several upstream names still map only to product lines, workflow lanes, or ecosystem programs rather than exact owner/repo identifiers.
- `NousResearch/hermes-agent` could not be cleanly re-read through the unauthenticated REST API in this session after earlier verification, so it stayed in candidate state rather than being promoted on incomplete evidence.
- Some confirmations are intentionally labeled `related official repo` rather than `exact repo` because the branded product surface is broader than a single public repository.

## Source Links

Primary tracked-repo API sources used in this run:

- https://api.github.com/repos/github/copilot-cli
- https://api.github.com/repos/github/copilot-sdk
- https://api.github.com/repos/xai-org/grok-build
- https://api.github.com/repos/google-antigravity/antigravity-cli
- https://api.github.com/repos/google-gemini/starter-applets
- https://api.github.com/repos/mira-wm/mira
- https://api.github.com/repos/alibaba-damo-academy/RynnWorld-4D
- https://api.github.com/repos/anthropics/claude-code
- https://api.github.com/repos/meshy-dev/meshy-3d-agent
- https://api.github.com/repos/VAST-AI-Research/TripoSR

Candidate-verification sources used or retained in this run:

- https://github.com/NousResearch/hermes-agent
- https://api.github.com/repos/kinfey/Multi-AI-Agents-Cloud-Native
- https://github.com/xai-org/grok-build
- https://openai.com/index/unlocking-self-improvement-gpt-red/
- https://x.ai/news/grok-build-open-source

Upstream local inputs retained for provenance:

- `data/main/index.json`
- `data/dev/ai-events-latest.json`
- `data/dev/candidates.json`
- `data/dev/candidate-decisions.json`
- `reports/ai-events-2026-07-17.md`
- `reports/github-radar-2026-07-16.md`
