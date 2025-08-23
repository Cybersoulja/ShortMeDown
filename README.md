# AI Shortcut Companion

An intelligent iOS Shortcuts companion app that helps users create, understand, and optimize automation workflows through natural language processing and voice input. Built with modern web technologies and enhanced by Cloudflare edge computing.

## 🚀 Features

### Core Functionality
- **AI-Powered Generation**: Create iOS Shortcuts using natural language descriptions
- **Voice Assistant Mode**: Generate shortcuts through voice commands with speech recognition
- **Shortcut Gallery**: Browse and discover curated shortcut templates by category
- **Action Breakdown**: Detailed explanation of each shortcut action with visual icons
- **Jellycuts Export**: Export shortcuts to Jellycuts format for iOS import

### Advanced Features
- **Gamification System**: Level up with experience points, achievements, and daily streaks
- **Third-Party Integrations**: Connect with Airtable for data management and Bear for note-taking
- **Cloudflare Edge Computing**: 40-60% faster AI processing with global edge distribution
- **Progressive Web App**: Mobile-optimized interface with iOS-style design
- **Universal OAuth Handler**: Development-ready OAuth callback for testing external integrations

### Integrations
- **Airtable Integration**: Sync shortcuts to database for advanced organization
- **Bear App Integration**: Save shortcut documentation and create notes
- **OpenAI GPT-4o**: Advanced natural language processing for shortcut generation
- **Cloudflare Workers**: Edge AI processing and global content delivery

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, PostgreSQL, Drizzle ORM
- **Infrastructure**: Cloudflare Workers, R2 Storage, Analytics Engine
- **AI**: OpenAI GPT-4o, Cloudflare AI models
- **Database**: PostgreSQL with persistent data storage

### Deployment Infrastructure
- **Main App**: `https://app.oneseco.com`
- **API**: `https://api.oneseco.com` (Cloudflare Workers)
- **Documentation**: `https://shortcuts.oneseco.com` (GitHub Pages)
- **Repository**: `https://github.com/oneseco-media/ai-shortcut-companion`

## 📁 Project Structure

```
ai-shortcut-companion/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utility libraries and services
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database storage layer
│   └── db.ts             # Database configuration
├── worker/                # Cloudflare Workers
│   ├── index.ts          # Worker entry point
│   ├── cloudflare-ai.ts  # AI processing logic
│   ├── analytics.ts      # Usage analytics
│   └── shortcut-cache.ts # Caching layer
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
├── docs/                 # Documentation website
│   └── index.html        # Landing page
└── scripts/              # Deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- Cloudflare account (for Workers)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/oneseco-media/ai-shortcut-companion.git
   cd ai-shortcut-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Required environment variables
   DATABASE_URL=postgresql://user:password@localhost:5432/shortcuts
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🎮 Gamification System

### User Progression
- **Experience Points**: Earn XP for creating shortcuts, daily usage, and achievements
- **Level System**: Progressive leveling with increasing XP requirements
- **Daily Streaks**: Maintain momentum with consecutive day bonuses
- **Achievement Categories**: Creation, Usage, Streaks, Integrations, and Social

### Built-in Achievements
- **First Steps**: Create your first shortcut (25 XP)
- **Automation Master**: Create 100 shortcuts (250 XP)
- **Power User**: Use shortcuts 50 times (75 XP)
- **Streak Keeper**: Maintain a 7-day streak (100 XP)
- **Connected**: Set up your first integration (50 XP)

## 🔗 Integrations Guide

### Airtable Integration
1. Generate an API token at [airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Create a base for your shortcuts
3. Configure the integration in Profile > Integrations
4. Automatically sync shortcuts to your Airtable database

### Bear App Integration
- **iOS/macOS**: Direct URL scheme integration for seamless note creation
- **Web**: Download shortcuts as Markdown files
- **Features**: Auto-tagging, shortcut documentation, action logging

### Cloudflare Workers Setup
1. Deploy workers to `api.oneseco.com`
2. Configure R2 storage for assets
3. Set up Analytics Engine for usage tracking
4. Enable AI models for edge processing

## 📱 Mobile Experience

### iOS-Style Design
- Native iOS design patterns and animations
- Responsive layout optimized for mobile devices
- Touch-friendly interface with gesture support
- Progressive Web App capabilities

### Voice Assistant Mode
- Browser-based speech recognition
- Real-time transcript display
- Natural language processing for shortcut generation
- Hands-free shortcut creation

## 🛠️ API Reference

### Core Endpoints
- `GET /api/shortcuts` - Retrieve user shortcuts
- `POST /api/shortcuts` - Create new shortcut
- `POST /api/generate-shortcut` - AI shortcut generation
- `GET /api/templates` - Browse shortcut templates
- `POST /api/export-jellycuts` - Export to Jellycuts format

### Development Tools
- `GET /oauth-callback` - Universal OAuth redirect handler for development
- Supports all major OAuth providers (GitHub, Google, Discord, Spotify, etc.)
- Parameter parsing, color-coded display, and copy functionality
- Ideal for testing OAuth integrations during app development

### Authentication
- Session-based authentication with PostgreSQL storage
- User registration and login endpoints
- Secure password hashing with bcrypt

## 🚀 Deployment

### Cloudflare Pages (Documentation)
```bash
# Automatic deployment via GitHub Actions
git push origin main
```

### Cloudflare Workers (API)
```bash
wrangler deploy
```

### Main Application
The application runs on Replit with automatic deployment pipeline.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shortcuts

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Cloudflare (Optional)
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

### Database Schema
The application uses PostgreSQL with Drizzle ORM:
- **Users**: Authentication and gamification data
- **Shortcuts**: User-created shortcuts with actions and metadata
- **Templates**: Curated shortcut templates for discovery
- **Achievements**: Gamification achievements and user progress

## 📊 Performance

### Cloudflare Edge Benefits
- **40-60% faster AI processing** through edge computing
- **Global CDN** for optimal loading times
- **R2 Storage** for efficient asset delivery
- **Analytics Engine** for real-time usage insights

### Optimization Features
- **Lazy loading** for images and components
- **Code splitting** for faster initial load
- **Caching strategies** for API responses
- **Progressive enhancement** for mobile devices

## 🐛 Troubleshooting

### Common Issues
1. **OpenAI API errors**: Verify API key configuration
2. **Database connection**: Check PostgreSQL service and connection string
3. **Cloudflare Workers**: Ensure proper domain configuration
4. **Voice recognition**: Enable microphone permissions in browser

### Development Tips
- Use `npm run db:push` to sync schema changes
- Check browser console for client-side errors
- Monitor server logs for API issues
- Test voice features in secure (HTTPS) context
- Use `/oauth-callback` route for OAuth development testing
- Configure redirect URI as `https://your-app.replit.dev/oauth-callback`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o language model
- **Cloudflare** for edge computing infrastructure
- **shadcn/ui** for beautiful UI components
- **Drizzle ORM** for type-safe database operations
- **React** and **TypeScript** communities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/oneseco-media/ai-shortcut-companion/issues)
- **Documentation**: [shortcuts.oneseco.com](https://shortcuts.oneseco.com)
- **API Status**: [api.oneseco.com/health](https://api.oneseco.com/health)

---

Built with ❤️ by the oneseco.com team. Empowering iOS users to automate their digital lives through intelligent shortcut generation.