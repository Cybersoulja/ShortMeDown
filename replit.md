# AI Shortcut Companion

## Overview

The AI Shortcut Companion is an intelligent iOS Shortcuts companion app that helps users create, understand, and optimize automation workflows through natural language processing and voice input. The application combines AI-powered shortcut generation with a comprehensive management system, featuring third-party integrations, gamification elements, and edge computing capabilities through Cloudflare infrastructure.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Universal OAuth Redirect Handler (August 2025)
- Added `/oauth-callback` route for development OAuth workflows
- Supports all major OAuth providers (GitHub, Google, Discord, Spotify, etc.)
- Features parameter parsing, color-coded badges, and copy functionality
- Designed for use during app development when redirect URIs are needed
- Ready for Cloudflare domain configuration at `app.oneseco.com/oauth-callback`

## System Architecture

### Frontend Architecture
The client-side application is built using React 18 with TypeScript and follows a component-based architecture. The UI framework leverages shadcn/ui components built on top of Radix UI primitives for accessibility and customization. Tailwind CSS provides utility-first styling with custom iOS-inspired design tokens and color schemes. The application uses Wouter for lightweight client-side routing and React Query (TanStack Query) for server state management and caching.

### Backend Architecture
The server follows a Node.js Express architecture with TypeScript support. The API layer is structured around RESTful endpoints for core functionality including user management, shortcut CRUD operations, and AI-powered generation services. The backend integrates with multiple AI providers (OpenAI GPT-4o as primary, with fallback templates) and implements a storage abstraction layer for database operations using Drizzle ORM.

### Database Design
PostgreSQL serves as the primary database with Drizzle ORM providing type-safe database operations. The schema includes core entities for users, shortcuts, shortcut templates, and gamification features. The database design supports complex shortcut action structures through JSONB columns while maintaining relational integrity for user associations and metadata.

### AI Integration Strategy
The application implements a dual AI strategy with OpenAI GPT-4o as the primary service for shortcut generation and Cloudflare Workers AI as a secondary option for edge computing scenarios. The AI services handle natural language processing for shortcut creation, daily suggestions, and personalized recommendations. Fallback mechanisms ensure functionality even when AI services are unavailable.

### Cloudflare Edge Computing
Cloudflare Workers provide edge-based AI processing for improved performance and global distribution. The worker architecture includes KV storage for caching, R2 for asset delivery, and Analytics Engine for usage tracking. This setup delivers 40-60% faster AI processing through geographic proximity and reduced latency.

### Third-Party Service Integrations
The architecture supports extensible third-party integrations including Airtable for advanced shortcut data management and Bear app for documentation and note-taking. These integrations use service abstraction patterns to allow for easy addition of new providers and maintain loose coupling between core functionality and external services.

### Gamification System
A comprehensive gamification engine tracks user progress through experience points, achievement systems, and daily streaks. The system calculates dynamic level progressions and provides motivational feedback to encourage continued engagement with the platform.

## External Dependencies

- **OpenAI API**: Primary AI service for GPT-4o powered shortcut generation and natural language processing
- **Cloudflare Services**: Workers for edge computing, R2 for storage, KV for caching, Analytics Engine for metrics
- **PostgreSQL Database**: Primary data storage with Neon serverless hosting
- **Airtable API**: Optional integration for advanced shortcut organization and data management
- **Bear App**: iOS note-taking app integration via URL schemes for documentation export
- **Drizzle ORM**: Type-safe database operations and migrations
- **React Query**: Server state management and API caching
- **Radix UI**: Accessible component primitives for the design system
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens