# AI 实验室

2026-11-06：用户已授权合并到 main 并接入正式站，使用本机 GPT-6.1 Sol API，允许所有访客在隔离浏览器会话中生成、编辑和保存。正式站使用 8080 同域代理与 8787 独立后端，开发版 5186/8786 及私人案例保持独立。启动、访问边界和额度见 [正式站运行说明](docs/ai-lab-production.md)。下文保留独立开发版的历史流程与测评范围；其中“主项目审核后接入”的表述描述合并前阶段。

从 Wagmi Daily 的 `57ce332bd5b69195e11fe7d4d14595e42f3ae86f` 创建 `codex/ai-lab`。本分支为户型图生成可编辑 3D 空间的本地产品原型；主项目审核后决定接入和发布。

## 启动

需要 Node.js 22、Python 3.13 和本仓库 lockfile 对应依赖。在独立 checkout 内执行：

```powershell
npm ci --ignore-scripts --no-audit --no-fund
# 当前聊天接力不需要模型 Key；保留已有私有配置。
python -m pip install -r ai-lab/server/requirements.txt
powershell -NoProfile -File scripts/start-ai-lab-dev.ps1
```

浏览器入口 `http://127.0.0.1:5186/#/ai-lab?tool=floorplan3d`。API 仅监听 `127.0.0.1:8786`，通过 Vite 同源代理访问 `/api/ai-lab/v1`。进程日志位于 `.local-ai-lab/runtime/`。构建使用 `npm run build:lab`，输出 `dist/ai-lab/`，不执行原项目的数据同步、管理写入或发布插件。停止实验室使用 `scripts/stop-ai-lab-dev.ps1`，不会删除方案或图片。

界面现名为 **Floorplan-Editor**。`#/ai-lab`为应用目录，选择应用后进入上述项目管理页；选择项目或新建才进入编辑器。原projectId深链接继续可用。开发版`#/today`导航已增加AI实验室入口，只读读取本机8080公开JSON用于入口演示；正式站接入仍由主项目审核。[入口与项目管理说明](docs/ai-lab-floorplan-editor.md)。

**日常实验室开发仅使用 `dev:lab` / `build:lab` 或上述启动脚本。** 原项目 `npm run build`、日报、通知与发布脚本不属于本分支工作流。

## 模型与数据

自 2026-11-05 起，按用户要求默认使用 **当前 Codex 聊天接力**。后端默认 provider 不发出模型请求、不启动 CLI/SDK；旧 DeepSeek 网关和私有 Key 不会自动生效。网页创建本地任务并显示持久化进度，当前聊天显式读取原图、提交分析/候选、核对客户端视图并保存。`codex-current-session` 是执行方式标签，不是具体模型型号。接口、工具与部署依赖见 [Codex 接力说明](docs/ai-lab-codex-handoff.md)。

历史 DeepSeek 测试的参数证据和用量记录继续保留，参见 [参数证据](ai-lab/server/reasoning-notes.md)。这些旧配置不代表当前运行方式；大模型切换测评在基础交互完成后另行进行。当前聊天的 token/费用未接入网页账单，必须显示未知，不能按零用量或零费用统计。

图片、SQLite、不可变场景版本和参考案例均保存在忽略的 `.local-ai-lab/`，不复用主项目 `data/dev`、`data/main` 或其发布目录。既有三例可作为私有参考导入，界面会标注“历史参考”及其修改来源；不会将参考场景当作新模型生成结果。原 floorplan 工程、图片和浏览器布置均保留。

## 已实现的产品链路

