#!/bin/bash

echo "🚀 AI DILIGENCE PRO - SIMPLE DEPLOYMENT FIX"
echo "==========================================="

# Fix functions dependencies
echo "🔧 Fixing functions..."
cd /app/functions
npm install
cd ..

# Deploy without functions first
echo "📤 Deploying website..."
firebase deploy --only hosting,firestore,storage

# Set API secrets with correct format
echo "🔑 Setting API secrets..."
firebase functions:secrets:set AIML_API_KEY="782d4016a20947cc84ec6f389daf8449"
firebase functions:secrets:set ALPHA_VANTAGE_API_KEY="7JIZRKMA9WLZ7G1O" 
firebase functions:secrets:set SEC_API_KEY="f5e1e929055cc168e881b6cbf5d931b569f4bb20c2b742f49b051f3485e608ed"

# Deploy functions last
echo "⚡ Deploying functions..."
firebase deploy --only functions

# Get the website URL
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo "🌐 Your website is live at:"
echo "   https://ai-diligence-pro.web.app"
echo ""
echo "🎯 Test it now:"
echo "   1. Visit the website"
echo "   2. Click 'Enter Demo Platform'"
echo "   3. Enjoy your $2,000/month AI platform!"
echo ""