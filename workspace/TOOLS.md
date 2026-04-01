# TOOLS.md - 环境配置

OpenClaw 环境配置、模型定价和工具说明。

---

## 🤖 模型配置

### 主力模型

| 模型 | Provider | 别名 | 用途 |
|------|----------|------|------|
| GLM-5 | zai | GLM | 主力推理 |
| MiniMax-M2.7 | minimax-portal | minimax-m2.7 | 备用 |
| MiniMax-M2.7-highspeed | minimax-portal | minimax-m2.7-highspeed | 快速响应 |

### 模型定价 (元/千tokens)

| 模型 | Input | Output | Cache Read | Cache Write |
|------|-------|--------|------------|-------------|
| **GLM-5** | ¥0.001 | ¥0.0032 | ¥0.0002 | ¥0 |
| GLM-5-Turbo | ¥0.0012 | ¥0.004 | ¥0.00024 | ¥0 |
| GLM-4.7 | ¥0.0006 | ¥0.0022 | ¥0.00011 | ¥0 |
| GLM-4.7-Flash | ¥0.00007 | ¥0.0004 | ¥0 | ¥0 |
| GLM-4.7-FlashX | ¥0.00006 | ¥0.0004 | ¥0.00001 | ¥0 |
| GLM-4.6V (多模态) | ¥0.0003 | ¥0.0009 | ¥0 | ¥0 |

### 成本计算公式

```
成本 = (input_tokens × input_price) 
     + (output_tokens × output_price)
     + (cache_read × cache_read_price)
     + (cache_write × cache_write_price)
```

### 当前会话成本估算

```
Input:  278,201 × ¥0.001  = ¥0.278
Output:   5,037 × ¥0.0032 = ¥0.016
Cache:   97,216 × ¥0.0002 = ¥0.019
────────────────────────────────────
Total:                     ≈ ¥0.31
```

---

## 🛠️ 工具权限

### 权限级别

| 级别 | 风险 | 工具示例 |
|------|------|---------|
| ReadOnly | 低 | read, web_search, memory_search |
| WorkspaceWrite | 中 | write, edit, image_generate |
| DangerFullAccess | 高 | exec, process, sessions_spawn |

### 当前 Profile: `coding`

允许的工具集：
- ✅ 所有 ReadOnly 工具
- ✅ write, edit (WorkspaceWrite)
- ✅ exec (需要确认)

---

## 📱 飞书 Bot 配置

| Bot ID | 名称 | 用途 |
|--------|------|------|
| main | 打工人首领 | 主控 agent |
| product-worker | 产品打工人 | 产品需求 |
| ui-worker | UI设计打工人 | UI/UX 设计 |
| web-worker | web开发打工人 | Web 前端 |
| qa-worker | QA测试打工人 | 测试验证 |
| app-worker | app开发打工人 | App 开发 |

### 飞书群组白名单
- `oc_af9134db25975903aa234741c4d7ad5d` ✅

---

## 🔧 Git 配置同步

### 仓库信息
- **本地**: `C:\Users\张云亮\.openclaw`
- **远程**: `https://github.com/yun-coder/openclaw-config-self.git`
- **分支**: main

### 自动推送
- **机制**: post-commit 钩子
- **触发**: 每次 commit 后自动 push

### 排除规则 (.gitignore)
```
credentials/   # 凭证
devices/       # 设备配对
identity/      # 身份认证
feishu/        # 飞书 token
logs/          # 日志
*.log          # 日志文件
```

### 手动操作
```bash
cd ~/.openclaw
git add .
git commit -m "config update"
# 自动推送
```

---

## 📁 工作目录

| Agent | Workspace |
|-------|-----------|
| main | `C:\Users\张云亮\.openclaw\workspace` |
| product-worker | `agents/product-worker/workspace` |
| ui-worker | `agents/ui-worker/workspace` |
| web-worker | `agents/web-worker/workspace` |
| qa-worker | `agents/qa-worker/workspace` |
| app-worker | `agents/app-worker/workspace` |

---

## 📄 重要文件

| 路径 | 用途 |
|------|------|
| `workspace/MEMORY.md` | 长期记忆 |
| `workspace/PARITY.md` | 功能对比 |
| `workspace/TOOL-PERMISSIONS.md` | 工具权限配置 |
| `workspace/memory/` | 每日笔记 |
| `openclaw.json` | OpenClaw 主配置 |

---

## 📊 会话状态

查看当前会话状态和 Token 使用：
```
📊 session_status
```

---

_持续更新中。_
