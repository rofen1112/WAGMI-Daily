# WAGMI GitHub Radar - 2026-07-14

Run time: 2026-07-14 07:49:07 +08:00

Recovery status:

- Same-day files `reports/github-radar-2026-07-14.md` and `public/reports/github-radar-2026-07-14.md` were missing at run start.
- `C:\Users\Administrator\.codex\automations\wagmi-github\memory.md` did not contain a completed `2026-07-14` record.
- Per recovery rule, this run re-executed the full radar collection from the watched repo set plus all GitHub/project names carried by the latest local AI daily and weekly upstream reports.

Scope:

- Re-check watched repos for stars, forks, recent commits, releases, issue activity, README touchpoints, and homepage/demo status.
- Re-check every forced GitHub candidate from:
  - `reports/ai-events-2026-07-10.md`
  - `reports/ai-events-supplement-2026-07-09.md`
  - `reports/ai-events-2026-06.md`
- Preserve every project name in the candidate handling table; unresolved names stay `待核验`.

## Followed Projects Status

App inventory still contains placeholder URLs under `github.com/example/...`, so these rows remain excluded from recommendation logic.

| Project | Repo in app | 2026-07-14 status | Recommendation impact | Risk |
| --- | --- | --- | --- | --- |
| RoomAgent Studio | `github.com/example/room-agent-studio` | Not a real verified repo | Keep `待核验` | Placeholder stats are unusable |
| SplatMap Viewer | `github.com/example/splatmap-viewer` | Not a real verified repo | Keep `待核验` | Placeholder stats are unusable |
| Designer CLI | `github.com/example/designer-cli` | Not a real verified repo | Keep `待核验` | Placeholder stats are unusable |
| Agent Runtime Kit | `github.com/example/agent-runtime-kit` | Not a real verified repo | Keep `待核验` | Placeholder stats are unusable |

## Watched Repo Changes Since 2026-07-10

