# 深度学习：claw-code 核心架构

基于对 `D:\gitCode\claw-code` 源码的深入分析。

---

## 1. 会话压缩策略 (compact.rs)

### 核心配置

```rust
pub struct CompactionConfig {
    pub preserve_recent_messages: usize,  // 默认 4
    pub max_estimated_tokens: usize,       // 默认 10,000
}
```

### 压缩流程

```
1. 检查是否需要压缩 (should_compact)
   ├── 估算当前 token 数量
   ├── 跳过已有的压缩摘要
   └── 比较: compactable.len() > preserve && tokens >= max

2. 执行压缩 (compact_session)
   ├── 保留最近 N 条消息
   ├── 对历史消息生成摘要
   ├── 合并已有的压缩摘要
   └── 生成 continuation 消息

3. 摘要内容包含
   ├── Scope: 压缩了多少消息
   ├── Tools mentioned: 使用的工具列表
   ├── Recent user requests: 最近用户请求
   ├── Pending work: 待办事项 (todo/next/pending)
   ├── Key files referenced: 关键文件
   ├── Current work: 当前工作
   └── Key timeline: 关键时间线
```

### 智能提取

```rust
// 从消息中提取待办事项
fn infer_pending_work(messages) -> Vec<String> {
    // 查找包含 todo/next/pending/follow up/remaining 的文本
}

// 从消息中提取关键文件
fn collect_key_files(messages) -> Vec<String> {
    // 识别带扩展名的路径: .rs, .ts, .tsx, .js, .json, .md
}
```

### 压缩摘要格式

```
<summary>
Conversation summary:
- Scope: 10 earlier messages compacted (user=3, assistant=4, tool=3).
- Tools mentioned: read_file, edit_file, bash.
- Recent user requests:
  - Update the compaction logic
  - Add tests for edge cases
- Pending work:
  - Next: update tests and follow up on remaining CLI polish.
- Key files referenced: rust/crates/runtime/src/compact.rs.
- Current work: Working on regression coverage now.
- Key timeline:
  - user: Update the compaction logic
  - assistant: I will inspect the compact flow.
  ...
</summary>
```

---

## 2. 工具权限粒度 (tools/lib.rs)

### 权限级别

```rust
pub enum PermissionMode {
    ReadOnly,           // 只读操作
    WorkspaceWrite,     // 工作区写入
    DangerFullAccess,   // 完全访问（危险）
    Prompt,             // 每次询问用户
    Allow,              // 总是允许
}
```

### 工具权限映射

| 工具 | 权限级别 | 说明 |
|------|---------|------|
| `read_file` | ReadOnly | 读取文件 |
| `glob_search` | ReadOnly | 文件搜索 |
| `grep_search` | ReadOnly | 内容搜索 |
| `WebFetch` | ReadOnly | 网页获取 |
| `WebSearch` | ReadOnly | 网页搜索 |
| `Skill` | ReadOnly | 加载技能 |
| `write_file` | WorkspaceWrite | 写入文件 |
| `edit_file` | WorkspaceWrite | 编辑文件 |
| `TodoWrite` | WorkspaceWrite | 更新待办 |
| `bash` | DangerFullAccess | 执行命令 |
| `Agent` | DangerFullAccess | 子代理 |

### 权限检查逻辑

```rust
pub fn authorize(&self, tool_name: &str, input: &str, prompter) -> PermissionOutcome {
    let current = self.active_mode();
    let required = self.required_mode_for(tool_name);
    
    // 当前权限 >= 需要权限 → 允许
    if current >= required {
        return Allow;
    }
    
    // Prompt 模式 → 询问用户
    if current == Prompt {
        return prompter.decide(...);
    }
    
    // 权限不足 → 拒绝
    return Deny { reason };
}
```

---

## 3. Token 成本追踪 (usage.rs)

### 数据结构

```rust
pub struct TokenUsage {
    pub input_tokens: u32,
    pub output_tokens: u32,
    pub cache_creation_input_tokens: u32,  // 缓存写入
    pub cache_read_input_tokens: u32,       // 缓存读取
}

pub struct ModelPricing {
    pub input_cost_per_million: f64,
    pub output_cost_per_million: f64,
    pub cache_creation_cost_per_million: f64,
    pub cache_read_cost_per_million: f64,
}
```

