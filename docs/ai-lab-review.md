# AI 实验室 MVP 技术验收记录

审查日期：2026-11-03，包含初审后的修复复核。对象为本次 staging 和已同步目标 checkout 的前端、独立 Vite 配置、Python 服务、场景引擎、legacy iframe renderer、相关测试与许可文件。独立审查仅作源码和离线检查，未调用付费模型或启停服务；下述目标 checkout 的完整测试、构建及实际启动结果由主任务执行并回报。真实模型调用与浏览器画面验收仍须引用主任务另行保存的证据。

**结论：工程链路具备本地 MVP 验收基础；图纸还原质量尚不能据此验收。** 三个历史案例通过的是完整 JSON 兼容性检查，不能算作三次模型生成成功或图像重建精度证明。

## 已核实的边界

- lab 使用独立 5186 / 8786、`dist/ai-lab` 和私有数据目录；独立 Vite 配置不加载日报管理或发布插件，public/admin 路由不能进入实验室。未执行日报、推送或发布工作流。
- legacy renderer 使用本地 Three.js，与原 8000 展示器没有共享 case loader 或存储键。iframe 存储按项目和版本隔离；bridge 双方检查 Window 来源、同源与 requestId；移除时释放动画、observer、controls 和 WebGL 资源。iframe 是可信 renderer 的运行隔离，不是任意模型代码的安全执行环境。
- 模型只返回数据。原图像素到 mm 单次转换，竖向 mm、方向向量和角度保持原单位；schema/有限数/正尺寸/材质与类型/ID/自交/房间重叠/边界检查在持久化前执行。错误 `labelRooms3D` 和 renderer metadata 类型现已拒绝。
- viewer 使用唯一惰性 JSON 注入点并转义 script 终止字符；模型字符串进入 markup 时转义，颜色和 ID 另受白名单限制。无有效场景时拒绝显示，没有默认假户型补位。
- 每个版本保存完整 legacy scene 及独立 `furniture/rooms/demolished/measures` state。保存、重开、完整 JSON 导出和聊天修改基于已保存编辑状态；乐观版本冲突、取消后禁止提交、最多一次几何修复及中断响应不当作成功已有回归。MIT 原声明、Three.js MIT、上游基线 SHA 与本地扩展说明均保留。

## 验收证据与复核

| 检查 | 当前结果与限制 |
| --- | --- |
| `tests/ai-lab-engine-test.py` | 目标 checkout 10 组通过；设私有 `AI_LAB_LEGACY_FIXTURES`，三个真实历史 JSON 均只读校验和渲染序列化通过；含 script 注入、错 schema、JS 语法检查 |
| `tests/ai-lab-server.test.py` | 主任务在目标 checkout 完整运行 24 项通过；初审阶段独立运行其中当时的 18 项，刻意排除了会监听端口的 HTTP 项 |
| `tests/ai-lab-isolation.test.mjs` | 目标 checkout 9 项通过，新增用量、参考来源和不确定性展示回归均包含在内 |
| TypeScript / lab 构建 / 模式隔离 | 主任务报告 `typecheck`、`build:lab`、三模式内存隔离检查全部通过 |
| 服务所有权、停止与重启 | 主任务已实际启动并重复复用两服务，随后 stop 仅终止核验为本目录拥有的 API / frontend 进程，再次 start 正常；独立审查没有启停服务 |
| 重启持久化 | 主任务重启后复核 8 个项目仍在，实际生成场景保持 version 1、`source:generated`、`validation.errors` 为 0；这是持久化证据，不是图像还原准确性评分 |
| 浏览器编辑链路 | 主任务已在浏览器核对人工编辑状态保存，以及新家具经聊天修改旋转后状态保留；此项仅证明交互与状态链路 |
| 图像重建质量 | 上述工程检查不等于模型质量验收；离线通过不能替代原图叠加核对、2D/3D 画面、门窗位置或模型完成率验收 |

可选 `AI_LAB_LEGACY_FIXTURES` 只读指向已有原案例目录；未设置时兼容性用例会跳过，不能算通过。原案例 JSON 和用户图片没有复制进公共仓库；运行时 reference fixture 留在私有目录。这是复现兼容检查的输入方式，不是给模型提供参考坐标。

## 初审问题与已完成修复

三项初审发现均已修复并加入回归，保留记录用于说明验收范围。

1. **参考来源丢失：已修复。** 参考方案聊天修改后使用 `baseline_reference_modified`，后续重复聊天及 state 保存仍保留参考血缘；页面明确显示“参考方案的修改版”，不会成为模型重建证据。后端回归为 `test_baseline_provenance_survives_repeated_chat_and_state_save`；前端回归为 `modified reference scenes retain their reference provenance in the UI`。
2. **token 用量 shape 不匹配：已修复。** 页面现在读取 `calls[*].usage.total_tokens`，只汇总厂商实际返回的总量，并区分完整、部分和未知；没有把未返回的输入/输出值推算成总量，未知金额继续保留未知。前端回归为 `vendor call totals are summed only when actually returned, with partial and unknown labels`，覆盖空值、部分返回、零值及非法数字。
3. **模型不确定性未展示：已修复。** 页面独立显示 `scene.warnings` 的“模型不确定性”，与确定性几何校验提醒分开；只接纳有限条数和长度的原始字符串，并通过 React 转义，忽略对象、空值等错误类型。前端回归为 `model uncertainty renders bounded source strings with React escaping and ignores unknown values`，包含脚本字符串与恶意/错误 schema 夹具。

