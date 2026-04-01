/**
 * Tool Permission Check Hook
 * 
 * 基于 claw-code 的权限分级设计，检查工具执行权限。
 * 
 * 权限级别:
 * - ReadOnly: read, web_search, memory_search
 * - WorkspaceWrite: write, edit, image_generate
 * - DangerFullAccess: exec, process, sessions_spawn
 */

const DANGER_TOOLS = [
  'exec',
  'process',
  'sessions_spawn',
  'sessions_send',
  'subagents',
];

const WORKSPACE_WRITE_TOOLS = [
  'write',
  'edit',
  'image_generate',
];

const READ_ONLY_TOOLS = [
  'read',
  'image',
  'web_search',
  'web_fetch',
  'memory_search',
  'memory_get',
  'sessions_list',
  'sessions_history',
  'session_status',
];

/**
 * 获取工具的权限级别
 */
function getPermissionLevel(toolName) {
  if (DANGER_TOOLS.includes(toolName)) {
    return 'DangerFullAccess';
  }
  if (WORKSPACE_WRITE_TOOLS.includes(toolName)) {
    return 'WorkspaceWrite';
  }
  if (READ_ONLY_TOOLS.includes(toolName)) {
    return 'ReadOnly';
  }
  return 'Unknown';
}

/**
 * 格式化时间戳
 */
function timestamp() {
  return new Date().toISOString();
}

/**
 * 写入日志
 */
async function logToFile(message) {
  const fs = require('fs');
  const path = require('path');
  const logDir = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'logs');
  const logFile = path.join(logDir, 'tool-permissions.log');
  
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, message + '\n');
  } catch (err) {
    // 静默失败
  }
}

/**
 * Hook 处理函数
 */
const handler = async (event) => {
  // 只处理工具执行前事件
  if (event.type !== 'tool' || event.phase !== 'pre') {
    return { action: 'allow' };
  }
  
  const toolName = event.tool?.name || event.toolName;
  if (!toolName) {
    return { action: 'allow' };
  }
  
  const permissionLevel = getPermissionLevel(toolName);
  
  // 记录所有工具调用
  const logEntry = JSON.stringify({
    timestamp: timestamp(),
    tool: toolName,
    permission: permissionLevel,
    input: event.tool?.input ? JSON.stringify(event.tool.input).slice(0, 200) : '',
  });
  
  // 高风险操作额外记录
  if (permissionLevel === 'DangerFullAccess') {
    await logToFile(logEntry);
    
    // 可以返回消息提醒用户（但不阻止执行）
    return {
      action: 'allow',
      message: `🔒 高风险操作: ${toolName} (权限: ${permissionLevel})`,
    };
  }
  
  // 中等风险操作
  if (permissionLevel === 'WorkspaceWrite') {
    // 可选：记录到日志
    // await logToFile(logEntry);
    
    return { action: 'allow' };
  }
  
  // 只读操作直接允许
  return { action: 'allow' };
};

module.exports = handler;
module.exports.default = handler;
