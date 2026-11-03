# GitHub Radar 2026-10-25

- 批次日期：2026-10-25；契约07:30；状态success。
- 11个surging、20个hot、381个发现候选；全部强制队列去重49个，watch抽查5个。
- 既有正式项目262个；当日官方元数据刷新49个，失败0；未重复启动长尾全量轮换。
- GitHub连接器与官方仓库页互证；README、commits、Issues、PRs、Releases均逐项核验。未运行外部项目或复现性能。

## 来源与质量

|来源|状态|数量|
|---|---|---:|
|github-trending-weekly-all|success|15|
|github-trending-24h-all|success|10|
|github-trending-24h-python|success|11|
|github-trending-24h-typescript|success|21|
|ossinsight-24h-all|unavailable|0|
|ossinsight-weekly-all|unavailable|0|
|github-ai-active|success|50|
|ossinsight-24h-python|unavailable|0|
|ossinsight-24h-typescript|unavailable|0|
|github-agent-active|success|50|
|github-ai-new|success|2|
|github-aec-design-active|success|50|
|github-interior-design-active|success|50|
|github-3d-active|success|50|
|github-3d-generation-active|success|50|
|github-3dgs-active|success|50|
|github-simready-active|success|50|
|github-open-model-new|success|4|
|github-image-generation-active|success|50|
|github-video-intelligence-active|success|50|
|github-video-generation-active|success|50|
|github-video-editing-active|success|50|
|github-video-3d-stage-active|success|50|
|github-video-2026-new|success|50|
|github-web-data-active|success|50|
|github-browser-automation-active|success|50|
|github-deep-research-active|success|50|
|github-document-processing-active|success|50|
|github-physical-ai-active|success|50|
|github-vla-robotics-active|success|50|
|github-robot-simulation-active|success|50|

OSS Insight四项质量不可用仅为可选来源提示；未将空结果当作真实零热度。

## 强制仓库审校

