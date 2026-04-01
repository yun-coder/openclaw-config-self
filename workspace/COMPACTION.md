# 会话压缩配置 (COMPACTION.md)

基于 claw-code 的会话压缩策略，配置 OpenClaw 的自动压缩功能。

---

## OpenClaw 内置压缩

### 配置位置

在 `openclaw.json` 中：

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "model": "zai/glm-4.7-flash",  // 使用便宜模型做摘要
        "identifierPolicy": "strict"
      }
    }
  }
}
```

### 手动压缩

```
/compact
/compact 聚焦于决策和未解决的问题
```

### 自动压缩

当会话接近上下文窗口限制时，OpenClaw 自动触发压缩。

---

## 压缩策略 (参考 claw-code)

### 配置参数

| 参数 | claw-code 默认 | 建议值 | 说明 |
|------|---------------|--------|------|
| `preserve_recent_messages` | 4 | 4 | 保留最近 N 条消息 |
| `max_estimated_tokens` | 10,000 | 50,000 | 触发压缩的阈值 |

### 摘要内容

参考 claw-code 的智能摘要格式：

```
<summary>
Conversation summary:
- Scope: N earlier messages compacted (user=X, assistant=Y, tool=Z).
- Tools mentioned: tool1, tool2, tool3.
- Recent user requests:
  - 最近的用户请求
- Pending work:
  - 待办事项
- Key files referenced: 关键文件路径.
- Current work: 当前工作描述.
- Key timeline:
  - user: 消息摘要
  - assistant: 消息摘要
</summary>
```

---

## 建议配置

### 添加到 openclaw.json

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "model": "zai/glm-4.7-flash",
        "identifierPolicy": "strict",
        "instructions": "生成摘要时包含：1) 讨论的主要话题 2) 做出的决策 3) 待办事项 4) 关键文件路径 5) 当前工作状态"
      }
    }
  }
}
```

### 使用便宜模型做摘要

| 模型 | 用途 | 成本优势 |
|------|------|---------|
| GLM-4.7-Flash | 压缩摘要 | Input ¥0.00007 vs GLM-5 ¥0.001 |
| GLM-5 | 主力推理 | 更强的推理能力 |

**节省计算**：
- 100K tokens 摘要成本：
  - GLM-5: ¥0.10
  - GLM-4.7-Flash: ¥0.007
  - **节省 93%**

---

## 压缩时机

### 自动触发

- 上下文使用 > 80%
- Token 数接近模型限制

### 手动触发

```
/compact
```

### 最佳实践

1. **长会话**：每 20-30 轮对话后手动压缩
2. **切换话题**：使用 `/new` 开始新会话
3. **重要决策**：在压缩前记录到 MEMORY.md

---

## 压缩 vs 新会话

| 场景 | 建议 |
|------|------|
| 同一任务，上下文太长 | `/compact` |
| 切换到新任务 | `/new` |
| 需要保留历史决策 | 先更新 MEMORY.md，再 `/compact` |
| 会话混乱，需要重新开始 | `/reset` |

---

## 与 claw-code 的差异

| 功能 | claw-code | OpenClaw |
|------|-----------|----------|
| 保留最近消息 | 4 条 | 可配置 |
| 智能摘要 | 详细时间线 | 内置摘要 |
| 摘要合并 | 支持多次压缩合并 | 支持 |
| 自定义指令 | 代码级别 | 配置级别 |

---

_参考: claw-code `rust/crates/runtime/src/compact.rs`_
