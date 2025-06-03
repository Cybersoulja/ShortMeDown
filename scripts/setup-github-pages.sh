#!/bin/bash

# GitHub Pages + Cloudflare Pages Setup Script for oneseco.com
# This script configures GitHub Pages to work with Cloudflare Pages

set -e

echo "🚀 Setting up GitHub Pages with Cloudflare Pages for oneseco.com..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository. Please run this from your project root."
    exit 1
fi

# Create GitHub repository if it doesn't exist
echo "📝 Setting up GitHub repository..."
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "Please create a GitHub repository and add it as origin:"
    echo "git remote add origin https://github.com/oneseco-media/ai-shortcut-companion.git"
    exit 1
fi

# Add all files and commit
echo "📦 Adding files to git..."
git add .
git commit -m "Initial commit: AI Shortcut Companion with Cloudflare integration" || echo "No changes to commit"

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo "✅ Repository setup complete!"
echo ""
echo "Next steps to complete your Cloudflare Pages setup:"
echo ""
echo "1. Go to Cloudflare Dashboard → Pages"
echo "2. Connect to Git → Select your GitHub repository"
echo "3. Configure build settings:"
echo "   - Build command: mkdir -p dist && cp docs/* dist/"
echo "   - Build output directory: dist"
echo "   - Root directory: (leave empty)"
echo ""
echo "4. Set up custom domain:"
echo "   - Add shortcuts.oneseco.com as custom domain"
echo "   - Update DNS: shortcuts CNAME to your-pages-site.pages.dev"
echo ""
echo "5. Configure environment variables in Cloudflare Pages:"
echo "   - CLOUDFLARE_API_TOKEN (for API integration)"
echo "   - CLOUDFLARE_ACCOUNT_ID (your account ID)"
echo ""
echo "Your sites will be available at:"
echo "  - Documentation: https://shortcuts.oneseco.com"
echo "  - API: https://api.oneseco.com"
echo "  - App: https://app.oneseco.com"