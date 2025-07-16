import { initializeApp, getApps } from 'firebase-admin/app';
import { mcpExecuteResource, mcpCallTool, mcpRealTime } from './mcpServer';
import { generateReport } from './reportGenerator';
import { createSubscription } from './subscriptions';
import { createPayPalSubscription, executePayPalAgreement } from './paypal';

// Initialize Firebase Admin only if no app exists
if (getApps().length === 0) {
  initializeApp();
}

// Export MCP functions
export { mcpExecuteResource, mcpCallTool, mcpRealTime, generateReport, createSubscription, createPayPalSubscription, executePayPalAgreement };