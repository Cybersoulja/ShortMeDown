import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';
import { CloudflareAI } from './cloudflare-ai';
import { ShortcutCache } from './shortcut-cache';
import { Analytics } from './analytics';

type Bindings = {
  SHORTCUT_CACHE: KVNamespace;
  USER_SESSIONS: KVNamespace;
  ASSETS: R2Bucket;
  AI: any;
  ANALYTICS: AnalyticsEngineDataset;
  SHORTCUT_SYNC: DurableObjectNamespace;
  OPENAI_API_KEY?: string;
  DATABASE_URL?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:5000', 'https://*.pages.dev', 'https://*.workers.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Cache middleware for static content
app.use('/api/templates*', cache({
  cacheName: 'shortcut-templates',
  cacheControl: 'max-age=300', // 5 minutes
}));

// Cloudflare AI-powered shortcut generation
app.post('/api/ai/generate-shortcut', async (c) => {
  try {
    const { prompt, userId } = await c.req.json();
    
    // Try Cloudflare AI first, fallback to OpenAI
    const cloudflareAI = new CloudflareAI(c.env.AI);
    let result;
    
    try {
      result = await cloudflareAI.generateShortcut(prompt);
    } catch (error) {
      // Fallback to OpenAI if available
      if (c.env.OPENAI_API_KEY) {
        const openaiResult = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'Generate iOS shortcuts based on user requests. Respond with JSON containing title, description, tags, and actions array.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            response_format: { type: 'json_object' }
          })
        });
        
        if (openaiResult.ok) {
          const data = await openaiResult.json();
          result = JSON.parse(data.choices[0].message.content);
        }
      }
    }
    
    if (result) {
      // Cache the result
      const cache = new ShortcutCache(c.env.SHORTCUT_CACHE);
      await cache.store(prompt, result);
      
      // Track usage
      const analytics = new Analytics(c.env.ANALYTICS);
      await analytics.track('shortcut_generated', {
        userId,
        method: 'cloudflare_ai',
        promptLength: prompt.length
      });
      
      return c.json(result);
    }
    
    return c.json({ error: 'Unable to generate shortcut' }, 500);
    
  } catch (error) {
    console.error('Shortcut generation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Smart shortcut recommendations using Cloudflare AI
app.get('/api/ai/recommendations/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const cache = new ShortcutCache(c.env.SHORTCUT_CACHE);
    
    // Check cache first
    const cached = await cache.get(`recommendations:${userId}`);
    if (cached) {
      return c.json(cached);
    }
    
    // Get user's shortcut history (would need to connect to main database)
    // For now, use Cloudflare AI to generate personalized recommendations
    const cloudflareAI = new CloudflareAI(c.env.AI);
    const recommendations = await cloudflareAI.generateRecommendations(userId);
    
    // Cache recommendations for 1 hour
    await cache.store(`recommendations:${userId}`, recommendations, 3600);
    
    return c.json(recommendations);
    
  } catch (error) {
    console.error('Recommendations error:', error);
    return c.json({ error: 'Unable to generate recommendations' }, 500);
  }
});

// Asset delivery with Cloudflare R2
app.get('/api/assets/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const object = await c.env.ASSETS.get(key);
    
    if (!object) {
      return c.json({ error: 'Asset not found' }, 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    
    return new Response(object.body, { headers });
    
  } catch (error) {
    console.error('Asset delivery error:', error);
    return c.json({ error: 'Asset delivery failed' }, 500);
  }
});

// Upload assets to R2
app.post('/api/assets/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const key = `uploads/${Date.now()}-${file.name}`;
    await c.env.ASSETS.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      }
    });
    
    return c.json({ 
      success: true, 
      url: `/api/assets/${key}`,
      key 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Analytics endpoint
app.get('/api/analytics/usage', async (c) => {
  try {
    const analytics = new Analytics(c.env.ANALYTICS);
    const usage = await analytics.getUsageStats();
    
    return c.json(usage);
    
  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ error: 'Analytics unavailable' }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default app;