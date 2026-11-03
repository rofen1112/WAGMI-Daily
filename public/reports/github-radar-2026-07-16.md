# WAGMI GitHub Radar - 2026-07-16

Run time: 2026-07-16 07:35:30 +08:00

Recovery status:

- Same-day files `reports/github-radar-2026-07-16.md` and `public/reports/github-radar-2026-07-16.md` were missing at run start.
- `C:\Users\Administrator\.codex\automations\wagmi-github\memory.md` did not contain a completed `2026-07-16` record.
- Per recovery rule, this run re-executed the full radar collection from the watched repo set plus the forced-candidate ledger carried by the latest local AI daily, weekly, and prior GitHub radar artifacts.

Input status:

- Read successfully:
  - `data/main/index.json`
  - `data/dev/candidates.json`
  - `reports/github-radar-2026-07-14.md`
  - `reports/ai-events-2026-07-10.md`
  - `reports/ai-events-supplement-2026-07-09.md`
  - `reports/ai-events-2026-06.md`
- Missing local upstream structured AI snapshots:
  - `data/dev/ai-events-latest.json`
  - `data/dev/ai-weekly-latest.json`
- Because the two upstream dev snapshots were absent, AI forced-candidate intake fell back to the latest published AI report files and the carried-forward forced-candidate table from `2026-07-14`.

## Followed Projects Status

App inventory still contains placeholder URLs under `github.com/example/...`, so those rows remain excluded from recommendation logic.

| Project | Repo in app | 2026-07-16 status | Recommendation impact | Risk |
| --- | --- | --- | --- | --- |
| RoomAgent Studio | `github.com/example/room-agent-studio` | Not a real verified repo | Keep `pending` | Placeholder stats are unusable |
| SplatMap Viewer | `github.com/example/splatmap-viewer` | Not a real verified repo | Keep `pending` | Placeholder stats are unusable |
| Designer CLI | `github.com/example/designer-cli` | Not a real verified repo | Keep `pending` | Placeholder stats are unusable |
| Agent Runtime Kit | `github.com/example/agent-runtime-kit` | Not a real verified repo | Keep `pending` | Placeholder stats are unusable |

## Watched Repo Changes Since 2026-07-14

