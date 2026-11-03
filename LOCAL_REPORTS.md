# 本地深度报告

本地深度报告用于保存结合项目事实、暗壳AI业务和行业趋势形成的商业分析。它与每日采集日报分开管理，只能通过本机管理版浏览，不参与 `dev -> main` 发布，也不会进入公开构建。

## 目录

```text
data/local-reports/
  index.json
  html/
    <report-id>.html
```

`data/local-reports/` 已被 Git 忽略。请勿把深度报告放进 `public/`、`reports/`、`data/main/` 或 `data/dev/`。

## HTML 标准

- 使用 UTF-8，并在 `<head>` 中声明 `<meta charset="utf-8">`。
- 使用单文件 HTML；样式、脚本和图片尽量内嵌，避免依赖本地绝对路径。
- 一份报告对应一个稳定的英文 `id`，文件名建议与 `id` 相同。
- 当前由人工完成报告并登记清单；后续自动化只需生成 HTML 并追加同一清单。

## 清单格式

```json
{
  "schemaVersion": "1.0.0",
  "updatedAt": "2026-07-21",
  "reports": [
    {
      "id": "example-project-2026-07-21",
      "projectRepo": "owner/repository",
      "title": "报告标题",
      "date": "2026-07-21",
      "format": "html",
      "file": "html/example-project-2026-07-21.html",
      "status": "draft",
      "author": "暗壳AI",
      "summary": "用于项目详情中的简短说明。"
    }
  ]
}
```

`status` 可用值为 `draft`、`final`、`archived`。当同一仓库有多份报告时，项目详情默认显示日期最新的一份。

## 本地浏览

启动管理版后，在 GitHub Radar 打开对应项目详情，使用“查看深度报告”。报告通过 `/__admin/reports/<id>` 返回，并带有禁止缓存和禁止索引响应头；非本机 Host、代理转发请求和公开模式都无法读取。