### 模型定价

| 模型 | Input | Output | Cache Write | Cache Read |
|------|-------|--------|-------------|------------|
| Haiku | $1.0/M | $5.0/M | $1.25/M | $0.1/M |
| Sonnet | $15.0/M | $75.0/M | $18.75/M | $1.5/M |
| Opus | $15.0/M | $75.0/M | $18.75/M | $1.5/M |

### 使用追踪器

```rust
pub struct UsageTracker {
    latest_turn: TokenUsage,   // 最近一次
    cumulative: TokenUsage,     // 累计
    turns: u32,                 // 回合数
}

impl UsageTracker {
    pub fn record(&mut self, usage: TokenUsage) {
        self.latest_turn = usage;
        self.cumulative += usage;
        self.turns += 1;
    }
    
    pub fn from_session(session: &Session) -> Self {
        // 从会话消息重建追踪器
    }
}
```

---

## 4. 项目上下文发现 (prompt.rs)

### 层级发现

```rust
fn discover_instruction_files(cwd: &Path) -> Vec<ContextFile> {
    // 从当前目录向上遍历到根目录
    let mut directories = vec![];
    let mut cursor = Some(cwd);
    while let Some(dir) = cursor {
        directories.push(dir);
        cursor = dir.parent();
    }
    directories.reverse();  // 从根到叶
    
    // 查找每个目录下的指令文件
    for dir in directories {
        for candidate in [
            dir.join("CLAW.md"),
            dir.join("CLAW.local.md"),
            dir.join(".claw").join("CLAW.md"),
            dir.join(".claw").join("instructions.md"),
        ] { ... }
    }
}
```

### Git 状态注入

```rust
fn read_git_status(cwd: &Path) -> Option<String> {
    // git --no-optional-locks status --short --branch
}

fn read_git_diff(cwd: &Path) -> Option<String> {
    // 分离 staged 和 unstaged
    // staged: git diff --cached
    // unstaged: git diff
}
```

### 项目上下文格式

```
# Project context
 - Today's date is 2026-04-01.
 - Working directory: /path/to/project
 - Claw instruction files discovered: 2.

Git status snapshot:
 M src/lib.rs
?? new_file.rs

Git diff snapshot:
Staged changes:
...

Unstaged changes:
...
```

---

## 5. 钩子系统 (hooks.rs)

### 退出码语义

| 退出码 | 含义 | 行为 |
|-------|------|------|
| 0 | 允许 | 继续执行，可选消息 |
| 2 | 拒绝 | 阻止工具，必须说明原因 |
| 其他 | 警告 | 继续执行，记录警告 |

### 环境变量

```bash
HOOK_EVENT=PreToolUse|PostToolUse
HOOK_TOOL_NAME=工具名
HOOK_TOOL_INPUT=工具输入JSON
HOOK_TOOL_OUTPUT=工具输出 (仅 PostToolUse)
HOOK_TOOL_IS_ERROR=0|1
```

### stdin payload

```json
{
  "hook_event_name": "PreToolUse",
  "tool_name": "bash",
  "tool_input": { "command": "ls" },
  "tool_input_json": "{\"command\":\"ls\"}",
  "tool_output": null,
  "tool_result_is_error": false
}
```

---

## 🎯 学习成果

### 已理解
- [x] 会话压缩：保留最近 + 智能摘要 + 摘要合并
- [x] 权限分级：5 级权限 + 工具级别控制
- [x] Token 追踪：累计 + 按模型定价 + 缓存成本
- [x] 上下文发现：层级查找 + Git 状态注入
- [x] 钩子语义：退出码 + 环境变量 + JSON payload

### 可应用到 OpenClaw
1. **AGENTS.md** - 借鉴压缩摘要格式优化记忆管理
2. **工具配置** - 参考权限分级优化工具控制
3. **HEARTBEAT** - 学习 Token 追踪优化成本感知
4. **SKILL.md** - 参考上下文发现优化技能加载

---

_2026-04-01 学习笔记_
