# 工具权限配置 (TOOL-PERMISSIONS.md)

基于 claw-code 的权限分级设计，定义 OpenClaw 工具的权限粒度。

---

## 权限级别

| 级别 | 值 | 说明 | 风险 |
|------|-----|------|------|
| **ReadOnly** | `read-only` | 只读操作，无副作用 | 低 |
| **WorkspaceWrite** | `workspace-write` | 工作区文件写入 | 中 |
| **DangerFullAccess** | `danger-full-access` | 系统命令、外部访问 | 高 |
| **Prompt** | `prompt` | 每次询问用户确认 | 安全 |
| **Allow** | `allow` | 总是允许 | 信任 |

---

## 工具权限映射

### ReadOnly 级别

| 工具 | 说明 |
|------|------|
| `read` | 读取文件 |
| `image` | 分析图片 |
| `web_search` | 网页搜索 |
| `web_fetch` | 获取网页内容 |
| `memory_search` | 搜索记忆 |
| `memory_get` | 获取记忆片段 |
| `sessions_list` | 列出会话 |
| `sessions_history` | 获取会话历史 |
| `session_status` | 查看会话状态 |

### WorkspaceWrite 级别

| 工具 | 说明 |
|------|------|
| `write` | 写入文件 |
| `edit` | 编辑文件 |
| `image_generate` | 生成图片 |

### DangerFullAccess 级别

| 工具 | 说明 |
|------|------|
| `exec` | 执行命令 |
| `process` | 管理进程 |
| `sessions_spawn` | 创建子代理 |
| `sessions_send` | 发送消息到其他会话 |
| `subagents` | 管理子代理 |

---

## 当前配置

OpenClaw 使用 `tools.profile` 配置：

```json
{
  "tools": {
    "profile": "coding"
  }
}
```

### 可用 Profile

| Profile | 说明 | 等效权限 |
|---------|------|---------|
| `coding` | 编程助手 | WorkspaceWrite + 部分 DangerFullAccess |
| `read-only` | 只读模式 | ReadOnly |
| `full` | 完全访问 | DangerFullAccess |

---

## 权限检查逻辑

```
1. 获取当前 profile 对应的权限级别
2. 获取工具需要的权限级别
3. 如果 当前 >= 需要 → 允许
4. 否则 → 拒绝或询问
```

---

## 建议优化

### 1. 细粒度权限配置

```json
{
  "tools": {
    "profile": "custom",
    "permissions": {
      "exec": "prompt",
      "write": "workspace-write",
      "read": "read-only",
      "sessions_spawn": "danger-full-access"
    }
  }
}
```

### 2. 工具权限声明

在 `openclaw.json` 中声明每个工具的 `requiredPermission`：

```json
{
  "tools": {
    "registry": {
      "exec": { "requiredPermission": "danger-full-access" },
      "write": { "requiredPermission": "workspace-write" },
      "read": { "requiredPermission": "read-only" }
    }
  }
}
```

### 3. 钩子集成

在执行工具前检查钩子返回：
- 退出码 0 → 允许
- 退出码 2 → 拒绝
- 其他 → 警告但继续

---

_参考: claw-code `rust/crates/tools/src/lib.rs`_