| Repo | Stars / Forks | Recent commit / release | Issue activity | README / Demo change | Level change | Risk note |
| --- | --- | --- | --- | --- | --- | --- |
| [github/copilot-cli](https://github.com/github/copilot-cli) | `10,949 / 1,774`; up from `10,940 / 1,762` | Push `2026-07-15`; latest release [`v1.0.70`](https://github.com/github/copilot-cli/releases/tag/v1.0.70) stays `2026-07-10` | Open issues `1,900`, up from `1,876` | README touchpoint still `2026-02-25`; no homepage/demo field | `A+` stays | Shipping remains strong, but support noise is still very high |
| [github/copilot-sdk](https://github.com/github/copilot-sdk) | `9,510 / 1,305`; up from `9,504 / 1,298` | Push `2026-07-15`; API latest release is [`java/v1.0.6`](https://github.com/github/copilot-sdk/releases) on `2026-07-08` | Open issues `231`, up from `223` | README touchpoint still `2026-07-01`; no homepage/demo field | `A+` stays | Strong infra signal, but multi-SDK preview/release-train churn remains real |
| [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | `1,599 / 124`; up from `1,581 / 120` | Last push still `2026-07-13`; latest release [`1.1.2`](https://github.com/google-antigravity/antigravity-cli/releases/tag/1.1.2) stays `2026-07-13` | Open issues `476`, up from `469` | README touchpoint still `2026-06-07`; no homepage field | `A+` stays | Freshness is still good enough, but issue load keeps climbing |
| [google-gemini/starter-applets](https://github.com/google-gemini/starter-applets) | `1,347 / 452`; flat vs `2026-07-14` | Last push still `2026-07-03`; no release | Open issues `27`, unchanged | Homepage remains [aistudio.google.com/starter-apps](https://aistudio.google.com/starter-apps); README commit remains old (`2024-12-23`) | `B` stays | Official related code only; still not the exact AI Studio product repo |
| [mira-wm/mira](https://github.com/mira-wm/mira) | `403 / 21`; up from `380 / 20` | Last push still `2026-07-12`; release [`v1.0`](https://github.com/mira-wm/mira/releases/tag/v1.0) stays `2026-07-05` | Open issues `2`, unchanged | README touchpoint still `2026-07-12`; homepage stays [mira-wm.com](https://mira-wm.com/) | `B+` stays | Momentum continues, but maintainer/community depth is still small |
| [alibaba-damo-academy/RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D) | `59 / 3`; up from `57 / 3` | Last push still `2026-07-08`; no release | Open issues `1`, unchanged | README touchpoint still `2026-07-08`; no homepage/demo field | `B+` stays | Research-stage risk remains and release discipline is still absent |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | `137,984 / 22,248`; up from `137,725 / 22,215` | Push `2026-07-15`; latest release [`v2.1.211`](https://github.com/anthropics/claude-code/releases/tag/v2.1.211) on `2026-07-15` | Open issues `11,606`, up from `11,311` | README touchpoint still `2026-01-12`; homepage stays [code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview) | `A` stays | Operational noise remains extreme; issue volume alone is not a quality score |
| [meshy-dev/meshy-3d-agent](https://github.com/meshy-dev/meshy-3d-agent) | `50 / 8`; up from `49 / 8` | Last push still `2026-06-24`; latest release [`v0.4.0`](https://github.com/meshy-dev/meshy-3d-agent/releases/tag/v0.4.0) stays `2026-06-24` | Open issues `1`, unchanged | README touchpoint still `2026-06-24`; no homepage/demo field | `B` stays | Official but still too early and too quiet for promotion |
| [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR) | `6,731 / 860`; up from `6,725 / 860` | Last push still `2026-06-04`; no release | Open issues `102`, unchanged | README touchpoint still `2026-06-04`; no homepage/demo field | `B` stays | Useful anchor repo, but code freshness is weak |

## Candidate Queue Updates

These checks were driven by `data/dev/candidates.json` plus the carried-forward forced-candidate table from `2026-07-14`.

| Candidate | Result | Recommendation | Notes |
| --- | --- | --- | --- |
| `kinfey/Multi-AI-Agents-Cloud-Native` | Confirmed exact repo: [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | Keep as verified candidate, not yet promoted | Exact repo exists with `26` stars, `10` forks, push `2026-07-13`; still too small for tracked-inventory promotion |
| `NousResearch/hermes-agent` | Confirmed exact repo: [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | Keep as verified candidate, not yet promoted | Exact repo exists with large community traction and push `2026-07-15`; upstream product framing still needs category fit before promotion |
| `GitHub Copilot cloud agent` | No exact standalone public repo confirmed | Keep `pending` | Treat as product capability, not a clean repo entity yet |
| `OpenAI Programmatic Tool Calling` example repo | No official exact repo confirmed | Keep `pending` | Search still resolves to third-party demos and discussions only |
| `OpenAI multi-agent beta` example repo | No official exact repo confirmed | Keep `pending` | Keep pending until OpenAI exposes a public code anchor |
| `AI floor-plan / room-design CAD export` | No exact public repo confirmed | Keep `pending` | Still a workflow/theme lane rather than a verified repo |

## Forced Candidate Carry-Forward

All GitHub/project names from the latest local AI daily, weekly, and supplement materials remain represented below. Exact identities already confirmed on `2026-07-14` were re-used unless today produced a better URL decision. Unresolved names stay `pending`.

| Candidate name | Repo URL verification result | Recommendation | Notes |
| --- | --- | --- | --- |
| `github/copilot-cli` / `Copilot CLI` | Confirmed: [github/copilot-cli](https://github.com/github/copilot-cli) | `A+` | Fresh push on `2026-07-15`; tracked inventory stays strong |
| `github/copilot-sdk` | Confirmed: [github/copilot-sdk](https://github.com/github/copilot-sdk) | `A+` | Push landed `2026-07-15`; tracked inventory stays strong |
| `Copilot cloud agent` | No exact standalone public repo confirmed | `pending` | Product capability, not a clean repo entity yet |
| `The Kotlin Benchmark` | No exact repo with this exact brand confirmed | `pending` | Related JetBrains repos exist, but the branded benchmark signal still does not map cleanly |
| `Terminal-Bench 2.1` | Confirmed: [harbor-framework/terminal-bench-2-1](https://github.com/harbor-framework/terminal-bench-2-1) | `A` | Exact repo still valid; push `2026-07-15` confirms freshness |
| `GeneBench v1` | No exact AI benchmark repo confirmed | `pending` | Search remains skewed toward unrelated bioinformatics repos |
| `ExploitGym` | Confirmed: [sunblaze-ucb/exploitgym](https://github.com/sunblaze-ucb/exploitgym) | `B+` | Exact benchmark repo still valid |
| `Work IQ APIs` | Confirmed: [microsoft/work-iq](https://github.com/microsoft/work-iq) | `A` | Exact official repo still valid |
| `Microsoft Scout` | Related official repo confirmed: [microsoft/scout-resources](https://github.com/microsoft/scout-resources) | `B` | Exact product core repo still not exposed publicly |
| `Copilot Cowork` | No exact public repo confirmed | `pending` | Product/workflow name, not a verified owner/repo |
| `Foundation Models framework` | Related official repos confirmed: [apple/python-apple-fm-sdk](https://github.com/apple/python-apple-fm-sdk), [apple/foundation-models-utilities](https://github.com/apple/foundation-models-utilities) | `B+` | Good official anchors, but not one exact umbrella repo |
| `Language Model protocol` | No exact public repo confirmed | `pending` | Search results remain generic protocol or paper repos |
| `Antigravity CLI` | Confirmed: [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | `A+` | Tracked inventory remains promoted |
| `A2A` | Confirmed: [a2aproject/A2A](https://github.com/a2aproject/A2A) | `A` | Large, active protocol repo remains a core watch item |
| `Agent Development Kit` | Confirmed primary repo: [google/adk-python](https://github.com/google/adk-python); companion: [google/adk-samples](https://github.com/google/adk-samples) | `A` / `B+` | Both repos still fresh on `2026-07-15` |
| `Genkit` | Confirmed: [genkit-ai/genkit](https://github.com/genkit-ai/genkit) | `B+` | Exact framework repo still active |
| `Agent Finder` | Confirmed related official catalog repo: [github/agentfinder-catalog](https://github.com/github/agentfinder-catalog) | `B` | Public catalog repo exists; product UI repo is still not exposed |
| `ARD specification` | Confirmed: [ards-project/ard-spec](https://github.com/ards-project/ard-spec) | `B` | Exact repo still valid |
| `NVIDIA Cosmos 3` | Confirmed: [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | `A` | Official repo remains active |
| `physical AI agent skills` | No exact standalone repo confirmed | `pending` | Use [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) only as related context |
| `Cosmos Coalition` | No public exact repo confirmed | `pending` | Ecosystem/program name rather than a verified repo |
| `Runway Agent 2.0` | No exact public repo confirmed | `pending` | Product/version signal, not a clean repo entity yet |
| `Runway API` | Related official repos confirmed: [runwayml/openapi](https://github.com/runwayml/openapi), [runwayml/runway-api-mcp-server](https://github.com/runwayml/runway-api-mcp-server) | `B+` | Official API anchors remain multi-repo |
| `Mistral OCR 4` | No exact product repo confirmed | `pending` | Official sample context exists, but not a clean standalone repo |
| `Mistral connectors` | No exact official repo confirmed | `pending` | Community mirrors exist, but no exact official repo was confirmed |
| `Arcade.dev` | Confirmed official org/context: [ArcadeAI](https://github.com/ArcadeAI) and [ArcadeAI/arcade-mcp](https://github.com/ArcadeAI/arcade-mcp) | `B+` | Treat `arcade-mcp` as the best current code anchor |
| `MCP runtime` | No single canonical official repo confirmed | `pending` | Third-party implementations exist, but this is still a concept-level term |
| `Patronus AI evals` | Related official repos confirmed: [patronus-ai](https://github.com/patronus-ai), [patronus-ai/patronus-mcp-server](https://github.com/patronus-ai/patronus-mcp-server) | `B` | Exact eval benchmark anchor remains diffuse |
| `agent security` | Official guardrail/security anchor confirmed: [openai/openai-guardrails-python](https://github.com/openai/openai-guardrails-python) | `A-` | Use this as the main official anchor for this lane for now |
| `runtime guardrails` | Confirmed: [openai/openai-guardrails-python](https://github.com/openai/openai-guardrails-python) | `A-` | Strongest exact official repo found so far |
| `voice agent evals` | No exact official repo confirmed | `pending` | Still no authoritative public repo to map |
| `enterprise process agent` | No exact public repo confirmed | `pending` | Theme-level name, not a verified owner/repo |
| `alibaba-damo-academy/RynnWorld-4D` | Confirmed: [alibaba-damo-academy/RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D) | `B+` | Tracked inventory stays promoted |
| `alibaba-damo-academy/RynnWorld-Teleop` | Confirmed: [alibaba-damo-academy/RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop) | `B` | Companion repo remains real but early |
| `AlayaLab/AlayaWorld` | Confirmed: [AlayaLab/AlayaWorld](https://github.com/AlayaLab/AlayaWorld) | `B` | Exact repo still valid |
| `SWE-PolyBench` | Confirmed: [amazon-science/SWE-PolyBench](https://github.com/amazon-science/SWE-PolyBench) | `B` | Exact URL remains valid |
| `SWE-Lancer Diamond` | No standalone exact repo confirmed | `pending` | Related references exist, but not as a distinct official repo |
| `DesignArena` | Related official repos confirmed: [Design-Arena/MicroEvals](https://github.com/Design-Arena/MicroEvals), [Design-Arena/agent-runner](https://github.com/Design-Arena/agent-runner) | `B` | Exact branded benchmark repo still unclear |
| `SpreadsheetBench` | Confirmed: [RUCKBReasoning/SpreadsheetBench](https://github.com/RUCKBReasoning/SpreadsheetBench) | `B` | Exact URL remains valid |
| `VRING:ON` | No exact public repo confirmed | `pending` | Product/event name only |
| `design-to-manufacturing agent` | No exact public repo confirmed | `pending` | Theme-level workflow name only |
| `simonw/llm-meta-ai` | Confirmed: [simonw/llm-meta-ai](https://github.com/simonw/llm-meta-ai) | `B` | Exact repo still valid, but tiny |
| `simonw/llm` | Confirmed: [simonw/llm](https://github.com/simonw/llm) | `A-` | High-signal plugin/runtime host repo |
| `openclaw/openclaw` | Confirmed: [openclaw/openclaw](https://github.com/openclaw/openclaw) | `B` | Exact repo confirmed; upstream signal was still indirect |
| `Meta Model API` official SDK / example repo | Related official example repo confirmed: [meta-models/meta-model-cookbook](https://github.com/meta-models/meta-model-cookbook) | `B+` | Cookbook/examples verified; standalone SDK repo still not confirmed |
| `OpenAI Programmatic Tool Calling` example repo | No official exact repo confirmed | `pending` | Search still resolves only to third-party demos and discussions |
| `OpenAI multi-agent beta` example repo | No official exact repo confirmed | `pending` | Keep pending until OpenAI publishes a public code anchor |
| `Office / slides / sheets automation workflows` | No single exact repo confirmed | `pending` | Still a theme-level watch category |
| `biosafety / agent guardrails / policy engine` projects | Official guardrail anchor confirmed: [openai/openai-guardrails-python](https://github.com/openai/openai-guardrails-python) | `A-` | Closest exact official repo in the current run |
| `OpenAI GPT-Live` workflow repos | No official exact repo confirmed | `pending` | Product signal only so far |
| `AI floor-plan / room-design CAD export` projects | No exact public repo confirmed | `pending` | Remains a domain watch lane rather than a confirmed repo set |
| `GTM Agent stack` | No exact public repo confirmed | `pending` | Theme-level market signal only |
| `ollama/ollama` | Confirmed: [ollama/ollama](https://github.com/ollama/ollama) | `A` | Strong open-model infrastructure anchor remains valid |

## Recommendation Changes

- No tracked repo level changed on `2026-07-16`.
- Two exact queued candidates were resolved from `pending` to verified-candidate status without promotion into the tracked inventory:
  - `kinfey/Multi-AI-Agents-Cloud-Native`
  - `NousResearch/hermes-agent`

## Risk Notes

- App-level followed projects still point to placeholder repos, so they remain excluded from recommendation logic.
- The required upstream dev files `data/dev/ai-events-latest.json` and `data/dev/ai-weekly-latest.json` were missing, so GitHub intake had to fall back to published AI report files and the prior forced-candidate ledger.
- Several upstream names still map only to product lines, benchmark brands, workflow lanes, or ecosystem programs rather than exact owner/repo identifiers.
- Some confirmations are intentionally labeled `related official repo` rather than `exact repo` because the branded product surface is broader than a single public repository.
- Large-support repos such as `claude-code`, `copilot-cli`, and `copilot-sdk` still need issue-volume interpretation with caution.

## Source Links

Primary tracked-repo API sources used in this run:

- https://api.github.com/repos/github/copilot-cli
- https://api.github.com/repos/github/copilot-sdk
- https://api.github.com/repos/google-antigravity/antigravity-cli
- https://api.github.com/repos/google-gemini/starter-applets
- https://api.github.com/repos/mira-wm/mira
- https://api.github.com/repos/alibaba-damo-academy/RynnWorld-4D
- https://api.github.com/repos/anthropics/claude-code
- https://api.github.com/repos/meshy-dev/meshy-3d-agent
- https://api.github.com/repos/VAST-AI-Research/TripoSR

Exact-candidate verification sources re-checked in this run:

- https://api.github.com/repos/kinfey/Multi-AI-Agents-Cloud-Native
- https://api.github.com/repos/NousResearch/hermes-agent
- https://api.github.com/repos/a2aproject/A2A
- https://api.github.com/repos/google/adk-python
- https://api.github.com/repos/google/adk-samples
- https://api.github.com/repos/genkit-ai/genkit
- https://api.github.com/repos/github/agentfinder-catalog
- https://api.github.com/repos/microsoft/work-iq
- https://api.github.com/repos/NVIDIA/cosmos
- https://api.github.com/repos/harbor-framework/terminal-bench-2-1
- https://api.github.com/repos/sunblaze-ucb/exploitgym
- https://api.github.com/repos/runwayml/runway-api-mcp-server
- https://api.github.com/repos/ArcadeAI/arcade-mcp
- https://api.github.com/repos/openai/openai-guardrails-python
- https://api.github.com/repos/meta-models/meta-model-cookbook
- https://api.github.com/repos/amazon-science/SWE-PolyBench
- https://api.github.com/repos/RUCKBReasoning/SpreadsheetBench
- https://api.github.com/repos/alibaba-damo-academy/RynnWorld-Teleop
- https://api.github.com/repos/AlayaLab/AlayaWorld
- https://api.github.com/repos/simonw/llm-meta-ai
- https://api.github.com/repos/simonw/llm
- https://api.github.com/repos/openclaw/openclaw

Upstream local report inputs retained for provenance:

- `reports/ai-events-2026-07-10.md`
- `reports/ai-events-supplement-2026-07-09.md`
- `reports/ai-events-2026-06.md`
- `reports/github-radar-2026-07-14.md`
