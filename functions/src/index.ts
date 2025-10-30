import { initializeApp, getApps } from 'firebase-admin/app';
import { mcpExecuteResource, mcpCallTool, mcpRealTime, getMCPData } from './mcpServer';
import { generateReport } from './reportGenerator';
import { createPayPalSubscription, executePayPalAgreement } from './paypal';

if (getApps().length === 0) {
  initializeApp();
}

export {
  mcpExecuteResource,
  mcpCallTool,
  mcpRealTime,
  getMCPData,
  generateReport,
  createPayPalSubscription,
  executePayPalAgreement
};