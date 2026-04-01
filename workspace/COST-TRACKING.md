# 成本追踪配置 (COST-TRACKING.md)

基于 claw-code 的 Token 追踪设计，配置 OpenClaw 的成本感知功能。

---

## OpenClaw 内置功能

### `/usage` 命令

| 命令 | 说明 |
|------|------|
| `/usage off` | 关闭使用显示 |
| `/usage tokens` | 显示 token 数量 |
| `/usage full` | 显示 token + 估算成本 |
| `/usage cost` | 显示本地成本汇总 |

### `/status` 命令

显示当前会话的：
- 模型名称
- 上下文使用率
- 最近回复的 token 数
- 估算成本（API key 模式）

### CLI 命令

```bash
# 查看完整使用情况
openclaw status --usage

# 查看渠道列表（含使用情况）
openclaw channels list
```

---

## GLM-5 定价配置

已在 `openclaw.json` 中配置：

```json
{
  "models": {
    "providers": {
      "zai": {
        "models": [{
          "id": "glm-5",
          "cost": {
            "input": 1,        // 元/千tokens
            "output": 3.2,
            "cacheRead": 0.2,
            "cacheWrite": 0
          }
        }]
      }
    }
  }
}
```

---

## 成本计算

### 公式

```
成本 (元) = (input_tokens × input_price / 1000)
          + (output_tokens × output_price / 1000)
          + (cache_read × cache_read_price / 1000)
          + (cache_write × cache_write_price / 1000)
```

### 当前会话估算

| 类型 | Tokens | 单价 | 成本 |
|------|--------|------|------|
| Input | 278,201 | ¥0.001 | ¥0.278 |
| Output | 5,037 | ¥0.0032 | ¥0.016 |
| Cache Read | 97,216 | ¥0.0002 | ¥0.019 |
| Cache Write | 0 | ¥0 | ¥0 |
| **Total** | | | **≈ ¥0.31** |

---

## 启用成本追踪

### 方法 1：聊天中启用

```
/usage full
```

每条回复后会显示：
```
📊 Usage: input=278201 output=5037 cache_read=97216 ≈ ¥0.31
```

### 方法 2：查看状态

```
/status
```

显示：
```
📊 Session Status
Model: glm-5
Context: 48% used (97,683 / 202,800)
Last reply: 5,037 output tokens
Estimated cost: ¥0.31
```

### 方法 3：CLI 查询

```bash
openclaw status --usage
```

---

## 成本阈值建议

| 会话规模 | Token 阈值 | 成本阈值 | 建议 |
|---------|-----------|---------|------|
| 小型 | < 50K | < ¥0.10 | 无需关注 |
| 中型 | 50K-200K | ¥0.10-0.50 | 适时压缩 |
| 大型 | > 200K | > ¥0.50 | 考虑新会话 |

---

## 自动化建议

### 1. 成本警告钩子

创建钩子在成本超过阈值时提醒：

```typescript
// hooks/cost-alert/handler.ts
export default async (event) => {
  if (event.type !== 'response') return;
  
  const cost = event.usage?.estimatedCost;
  if (cost && cost > 0.5) {
    return {
      message: `⚠️ 会话成本已超过 ¥0.50，考虑使用 /compact 或 /new`
    };
  }
};
```

### 2. 定期成本报告

在 heartbeat 中检查成本并报告。

---

_参考: claw-code `rust/crates/runtime/src/usage.rs`_
