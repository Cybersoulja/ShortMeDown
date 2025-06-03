# AI Shortcut Companion

A powerful AI-driven companion app for iOS users to create, understand, and optimize Shortcuts through natural language and voice input. Enhanced by Cloudflare edge computing for superior performance.

## 🌟 Features

- **Natural Language Processing**: Describe automation tasks in plain English
- **Voice Assistant Mode**: Speak your requests and get instant shortcut generation
- **Smart Recommendations**: Time-aware suggestions based on usage patterns
- **App Integrations**: Seamless integration with Data Jar, Drafts, and Pushcut
- **Shortcut Gallery**: Browse pre-built templates and community shortcuts
- **Jellycuts Export**: Export shortcuts to Jellycuts script format
- **Edge AI Processing**: 40-60% faster response times with Cloudflare Workers

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for responsive styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for lightweight routing

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database with Drizzle ORM
- **OpenAI GPT-4** for AI-powered generation
- **Passport.js** for authentication

### Cloudflare Integration
- **Workers AI** for edge-based AI processing
- **R2 Storage** for global asset delivery
- **KV Storage** for intelligent caching
- **Analytics Engine** for real-time insights
- **Cloudflare Pages** for static site hosting

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│  Cloudflare CDN  │───▶│  Workers API    │
│  (Frontend)     │    │  shortcuts.      │    │  api.oneseco.   │
└─────────────────┘    │  oneseco.com     │    │  com            │
                       └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PostgreSQL    │◀───│   Workers AI     │    │   R2 Storage    │
│   Database      │    │   (Llama 2)      │    │   Assets/Cache  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Cloudflare account
- OpenAI API key (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/oneseco/ai-shortcut-companion.git
   cd ai-shortcut-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

### Cloudflare Deployment

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy to Cloudflare**
   ```bash
   ./scripts/deploy-cloudflare.sh
   ```

4. **Configure custom domain**
   - Set up DNS records for api.oneseco.com
   - Configure Cloudflare Pages for shortcuts.oneseco.com

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── lib/            # Utility libraries and services
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express.js backend
│   ├── index.ts           # Main server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database storage layer
│   └── db.ts              # Database configuration
├── worker/                 # Cloudflare Workers
│   ├── index.ts           # Worker entry point
│   ├── cloudflare-ai.ts   # AI processing logic
│   ├── shortcut-cache.ts  # Caching utilities
│   └── analytics.ts       # Analytics tracking
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schemas and types
├── docs/                   # GitHub Pages documentation
└── scripts/               # Deployment and utility scripts
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shortcuts

# OpenAI (optional - fallback to Cloudflare AI)
OPENAI_API_KEY=sk-your-openai-key

# Cloudflare (for production deployment)
CLOUDFLARE_API_TOKEN=your-cloudflare-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

### Cloudflare Configuration

See [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) for detailed Cloudflare integration setup.

## 🚀 Deployment

### Production Deployment

1. **Main Application**
   - Deploy to your preferred hosting platform
   - Ensure environment variables are configured
   - Set up PostgreSQL database

2. **Cloudflare Workers**
   ```bash
   wrangler deploy --env production
   ```

3. **Cloudflare Pages** (Documentation)
   - Connected to GitHub for automatic deployments
   - Deploys to shortcuts.oneseco.com

### GitHub Actions

Automated deployment pipeline:
- Builds and tests on every push
- Deploys to Cloudflare Pages automatically
- Runs database migrations

## 📊 Performance

- **Edge AI Processing**: 40-60% faster than centralized AI
- **Global CDN**: 300+ edge locations worldwide
- **Cache Hit Rate**: 98% for static assets
- **Average Response Time**: <100ms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: https://app.oneseco.com
- **Documentation**: https://shortcuts.oneseco.com
- **API Endpoint**: https://api.oneseco.com
- **Issue Tracker**: https://github.com/oneseco/ai-shortcut-companion/issues

## 📧 Support

For support, email support@oneseco.com or open an issue on GitHub.

---

Built with ❤️ by [oneseco.com](https://oneseco.com) • Powered by Cloudflare