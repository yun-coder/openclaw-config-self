---
name: cost-alert
description: "在会话成本超过阈值时发出提醒"
homepage: https://docs.openclaw.ai/automation/hooks
metadata:
  openclaw:
    emoji: "💰"
    events:
      - response
    requires:
      config:
        - workspace.dir
---

# Cost Alert Hook

基于 claw-code 的 Token 追踪设计，在成本超过阈值时发出提醒。

## 功能

- 追踪每轮对话的 token 使用
- 累计会话成本
- 超过阈值时提醒用户

## 阈值

| 级别 | 阈值 | 提醒 |
|------|------|------|
| 低 | ¥0.10 | 无 |
| 中 | ¥0.30 | 提示 |
| 高 | ¥0.50 | 建议压缩 |
| 超高 | ¥1.00 | 建议新会话 |

## 配置

在 `COST-TRACKING.md` 中查看详细定价。
