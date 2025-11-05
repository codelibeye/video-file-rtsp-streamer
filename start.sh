#!/bin/bash

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Railway Multi-Service Deployment${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${BLUE}📦 Installing Railway CLI...${NC}"
    curl -fsSL https://railway.com/install.sh | sh
fi

# Initialize Railway project (if needed)
if [ ! -f "railway.toml" ] && [ ! -f "railway.json" ]; then
    echo -e "${BLUE}🔧 Initializing Railway project...${NC}"
    railway init
fi

# Login to Railway
echo -e "${BLUE}🔐 Logging in to Railway...${NC}"
railway login --browserless

# Deploy Backend
echo -e "${GREEN}📤 Deploying Backend...${NC}"
cd backend
railway service
railway up
cd ..

echo ""

# Deploy Frontend
echo -e "${GREEN}📤 Deploying Frontend...${NC}"
cd frontend
railway service
railway up
cd ..

echo -e "${GREEN}✅ Deployment Complete!${NC}"
