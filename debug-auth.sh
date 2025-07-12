#!/bin/bash

echo "🔍 Firebase Authentication Debug"
echo "==============================="

# Check current project
PROJECT=$(firebase use --json 2>/dev/null | jq -r '.active' 2>/dev/null || echo "unknown")
echo "📋 Current Firebase Project: $PROJECT"

# Check if auth is enabled
echo ""
echo "🔧 Authentication Status Check:"
echo "Visit: https://console.firebase.google.com/project/$PROJECT/authentication/providers"
echo ""
echo "Required Settings:"
echo "✅ Anonymous Provider: ENABLED"
echo "✅ Authorized domains: Should include ai-diligence.web.app and aidiligence.pro"
echo ""

# Test the website
echo "🌐 Test Your Website:"
echo "Current: https://ai-diligence.web.app"
echo "Future:  https://aidiligence.pro (after DNS setup)"
echo ""

echo "🎯 If authentication still fails:"
echo "1. Check browser console for specific errors"
echo "2. Verify anonymous auth is enabled in Firebase Console"
echo "3. Check authorized domains list"
echo "4. Try in incognito/private browsing mode"