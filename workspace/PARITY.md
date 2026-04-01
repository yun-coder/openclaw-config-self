# PARITY.md - 功能对比与学习进度

基于对 `D:\gitCode\claw-code` 项目的分析，记录 OpenClaw 已有功能和需要学习的能力。

---

## 🏗️ claw-code 核心架构

```
rust/crates/
├── api/           # API 客户端 + SSE 流式传输
├── runtime/       # 核心：对话、会话、权限、钩子、压缩、提示、沙箱
├── claw-cli/      # CLI 入口 + REPL 循环
├── commands/      # 斜杠命令注册表
├── plugins/       # 插件系统 + 钩子运行器
├── tools/         # 工具规格 + 执行器
└── compat-harness/# 兼容性适配层
```

---

## 📊 功能对比

### ✅ OpenClaw 已有

| 功能 | claw-code | OpenClaw | 说明 |
|------|-----------|----------|------|
| 对话循环 | `conversation.rs` | 内置 | 核心对话处理 |
| 会话管理 | `session.rs` | 内置 | 持久化、恢复 |
| 权限系统 | `permissions.rs` | `tools.profile` | 多级权限控制 |
| 钩子系统 | `hooks.rs` | 内置 | PreToolUse/PostToolUse |
| MCP 协议 | `mcp*.rs` | 内置 | Model Context Protocol |
| 配置层级 | `config.rs` | `openclaw.json` | User/Project/Local |
| 系统提示 | `prompt.rs` | 动态构建 | CLAW.md/SKILL.md 发现 |
| Git 状态 | `prompt.rs` | 上下文注入 | 自动注入 git status |
| 插件系统 | `plugins/` | skills + plugins | 可扩展架构 |
| Token 追踪 | `usage.rs` | session_status | 成本估算 |
| 沙箱隔离 | `sandbox.rs` | 部分支持 | 文件系统隔离 |

### ⚠️ 需要学习/增强

| 功能 | claw-code 实现 | OpenClaw 现状 | 优先级 |
|------|---------------|--------------|--------|
| **会话压缩** | `compact.rs` - 智能摘要 | 有但简单 | 🔴 高 |
| **工具权限级别** | 每个工具声明 `required_permission` | 有 profile 但不细粒度 | 🔴 高 |
| **Hook 退出码语义** | 0=允许, 2=拒绝, 其他=警告 | 需确认 | 🟡 中 |
| **多模型定价** | `pricing_for_model()` 按模型计费 | 有但不完整 | 🟡 中 |
| **项目上下文发现** | CLAW.md 层级发现 + git diff | 有但可优化 | 🟡 中 |
| **沙箱模式** | `off/workspace-only/allow-list` | 部分支持 | 🟢 低 |

---

## 🧠 关键设计模式

### 1. 权限模式 (PermissionMode)

```rust
pub enum PermissionMode {
    ReadOnly,           // 只读
    WorkspaceWrite,     // 工作区写入
    DangerFullAccess,   // 完全访问
    Prompt,             // 每次询问
    Allow,              // 总是允许
}
```

**学习点**：每个工具声明需要的权限级别，运行时检查。

### 2. 钩子运行器 (HookRunner)

```rust
pub enum HookEvent {
    PreToolUse,   // 工具执行前
    PostToolUse,  // 工具执行后
}

pub struct HookRunResult {
    denied: bool,       // 是否拒绝
    messages: Vec<String>,  // 反馈消息
}
```

**退出码语义**：
- `0` = 允许，可选消息
- `2` = 拒绝，必须说明原因
- 其他 = 警告，但继续执行

### 3. 会话压缩 (Compact)

```rust
pub struct CompactionConfig {
    pub preserve_recent_messages: usize,  // 保留最近 N 条
    pub max_estimated_tokens: usize,       // 触发压缩的阈值
}
```

**压缩策略**：
1. 保留最近 4 条消息
2. 对历史消息生成摘要
3. 注入摘要作为系统消息

### 4. 项目上下文发现

```rust
// 从当前目录向上查找
for candidate in [
    dir.join("CLAW.md"),
    dir.join("CLAW.local.md"),
    dir.join(".claw").join("CLAW.md"),
    dir.join(".claw").join("instructions.md"),
] { ... }
```

**学习点**：层级发现，优先级从下到上。

### 5. Token 使用追踪

```rust
pub struct TokenUsage {
    pub input_tokens: u32,
    pub output_tokens: u32,
    pub cache_creation_input_tokens: u32,
    pub cache_read_input_tokens: u32,
}

pub struct ModelPricing {
    pub input_cost_per_million: f64,
    pub output_cost_per_million: f64,
    pub cache_creation_cost_per_million: f64,
    pub cache_read_cost_per_million: f64,
}
```

**学习点**：按模型区分定价，支持缓存成本计算。

---

## 📋 我的行动计划

### 立即实施

- [x] Git 配置同步（已完成）
- [ ] 创建 `memory/` 目录和每日笔记
- [ ] 更新 `IDENTITY.md` 定义身份
- [ ] 更新 `USER.md` 记录用户信息
- [ ] 删除 `BOOTSTRAP.md`

### 短期优化

- [ ] 优化 AGENTS.md 简化指令
- [ ] 创建 `TOOLS.md` 记录环境配置
- [ ] 学习 claw-code 的会话压缩策略
- [ ] 借鉴权限模式优化工具控制

### 长期学习

- [ ] 研究插件系统架构
- [ ] 学习 MCP 集成模式
- [ ] 优化项目上下文发现逻辑

---

## 📝 更新日志

- **2026-04-01**: 初始分析，完成 git 同步设置
