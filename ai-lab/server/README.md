# AI Lab 本机后端

默认 `executionMode=codex_handoff`：网页只创建接力任务，当前 Codex 聊天需显式接手。程序不启动 CLI/SDK、不探测桌面凭据，也不自动调用旧网关。旧 Key 与历史记录保留但不激活旧 provider。

HTTP/SQLite 主体使用 Python 标准库。**新 handoff 截图完整解码明确依赖 Pillow 12.2.0**，部署环境先显式执行：

```powershell
python -m pip install -r ai-lab/server/requirements.txt
```

程序不会自动安装；未安装时新截图提交返回 `capture_decoder_unavailable`，不退回只检查文件头。服务端能验证格式/尺寸和完整解码，不能证明图片由 viewer 渲染；仍需当前 Codex 查看原图及两张客户端图片后显式复核与保存。

启动沿用 `scripts/start-ai-lab-api.ps1`，监听 loopback。当前聊天工具是 `python ai-lab/server/handoff_cli.py --help`。完整 endpoint、CAS/幂等、候选/截图/复核合同见 [当前 Codex 接力说明](../../docs/ai-lab-codex-handoff.md)。

`model=codex-current-session` 仅为执行标签；`usage=null` 和 `current_session_unreported` 表示未接入当前聊天用量，不是零 token 或零费用。
