---
name: tool-permission-check
description: "在工具执行前检查权限级别，高风险操作需要确认"
homepage: https://docs.openclaw.ai/automation/hooks
metadata:
  openclaw:
    emoji: "🔒"
    events:
      - tool:pre
    requires:
      config:
        - workspace.dir
---

# Tool Permission Check

基于 claw-code 的权限分级设计，在工具执行前检查权限。

## 功能

- 检查工具的权限级别
- 高风险操作（DangerFullAccess）记录日志
- 可扩展为需要用户确认

## 权限分级

| 级别 | 工具示例 |
|------|---------|
| ReadOnly | read, web_search, memory_search |
| WorkspaceWrite | write, edit, image_generate |
| DangerFullAccess | exec, process, sessions_spawn |

## 配置

在 `TOOL-PERMISSIONS.md` 中定义工具权限映射。

## 日志

高风险操作记录到 `~/.openclaw/logs/tool-permissions.log`
