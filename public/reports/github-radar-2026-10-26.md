# GitHub Radar 2026-10-26

- 运行状态success，契约每天07:30。
- 12个surging、20个hot、383个发现候选；全部强制队列去重52个，watch抽查5个。
- 当日正式项目刷新48，失败0；未重复启动长尾轮换。
- 官方仓库页逐项核验README、commits、Issues、PRs、Releases，全部52/52；补读10个仓库的连接器元数据和README。未安装或运行项目。

## 来源状态

|来源|状态|数量|
|---|---|---:|
|github-trending-weekly-all|success|14|
|github-trending-24h-all|success|11|
|github-trending-24h-python|success|14|
|github-trending-24h-typescript|success|20|
|ossinsight-weekly-all|unavailable|0|
|github-ai-active|success|50|
|ossinsight-24h-all|unavailable|0|
|ossinsight-24h-python|unavailable|0|
|github-agent-active|success|50|
|github-ai-new|success|2|
|ossinsight-24h-typescript|failed|0|
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

OSS Insight质量不可用仅为可选提示；真实来源状态保留。

## 强制候选结论

|仓库|Stars / Forks|许可|结论|事实与局限|
|---|---:|---|---|---|
|[firecrawl/firecrawl](https://github.com/firecrawl/firecrawl)|195319 / 10305|AGPL-3.0|approved|原创网页读取与结构化数据基础设施，源码、安装、维护与发布继续可核验；代码 AGPL-3.0，托管服务与自托管差异依文档配置，覆盖率及延迟未复测。|
|[debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio)|86792 / 9610|AGPL-3.0|observe|本地语音工作站、模型管理与配音/转写代码可见，代码 AGPL-3.0，外部模型各有许可；本轮未执行或验证所称语言覆盖，继续观察。|
|[rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch)|73816 / 12941|MIT|rejected|仍以课程、实验及挑战项目为主体；新增维护未提供足以重开原创产品或研究实现判断的证据，保留拒绝。|
|[lexmount/moli](https://github.com/lexmount/moli)|20667 / 555|Apache-2.0 OR MIT; third-party notices separate|observe|原创 Rust 浏览器运行时，根目录与 README 可核验；本日同时检查 Apache 与 MIT 正文，不能仅沿用 API 的单项许可。README 的兼容范围与性能仍需独立实测，继续观察。|
|[mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)|65454 / 5684|MIT|observe|多来源近期研究 Skill 与检索编排代码及安装可核验；结论依赖外部检索覆盖，热度和投票不自动证明可靠性，维持观察。|
|[HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor)|42674 / 5416|Apache-2.0; adapted third-party MIT notices retained|approved|有独立能力协议、知识服务、Web/CLI 工作台及 v1.6.15 发布，实读 capability protocol 和第三方归属说明，作为 Agent/知识工作台批准。模型与检索服务另配；未安装，未验证学习效果或沙箱保证。|
|[citrolabs/ego-lite](https://github.com/citrolabs/ego-lite)|19468 / 1081|MIT|observe|共享浏览器、隔离空间与插件集成有源码及说明；保留观察，产品集成不等于完整浏览器核心，速度与 Token 节约未复测。|
|[bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view)|60064 / 11720|MIT source; third-party data/assets separately licensed|observe|原创三维地理空间客户端继续观察。LICENSE 将源码 MIT 与数据明确区分：海缆 CC BY-NC-SA、部分灾害素材 CC BY-NC，另有 ODbL 数据；不可将源码许可推广至商业数据使用。|
|[Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach)|102480 / 9082|MIT|observe|多平台读取集成、CLI 与适配器可核验；依赖登录态、平台接口和第三方服务，跨平台稳定性及零费用承诺未实测，维持观察。|
|[outcrawlai/scout](https://github.com/outcrawlai/scout)|939 / 32|Apache-2.0|approved|发布者说明这是官方源的镜像分发，包含 Agent/SDK 与本地及云浏览器路径；保留既有批准。镜像有发布者关系证据，云服务及模型仍需另配，未验证成功率。|
|[basketikun/infinite-canvas](https://github.com/basketikun/infinite-canvas)|9121 / 2131|MIT|approved|原创多模态节点画布、web 与 canvas-agent 继续跟踪，MIT。实读 canvas-proxy/index.js，默认 loopback 但设置通配 CORS 并转发目标 URL；仓库已有对应问题报告。保留已有批准并记录部署关注项，未运行代理或复现利用。赞助商价格及模型供应商宣称不作为质量证据。|
|[remotion-dev/remotion](https://github.com/remotion-dev/remotion)|67431 / 5441|Custom Remotion License; company tier applies|approved|原创程序化视频工具链继续跟踪；本日许可正文区分个人、最多 3 员工盈利组织等免费档与公司许可，不能当作宽松开源。未执行渲染。|
|[jackwener/OpenCLI](https://github.com/jackwener/OpenCLI)|30633 / 3002|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[browser-use/browser-use](https://github.com/browser-use/browser-use)|119122 / 13239|MIT|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[browserbase/stagehand](https://github.com/browserbase/stagehand)|25806 / 1782|MIT|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser)|32492 / 2696|MIT wrapper; browser binary terms separate|observe|包装与分发代码可核验，README 区分 free/Pro 浏览器；包装 MIT 不表示完整二进制补丁开放，反检测效果未测，维持观察。|
|[jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser)|11952 / 1207|MIT|observe|基于 Camoufox 的 Agent 浏览器服务，有安装与接口代码；继承第三方浏览器栈，独立集成价值继续观察，未验证反检测效果。|
|[cporter202/API-mega-list](https://github.com/cporter202/API-mega-list)|8199 / 1588|NOASSERTION (未核实根许可证)|rejected|API 目录与赞助条目集合，累计 Stars 和活跃不能替代原创可运行产品或研究实现，维持拒绝。|
|[NVlabs/Sana](https://github.com/NVlabs/Sana)|9645 / 777|Apache-2.0|approved|NVIDIA 官方扩散与加速实现，代码、README 和当日维护证据继续可核验。性能为作者报告，未训练、推理或复测速度；不从 Issue 数量推断稳定性。|
|[apify/crawlee](https://github.com/apify/crawlee)|26264 / 1731|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling)|89700 / 9266|BSD-3-Clause|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[sgl-project/sglang](https://github.com/sgl-project/sglang)|38157 / 9885|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[unclecode/crawl4ai](https://github.com/unclecode/crawl4ai)|86260 / 8972|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[lightpanda-io/browser](https://github.com/lightpanda-io/browser)|36991 / 1789|AGPL-3.0-only (LICENSING.md); dependencies separate|approved|实读 Zig App 实现与 LICENSING.md，有独立浏览器运行时、构建与 1.0.2 发布，作为 Agent 基础设施批准。不是图形渲染浏览器，Windows 指引依赖 WSL；所称 16 倍内存/9 倍速度为特定测试，未复测。|
|[Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern)|23275 / 2217|AGPL-3.0|approved|公开README提供视觉模型与Playwright兼容SDK、工作流编辑及本地服务安装；维持既有判断，未实测网页成功率或云端能力。|
|[hi3d-official/Hi3Dv1.0](https://github.com/hi3d-official/Hi3Dv1.0)|315 / 22|NOASSERTION|observe|基于Sparc3D的几何细化推理与权重入口；不含训练及评测框架。1536³仅在96GB H20验证，保留观察，未下载权重或运行。|
|[feder-cr/invisible_dots](https://github.com/feder-cr/invisible_dots)|32244 / 4733|MIT|observe|自托管计算机Agent，README列出虚拟机、持久磁盘、任务和审批流程。浏览器反检测及任务可靠性为作者宣称，本批未验证，继续观察。|
|[gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper)|6856 / 1071|MIT|observe|公开CLI、Web UI、REST API和Agent Skill用于地图商户数据采集；维持既有判断，赞助商宣传不作为质量或费用依据，未执行抓取。|
|[PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored)|2568 / 416|AGPL-3.0|observe|仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。|
|[Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI)|31528 / 5858|MIT|rejected|仍围绕MuAPI第三方模型聚合及白标服务，未取得足以重开既有拒绝判断的原创技术证据。|
|[Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI)|142934 / 16874|GPL-3.0|approved|节点式生成工作流引擎，README列出本地安装、API及图像视频三维工作流；模型及社区节点需独立核验，未实测性能。|
|[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)|257049 / 56300|MIT|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[InRobots/MoonBlender](https://github.com/InRobots/MoonBlender)|2 / 1|NOASSERTION (no root LICENSE)|observe|当前目录含 MoonGS 研究实现及安装说明，但根许可未核实，最近提交与维护按证据记录；原观察保留，不将展示内容等同可直接部署管线。|
|[rxjfighting/SceneMosaic](https://github.com/rxjfighting/SceneMosaic)|52 / 1|MIT|approved|原创室内图像到可编辑仿真场景管线，代码与安装指引继续核验后保留批准；SAM3/SAM3D 等模型权限及组件条款单独配置，未复现场景。|
|[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)|261346 / 31567|MIT|approved|DeepSeek 官方可组合 Agent Harness，源码、安装、插件与发布可核验，仍为开发预览。Pulls API404 原样留档，由当日官方 Pulls 页 HTTP200 和独立 is:pr 查询补足，未将它误判为仓库下架。|
|[kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native)|28 / 11|NOASSERTION (no root LICENSE)|approved|遵循人工 approved 保留云原生多 Agent 示例；README 声称 MIT，但当前根目录未核实对应 LICENSE，不能标为已核实 MIT，Azure 服务与密钥另配。|
|[openai/codex](https://github.com/openai/codex)|130873 / 20656|Apache-2.0|approved|保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。|
|[anthropics/claude-code](https://github.com/anthropics/claude-code)|153352 / 26032|Anthropic Commercial Terms|approved|遵循人工 approved 保留 Anthropic 官方产品分发、插件与示例；当日安装及 release 可核验，LICENSE 为商业条款，不能解释为完整核心开源。|
|[fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld)|0 / 0|Apache-2.0|approved|原创 3DGS 伪影修复，推理与预处理实现继续可核验；README 训练代码和数据开放范围仍须单独看待，模型入口检查不代表性能复现。|
|[openai/MultiLangBench](https://github.com/openai/MultiLangBench)|0 / 0|Apache-2.0|approved|OpenAI 官方 SQLite 多语言编码评估与测试转换代码，Apache-2.0；默认测试子集与全量测试范围分别记录，未运行评测。|
|[deepseek-ai/deepseek-recipe](https://github.com/deepseek-ai/deepseek-recipe)|0 / 0|MIT|approved|DeepSeek 官方 Rust 库与 Python 绑定，协议转换、prompt 编码和解析有实现，MIT；推理、HTTP 及工具执行由调用方提供，不能视为完整推理后端。|
|[Fantasy-AMAP/TriFold](https://github.com/Fantasy-AMAP/TriFold)|0 / 0|NOASSERTION (未核实根许可证)|observe|当前根目录只有 README；三维高斯研究名称可确认，但实现、安装和根许可未发布，维持观察。|
|[ku-autoai/MAGE](https://github.com/ku-autoai/MAGE)|0 / 0|MIT|observe|GUI Agent 的规划、训练和评测代码可核验，MIT；当前 README 的匿名配套模型/数据入口另行复查，源码可访问不等于资产可获取，维持观察。|
|[pengpeng-yu/CodecSplat](https://github.com/pengpeng-yu/CodecSplat)|0 / 0|MIT|approved|原创前馈 3DGS 潜特征熵编码研究，代码、配置和模型说明可核验，MIT；本轮只检查入口及指引，未复测压缩质量。|
|[RUCAIBox/Agentic-ImageGen-Wild](https://github.com/RUCAIBox/Agentic-ImageGen-Wild)|0 / 0|NOASSERTION (未核实根许可证)|rejected|当前官方元数据仍为 Fork，根目录为 README 与展示资源，缺少可执行原创增量和根许可；文档更新已记录但不足以重开拒绝。|
|[SegerEnd/sprongmotion-blender](https://github.com/SegerEnd/sprongmotion-blender)|0 / 0|GPL-3.0-or-later add-on; Apache-2.0 runtime/model; demo media excluded|approved|0 Stars 的新发布仍按原创性批准。实读 engine.py 和 retarget.py，具有时间线分块、骨架重定向与写关键帧；v1.0.0 三系统安装包列出，需 Blender5+。插件 GPL 与运行时/模型 Apache 分开；脚滑、转圈跳帧、动作衔接及约 9 秒分块限制明确，未安装或复测。|
|[SegerEnd/sprongmotion-runtime](https://github.com/SegerEnd/sprongmotion-runtime)|0 / 0|Apache-2.0 runtime and model; demo media excluded|approved|AI 日报强制/P0，0 Stars 不妨碍批准：实读 sm_gen.c 和公开 C API，v1.0.0 含 Linux/macOS/Windows/WASM 包，HF 模型元数据和文件列表可取。名称 14M 指 13.8M 生成器，完整模型约 20M；模型 Apache-2.0，演示媒体保留版权且有使用请求。部分测试张量未公开，M4 速度未复测，不下载权重。|
|[VAST-AI-Research/EdenLive](https://github.com/VAST-AI-Research/EdenLive)|0 / 0|Apache-2.0 code; model/component terms separate|approved|VAST 研究发布，离线推理与实时服务及模型入口继续核验；帧率为作者报告，引用视频与 FLUX/DINO 等组件条款单独适用，未运行服务。|
|[deepseek-ai/DeepInfer](https://github.com/deepseek-ai/DeepInfer)|22391 / 2587|Apache-2.0|observe|DeepSeek发布的原创离线推理框架；README说明仅支持V4.1-Flash与SM100/Ascend950，完整在线服务所需KV缓存、分离及负载均衡未全部提供。保留观察，未复现性能。|
|[gaojh0333/PanoGraphGS](https://github.com/gaojh0333/PanoGraphGS)|0 / 0|NOASSERTION|observe|面向全景分割和层次三维场景图的3DGS研究；README仍将推理与评测代码列为待发布，API无明确许可。数据集入口可读，继续观察，指标为作者报告。|
|[simonw/battledrones](https://github.com/simonw/battledrones)|0 / 0|Apache-2.0 source; external model and art terms separate|approved|Simon Willison 的游戏及 LLM 工具环境，当前 README、TypeScript 与 Toolbox 文件目录可核验；保留 AI 编程/Agent 环境批准，不当作机器人或建筑能力证据，未运行游戏。|
|[XingChen-AGI/Xing4.0-29B-Intent](https://github.com/XingChen-AGI/Xing4.0-29B-Intent)|32 / 5|Apache-2.0|observe|中国电信星辰发布者的29B/4B激活MoE意图识别及结构化抽取模型，README提供SDK、权重与数据集入口，Apache2.0。业务准确率须另测，保留观察。|

## Watch轮换样本

- OpenMOSS/MOVA：observe；仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。
- perfanalytics/pose2sim：observe；仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。
- scenario-labs/skills：observe；仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。
- scrapy/scrapy：observe；仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。
- tetherto/qvac：observe；仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。

证据：github-radar-review-ledger.json、github-connector-evidence.json、wagmi-github-connector-2026-10-26.json。连接器/readme别名端点HTTP400已保留，后续通过标准文件读取接口成功取得README，不影响官方页面完整证据。

## 09:00独立二次复核

- 官方Trending四项与活跃搜索23项成功；383候选，12 surging、20 hot、314行业优先。
- 52个强制身份经连接器确认，全部必需官方页面证据通过；另复核5个轮换样本。
- 元数据dry-run刷新46项、失败0；无新增强制仓库身份，保留本日既有编辑决定，正式库存262项。
- 本次新核验SprongMotion两个1.1.0发布，已在AI日报形成工程升级事件；原始仓库已在强制队列。
- OSS Insight四项缺失仅为可选提示，保留真实unavailable/timeout。
