# 本机公共网站服务器

本机负责保存和生成数据，公共网站只读取 `dist/client`。公共静态服务器监听 `0.0.0.0:8080`，可供本机、局域网及后续公网隧道访问。管理端口 `5174`、采集程序、Codex 自动化和钉钉凭据不属于这个服务。

## 当前部署状态（2026-09-30）

- 已安装并启动 `ark.insight Public Static Server`，核实以 `LocalService` 账户运行。
- 当前发布模式为 `local`；`publication:deploy` 更新本机网站，`publication:verify` 另行核验固定公网。8:30、9:00、12:00 自动化已切换到此流程，原计划时间和发送去重规则保持不变。
- 本机地址为 `http://127.0.0.1:8080/`，当前局域网地址为 `http://10.1.60.144:8080/`。局域网地址可能因 DHCP 改变；尚未在其他设备上验证防火墙可达性。
- 实测首页和正式数据 HTTP 200、Brotli 压缩、相同编码下 ETag 304、私有文件路径 404。主数据版本为 `2026-09-30T00:37:16.741Z`。
- 电脑当前接通交流电时不自动睡眠；断电、断网仍会影响访问。网站开机任务已验证运行，尚未通过实际重启测试。
- 用户确认持有 `wagmii.cn`，注册商为阿里云，有效期至 2029-02-11。原 DNS 与全部三条记录已备份至私有 `.local-backups/wagmii-cn-dns-before-tunnel-20260930.json`。
- 经用户明确确认并完成阿里云短信验证，NS 已改为 `aragorn.ns.cloudflare.com` / `laila.ns.cloudflare.com`；公开 NS 查询也已返回新值。Cloudflare 根域名 CNAME 已指向本站命名隧道；`www` 的原 A 记录和 `_acme-challenge` TXT 保留。原根域名/当前 www 的 `47.238.143.43` 不是本机地址。
- 命名隧道 `wagmii-home` 已创建并以 LocalService 开机任务启动，`127.0.0.1:20246/ready` 实测 HTTP 200、4 条就绪连接。运行说明见 [PUBLIC_TUNNEL.md](PUBLIC_TUNNEL.md)。
- 原 CloudBase 套餐于 2026-09-25 23:59:59 到期，公开返回 HTTP 418；本机正式流程已不再依赖该服务。
- `https://wagmii.cn` 已激活并取得有效托管证书。2026-09-30 公网完整核验确认首页、JS、main 版本/计数、Skill 与论文目录均与本机一致，`localReady=true`、`publicReady=true`。正式 `WAGMI_PUBLIC_URL` 已切换为该地址，8:30/9:00/12:00 自动化也已保存新入口。
- 本机 watchdog 已连续核验到 `healthy`、HTTP 200，全部端点稳定；用户另以中国大陆手机移动网络关闭 Wi-Fi 与代理后确认“能打开，内容加载正常”。这代表本次实测成功，不代表所有运营商与时段的质量保证。

## wagmii.cn 后续迁移复核清单

以下步骤已经用于本次接入，后续迁移时应重新核实实际记录：

1. 登录管理该域名的账号及 Cloudflare。先核实并备份完整现有 DNS 记录，包括邮箱、验证记录和子域名，确认根域名现有用途。
2. 在 Cloudflare 接入域名并保留所需记录，使用实际分配的 NS；不得猜测 NS、隧道 ID 或密钥。切换 DNS 前检查 DNSSEC 和原有业务依赖。
3. 建立命名隧道，将 `wagmii.cn` 的公开网站路由指向 `http://127.0.0.1:8080`；其他主机名默认返回 404，不映射管理端或本地文件目录。隧道单独配置开机自启。
4. 验证 `https://wagmii.cn` 的证书、页面、资源、正式数据版本和目录，并在中国大陆移动网络及钉钉内实测。Cloudflare 境外链路对大陆的稳定性需实测，不能仅凭本机成功确认可用。
5. 公网完整验证通过后才把 `.env.dingtalk.local` 的 `WAGMI_PUBLIC_URL` 更新为 `https://wagmii.cn`，保留其他配置及凭据；再运行 `npm.cmd run publication:verify`。推送仍遵守当天禁发及去重规则。