|仓库|Stars / Forks|许可|结论|事实与局限|
|---|---:|---|---|---|
|[rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch)|73308 / 12856|MIT|rejected|仍以542课教学路径、实验和项目挑战为主体；当日文档及实现维护已核实，但未发现足以重开原创产品/研究库存拒绝判断的新证据。|
|[lexmount/moli](https://github.com/lexmount/moli)|20491 / 548|Apache-2.0 OR MIT; third-party notices separate|observe|原创 Rust Agent 浏览器运行时，DOM、解析、布局、V8与多协议模块均可见；README明确不追求Chrome像素、Canvas/WebGL与媒体高保真，性能数据为作者测试。本日核实双许可正文，不能只沿用API单项Apache标识。|
|[mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)|65320 / 5669|MIT|observe|原创多来源近期研究Skill与检索编排，当前安装和发布可核验；质量依赖外部检索覆盖，热度、投票或交易信号不自动证明结论可靠，保留工程跟踪。|
|[citrolabs/ego-lite](https://github.com/citrolabs/ego-lite)|19224 / 1070|MIT|observe|Agent与人共享浏览器、隔离Spaces及插件集成可核验；保留观察，产品集成代码不等同完整浏览器核心，速度和Token节约未复测。|
|[bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view)|59694 / 11624|MIT source; third-party data/assets separately licensed|observe|原创三维地理空间客户端与数据集成，源码MIT；当日LICENSE明确数据与模型不随源码授权：海缆数据CC-BY-NC-SA、部分灾害素材CC-BY-NC，实时地图/航空等另遵循提供方条款。README自称探索学习客户端，不能当作已加固生产服务。|
|[debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio)|84977 / 9407|AGPL-3.0|observe|原创本地语音工作站，桌面应用、语音模型管理与配音/转写工作流源码可见，AGPL-3.0；模型各自许可。语言数量与性能属于作者宣称，本轮没有下载模型或运行。|
|[Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach)|101763 / 8990|MIT|observe|原创多平台互联网读取集成，CLI、适配器与安装说明可见；依赖平台登录态、第三方服务和接口，零费用或全平台稳定性为作者描述，未执行自动化任务。|
|[outcrawlai/scout](https://github.com/outcrawlai/scout)|937 / 31|Apache-2.0|approved|发布者声明自动镜像其官方源仓库，含浏览器Agent、SDK与本地/云浏览器路径；保留批准，原始实现不因镜像分发直接排除。Node22+，云端需要服务和模型密钥，反检测与任务成功率未复测。|
|[basketikun/infinite-canvas](https://github.com/basketikun/infinite-canvas)|9003 / 2109|MIT|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[remotion-dev/remotion](https://github.com/remotion-dev/remotion)|67111 / 5407|Custom Remotion License; company tier applies|approved|原创程序化视频工具链与packages实现可见，继续跟踪；本日LICENSE明确个人、最多3员工盈利组织等可用免费许可，较大盈利组织需公司许可，不能将NOASSERTION当作宽松开源。未运行渲染。|
|[hugohe3/ppt-master](https://github.com/hugohe3/ppt-master)|67414 / 5283|MIT|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[jackwener/OpenCLI](https://github.com/jackwener/OpenCLI)|30612 / 2999|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[browser-use/browser-use](https://github.com/browser-use/browser-use)|119059 / 13227|MIT|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[browserbase/stagehand](https://github.com/browserbase/stagehand)|25803 / 1781|MIT|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[firecrawl/firecrawl](https://github.com/firecrawl/firecrawl)|195012 / 10291|AGPL-3.0|approved|保留原创网页读取与结构化数据基础设施；官方源码、安装、维护和发布可核验。AGPL-3.0覆盖代码，托管服务与自托管能力按各自文档配置，README覆盖率和延迟为作者测试，未复测。|
|[CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser)|32459 / 2691|MIT wrapper; browser binary terms separate|observe|可核验Playwright/Puppeteer包装和自动分发；README区分free与Pro浏览器二进制，不能将包装MIT解释成全部底层补丁开放。通过检测站的数量和效果为作者声明，未测试。|
|[jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser)|11907 / 1201|MIT|observe|基于Camoufox的Agent浏览器服务，安装与接口代码可见；继承第三方浏览器栈，独立扩展与集成价值保留跟踪，反检测效果未复测。|
|[cporter202/API-mega-list](https://github.com/cporter202/API-mega-list)|8175 / 1587|NOASSERTION (未核实根许可证)|rejected|仍为API目录与赞助条目集合，累计Stars和当日活跃不能替代原创可运行产品或研究实现，维持拒绝。|
|[NVlabs/Sana](https://github.com/NVlabs/Sana)|9641 / 777|Apache-2.0|approved|NVIDIA官方扩散与加速研究实现继续跟踪；当日纯Issue查询中LongSana非CUDA设备问题已关闭，Wan2.1加速复现差距问题仍开放。README性能为作者报告，不能从累计Stars或Issue数量推断稳定性；未运行训练、推理或速度复测。|
|[apify/crawlee](https://github.com/apify/crawlee)|26250 / 1730|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling)|89479 / 9234|BSD-3-Clause|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[sgl-project/sglang](https://github.com/sgl-project/sglang)|37789 / 9864|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[unclecode/crawl4ai](https://github.com/unclecode/crawl4ai)|86185 / 8963|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[lightpanda-io/browser](https://github.com/lightpanda-io/browser)|36942 / 1786|AGPL-3.0|approved|原创Zig无头浏览器，README提供安装、CDP和基准说明；Windows需WSL。性能数字为作者测量，本批未运行。|
|[Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern)|23266 / 2214|AGPL-3.0|approved|浏览器工作流产品，公开说明包含视觉模型、Playwright兼容SDK及本地服务；保留既有审批，未验证自动化成功率。|
|[hi3d-official/Hi3Dv1.0](https://github.com/hi3d-official/Hi3Dv1.0)|245 / 18|NOASSERTION|observe|提供基于Sparc3D的三维几何细化推理代码；训练及评测代码未包含。1536³只在96GB H20验证，具体许可和较小显卡可行性继续观察。|
|[feder-cr/invisible_dots](https://github.com/feder-cr/invisible_dots)|32228 / 4731|MIT|observe|提供自托管计算机Agent、虚拟机、持久化任务及权限流程的安装说明；公开README中的反检测能力未独立验证，本批仅元数据与源码入口核验。|
|[Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI)|31424 / 5819|MIT|rejected|README围绕MuAPI第三方模型聚合与白标服务，未见足以重开既有拒绝判断的原创技术证据。|
|[Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI)|142631 / 16819|GPL-3.0|approved|持续维护的节点式生成工作流引擎，README列出本地安装、API及图像视频三维工作流；社区节点与模型仍需独立审核。|
|[vllm-project/vllm](https://github.com/vllm-project/vllm)|95340 / 23898|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)|256806 / 56172|MIT|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[InRobots/MoonBlender](https://github.com/InRobots/MoonBlender)|2 / 1|NOASSERTION (no root LICENSE)|observe|核实存在MoonGS训练、评测、几何与COLMAP输入推理实现，不能沿用早期无代码或完全不相关的判断；当前README安装仍指向xiaoc57/MoonGS，根许可缺失，语义组件/启发式重采样仍TODO，Missing Modules问题开放且最近提交2025-10-09，保留观察。|
|[rxjfighting/SceneMosaic](https://github.com/rxjfighting/SceneMosaic)|52 / 1|MIT|approved|原创室内图像到可编辑仿真场景管线，保留批准；须单独获取SAM3/SAM3D等受限模型权限并配置Linux与显存环境，根MIT不能替代模型条款。本日只核验源码和指引，未复现场景。|
|[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)|260462 / 31462|MIT|approved|DeepSeek官方可组合Agent Harness，源码、安装、插件与release可核验；仍为开发预览。Pulls集合API404真实保留，以当日官方Pulls页HTTP200补足字段；没有把API404视为仓库消失。|
|[kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native)|28 / 11|NOASSERTION (no root LICENSE)|approved|遵循人工approved保留云原生多Agent示例；README声称MIT但当前根目录没有对应LICENSE，不能继续写为已核实MIT。代码示例与部署结构可访问，服务密钥和Azure环境另配。|
|[openai/codex](https://github.com/openai/codex)|130806 / 20638|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[anthropics/claude-code](https://github.com/anthropics/claude-code)|153287 / 26588|Anthropic Commercial Terms|approved|遵循人工approved保留Anthropic官方产品分发、插件与示例；当前安装和release可核验，LICENSE为商业条款，不能把仓库存在解读为完整核心开源。|
|[fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld)|0 / 0|Apache-2.0|approved|原创3DGS伪影修复，两阶段推理、benchmark预处理与配置已公开；README仍说明训练代码和训练数据后续发布。模型入口本日HTTP200，代码Apache-2.0，底模与资产另计，未复测性能。|
|[VAST-AI-Research/EdenLive](https://github.com/VAST-AI-Research/EdenLive)|0 / 0|Apache-2.0 code; model/component terms separate|approved|VAST官方实时生成渲染实现，离线推理与实时服务、模型入口可核验；项目/模型页面本日HTTP200，引用视频仍由上游引擎提供。RTX5090帧率为作者报告，FLUX/DINO等组件条款单独适用。|
|[deepseek-ai/deepseek-recipe](https://github.com/deepseek-ai/deepseek-recipe)|0 / 0|MIT|approved|DeepSeek官方Rust库及Python绑定，负责协议转换、prompt编码与响应解析，MIT；README明确推理、HTTP与工具执行由调用方提供，不是完整推理后端。|
|[Fantasy-AMAP/TriFold](https://github.com/Fantasy-AMAP/TriFold)|0 / 0|NOASSERTION (未核实根许可证)|observe|三维高斯潜变量研究名称可确认，根目录仍只有README，无实现、安装或根许可证，保持观察。|
|[ku-autoai/MAGE](https://github.com/ku-autoai/MAGE)|0 / 0|MIT|observe|原创手册增强GUI Agent，规划、轨迹、训练与评测目录可核验，MIT；论文链接仍待补，当前README配套匿名模型/数据入口实测HTTP403。保留观察，源码访问不等同配套资产可取得。|
|[openai/MultiLangBench](https://github.com/openai/MultiLangBench)|0 / 0|Apache-2.0|approved|OpenAI官方SQLite3.40.1多语言编码评估与测试转换实现，Apache-2.0；默认采用272个测试子集，全量约24k测试须另注明，未执行评测。|
|[pengpeng-yu/CodecSplat](https://github.com/pengpeng-yu/CodecSplat)|0 / 0|MIT|approved|原创前馈3DGS潜特征熵编码研究，源码、配置与模型入口可核验，MIT；本日模型页HTTP200，Python3.10/PyTorch2.9.1依赖按文档配置，维护时间按当日提交证据记录，未复测压缩结果。|
|[RUCAIBox/Agentic-ImageGen-Wild](https://github.com/RUCAIBox/Agentic-ImageGen-Wild)|0 / 0|NOASSERTION (未核实根许可证)|rejected|本日新增完整论文/benchmark介绍与arXiv链接，但元数据仍fork=true，根目录只有README和展示asset，无可执行实现或根许可；记录新官方文档证据，仍不足以批准原创可用产品。|
|[simonw/battledrones](https://github.com/simonw/battledrones)|0 / 0|Apache-2.0 source; external model and art terms separate|approved|AI日报强制候选；实读TypeScript游戏入口与llm_tools_battledrones.py，包含LLM Toolbox、按回合对战和记录回放，四人联网变更已核验。作为AI编程与Agent工具调用环境批准；不是建筑设计或机器人能力证明。Apache-2.0，官方试玩入口HTTP200；未运行游戏、联机或模型对战。|
|[Fantasy-AMAP/LongForcing](https://github.com/Fantasy-AMAP/LongForcing)|0 / 0|NOASSERTION (未核实根许可证)|observe|根目录仍只有README，世界模型研究名称可确认，代码、模型、安装与根许可未发布，保持观察。|
|[greenvla/GreenWAM](https://github.com/greenvla/GreenWAM)|0 / 0|OpenMDW-1.1; third-party notices retained|observe|原创机器人世界模型与策略研究，当前代码与checkpoint说明可核验，基于Cosmos3 Edge；根许可证OpenMDW-1.1，外部权重/依赖单独配置，榜单为作者报告，保留观察。|
|[sumuru789/DK-VLM](https://github.com/sumuru789/DK-VLM)|0 / 0|MIT original contributions; VGGT-Omega noncommercial portions|approved|原创几何注意力研究，推理评测和LoRA/几何分支权重入口可见；本日模型页HTTP200，底模需独立获取。MIT仅覆盖原创贡献，派生自VGGT-Omega的部分保留非商业研究限制。|

## Watch 抽查

- nerfstudio-project/nerfstudio：approved；成熟原创工具链，长期被 3D 重建研究与工程流程采用；高质量实景扫描优先验证 Splatfacto-big。
- neu-vi/houseCrafter：approved；ICCV 2025 Highlight 官方代码与预训练模型，原创性和场景价值明确。
- nv-dvl/vgg-ttt：approved；NVIDIA Deep Vision Lab 官方论文代码，属于 LingBot-Map 同类前馈重建新路线。
- nvidia-cosmos/cosmos-predict2.5：approved；物理 AI 世界模型的核心开放平台，可服务机器人、自动驾驶和工业数字孪生的数据生成。
- nvidia-cosmos/cosmos-transfer2.5：approved；NVIDIA 官方物理 AI 数据生成主线，直接服务 Sim2Real、机器人感知和世界仿真。

完整证据：data/dev/github-radar-review-ledger.json、github-connector-evidence.json、wagmi-github-connector-2026-10-25.json、wagmi-github-readmes-2026-10-25.json。原有中文审校保留，本次新采事实与历史判断分开记录。

## 09:00独立二次复核

- 官方Trending四项和活跃搜索23项成功；381候选，11 surging、20 hot、314行业优先候选。
- 当前49强制仓库及5轮换样本的仓库/README/commits/Issues/PRs/Releases全部复核；49强制身份经GitHub连接器确认；元数据dry-run刷新48项、失败0。
- 新出现的polyform及Gaussian-Splat-Lite已读官方元数据、README与实现目录；后者明确派生SparkJS/SuperSplat，保留独立差异与运行验证事项，两项暂观察。正式库存仍262项。
- OSS Insight两项unavailable、两项timeout均为可选来源提示，不单独阻断。
- 完整证据保存于data/dev/audit-0900-2026-10-25-github-evidence.json及-industry-review.json。
