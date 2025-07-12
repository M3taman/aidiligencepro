#!/bin/bash

# Deployment Verification Script
echo "🔍 AI DILIGENCE PRO - DEPLOYMENT VERIFICATION"
echo "============================================"

# Check if Firebase project is set
PROJECT=$(firebase use --json | jq -r '.active')
echo "📋 Firebase Project: $PROJECT"

# Check build files
if [ -d "dist" ]; then
    echo "✅ Build files ready: $(ls dist/ | wc -l) files"
else
    echo "❌ Build files missing - run 'yarn build' first"
    exit 1
fi

# Check functions build
if [ -d "functions/lib" ]; then
    echo "✅ Functions compiled: $(ls functions/lib/ | wc -l) files"
else
    echo "❌ Functions not compiled - run 'cd functions && yarn build'"
    exit 1
fi

# Check Firebase config
if [ -f "firebase.json" ]; then
    echo "✅ Firebase configuration ready"
else
    echo "❌ Firebase configuration missing"
    exit 1
fi

echo ""
echo "🚀 READY TO DEPLOY!"
echo "Run: firebase deploy"
echo ""
echo "After deployment, test at:"
echo "https://${PROJECT}.web.app"