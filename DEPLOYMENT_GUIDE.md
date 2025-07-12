# AI Diligence Pro - Deployment Guide

## Prerequisites

1. **Firebase Project Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named "ai-diligence"
   - Enable the following services:
     - Authentication (Anonymous & Email/Password)
     - Firestore Database
     - Cloud Functions
     - Hosting
     - Storage

2. **API Keys Required**
   - ✅ AIML API: `782d4016a20947cc84ec6f389daf8449`
   - ✅ Alpha Vantage: `7JIZRKMA9WLZ7G1O`
   - ✅ SEC API: `f5e1e929055cc168e881b6cbf5d931b569f4bb20c2b742f49b051f3485e608ed`
   - ✅ Firebase Config: Already configured

## Deployment Steps

### 1. Initialize Firebase
```bash
firebase login
firebase init
# Select: Hosting, Functions, Firestore, Storage
# Choose existing project: ai-diligence
```

### 2. Set Environment Secrets
```bash
# Set API keys as Firebase Function secrets
firebase functions:secrets:set VITE_AIML_API_KEY="782d4016a20947cc84ec6f389daf8449"
firebase functions:secrets:set VITE_ALPHA_VANTAGE_API_KEY="7JIZRKMA9WLZ7G1O"
firebase functions:secrets:set VITE_SEC_API_KEY="f5e1e929055cc168e881b6cbf5d931b569f4bb20c2b742f49b051f3485e608ed"
```

### 3. Build and Deploy
```bash
# Build the frontend
yarn build

# Deploy everything
firebase deploy
```

### 4. Configure Firestore Security
- Go to Firebase Console > Firestore > Rules
- The rules are already configured in `firestore.rules`

### 5. Test the Deployment
- Visit the deployed URL
- Test anonymous authentication
- Test MCP data connections
- Verify API integrations

## Admin Testing Guide

### Demo User Access
1. **Anonymous Login**: Click "Enter Demo Platform"
2. **Admin Features**: All MCP features available in demo mode
3. **Test Data**: Real API connections with your keys

### Testing Checklist

#### 1. Authentication Flow
- [ ] Anonymous login works
- [ ] Dashboard loads after authentication
- [ ] User session persists

#### 2. MCP Data Sources
- [ ] Stock analysis loads real data
- [ ] ESG ratings generate
- [ ] SEC filings retrieve
- [ ] Real-time alerts trigger

#### 3. AI Features
- [ ] Due diligence reports generate
- [ ] AIML API integration works
- [ ] Comprehensive analysis provided

#### 4. Performance
- [ ] Page loads under 3 seconds
- [ ] API calls complete under 10 seconds
- [ ] Real-time updates work

### Advanced Admin Features

#### Custom Portfolio Testing
1. Go to Firestore Console
2. Create test portfolio:
```json
{
  "ownerId": "demo-user",
  "holdings": [
    {"symbol": "AAPL", "shares": 100},
    {"symbol": "MSFT", "shares": 50}
  ],
  "name": "Test Portfolio",
  "adminUsers": ["demo-user"]
}
```

#### Direct API Testing
```bash
# Test MCP functions directly
curl -X POST https://us-central1-ai-diligence.cloudfunctions.net/mcpExecuteResource \
  -H "Content-Type: application/json" \
  -d '{"name": "stock_analysis", "params": {"symbol": "AAPL", "period": "1d"}}'
```

## Production Readiness

### Security Checklist
- [ ] API keys stored as Firebase secrets
- [ ] Firestore rules properly configured
- [ ] CORS headers set correctly
- [ ] Anonymous access limited to demo features

### Performance Optimization
- [ ] Firestore indexes created
- [ ] Function cold start minimized
- [ ] CDN caching enabled
- [ ] Image optimization

### Monitoring Setup
- [ ] Firebase Analytics enabled
- [ ] Function logs monitoring
- [ ] Error tracking with Sentry
- [ ] Usage metrics dashboard

## Troubleshooting

### Common Issues

1. **Functions not deploying**
   - Check Node.js version (use 20.x)
   - Verify all dependencies installed
   - Check TypeScript compilation

2. **API calls failing**
   - Verify secrets are set correctly
   - Check CORS configuration
   - Validate API key permissions

3. **Frontend not loading**
   - Check environment variables
   - Verify Firebase config
   - Clear browser cache

### Debug Commands
```bash
# Check function logs
firebase functions:log

# Test functions locally
firebase emulators:start

# Validate Firestore rules
firebase firestore:rules:test
```

## Support

For technical support with the MCP integration or Firebase deployment:
1. Check Firebase Console logs
2. Review function execution logs
3. Test individual MCP endpoints
4. Verify API key permissions

## Next Steps

After successful deployment:
1. **Custom Domain**: Configure custom domain (aidiligence.pro)
2. **Production Auth**: Set up proper user authentication
3. **Payment Integration**: Add Stripe for $2,000/month subscriptions
4. **Advanced MCP**: Integrate Bloomberg Terminal access
5. **Portfolio Tools**: Complete Schwab/Salesforce integrations