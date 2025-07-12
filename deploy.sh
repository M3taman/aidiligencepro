#!/bin/bash

# AI Diligence Pro - Instant Deployment Script
# Run this script to deploy your MCP-integrated due diligence platform

echo "🚀 AI DILIGENCE PRO - INSTANT DEPLOYMENT"
echo "======================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Build the application
echo "📦 Building application..."
yarn build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. Please check the build process."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."

# Initialize Firebase (if not already done)
if [ ! -f "firebase.json" ]; then
    echo "🔧 Initializing Firebase..."
    firebase init --project ai-diligence-pro
fi

# Deploy hosting and functions
echo "📤 Deploying hosting and functions..."
firebase deploy

# Set API secrets
echo "🔑 Setting API secrets..."
firebase functions:secrets:set AIML_API_KEY="782d4016a20947cc84ec6f389daf8449"
firebase functions:secrets:set ALPHA_VANTAGE_API_KEY="7JIZRKMA9WLZ7G1O"
firebase functions:secrets:set SEC_API_KEY="f5e1e929055cc168e881b6cbf5d931b569f4bb20c2b742f49b051f3485e608ed"

# Redeploy functions with secrets
echo "🔄 Redeploying functions with API keys..."
firebase deploy --only functions

# Get hosting URL
HOSTING_URL=$(firebase hosting:sites:list --project ai-diligence-pro --format=json | jq -r '.[0].defaultUrl')

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo "🌐 Your AI Diligence Pro is live at:"
echo "   $HOSTING_URL"
echo ""
echo "🔧 Admin Access:"
echo "   1. Visit the URL above"
echo "   2. Click 'Enter Demo Platform'"
echo "   3. Test all MCP features"
echo ""
echo "💼 Ready for $2,000/month RIA clients!"
echo "📊 Features: Real-time data, AI analysis, ESG ratings, SEC filings"
echo "🔒 Security: Firebase auth, encrypted API keys, CORS protection"
echo ""