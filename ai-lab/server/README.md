# AI Lab 本机后端

未配置时默认 `executionMode=codex_handoff`：网页创建接力任务，当前 Codex 聊天显式接手。开发环境也可选择 `api`，由 BananaRouter 的 `gpt-6.1-sol` 自动完成同一套分析、尺度、建模、校验、真实截图复核与限定修复流程。两个入口同时保留；任务来源与设置在创建时固定，切换默认方式不会重新执行历史任务。程序不探测桌面凭据，不自动调用旧网关。私有 Key 与历史记录保留。

后端配置、API 参数、可恢复补尺及验收边界见 [API 完整工作流](../../docs/ai-lab-api-workflow.md) 与 [质量合同](../../docs/ai-lab-api-quality.md)。Key 仅存被 Git 忽略的 `.env.ai-lab.local`，从不进入前端或公开 job。API 只保存通过数据和真实 2D/3D 复核的候选；通过接口探测不代表还原效果已经等同 Codex。

HTTP/SQLite 主体使用 Python 标准库。**新 API 与 handoff 截图完整解码明确依赖 Pillow 12.2.0**，部署环境先显式执行：

```powershell
python -m pip install -r ai-lab/server/requirements.txt
```

程序不会自动安装；未安装时新截图提交返回 `capture_decoder_unavailable`，不退回只检查文件头。服务端能验证格式/尺寸和完整解码，不能证明图片由 viewer 渲染；仍需当前 Codex 查看原图及两张客户端图片后显式复核与保存。

启动沿用 `scripts/start-ai-lab-api.ps1`，监听 loopback。当前聊天工具是 `python ai-lab/server/handoff_cli.py --help`。完整 endpoint、CAS/幂等、候选/截图/复核合同见 [当前 Codex 接力说明](../../docs/ai-lab-codex-handoff.md)。

`model=codex-current-session` 仅为执行标签；`usage=null` 和 `current_session_unreported` 表示未接入当前聊天用量，不是零 token 或零费用。
