#!/bin/bash

# Railway Deployment Script for Video File RTSP Streamer
# This script deploys the application to Railway using Railway CLI

set -e

echo "🚀 Starting deployment to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    
    # Install Railway CLI using npm
    npm install -g @railway/cli
    
    # Verify installation
    if ! command -v railway &> /dev/null; then
        echo "❌ Failed to install Railway CLI"
        exit 1
    fi
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"

# Get project name (optional)
PROJECT_NAME=${1:-"video-rtsp-streamer"}

echo "📦 Deploying project: $PROJECT_NAME"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please run this script from a git repository."
    exit 1
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo "🌿 Current branch: $BRANCH"

# Deploy to Railway
echo "🚀 Deploying to Railway..."

# Create a new service or update existing one
railway up \
    --service "$PROJECT_NAME" \
    --branch "$BRANCH"

# Get the service URL
SERVICE_URL=$(railway domain --service "$PROJECT_NAME" 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your application is available at: $SERVICE_URL"
    echo ""
    echo "📋 Useful commands:"
    echo "   railway logs --service $PROJECT_NAME     # View logs"
    echo "   railway variables --service $PROJECT_NAME  # Manage environment variables"
    echo "   railway status --service $PROJECT_NAME   # Check service status"
else
    echo "⚠️  Deployment completed, but couldn't retrieve service URL"
    echo "   You can check your service at: https://railway.app"
fi

echo "🎉 Deployment process completed!"