模型当前支持的是图像转示意场景，以及家具位置/尺寸/旋转/颜色/名称和房间名称/材质的受限修改。新增或删除几何、自由拆改墙体、建筑结构与规范判断未实现。即使 JSON 校验成功，模型仍可能漏门窗、合并房间、误识家具或错画轮廓。配置中的 image verified 开关表示已录入能力门槛，不独立证明每个响应都正确读取了图像。

## 后续真实三图 benchmark 记录方式

为三张原图分别创建 **全新 generated 项目**，不调用 baseline 载入接口，不把参考 JSON 或坐标放进模型消息。历史手工案例只作为独立人工参考；其兼容性结果另表记录。冻结同一 promptVersion、模型、网关协议、推理强度、输出上限、超时、最多一次修复和尺度假设，禁止挑选成功重跑代替失败。

每张图保存一条私有 run manifest：原图 SHA-256、原始宽高、尺度及假设来源、运行时间、项目/job/version、完整参数、每次调用状态/耗时/厂商 usage、是否修复、最终 validation、候选像素 JSON、compiled scene/state 和原图叠加的 2D/固定视角 3D 截图。密钥与用户图片不得进入 tracked 公共源码；未返回 token、货币费用和中断原因按实际未知记录。

人工逐图核对房间数量与分区、墙轮廓、门窗检出和位置、主要家具检出与朝向、空白区保留及幻觉新增；可在原图像素坐标计算房间/墙体 IoU、门窗 precision/recall 与位置误差。没有可靠标尺时不宣称 mm 误差精度。每图分别给出：首次完成、修复后完成、可渲染、人工可用及失败原因；三图全列入分母，报告原始结果与人工编辑后结果，不能用后者覆盖原始模型表现。

## 2026-11-04 分阶段工作流独立集成审查补充

核心冻结前独立只读检查了 `server/scale.py`、`workflow.py`、`workflow_prompts.py`、checkpoint持久化与前端draft/capture/provenance交互。审查没有调用付费模型、启动HTTP服务或修改其他负责人的代码。下列发现已由对应负责人修复，修复后本轮独立运行新workflow的18项离线回归（排除会监听端口的HTTP项）及前端15项测试，全部通过。主任务尚未执行的目标checkout总回归、构建、浏览器与真实模型结果不计入这段证据。

| 已复现问题 | 修复闭环与回归 |
| --- | --- |
| 复核先截取前100项，再检查severity，会把第101项critical忽略并保留pass=true | 过长issues数组直接拒绝，任何保留的major/critical强制不通过。`test_review_cannot_hide_critical_issues_beyond_display_limit`通过 |
| 家具多带height等不支持字段时，scene可通过但default_state无法渲染；原流程却发布awaiting_review_images，导致viewer失败 | 发布draft前一并校验editorState，将错误纳入有限geometry repair。`test_invalid_editor_state_is_repaired_before_publishing_a_draft`通过 |
| preview状态公开后，快速截图回执已推进visual_review，却被worker finally写回旧preview/空captures覆盖 | finally与receipt在同事务下合并新checkpoint和captures，避免回退。`test_immediate_capture_receipt_cannot_be_overwritten_by_worker_finally`通过 |
| 后端review/description/reason与前端visualReview/message/reasons不一致，实际复核原因不显示 | 统一公开visualReview并提供reasons；前端兼容规范reason/description。`workflow summaries show actual scale evidence and visual conclusions with bounded escaped text`通过 |

其余已核对的关键边界：手动和两点校准仍执行图纸分析，但明确覆盖模型尺度；图纸锚点比值由服务计算，矛盾标注要求用户处理，对象先验只保留estimated及范围，未知比例不默用22或baseline。置信度与标注文本仍是来源声明，不是独立测绘或OCR真值证明。compiler使用服务固定的provenance并仅在像素到mm边界缩放；显式primitive展开幂等。家具阶段只允许furniture/furnitureRows/notes，不能替换建筑字段。major/critical不得因模型声称pass而被放行。

draftId在候选变化后更新；旧候选截图及不同内容覆盖被拒绝，相同截图回执幂等且不重复排队。取消等待或正在复核的任务不会提交正式版本；等待截图释放单worker供其它项目使用，重启不自动重放已预约的付费调用，已有相应离线回归。`codex-workflow-v1`默认预算为最多8次调用、共享最多2次修复、最多2次视觉复核；2026-11-04真实迁移验收显式采用12/4/4并保存到每个job。历史单次模式的旧预算需单列，不能作为新流程比较基线。

在本次源码与离线测试范围内，上述阻断已关闭。真实截图非空与身份对应、完整浏览器自动续跑、模型图纸还原质量和三图公平benchmark仍由主任务分别留证；模型自评通过不替代人工验收，历史参考兼容不能充作自动生成成功。