| Repo | Stars / Forks | Recent commit / release | Issue activity | README / Demo change | Level change | Risk note |
| --- | --- | --- | --- | --- | --- | --- |
| [github/copilot-cli](https://github.com/github/copilot-cli) | `10,940 / 1,762`; up from `10,927 / 1,740` | Push `2026-07-10`; latest release [`v1.0.70`](https://github.com/github/copilot-cli/releases/tag/v1.0.70) on `2026-07-10` | Open issues `1,876`, up from `1,849` | README touchpoint still `2026-02-25`; no homepage/demo field | `A+` stays | Strong shipping cadence, but support noise is still very high |
| [github/copilot-sdk](https://github.com/github/copilot-sdk) | `9,504 / 1,298`; up from `9,496 / 1,297` | Push `2026-07-13`; release train advanced through [`v1.0.7-preview.2`](https://github.com/github/copilot-sdk/releases) on `2026-07-11` | Open issues `223`, down from `238` | README touchpoint still `2026-07-01`; no homepage/demo field | `A+` stays | Best current Copilot infra signal, but preview APIs still imply churn |
| [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | `1,581 / 120`; up from `1,536 / 116` | Push `2026-07-13`; latest release [`1.1.2`](https://github.com/google-antigravity/antigravity-cli/releases/tag/1.1.2) on `2026-07-13` | Open issues `469`, up from `458` | README touchpoint still `2026-06-07`; no homepage field | `A` -> `A+` | Fresh same-day release plus push outweigh the still-large issue surface |
| [google-gemini/starter-applets](https://github.com/google-gemini/starter-applets) | `1,347 / 452`; up from app baseline `1,345 / 451` | Push `2026-07-03`; no release | Open issues `27` | Homepage remains [aistudio.google.com/starter-apps](https://aistudio.google.com/starter-apps); README still old | `B` stays | Official related code, but still not the exact AI Studio product repo |
| [mira-wm/mira](https://github.com/mira-wm/mira) | `380 / 20`; up from `338 / 16` | Push `2026-07-12`; release [`v1.0`](https://github.com/mira-wm/mira/releases/tag/v1.0) stays `2026-07-05` | Open issues `2`, up from `1` | README moved again on `2026-07-12`; homepage stays [mira-wm.com](https://mira-wm.com/) | `B+` stays | Momentum is real, but maintainer/community depth is still small |
| [alibaba-damo-academy/RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D) | `57 / 3`; up from `36 / 2` | Last push still `2026-07-08`; no release | Open issues `1` | README touchpoint still `2026-07-08`; no homepage/demo field | `B` -> `B+` | Research-stage risk remains, but star/fork growth is now clearer than on 2026-07-10 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | `137,725 / 22,215`; up from `137,072 / 22,042` | Push `2026-07-11`; latest release [`v2.1.207`](https://github.com/anthropics/claude-code/releases/tag/v2.1.207) on `2026-07-11` | Open issues `11,311`, up from `10,815` | README touchpoint still `2026-01-12`; homepage stays [code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview) | `A` stays | Operational noise remains extreme; issue count is not a direct weakness score |
| [meshy-dev/meshy-3d-agent](https://github.com/meshy-dev/meshy-3d-agent) | `49 / 8`; up from `47 / 7` | Last push still `2026-06-24`; latest release [`v0.4.0`](https://github.com/meshy-dev/meshy-3d-agent/releases/tag/v0.4.0) on `2026-06-24` | Open issues `1` | README touchpoint still `2026-06-24`; no homepage/demo field | `B` stays | Official but still too early and too quiet for promotion |
| [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR) | `6,725 / 860`; up from `6,705 / 857` | Last push still `2026-06-04`; no release | Open issues `102` | README touchpoint still `2026-06-04`; no homepage/demo field | `B` stays | Useful anchor repo, but code freshness is weak |
| [VAST-AI-Research/UniRig](https://github.com/VAST-AI-Research/UniRig) | `1.7k / 157`; up slightly from `1,643 / 157` | Last push still `2026-06-04`; no release | Issue count not re-pulled exactly in this run; prior baseline was `28` | Homepage remains [zjp-shadow.github.io/works/UniRig/](https://zjp-shadow.github.io/works/UniRig/) | `B` stays | Still relevant to workflow tracking, but packaging/release discipline has not improved |

## Today's Search Additions

These are the most relevant newly confirmed or newly upgraded repos from the forced-candidate pass tied to the latest upstream AI reports.

| Repo | Why add or upgrade now | Initial / new level |
| --- | --- | --- |
| [simonw/llm-meta-ai](https://github.com/simonw/llm-meta-ai) | Exact repo confirmed for the Meta Model API day-zero plugin signal from the 2026-07-10 AI daily | `B` |
| [simonw/llm](https://github.com/simonw/llm) | Exact companion repo confirmed; high-signal host ecosystem for new model/provider plugins | `A-` |
| [openclaw/openclaw](https://github.com/openclaw/openclaw) | Exact repo confirmed from the same Meta-related candidate chain; large adjacent open agent surface | `B` |
| [ollama/ollama](https://github.com/ollama/ollama) | Exact repo reconfirmed from the financing-driven forced intake; still one of the strongest local/open model anchors | `A` |
| [harbor-framework/terminal-bench-2-1](https://github.com/harbor-framework/terminal-bench-2-1) | Exact public repo confirmed for `Terminal-Bench 2.1` | `A` |
| [sunblaze-ucb/exploitgym](https://github.com/sunblaze-ucb/exploitgym) | Exact public repo confirmed for `ExploitGym` | `B+` |
| [microsoft/work-iq](https://github.com/microsoft/work-iq) | Exact official repo confirmed for `Work IQ APIs` / plugin marketplace signal | `A` |
| [meta-models/meta-model-cookbook](https://github.com/meta-models/meta-model-cookbook) | Related official example repo confirmed for `Meta Model API` even though no standalone SDK repo was found in this run | `B+` |
| [runwayml/runway-api-mcp-server](https://github.com/runwayml/runway-api-mcp-server) | Exact official MCP/server repo confirmed for `Runway API` workflow usage | `B+` |
| [ArcadeAI/arcade-mcp](https://github.com/ArcadeAI/arcade-mcp) | Exact flagship repo confirmed for the `Arcade.dev` developer tool surface | `B+` |
| [openai/openai-guardrails-python](https://github.com/openai/openai-guardrails-python) | Exact official repo confirmed for the `runtime guardrails` / `agent security` lane | `A-` |

## Forced Candidate Verification

Every GitHub/project name that appeared in the current upstream AI daily/weekly materials is represented below. When only a related org/repo was found, that is called out explicitly instead of treating it as an exact product repo.

| Candidate name | Repo URL verification result | Recommendation | Notes |
| --- | --- | --- | --- |
| `github/copilot-cli` / `Copilot CLI` | Confirmed: [github/copilot-cli](https://github.com/github/copilot-cli) | `A+` | New stable `v1.0.70` and fresh push since the prior radar |
| `github/copilot-sdk` | Confirmed: [github/copilot-sdk](https://github.com/github/copilot-sdk) | `A+` | Release train moved to `v1.0.7-preview.2`; strong commit freshness |
| `Copilot cloud agent` | No exact standalone public repo confirmed; related docs remain public | `待核验` | Treat as product capability, not a clean repo entity yet |
| `The Kotlin Benchmark` | No exact repo with this exact brand confirmed | `待核验` | Related JetBrains repos exist, including [Kotlin/kotlinx-benchmark](https://github.com/Kotlin/kotlinx-benchmark) and [Kotlin/kotlin-benchmarks](https://github.com/Kotlin/kotlin-benchmarks), but the branded benchmark signal still does not map cleanly |
| `Terminal-Bench 2.1` | Confirmed: [harbor-framework/terminal-bench-2-1](https://github.com/harbor-framework/terminal-bench-2-1) | `A` | Exact versioned benchmark repo confirmed in this run |
| `GeneBench v1` | No exact AI benchmark repo confirmed in this run | `待核验` | Search results skewed toward unrelated bioinformatics repos; do not force-map |
| `ExploitGym` | Confirmed: [sunblaze-ucb/exploitgym](https://github.com/sunblaze-ucb/exploitgym) | `B+` | Exact benchmark repo confirmed |
| `Work IQ APIs` | Confirmed: [microsoft/work-iq](https://github.com/microsoft/work-iq) | `A` | Official Microsoft plugin marketplace / MCP server and CLI repo |
| `Microsoft Scout` | Related official repo confirmed: [microsoft/scout-resources](https://github.com/microsoft/scout-resources) | `B` | Exact product core repo still not exposed publicly |
| `Copilot Cowork` | No exact public repo confirmed | `待核验` | Product/workflow name, not a verified owner/repo |
| `Foundation Models framework` | Related official repos confirmed: [apple/python-apple-fm-sdk](https://github.com/apple/python-apple-fm-sdk), [apple/foundation-models-utilities](https://github.com/apple/foundation-models-utilities) | `B+` | Good official anchors, but not one exact umbrella repo |
| `Language Model protocol` | No exact public repo confirmed | `待核验` | Search results were generic protocol or paper repos, not a clear official target |
| `Antigravity CLI` | Confirmed: [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | `A+` | Fresh `1.1.2` release promoted it |
| `A2A` | Confirmed: [a2aproject/A2A](https://github.com/a2aproject/A2A) | `A` | Large, active protocol repo remains a core agent-infra watch item |
| `Agent Development Kit` | Confirmed primary repo: [google/adk-python](https://github.com/google/adk-python); companion: [google/adk-samples](https://github.com/google/adk-samples) | `A` / `B+` | `adk-python` remains the main official anchor |
| `Genkit` | Confirmed: [genkit-ai/genkit](https://github.com/genkit-ai/genkit) | `B+` | Exact framework repo still active |
| `Agent Finder` | Confirmed related official catalog repo: [github/agentfinder-catalog](https://github.com/github/agentfinder-catalog) | `B` | Public catalog repo exists; product UI repo is still not exposed |
| `ARD specification` | Confirmed: [ards-project/ard-spec](https://github.com/ards-project/ard-spec) | `B` | Exact repo still valid |
| `NVIDIA Cosmos 3` | Confirmed: [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | `A` | Official repo plus `Cosmos3` release lineage still maps cleanly |
| `physical AI agent skills` | No exact standalone repo confirmed | `待核验` | Use [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) only as related context |
| `Cosmos Coalition` | No public exact repo confirmed | `待核验` | Ecosystem/program name rather than a verified repo |
| `Runway Agent 2.0` | No exact public repo confirmed | `待核验` | Product/version signal, not a clean repo entity yet |
| `Runway API` | Related official repos confirmed: [runwayml/openapi](https://github.com/runwayml/openapi), [runwayml/runway-api-mcp-server](https://github.com/runwayml/runway-api-mcp-server) | `B+` | Official API anchors now exist, but the signal is still multi-repo |
| `Mistral OCR 4` | No exact product repo confirmed | `待核验` | Official sample context exists in [mistralai/cookbook](https://github.com/mistralai/cookbook/blob/main/mistral/ocr/structured_ocr.ipynb), but not a clean standalone repo |
| `Mistral connectors` | No exact official repo confirmed | `待核验` | Community mirrors and connector lists exist, but no exact official repo was confirmed in this run |
| `Arcade.dev` | Confirmed official org/context: [ArcadeAI](https://github.com/ArcadeAI) and [ArcadeAI/arcade-mcp](https://github.com/ArcadeAI/arcade-mcp) | `B+` | Treat `arcade-mcp` as the best current code anchor |
| `MCP runtime` | No single canonical official repo confirmed | `待核验` | Search surfaced third-party implementations such as [IBM/chuk-mcp-runtime](https://github.com/IBM/chuk-mcp-runtime), but this is still a concept-level term |
| `Patronus AI evals` | Related official repos confirmed: [patronus-ai](https://github.com/patronus-ai), [patronus-ai/patronus-mcp-server](https://github.com/patronus-ai/patronus-mcp-server) | `B` | Exact eval benchmark anchor remains diffuse |
| `agent security` | Official guardrail/security anchor confirmed: [openai/openai-guardrails-python](https://github.com/openai/openai-guardrails-python) | `A-` | Use this as the main official anchor for this lane for now |
| `runtime guardrails` | Confirmed: [openai/openai-guardrails-python](https://github.com/openai/openai-guardrails-python) | `A-` | Strongest exact official repo found in this run |
| `voice agent evals` | No exact official repo confirmed | `待核验` | Community result [Coowoolf/paperhunt](https://github.com/Coowoolf/paperhunt) is interesting but not authoritative enough to force-map |
| `enterprise process agent` | No exact public repo confirmed | `待核验` | Theme-level name, not a verified owner/repo |
| `alibaba-damo-academy/RynnWorld-4D` | Confirmed: [alibaba-damo-academy/RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D) | `B+` | Promotion justified by continued star/fork growth |
| `alibaba-damo-academy/RynnWorld-Teleop` | Confirmed: [alibaba-damo-academy/RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop) | `B` | Companion teleoperation repo remains early but real |
| `AlayaLab/AlayaWorld` | Confirmed: [AlayaLab/AlayaWorld](https://github.com/AlayaLab/AlayaWorld) | `B` | Exact repo still valid |
| `SWE-PolyBench` | Confirmed: [amazon-science/SWE-PolyBench](https://github.com/amazon-science/SWE-PolyBench) | `B` | Exact URL remains valid |
| `SWE-Lancer Diamond` | No standalone exact repo confirmed | `待核验` | Related dataset references appear inside Terminal-Bench registry results, but not as a distinct official repo |
| `DesignArena` | Related official repos confirmed: [Design-Arena/MicroEvals](https://github.com/Design-Arena/MicroEvals), [Design-Arena/agent-runner](https://github.com/Design-Arena/agent-runner) | `B` | Exact branded benchmark repo still unclear; keep conservative |
| `SpreadsheetBench` | Confirmed: [RUCKBReasoning/SpreadsheetBench](https://github.com/RUCKBReasoning/SpreadsheetBench) | `B` | Exact URL remains valid |
| `VRING:ON` | No exact public repo confirmed | `待核验` | Product/event name only |
| `design-to-manufacturing agent` | No exact public repo confirmed | `待核验` | Theme-level workflow name only |
| `simonw/llm-meta-ai` | Confirmed: [simonw/llm-meta-ai](https://github.com/simonw/llm-meta-ai) | `B` | Tiny repo, but exact and timely |
| `simonw/llm` | Confirmed: [simonw/llm](https://github.com/simonw/llm) | `A-` | High-signal plugin/runtime host repo |
| `openclaw/openclaw` | Confirmed: [openclaw/openclaw](https://github.com/openclaw/openclaw) | `B` | Exact repo confirmed; keep conservative because the upstream signal was indirect |
| `Meta Model API` official SDK / example repo | Related official example repo confirmed: [meta-models/meta-model-cookbook](https://github.com/meta-models/meta-model-cookbook) | `B+` | Cookbook/examples verified; standalone SDK repo still not confirmed |
| `OpenAI Programmatic Tool Calling` example repo | No official exact repo confirmed in this run | `待核验` | Search results were third-party demos and discussions only |
| `OpenAI multi-agent beta` example repo | No official exact repo confirmed in this run | `待核验` | Keep pending until OpenAI publishes a public code anchor |
| `Office / slides / sheets automation workflows` | No single exact repo confirmed | `待核验` | Still a theme-level watch category, not a verified repo |
| `biosafety / agent guardrails / policy engine` projects | Official guardrail anchor confirmed: [openai/openai-guardrails-python](https://github.com/openai/openai-guardrails-python) | `A-` | Use this as the closest exact official repo in the current run |
| `OpenAI GPT-Live` workflow repos | No official exact repo confirmed | `待核验` | Product signal only so far |
| `AI floor-plan / room-design CAD export` projects | No exact public repo confirmed | `待核验` | Remains a domain watch lane rather than a confirmed repo set |
| `GTM Agent stack` | No exact public repo confirmed | `待核验` | Theme-level market signal only |
| `ollama/ollama` | Confirmed: [ollama/ollama](https://github.com/ollama/ollama) | `A` | Strong open-model infrastructure anchor remains valid |

## Recommendation Changes

| Item | 2026-07-10 | 2026-07-14 | Reason |
| --- | --- | --- | --- |
| `google-antigravity/antigravity-cli` | `A` | `A+` | Fresh `1.1.2` release plus same-day code push on `2026-07-13` |
| `alibaba-damo-academy/RynnWorld-4D` | `B` | `B+` | Stars/forks grew materially without losing freshness |
| `Terminal-Bench 2.1` | pending from weekly queue | `A` | Exact repo `harbor-framework/terminal-bench-2-1` confirmed |
| `ExploitGym` | pending from weekly queue | `B+` | Exact benchmark repo confirmed |
| `Work IQ APIs` | conditional from weekly queue | `A` | Exact official Microsoft repo confirmed |
| `simonw/llm-meta-ai` | pending from AI daily | `B` | Exact repo confirmed, but still very small |
| `simonw/llm` | pending from AI daily | `A-` | Exact repo confirmed; strong ecosystem relevance |
| `Meta Model API` examples | pending from AI daily | `B+` | Official cookbook/examples repo confirmed |
| `Runway API` | conditional from weekly queue | `B+` | Official OpenAPI and MCP repos confirmed |
| `runtime guardrails` | conditional from weekly queue | `A-` | Official `openai-guardrails-python` repo confirmed |

## Risk Notes

- App-level followed projects still point to placeholder repos, so they remain excluded from recommendation logic.
- GitHub REST API hit shared-network rate limiting during this run, so later verification relied on public GitHub pages, release pages, Atom commit feeds, and search-result confirmation.
- Several upstream names still map only to product lines, benchmark brands, or program names rather than exact owner/repo identifiers: `Copilot cloud agent`, `The Kotlin Benchmark`, `GeneBench v1`, `Copilot Cowork`, `Language Model protocol`, `Cosmos Coalition`, `Runway Agent 2.0`, `VRING:ON`, and `design-to-manufacturing agent`.
- Some confirmations are intentionally labeled as `related official repo` rather than `exact repo` because the branded product surface is broader than a single public repository.
- `claude-code`, `copilot-cli`, `copilot-sdk`, `work-iq`, `adk-python`, and `ollama` all have issue/support volume large enough to distort raw activity readings.
- Most world-model and 3D research repos still lack mature release discipline, so recommendation upgrades should stay conservative until reproducibility becomes clearer.

## Source Links

Primary watched-repo sources used in this run:

- https://github.com/github/copilot-cli
- https://github.com/github/copilot-cli/releases/tag/v1.0.70
- https://github.com/github/copilot-sdk
- https://github.com/github/copilot-sdk/releases
- https://github.com/google-antigravity/antigravity-cli
- https://github.com/google-antigravity/antigravity-cli/releases/tag/1.1.2
- https://github.com/google-gemini/starter-applets
- https://github.com/mira-wm/mira
- https://github.com/alibaba-damo-academy/RynnWorld-4D
- https://github.com/anthropics/claude-code
- https://github.com/anthropics/claude-code/releases/tag/v2.1.207
- https://github.com/meshy-dev/meshy-3d-agent
- https://github.com/VAST-AI-Research/TripoSR
- https://github.com/VAST-AI-Research/UniRig

Search-addition and candidate-verification sources used in this run:

- https://github.com/simonw/llm-meta-ai
- https://github.com/simonw/llm
- https://github.com/openclaw/openclaw
- https://github.com/ollama/ollama
- https://github.com/harbor-framework/terminal-bench-2-1
- https://github.com/sunblaze-ucb/exploitgym
- https://github.com/microsoft/work-iq
- https://github.com/microsoft/scout-resources
- https://github.com/meta-models/meta-model-cookbook
- https://github.com/apple/python-apple-fm-sdk
- https://github.com/apple/foundation-models-utilities
- https://github.com/runwayml/openapi
- https://github.com/runwayml/runway-api-mcp-server
- https://github.com/ArcadeAI/arcade-mcp
- https://github.com/openai/openai-guardrails-python
- https://github.com/a2aproject/A2A
- https://github.com/google/adk-python
- https://github.com/google/adk-samples
- https://github.com/genkit-ai/genkit
- https://github.com/github/agentfinder-catalog
- https://github.com/ards-project/ard-spec
- https://github.com/NVIDIA/cosmos
- https://github.com/amazon-science/SWE-PolyBench
- https://github.com/RUCKBReasoning/SpreadsheetBench
- https://github.com/Design-Arena/MicroEvals
- https://github.com/Design-Arena/agent-runner

Upstream AI source links retained for provenance:

- https://github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot/
- https://github.blog/changelog/2026-07-09-ask-copilot-for-a-repository-overview/
- https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/
- https://simonwillison.net/2026/Jul/9/llm-meta-ai/
- https://simonwillison.net/2026/Jul/9/llm/
- https://www.businesswire.com/news/home/20260709429551/en/Ollama-Raises-%2465M-Series-B-Funding-to-Grow-its-Open-source-AI-Platform
- https://blog.jetbrains.com/kotlin/2026/07/introducing-the-kotlin-benchmark-evaluate-ai-coding-agents-on-real-world-kotlin-tasks/
- https://openai.com/index/gpt-5-6/
- https://openai.com/index/chatgpt-for-your-most-ambitious-work/
- https://openai.com/index/gpt-5-6-preferred-model-microsoft-365-copilot/