- PNG/JPG 上传、自动估算/图上两点已知长度校准/手动比例、要求输入、单队列生成、进度、取消、重启中断处理和幂等提交。尺度记录来源、锚点、依据、范围和置信度；无依据时要求补充，不套用参考比例。
- 当前默认强制使用 `codex-handoff-v1`：尺寸核对→识别结构→搭建空间→检查复核→方案完成。`awaiting_codex` 等待当前聊天接手，`awaiting_input` 等待用户在比例尺浮层补充已知尺寸。候选经过完整编译和编辑状态检查，客户端提交可解码的2D/3D图片后，仍需当前Codex对照原图显式复核与保存；浏览器不能自行提交复核或finalize。重放、取消、修订与场景版本均有校验。历史 `codex-workflow-v1` / `legacy-single-v1` 数据和离线回归保留，不作为默认模型执行通路。
- 确定性编译器仅进行一次像素到毫米转换，检查边界、房间相交、合法对象和门窗参数。显式 `wallSegments`、`furnitureRows`、`stairRuns` 展开为同一legacy几何，不执行模型代码，不补猜测厚度或夹紧越界坐标。
- 复用 floorplan 的 2D/3D、家具库、测量与编辑器，iframe 样式隔离，缓存按项目和版本分开；完整 scene 与当前 state 一并保存、导出。
- 已保存场景通过本地家具/材质属性和视角工具编辑；右侧Agent可按需查看实际任务记录，不开放后续AI修改输入。户型导入仅支持已实现的PNG/JPG，不展示未实现的DXF等入口。
- 旧供应商usage和参数继续按原记录保存，当前聊天接力的usage保持null。阶段产物、尺度依据、候选校验和客户端图片留在私有目录；页面事件只显示显式工作摘要，不显示隐藏推理、凭据或内部路径。

尺度可以来自图纸标注、用户已知长度或模型估算；均不代表现场实测。几何通过、模型视觉复核通过和独立人工验收分别记录。模型复核不能替代人工还原质量判断。原图叠加可在viewer内开关，自动复核图排除叠加层，避免把原图当成生成结果。

接力任务仍固定修正/视觉复核上限快照，重开任务不扩额。`AI_LAB_WORKFLOW_MAX_CALLS` 是历史自动工作流预算，不代表当前接力会发出模型请求。后续比较模型时应固定同一流程、输入、尺度策略、推理档位和预算，并保留所有失败及人工修改记录。此前Codex会话的历史参考结果与旧API测试不构成同条件模型排名。历史迁移范围见 [流程记录](docs/ai-lab-workflow-parity.md)。

## 验收与隔离

```powershell
python tests/ai-lab-engine-test.py
python tests/ai-lab-primitives-test.py
python tests/ai-lab-server.test.py
python tests/ai-lab-server-workflow.test.py
node --test tests/ai-lab-isolation.test.mjs
node --test tests/ai-lab-layout.test.mjs
npm run typecheck
npm run build:lab
node scripts/verify-ai-lab-isolation.mjs
```

可选 `AI_LAB_LEGACY_FIXTURES` 指向私有原案例父目录，以只读方式执行三例兼容检查。隔离脚本在内存构建 public/admin/lab，禁止载入原 Vite 配置、私有 env、发布插件和 public 数据，不写构建文件；public/admin 均不包含实验室模块、导航和 API。

2026-11-03：实验室引擎 10 项（含三例）、后端 24 项、前端 9 项通过，类型检查与 lab 构建通过。全库 `npm test` 曾为 235/236；`data-contract.test.mjs` 因鲜克隆缺少忽略的 `data/dev/papers-catalog.json` 在注册内部子测试前退出。因此全库数据契约验收未完成；没有补造历史数据或绕过既有测试。独立技术审查见 [审查记录](docs/ai-lab-review.md)。真实模型验收另行记录，不以离线 mock 或参考兼容代替。

2026-11-04：分阶段工作流、自动/两点校尺、真实截图回传与有界复核已在真实网关贯通。三张真实图的原始失败、重复响应修复后的定点复验及尺度证据均见 [迁移验收](docs/ai-lab-workflow-acceptance.md)，不能用功能链路通过替代还原质量通过。失败/需补输入的项目重新打开时恢复原图和原提交输入；终态候选明确任务已停止。

## 交接与发布边界

前端改动集中在 `src/features/ai-lab/`，仅对 App、router、package 增加模式门控和懒加载。后端、编译器、viewer 和本地 Three.js 依赖位于 `ai-lab/`，保留上游许可。实验室独立 Vite 配置不包含原管理写入或 Sites 发布插件。

本阶段仅本机单用户，未提供公开访问认证、配额、多人隔离、生产备份或网关账单核对。正式发布前需要主项目审核接入路径和功能开关，并补齐这些能力及三例生成质量评测。提交仅面向 `codex/ai-lab` 的审阅，不合并或发布 main，不自动调用日报、通知或部署。
