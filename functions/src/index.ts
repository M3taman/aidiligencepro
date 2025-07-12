import { initializeApp } from 'firebase-admin/app';
import { mcpExecuteResource, mcpCallTool } from './mcpServer';

// Initialize Firebase Admin
initializeApp();

// Export MCP functions
export { mcpExecuteResource, mcpCallTool };