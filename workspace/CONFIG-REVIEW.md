# 配置全面审查报告 (CONFIG-REVIEW.md)

对当前 OpenClaw 配置的全面分析和优化建议。

---

## 📊 当前配置概览

### Agent 架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Feishu 群组                             │
│              oc_af9134db25975903aa234741c4d7ad5d             │
└─────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────┐           ┌──────────┐           ┌──────────┐
│   main   │           │ workers  │           │  skills  │
│ 打工人首领 │           │ 5 个工人  │           │  50+ 技能 │
│  GLM-5   │           │ 未配置    │           │  未启用   │
└──────────┘           └──────────┘           └──────────┘
```

### Agent 列表

| Agent | 飞书账号 | 模型 | 状态 | 问题 |
|-------|---------|------|------|------|
| main | 打工人首领 | GLM-5 | ✅ 已配置 | - |
| product-worker | 产品打工人 | 继承 | ⚠️ 未初始化 | BOOTSTRAP.md 存在 |
| ui-worker | UI设计打工人 | 继承 | ⚠️ 未初始化 | BOOTSTRAP.md 存在 |
| web-worker | web开发打工人 | 继承 | ⚠️ 未初始化 | BOOTSTRAP.md 存在 |
| qa-worker | QA测试打工人 | 继承 | ⚠️ 未初始化 | BOOTSTRAP.md 存在 |
| app-worker | app开发打工人 | 继承 | ⚠️ 未初始化 | BOOTSTRAP.md 存在 |

### 模型配置

| 模型 | 用途 | 价格 (元/千tokens) | 上下文 |
|------|------|-------------------|--------|
| GLM-5 | 主力推理 | ¥0.001/0.0032 | 202K |
| GLM-4.7-Flash | 摘要/快速 | ¥0.00007/0.0004 | 200K |
| MiniMax-M2.7 | 备用 | ¥0.0003/0.0012 | 204K |

### 钩子状态

| 钩子 | 状态 | 说明 |
|------|------|------|
| boot-md | ✓ ready | 启动时运行 BOOT.md |
| bootstrap-extra-files | ✓ ready | 注入额外引导文件 |
| command-logger | ✓ ready | 命令审计日志 |
| session-memory | ✓ ready | 会话记忆保存 |
| cost-alert | ⏸ disabled | 成本警告 |
| tool-permission-check | ⏸ disabled | 工具权限检查 |

### 可用技能 (50+)

内置技能包括：
- **开发**: github, gh-issues, coding-agent, skill-creator
- **文档**: notion, obsidian, bear-notes, apple-notes
- **通信**: discord, slack, imsg, wacli, himalaya
- **媒体**: spotify-player, sonoscli, sag (TTS), video-frames
- **工具**: 1password, things-mac, trello, weather
- **AI**: gemini, openai-whisper, summarize

---

## ⚠️ 发现的问题

### 1. Worker 未初始化
- 所有 worker 的 BOOTSTRAP.md 还存在
- IDENTITY.md 是空模板
- 没有个性化配置

### 2. 模型配置重复
- 所有 worker 继承相同的模型配置
- 没有针对任务优化（如 UI worker 可以用更便宜的模型）

### 3. 钩子未启用
- 4 个 bundled hooks 未启用
- 2 个自定义 hooks 未启用
- 没有自动化工作流

### 4. 技能未利用
- 50+ 技能都没有启用
- 没有针对 worker 的专业技能

### 5. 无协作流程
- Worker 之间没有协作机制
- 没有任务分发策略
- 没有结果聚合

---

## 🎯 优化方案

### 阶段 1：初始化 Worker (高优先级)

为每个 worker 创建个性化配置：

#### product-worker (产品打工人)
```yaml
角色: 产品经理
职责: 需求分析、PRD 编写、优先级排序
技能: notion, trello, summarize
模型: GLM-4.7 (平衡性价比)
风格: 结构化、数据驱动
```

#### ui-worker (UI设计打工人)
```yaml
角色: UI/UX 设计师
职责: 界面设计、交互流程、设计评审
技能: canvas, video-frames
模型: GLM-4.6V (多模态)
风格: 视觉化、用户体验导向
```

#### web-worker (web开发打工人)
```yaml
角色: 前端开发
职责: Web 开发、组件实现、性能优化
技能: github, coding-agent
模型: GLM-5 (主力)
风格: 代码优先、工程化
```

#### qa-worker (QA测试打工人)
```yaml
角色: 测试工程师
职责: 测试用例、Bug 分析、质量报告
技能: github, gh-issues
模型: GLM-4.7-Flash (快速)
风格: 细致、覆盖全面
```

#### app-worker (app开发打工人)
```yaml
角色: 移动端开发
职责: App 开发、跨平台适配
技能: github, coding-agent
模型: GLM-5 (主力)
风格: 移动优先、性能敏感
```

### 阶段 2：启用钩子 (高优先级)

```bash
# 启用 bundled hooks
openclaw hooks enable session-memory
openclaw hooks enable command-logger

# 启用自定义 hooks
openclaw hooks enable cost-alert
openclaw hooks enable tool-permission-check
```

### 阶段 3：配置技能 (中优先级)

为每个 worker 启用相关技能：

```json
{
  "skills": {
    "entries": {
      "github": { "enabled": true },
      "notion": { "enabled": true },
      "summarize": { "enabled": true }
    }
  }
}
```

### 阶段 4：工作流设计 (中优先级)

建立协作流程：

```
用户请求 → main 分析
    │
    ├─ 产品需求 → product-worker
    ├─ UI 设计 → ui-worker
    ├─ Web 开发 → web-worker
    ├─ App 开发 → app-worker
    └─ 测试验证 → qa-worker
         │
         ▼
    结果汇总 → main 整合 → 用户
```

---

## 📋 优化清单

### 立即执行

- [ ] 初始化 product-worker
- [ ] 初始化 ui-worker
- [ ] 初始化 web-worker
- [ ] 初始化 qa-worker
- [ ] 初始化 app-worker
- [ ] 启用 session-memory hook
- [ ] 启用 cost-alert hook

### 短期优化

- [ ] 为 worker 配置不同模型
- [ ] 启用相关技能
- [ ] 配置工作流钩子

### 长期规划

- [ ] 建立 worker 协作机制
- [ ] 配置任务自动分发
- [ ] 实现结果自动聚合

---

## 📁 相关文件

| 文件 | 说明 |
|------|------|
| `openclaw.json` | 主配置 |
| `PARITY.md` | 功能对比 |
| `MEMORY.md` | 长期记忆 |
| `TOOLS.md` | 环境配置 |
| `TOOL-PERMISSIONS.md` | 工具权限 |
| `COST-TRACKING.md` | 成本追踪 |
| `COMPACTION.md` | 会话压缩 |

---

_2026-04-01 配置审查_
