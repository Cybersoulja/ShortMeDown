#!/bin/bash

# Cloudflare Deployment Script for oneseco.com
# This script sets up and deploys the AI Shortcut Companion to Cloudflare Workers

set -e

echo "🚀 Deploying AI Shortcut Companion to Cloudflare Workers..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please log in to Cloudflare:"
    wrangler login
fi

# Create KV namespaces
echo "Creating KV namespaces..."
wrangler kv:namespace create "SHORTCUT_CACHE" --preview
wrangler kv:namespace create "USER_SESSIONS" --preview

# Create R2 bucket for assets
echo "Creating R2 bucket for assets..."
wrangler r2 bucket create shortcut-assets

# Set up custom domain routing for oneseco.com
echo "Setting up custom domain routing..."
echo "Please ensure your Cloudflare zone for oneseco.com is configured with these DNS records:"
echo "  - api.oneseco.com CNAME to your-worker.your-subdomain.workers.dev"
echo "  - staging-api.oneseco.com CNAME to your-worker-staging.your-subdomain.workers.dev"

# Deploy to staging first
echo "Deploying to staging environment..."
wrangler deploy --env staging --var ENVIRONMENT:staging

# Deploy to production
echo "Deploying to production environment..."
wrangler deploy --env production --var ENVIRONMENT:production

echo "✅ Deployment complete!"
echo "Your AI Shortcut Companion is now available at:"
echo "  - Production: https://api.oneseco.com"
echo "  - Staging: https://staging-api.oneseco.com"
echo ""
echo "Don't forget to:"
echo "1. Update your main app's API endpoints to use the Cloudflare Workers"
echo "2. Configure environment variables in the Cloudflare dashboard"
echo "3. Set up Analytics Engine and AI bindings"