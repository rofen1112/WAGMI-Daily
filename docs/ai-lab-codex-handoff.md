# 当前 Codex 聊天接力

默认执行方式是 `codex_handoff`，执行标签为 `codex-current-session`。这不是具体模型型号，也不代表网页已获得自动推理能力。生成按钮只创建本机任务；需当前聊天显式读取原图、分析、提交候选和复核。没有 SDK/CLI、自动模型请求或旧网关 fallback。旧私有 Key、历史 jobs/usage/versions 均保留，旧结果不改写。

新接力截图入口明确依赖 `ai-lab/server/requirements.txt` 中的 `Pillow==12.2.0`（本机已有；程序不会自动安装）。部署前显式安装该 requirements。缺失时返回结构化 `capture_decoder_unavailable`，不退回只检查图片头。这里只对新 handoff captures 使用该依赖，不改既有 upload 的实现。

`health.providerConfigured=false` 与 `capabilities.generation=true` 可以同时成立：可创建本地接力任务，但没有自动模型 provider。接力 job 的 `usage=null`、`usageAccounting=current_session_unreported`；当前聊天用量和费用未接入，不能显示为零调用或零费用。

## 网页合同

新 generate 在默认 runtime 强制使用 `codex-handoff-v1`，即使旧客户端提交旧 pipeline 标签也不会触发旧网关。初始状态为 `awaiting_codex`；比例信息不足时为 `awaiting_input`。两者均可取消且不是 terminal。首次候选校验成功后为 `awaiting_review_images`，网页沿用既有 draft viewer 和 `POST /jobs/:id/review-images` 真实截图接口。截图收到后回到 `awaiting_codex`，等待当前聊天复核，不自动调用模型。

`job.handoff={requestId,revision,phase}`。每次有效接力提交推进 revision。`job.events` 和 `GET /jobs/:id/events?after=0&limit=100` 的 event 同形：

```json
{"events":[{"id":1,"at":"2026-11-05T00:00:00Z","type":"stage","stage":"awaiting_codex","message":"等待当前Codex聊天接力"}],"cursor":1,"hasMore":false,"terminal":false}
```

id/cursor 持久稳定，重新打开页面从旧 cursor 续读，不构造模拟推理流。只公开显式进度摘要，不包含思维链、工具命令、凭据和内部路径。`publicMessage` 是可选、显式的公开工作摘要，不能填写隐藏推理或原始工具输出。

用户补比例：`POST /jobs/:id/input`，携带最新 `requestId/revision`、随机 32hex `submissionId`，以及 `scaleMode` 和对应 `mmPerPixel` 或 `calibration`。返回 `{job}`。校尺仍按原图像素坐标；手动/用户标定不被分析覆盖。auto 无有效依据会继续等待输入，绝不使用固定默认比例。

## 当前聊天专用桥

只接受 loopback 的非浏览器客户端；带 `Origin` 或 `Sec-Fetch-*` 的浏览器请求会被拒绝。这里没有远程服务发布或任意代码执行入口。所有建模输入是 JSON 数据，不能提交代码、命令或服务端文件路径。

工具位于 `ai-lab/server/handoff_cli.py`，从项目根运行：

```powershell
python ai-lab/server/handoff_cli.py --job <32hex-job-id> request
python ai-lab/server/handoff_cli.py --job <32hex-job-id> analysis --file <explicit-json-payload>
python ai-lab/server/handoff_cli.py --job <32hex-job-id> candidate --file <explicit-json-payload>
python ai-lab/server/handoff_cli.py --job <32hex-job-id> review --file <explicit-json-payload>
python ai-lab/server/handoff_cli.py --job <32hex-job-id> finalize --file <explicit-json-payload>
```

`request` 对应 `GET /api/ai-lab/v1/jobs/:id/handoff/request`，返回当前修订、原图宽高/MIME、服务端验证过的安全本地文件路径与 sourceHash、原始用户要求、已保存分析/尺度/像素 IR、检查报告和截图路径。路径仅用于当前本机操作者查看，公共 job/events/draft 不返回这些内部路径。读取原图后用当前聊天的图像查看工具实际检查，不用参考案例冒充新生成。

每个 mutation 的公共字段如下；每次使用新的 submissionId，重试同一次提交应完整复用原 body。相同 ID+相同内容是幂等，不同内容返回 conflict。过期 revision、已取消/完成任务、项目版本冲突均拒绝推进。禁止在脚本里自动修订版本号掩盖过期输入。

