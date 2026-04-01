# TOOLS.md - Local Notes

OpenClaw 环境配置和工具说明。

---

## 飞书 Bot 配置

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

## 模型配置

### 主力模型
- **Primary:** `zai/glm-5` (GLM-5)
- **Fallbacks:**
  1. `minimax-portal/MiniMax-M2.7`
  2. `minimax-portal/MiniMax-M2.7-highspeed`
  3. `zai/glm-4.6v`
  4. `zai/glm-4.7`
  5. `zai/glm-5-turbo`

### 模型别名
| 别名 | 完整名称 |
|------|---------|
| GLM | zai/glm-5 |
| minimax-m2.7 | minimax-portal/MiniMax-M2.7 |
| minimax-m2.7-highspeed | minimax-portal/MiniMax-M2.7-highspeed |

---

## Git 配置同步

### 仓库
- **本地:** `C:\Users\张云亮\.openclaw`
- **远程:** `https://github.com/yun-coder/openclaw-config-self.git`
- **分支:** main

### 自动推送
- `post-commit` 钩子自动推送到 GitHub
- 排除敏感文件：credentials/, devices/, identity/, feishu/, logs/

### 手动操作
```bash
cd ~/.openclaw
git add .
git commit -m "config update"
# 自动推送
```

---

## 工作目录

| Agent | Workspace |
|-------|-----------|
| main | `C:\Users\张云亮\.openclaw\workspace` |
| product-worker | `agents/product-worker/workspace` |
| ui-worker | `agents/ui-worker/workspace` |
| web-worker | `agents/web-worker/workspace` |
| qa-worker | `agents/qa-worker/workspace` |
| app-worker | `agents/app-worker/workspace` |

---

## 常用路径

| 路径 | 用途 |
|------|------|
| `workspace/` | 主工作区 |
| `workspace/memory/` | 每日笔记 |
| `workspace/PARITY.md` | 功能对比与学习进度 |
| `openclaw.json` | OpenClaw 主配置 |

---

_持续更新中。_
