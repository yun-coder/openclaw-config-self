# MEMORY.md - 长期记忆

这是我的长期记忆，存储重要的信息、决策和上下文。

---

## 用户信息

- **名字**: 张云亮 (Yun-Liang Zhang)
- **GitHub**: yun-coder
- **时区**: Asia/Shanghai (GMT+8)
- **项目**: 多 agent 协作开发系统
- **飞书群**: `oc_af9134db25975903aa234741c4d7ad5d`

---

## 系统配置

### Git 同步
- **仓库**: `https://github.com/yun-coder/openclaw-config-self.git`
- **自动推送**: post-commit 钩子
- **排除**: credentials/, feishu/, logs/

### 飞书 Bot
- main (打工人首领)
- product-worker, ui-worker, web-worker, qa-worker, app-worker

### 模型
- **主力**: GLM-5 (zai/glm-5)
- **备用**: MiniMax-M2.7, GLM-4.7

---

## 学习成果 (2026-04-01)

### claw-code 架构分析
- **会话压缩**: 保留最近4条 + 智能摘要
- **工具权限**: 5级权限 + 工具级别控制
- **Token 追踪**: 按模型定价 + 缓存成本
- **上下文发现**: 层级查找 + Git 状态注入
- **钩子系统**: 退出码语义 (0=允许, 2=拒绝)

### 关键文件
- `memory/claw-code-architecture.md` - 详细架构分析
- `PARITY.md` - 功能对比
- `TOOL-PERMISSIONS.md` - 工具权限配置

---

## 智能摘要格式

参考 claw-code 的会话压缩策略：

```
<summary>
Conversation summary:
- Scope: N earlier messages compacted (user=X, assistant=Y, tool=Z).
- Tools mentioned: tool1, tool2, tool3.
- Recent user requests:
  - 最近的用户请求
- Pending work:
  - 待办事项
- Key files referenced: 关键文件.
- Current work: 当前工作.
- Key timeline:
  - user: 消息摘要
  - assistant: 消息摘要
</summary>
```

### 压缩规则
1. **保留最近 4 条消息**
2. **历史消息生成摘要**
3. **合并已有的摘要**
4. **提取关键信息**:
   - 工具使用
   - 待办事项 (todo/next/pending)
   - 关键文件 (带扩展名的路径)
   - 当前工作

---

## Token 成本追踪

### GLM-5 定价 (元/千tokens)

| 类型 | 价格 |
|------|------|
| Input | ¥0.001 |
| Output | ¥0.0032 |
| Cache Read | ¥0.0002 |
| Cache Write | ¥0 |

### 当前会话统计

| 指标 | 值 |
|------|-----|
| Input Tokens | 278,201 |
| Output Tokens | 5,037 |
| Cache Read | 97,216 |
| 估算成本 | ~¥0.29 |

---

## 待办事项

- [ ] 将工具权限粒度应用到 openclaw.json
- [ ] 优化会话压缩策略
- [ ] 完善成本感知显示

---

_此文件记录长期记忆。每日笔记存放在 memory/YYYY-MM-DD.md_
