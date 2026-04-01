/**
 * Cost Alert Hook
 * 
 * 基于 claw-code 的 Token 追踪设计，追踪会话成本并在超过阈值时提醒。
 * 
 * GLM-5 定价 (元/千tokens):
 * - Input: ¥0.001
 * - Output: ¥0.0032
 * - Cache Read: ¥0.0002
 * - Cache Write: ¥0
 */

// GLM-5 定价
const PRICING = {
  glm5: {
    input: 0.001,
    output: 0.0032,
    cacheRead: 0.0002,
    cacheWrite: 0,
  },
  glm4_7_flash: {
    input: 0.00007,
    output: 0.0004,
    cacheRead: 0,
    cacheWrite: 0,
  },
};

// 成本阈值
const THRESHOLDS = {
  low: 0.10,
  medium: 0.30,
  high: 0.50,
  critical: 1.00,
};

// 会话累计
let sessionCost = 0;
let sessionInputTokens = 0;
let sessionOutputTokens = 0;

/**
 * 计算成本
 */
function calculateCost(usage, model = 'glm5') {
  const pricing = PRICING[model] || PRICING.glm5;
  
  const inputCost = (usage.inputTokens || 0) * pricing.input / 1000;
  const outputCost = (usage.outputTokens || 0) * pricing.output / 1000;
  const cacheReadCost = (usage.cacheRead || 0) * pricing.cacheRead / 1000;
  const cacheWriteCost = (usage.cacheWrite || 0) * pricing.cacheWrite / 1000;
  
  return inputCost + outputCost + cacheReadCost + cacheWriteCost;
}

/**
 * 格式化成本
 */
function formatCost(cost) {
  if (cost < 0.01) {
    return `¥${(cost * 100).toFixed(2)}分`;
  }
  return `¥${cost.toFixed(2)}`;
}

/**
 * 获取阈值级别
 */
function getThresholdLevel(cost) {
  if (cost >= THRESHOLDS.critical) return 'critical';
  if (cost >= THRESHOLDS.high) return 'high';
  if (cost >= THRESHOLDS.medium) return 'medium';
  if (cost >= THRESHOLDS.low) return 'low';
  return 'none';
}

/**
 * Hook 处理函数
 */
const handler = async (event) => {
  // 只处理响应事件
  if (event.type !== 'response') {
    return;
  }
  
  const usage = event.usage || {};
  
  // 更新累计
  sessionInputTokens += usage.inputTokens || 0;
  sessionOutputTokens += usage.outputTokens || 0;
  
  // 计算本轮成本
  const turnCost = calculateCost(usage);
  sessionCost += turnCost;
  
  // 检查阈值
  const level = getThresholdLevel(sessionCost);
  
  if (level === 'critical') {
    return {
      message: `💰 会话成本已达 ${formatCost(sessionCost)}，建议使用 /new 开始新会话`,
    };
  }
  
  if (level === 'high') {
    return {
      message: `💰 会话成本已达 ${formatCost(sessionCost)}，建议使用 /compact 压缩上下文`,
    };
  }
  
  if (level === 'medium') {
    return {
      message: `💰 会话成本: ${formatCost(sessionCost)} (input: ${sessionInputTokens}, output: ${sessionOutputTokens})`,
    };
  }
  
  // 低成本时不提醒
  return;
};

module.exports = handler;
module.exports.default = handler;
