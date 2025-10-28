#!/bin/bash

# Production deployment script for Aidiligence.pro
set -e

echo "🚀 Starting production deployment for Aidiligence.pro..."

# Check if we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're not on the main branch. Current branch: $BRANCH"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Install function dependencies
echo "📦 Installing function dependencies..."
cd functions
npm ci
cd ..

# Run tests
echo "🧪 Running tests..."
npm run test

# Type check
echo "🔍 Type checking..."
npm run type-check

# Lint check
echo "🔧 Linting..."
npm run lint

# Build the project
echo "🏗️  Building project..."
npm run build:prod

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is now live at: https://aidiligence.pro"

# Optional: Open the deployed site
read -p "Do you want to open the deployed site? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open https://aidiligence.pro
fi