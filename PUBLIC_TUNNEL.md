# 固定域名的本机隧道

使用 Cloudflare 的本地管理命名隧道，将公开域名转发至 `http://127.0.0.1:8080`。仅转发公共站点，不转发管理后台。本站脚本使用 Windows 计划任务和 `LocalService`；它与公共静态服务器是两个独立任务。

## 本机已安装状态（2026-09-30）

任务 `ark.insight Public Named Tunnel` 已安装并运行，隧道名为 `wagmii-home`，UUID 为 `f7c5f2e0-d407-4278-95ae-49307b4b39bb`。当前只映射 `wagmii.cn`；`www.wagmii.cn` 按用户确认保留原服务器解析。运行配置为 `.local-server/cloudflared.yml`，单隧道凭据为 `.local-server/wagmii-home.json`，仅管理员、SYSTEM 与运行账户具有所需访问权限。账号级证书保留在用户配置目录，不供运行任务使用。

实测任务为 `Running`，监控端口仅监听 `127.0.0.1:20246`，`/ready` 返回 HTTP 200 和 4 条已连接通道。使用 HTTP/2 出站连接，未开放路由器入站端口。域名根记录已路由至此隧道；NS 已修改，Cloudflare 已激活。公网 HTTPS 全量核验通过，正式发布网址为 `https://wagmii.cn`，用户手机移动网络实测也正常。

现有部署执行安装校验或卸载时，应传入实际凭据路径：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-public-tunnel.ps1 -TunnelId 'f7c5f2e0-d407-4278-95ae-49307b4b39bb' -CredentialsPath 'G:\code-program\0-2026\wagmi-daily\.local-server\wagmii-home.json' -ValidateOnly
```

## 安装前准备

先通过官方 `cloudflared tunnel login` 网页授权，再通过 `cloudflared tunnel create <名称>` 创建单个命名隧道。创建和 DNS 路由是独立的账号操作，安装脚本不会代为执行。只有 UUID 与它的 JSON 凭据齐全后才能安装。

把以下文件置于项目下已被 Git 忽略的 `.local-server` 目录：

- `cloudflared.exe`：已安装的官方程序的真实副本，不用指向用户 profile 的 WinGet 符号链接。
- `<UUID>.json`：创建该隧道时生成的单隧道凭据。
- `cloudflared.yml`：配置文件，格式示例如下，替换 UUID 和实际绝对路径。

```yaml
tunnel: <UUID>
credentials-file: 'G:\code-program\0-2026\wagmi-daily\.local-server\<UUID>.json'
ingress:
  - hostname: wagmii.cn
    service: http://127.0.0.1:8080
  - service: http_status:404
```

不要把账号级 `cert.pem` 复制给运行服务。使用 UUID 运行已经创建的隧道只需要单隧道 JSON。脚本不接受内嵌令牌；命令行只有配置路径、凭据路径和 UUID。

## 注册与验证

在管理员 PowerShell 中运行，首次准备目录后使用 `-SetLocalPermissions`：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-public-tunnel.ps1 -TunnelId '<UUID>' -SetLocalPermissions
```

该开关只收紧 `.local-server` 及指定配置、凭据和本地程序文件的 ACL：管理员与 SYSTEM 保留完全控制，LocalService 对目录/程序可读取执行，对配置/凭据只读；其他已有文件不获得 LocalService 访问权。不修改项目根目录、用户 profile 或全局目录。需要保留此目录中的其他访问安排时，先手工准备对应的最小权限，再不带此开关安装。

`-ConfigPath`、`-CredentialsPath`、`-CloudflaredPath` 支持显式路径；配置和凭据必须是 `.local-server` 的直接子文件。已安装于其他本地固定磁盘路径的真实 `cloudflared.exe` 也可使用，但安装器不修改外部程序的 ACL。`-MetricsPort` 默认 `20246`，只绑定本机回环地址。

注册时默认不立刻启动，且不停止其他隧道。添加 `-StartNow` 可请求启动；`-ValidateOnly` 只核验本地文件、JSON 结构、入口规则与已有 ACL。`-WhatIf` 展示安装计划，不改变权限或注册任务。

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-public-tunnel.ps1 -TunnelId '<UUID>' -ValidateOnly
Start-ScheduledTask -TaskName 'ark.insight Public Named Tunnel'
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:20246/ready
node.exe scripts/check-public-url.mjs https://wagmii.cn --attempts=1 --verbose
```

成功注册或任务显示“正在运行”不代表公网已连通。还需确认 `/ready`、域名 DNS、HTTPS 和实际页面可访问。面向中国大陆的访问质量需要用实际访客网络验证。

任务开机自启、运行时长不限，故障退出后每分钟重试，最多 999 次。无需用户登录；正常退出、被手动停止或耗尽重试后需要人工排查。`cloudflared` 程序升级由维护人员替换本地副本并重启任务。

## 卸载

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/uninstall-public-tunnel.ps1 -TunnelId '<UUID>'
```

如安装时使用自定义路径或监控端口，卸载时传入相同参数。卸载先核验精确动作、目录、描述及 UUID，只停止并删除本站命名隧道任务；保留本地文件与权限、Cloudflare 隧道、DNS 和其他服务。

官方依据：[本地管理隧道](https://developers.cloudflare.com/tunnel/features/locally-managed-tunnels/create-local-tunnel/)、[运行参数](https://developers.cloudflare.com/tunnel/reference/run-parameters/)、[Windows 服务配置](https://developers.cloudflare.com/tunnel/features/locally-managed-tunnels/as-a-service/windows/)。命令语法也已用本机 `cloudflared tunnel run --help` 确认。
