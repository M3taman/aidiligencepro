import { initializeApp, getApps } from 'firebase-admin/app';
import { mcpExecuteResource, mcpCallTool } from './mcpServer';

// Initialize Firebase Admin only if no app exists
if (getApps().length === 0) {
  initializeApp();
}

// Export MCP functions
export { mcpExecuteResource, mcpCallTool };