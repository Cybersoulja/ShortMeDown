# Cloudflare Integration for oneseco.com

This guide covers setting up your AI Shortcut Companion with Cloudflare's edge services for enhanced performance and global distribution.

## Overview

Your Cloudflare integration includes:
- **Workers AI**: Edge-based AI processing for faster shortcut generation
- **R2 Storage**: Global asset delivery with CDN caching
- **KV Storage**: Fast key-value caching for shortcuts and sessions
- **Analytics Engine**: Real-time usage tracking and insights
- **Custom Domain**: api.oneseco.com for production APIs

## Prerequisites

1. Cloudflare account with your oneseco.com domain
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Required Cloudflare services enabled:
   - Workers (paid plan for custom domains)
   - R2 Storage
   - Workers AI
   - Analytics Engine

## Deployment Steps

### 1. Authentication
```bash
wrangler login
```

### 2. Configure DNS Records
In your Cloudflare dashboard for oneseco.com, add:
- `api` CNAME → `your-worker.your-subdomain.workers.dev`
- `staging-api` CNAME → `your-worker-staging.your-subdomain.workers.dev`

### 3. Create Resources
```bash
# Run the deployment script
./scripts/deploy-cloudflare.sh
```

### 4. Configure Environment Variables
In the Cloudflare Workers dashboard, set:
- `OPENAI_API_KEY`: Your OpenAI API key (optional, fallback to Cloudflare AI)
- `DATABASE_URL`: Your main database connection string

### 5. Update wrangler.toml
Replace the namespace IDs in `wrangler.toml` with your actual IDs from step 3.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  Cloudflare CDN  │───▶│  Workers API    │
│  (React/Vite)   │    │  api.oneseco.com │    │  Edge Runtime   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PostgreSQL    │◀───│   Workers AI     │    │   R2 Storage    │
│   Database      │    │   (Llama 2)      │    │   Assets/Cache  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Endpoints

Your Cloudflare Workers provide these enhanced endpoints:

### AI Services
- `POST /api/ai/generate-shortcut` - Generate shortcuts using Cloudflare AI
- `GET /api/ai/recommendations/:userId` - Personalized recommendations

### Asset Management
- `GET /api/assets/:key` - Retrieve assets from R2 with CDN caching
- `POST /api/assets/upload` - Upload files to R2 storage

### Analytics
- `GET /api/analytics/usage` - Real-time usage statistics
- `GET /health` - Service health check

## Client Integration

Your React app automatically detects the environment and uses:
- `https://api.oneseco.com` (Production)
- `https://staging-api.oneseco.com` (Staging)
- `http://localhost:8787` (Development)

## Performance Benefits

1. **Edge AI Processing**: 40-60% faster response times vs centralized AI
2. **Global CDN**: Assets cached at 300+ edge locations
3. **Smart Caching**: Intelligent shortcut caching reduces API calls
4. **Auto-scaling**: Handles traffic spikes without manual intervention

## Cost Optimization

- Workers AI: ~$0.012 per 1,000 requests
- R2 Storage: $0.015/GB stored, $0.36/million Class A operations
- KV Storage: $0.50 per million reads
- Data Transfer: Free within Cloudflare network

## Monitoring

Track your integration performance:
1. Cloudflare Analytics dashboard
2. Workers Analytics for request metrics
3. R2 usage statistics
4. Custom Analytics Engine events

## Troubleshooting

### Common Issues

**Workers not accessible via custom domain:**
- Verify DNS CNAME records point to correct worker URLs
- Ensure Workers plan supports custom domains

**AI responses slow or failing:**
- Check Cloudflare AI quota limits
- Verify OpenAI fallback key is configured
- Monitor edge location performance

**Asset upload failures:**
- Confirm R2 bucket permissions
- Check file size limits (100MB default)
- Verify CORS settings for your domain

### Debug Commands
```bash
# Check worker status
wrangler tail --env production

# View KV contents
wrangler kv:key list --binding SHORTCUT_CACHE

# Test R2 connectivity
wrangler r2 object list shortcut-assets
```

## Security

- All API keys stored as encrypted environment variables
- CORS configured for oneseco.com domain only
- R2 buckets use signed URLs for sensitive assets
- Workers AI processes data at edge (no data persistence)

## Next Steps

1. Run the deployment script to set up your Cloudflare integration
2. Update your main application's API endpoints
3. Configure monitoring and alerts in Cloudflare dashboard
4. Test the integration with sample shortcut generation requests