无需迁移域名注册商。域名本身不提供公网连接；实际接入以 [Cloudflare 域名接入文档](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/) 和 [命名隧道步骤](https://developers.cloudflare.com/tunnel/get-started/) 为准。

## 安装开机自启

先在项目目录生成公共站点：

```powershell
npm.cmd run build:public
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-public-server.ps1 -ValidateOnly
```

校验通过后，在**管理员 PowerShell** 中运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-public-server.ps1 -StartNow
```

脚本使用 Windows 计划任务 `ark.insight Public Static Server`。任务以内置 `LocalService` 账户在开机时运行，无需用户登录或保存密码；该账户权限低于 `SYSTEM`。直接启动绝对路径的 Node 和静态服务器脚本，不启动管理后台，也不依赖交互终端。安装检查本地固定磁盘、必要文件及读取权限，不扩大目录 ACL。文件夹或 Node 路径发生变化后，用新路径重新核实部署；同名任务属于另一项目时脚本会拒绝覆盖。

可指定路径，例如：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-public-server.ps1 -Root 'G:\code-program\0-2026\wagmi-daily' -NodePath 'C:\Program Files\nodejs\node.exe' -StartNow
```

不加 `-StartNow` 只注册下次开机启动，不中断当前服务。`-StartNow` 遇到已有的其他 `8080` 监听程序会停止安装的启动步骤，并保留该进程；应先核对监听进程的完整命令行与项目路径，再由操作人员完成切换。脚本不会按端口或历史 PID 文件直接杀进程。重复安装更新同一任务，但不会强制重启已运行的实例；已有实例的启动参数在下次启动时生效。

任务设置为后台运行、执行时长不限，故障后每分钟重试，最多 999 次；已有实例运行时忽略重复启动。Windows 重启会重新触发任务。此设置不能阻止电脑睡眠、断网或断电；长时间连续故障耗尽重试后，应排查并手动重新启动任务。

## 运行和验证

```powershell
Get-ScheduledTask -TaskName 'ark.insight Public Static Server'
Get-ScheduledTaskInfo -TaskName 'ark.insight Public Static Server'
node.exe scripts/check-public-url.mjs http://127.0.0.1:8080/ --attempts=1 --verbose
```

`-StartNow` 会核对 `8080` 监听程序的 Node 路径、绝对脚本路径及账户 SID，再检查首页、静态资源和正式数据。ACL 预检只是保守检查，真实服务账户能否读取文件最终以启动验证为准。计划任务的 `LastTaskResult` 及 Windows 任务计划程序历史可用于定位启动错误；长驻任务显示“正在运行”是正常状态。

现有 watchdog 通过 `start-local.ps1` 恢复本地服务时，会先核对本项目计划任务的完整 Node 路径、脚本参数、工作目录和描述标记。已安装任务时只启动或等待该任务，不另起交互式服务器争用 `8080`；任务被明确禁用或权限不足时报告失败。Node 的安装路径或当前 `PATH` 改变后，应先统一任务配置与本地启动配置。没有该任务时，旧预览流程仅在端口空闲时启动，也不再按旧 PID 文件杀进程。每次健康检查只尝试一次，恢复等待有时间上限。

更新数据后仍需执行 `npm.cmd run build:public`，静态服务器会读取新文件。采集、审核、发布、推送仍由现有流程执行；本服务保证的是已生成网页的开机自启，不代表 Codex 自动化可在无人登录时运行。

## 卸载

管理员 PowerShell 中运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/uninstall-public-server.ps1
```

卸载只停止并删除名称、项目根目录、描述标记和启动动作均匹配的公共服务器任务。不会删除网站文件、数据、密码、其他计划任务或防火墙设置。现有本地 watchdog 如果仍配置了公共服务恢复，会按自身配置重启公共服务；需要全面停机时应同时检查现有 watchdog。

## 官方依据

- [计划任务账户与 ServiceAccount 登录类型](https://learn.microsoft.com/en-us/powershell/module/scheduledtasks/new-scheduledtaskprincipal)
- [LocalService 的权限与身份](https://learn.microsoft.com/en-us/windows/win32/services/localservice-account)
- [计划任务重试与后台设置](https://learn.microsoft.com/en-us/powershell/module/scheduledtasks/new-scheduledtasksettingsset)
- [执行时长限制](https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-executiontimelimit)

公网入口、域名及 HTTPS 的接入应在本机服务验证后配置。域名本身不提供公网连接能力。