```json
{"requestId":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","revision":0,"submissionId":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","publicMessage":"已查看原图，正在记录可见结构与尺度依据。"}
```

### analysis

`POST /jobs/:id/handoff/analysis`，增加 `analysis` 对象。示意 shape：

```json
{"requestId":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","revision":0,"submissionId":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","analysis":{"summary":"图纸内容的简体中文摘要","spaces":["原图可见房间"],"notes":["可见与无法确认的细节"],"scale":{"anchors":[{"source":"dimension_annotation","label":"原图标注长度原文","p1":[10,10],"p2":[90,10],"lengthMm":800}],"confidence":"medium","evidence":["原图明确标注"],"assumptions":[]}}}
```

这里坐标和长度仅演示 schema，不是任何真实图纸。没有标注时可用明确的 `object_prior` 典型尺寸假设、原图两点、覆盖所有比例的 `rangeMmPerPixel`；程序计算锚点比值中位数并保留低置信估算标签。不可捏造标注或现场测量真值。有矛盾的尺寸锚点不会降级掩盖。完整尺度规则与既有 `scale.py` 相同。

### candidate

`POST /jobs/:id/handoff/candidate` 增加 `pixelScene`，提交完整原图像素 IR。支持的结构及 primitives 与已有 `pixel-scene-v2`/engine 契约相同；坐标必须在原图边界内，尺寸严格为正，polygon 不重复闭合点、不相邻重复。窗台/窗头可省略；提供时与 windows 长度一致。服务端展开 primitives、覆盖受控 provenance，再执行 compile、scene 与 editor-state 完整校验。不替模型修坐标或降低校验。

```json
{"requestId":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","revision":1,"submissionId":"cccccccccccccccccccccccccccccccc","pixelScene":{"rooms":[{"id":"r1","name":"合成房间","poly":[[10,10],[90,10],[90,90],[10,90]],"mat":"wood"}],"walls":[[5,5,95,10,"e"]],"windows":[],"doors":[],"slides":[],"furniture":[]}}
```

失败候选与检查报告只保存在私有 jobs artifacts，未写正式 version；有效候选获得每轮变化的 draftId，网页提交客户端截图。服务端限制每张不超过4MB、每轴不超过1280、总像素不超过1280²、单帧、实际格式与MIME一致，通过 Pillow verify 后重新 open/load 完整解码。viewer 的2D图按scene.bounds保留比例、长边至多1280；只有3D图固定1280×960，两张都兼容此入口。24字节伪PNG头和截断图被拒绝。**完整解码不能证明图片确来自渲染器**，有效任意照片的来源仍须当前Codex实际看图对照确认；不能靠HTTP自证来源。修复与复核次数受创建任务时 snapshot limits 限制，重启不改变原 limits，也不重放模型调用。

### review 与 finalize

读最新 request，实际查看 sourceAsset 以及返回的两张 captures（2D、3D），对照原图后提交 `POST /jobs/:id/handoff/review`：

```json
{"requestId":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","revision":3,"submissionId":"dddddddddddddddddddddddddddddddd","draftId":"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee","review":{"pass":false,"reason":"有明确未覆盖细节","issues":[{"severity":"major","path":"$.rooms[0]","description":"具体可见差异","suggestedChange":"限定数据修正"}],"limitations":["图纸模糊区域无法确认"]}}
```

critical/major 不能被 `pass:true` 绕过；失败后等待限定修正并重新截图。通过当前候选复核后，显式 `POST /jobs/:id/handoff/finalize`，公共字段外只加同一 `draftId`。服务端再次验证并事务保存；没有当前截图/通过复核则不能 finalize。metadata.generation 由服务端绑定 pipeline、prompt、执行标签、jobId、sourceHash、复核与 `reviewAppliesTo=initial_generated_scene`。它不替后续手动编辑版本背书。

## 验证

```powershell
python tests/ai-lab-server-handoff.test.py -q
python tests/ai-lab-server.test.py -q
python tests/ai-lab-server-workflow.test.py -q
```

新增合同测试只用临时数据库与真实可解码的合成PNG数据，无真实模型请求。合成图片验证解码、接口与保存闭环，不是实际户型视觉质量验收，也不声称合成图来自实际3D渲染。此迁移没有修改任何已有实际项目或数据库，也没有把现存参考方案覆盖为新生成。
