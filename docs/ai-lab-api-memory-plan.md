# API v5：有界公开决策记忆与修复循环停止

目标是保留跨轮已作出的公开检查与修复事实，减少反复推翻同一处开口、家具或连接的行为。它不是持久化思维链，也不把上一轮模型意见当成原图真值。仅新建、明确记录 `codex-workflow-prompts-v5` 的 API 任务启用；现存 v3/v4 任务继续使用原提示和循环逻辑，当前实际试跑不迁移。

## 输入边界

后端在 v5 的 `visual_review`、`visual_repair` 和 `geometry_repair` 追加独立的 user JSON 消息：

```json
{
  "type": "PUBLIC_DECISION_MEMORY_V1",
  "workflowMemory": {
    "version": "bounded-model-ledger-v1",
    "source": "previous_model_findings_not_ground_truth",
    "previousModelReviews": [
      {"draftId": "...", "candidateHash": "...", "review": {"pass": false, "reason": "公开结论", "issues": [], "limitations": []}}
    ],
    "repairAttempts": [
      {"targetedReview": {"pass": false, "reason": "本次针对的公开结论", "issues": [], "limitations": []}, "beforeFingerprint": "...", "afterFingerprint": "...", "changed": true, "changeSummary": {"counts": {}, "objects": [], "truncated": false}}
    ]
  }
}
```

每类仅保留最近 4 项；issues 优先 critical/major、至多 6 项，limitations 至多 8 项，所有公开文字至多 400 字符。完整 JSON UTF-8 至多 16 KiB；必要时压缩旧条目。摘要只白名单读取规范化后的公开 review；通过现有 `public_text` 清除凭据、控制符和本地路径。禁止复制旧 scene、编辑器 state、provider 原始输出、reasoning、工具记录和配置。首轮没有历史时数组为空，不编造已完成的步骤。

`changeSummary` 记录集合数量前后变化和最多 6 个对象的实际几何子集：collection、id（存在时）、path、match（stable_id/index）、before/after。开口保留 rect、h、len、c、o、v 等必要字段，因此下一轮能知道曾尝试把何种开口换成何种表示，而不只是看到无法解读的 hash。超界用 `truncated` 明示。它只描述数据变化，不宣称修复正确。

当前复核仍必须携带当前候选 scene、原图、该 draft 的真实 2D 和 3D 截图。记忆不能替代这些证据。`changed` 只证明数据指纹变化，不能说明问题已解决；最终仍由新截图复核与确定性校验约束。

## 修复停机边界

对展开 primitives 后的像素候选计算确定性指纹。剔除名称、label、warnings、metadata 等展示信息；保留几何、家具类型/朝向、材质和门窗语义。修复 before/after 指纹相同即停机；新候选回到任一之前通过确定性校验的几何，也在下一次付费复核前停机。错误码为 `workflow_repair_cycle`（或等义 `repair_stalled`），不提交正式 scene，保留已产生的用量及私有候选。终态不能通过再次 `run_job` 复活。

此机制可阻止 A→A、A→B→A 的重复；不保证互不重复的错误候选会收敛。数据差异和上一轮结论都是复查线索；模型仍需回看原图及当前截图，不能服从过时结论来掩盖新证据。

## 离线验收

新增 `tests/ai-lab-api-memory.test.py` 使用临时目录/SQLite、PIL 生成的原图和两张可解码截图、脚本化假 API provider、真实 engine 和 `WorkflowRunner`；在配置输入边界返回空配置，并主动阻断 socket 连接，不读取环境 Key 或实际项目，不替换工作流/几何实现。

覆盖：

1. 新任务明确记录 v5；第二轮复核含上一轮公开结论和针对性修复尝试；重开临时服务后信息仍在。
2. 记忆单独 JSON 有界、关键问题优先保留、敏感字段/旧 scene/思维链不进入；保留当前三图。
3. 多轮只保留最近四轮，且不同任务之间不串记忆。
4. 仅 name/warnings/metadata 变化停止；A→B→A 回环停止；不再创建下一轮复核调用，项目版本仍为 0。
5. 真实坐标、旋转、类型、材质变化仍可进入下一轮真实截图复核；合成滑动门改双扇门的数量、portal 几何变化可追溯。
6. v3/v4 修复与复核完整消息 SHA-256 固定；旧任务不附记忆，也不悄悄获得 v5 循环闸门。

运行：`python -B tests/ai-lab-api-memory.test.py`。本测试只验证离线流程与数据边界，不代表真实楼图的重建质量通过。
