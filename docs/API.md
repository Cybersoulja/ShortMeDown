# AI Shortcut Companion API Documentation

## Overview

The AI Shortcut Companion API provides comprehensive endpoints for shortcut management, AI-powered generation, user authentication, gamification, and third-party integrations.

**Base URL**: `https://app.oneseco.com/api`  
**Authentication**: Session-based with secure cookies  
**Content-Type**: `application/json`

## Authentication

### Registration
```http
POST /api/register
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "username": "john_doe",
  "level": 1,
  "experience": 0,
  "streak": 0
}
```

### Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "string", 
  "password": "string"
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "level": 3,
  "experience": 850,
  "streak": 5
}
```

### Logout
```http
POST /api/logout
```

**Response**: `200 OK`

## Shortcuts

### Get User Shortcuts
```http
GET /api/shortcuts
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Morning Routine",
    "description": "Start your day with weather, news, and reminders",
    "tags": ["morning", "routine", "productivity"],
    "actions": [
      {
        "id": "action_1",
        "name": "Get Weather",
        "description": "Fetch current weather conditions",
        "iconName": "cloud",
        "iconColor": "#0A84FF"
      }
    ],
    "usageCount": 15,
    "lastUsed": "2025-01-15T08:30:00Z",
    "createdAt": "2025-01-01T10:00:00Z"
  }
]
```

### Create Shortcut
```http
POST /api/shortcuts
Content-Type: application/json

{
  "title": "string",
  "description": "string", 
  "tags": ["string"],
  "actions": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "iconName": "string",
      "iconColor": "string"
    }
  ]
}
```

**Response**: `201 Created`

### Update Shortcut
```http
PATCH /api/shortcuts/:id
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "tags": ["string"]
}
```

**Response**: `200 OK`

### Delete Shortcut
```http
DELETE /api/shortcuts/:id
```

**Response**: `204 No Content`

## AI Generation

### Generate Shortcut
```http
POST /api/generate-shortcut
Content-Type: application/json

{
  "prompt": "Create a shortcut to turn on Do Not Disturb and set a 25-minute timer for focused work"
}
```

**Response**: `200 OK`
```json
{
  "title": "Focus Mode Timer",
  "description": "Activate Do Not Disturb and start a 25-minute focus session",
  "tags": ["focus", "productivity", "timer"],
  "actions": [
    {
      "id": "action_1", 
      "name": "Turn On Do Not Disturb",
      "description": "Enable focus mode to block notifications",
      "iconName": "moon",
      "iconColor": "#5E5CE6"
    },
    {
      "id": "action_2",
      "name": "Start Timer",
      "description": "Set a 25-minute countdown timer",
      "iconName": "clock",
      "iconColor": "#FF9500"
    }
  ],
  "integrations": {
    "dataJar": false,
    "drafts": false, 
    "pushcut": true
  }
}
```

### Export to Jellycuts
```http
POST /api/export-jellycuts
Content-Type: application/json

{
  "shortcutId": 1
}
```

**Response**: `200 OK`
```json
{
  "jellycutsCode": "// Focus Mode Timer\n// Activate Do Not Disturb and start a 25-minute focus session\n\nimport { Shortcut, Timer, DoNotDisturb } from 'jellycuts'\n\n// Turn on Do Not Disturb\nDoNotDisturb.enable()\n\n// Start 25-minute timer\nTimer.start({ minutes: 25 })",
  "filename": "focus-mode-timer.js"
}
```

## Templates

### Get Templates
```http
GET /api/templates?category=productivity&search=timer
```

**Query Parameters**:
- `category` (optional): Filter by category
- `search` (optional): Search in title and description
- `tags` (optional): Filter by tags (comma-separated)

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Pomodoro Timer",
    "description": "25-minute focused work sessions with breaks",
    "category": "Productivity",
    "tags": ["timer", "focus", "productivity"],
    "actions": [
      {
        "id": "timer_action",
        "name": "Start Timer", 
        "description": "Begin 25-minute focus session",
        "iconName": "clock",
        "iconColor": "#FF9500"
      }
    ],
    "popularity": 95
  }
]
```

### Use Template
```http
POST /api/templates/:id/use
```

**Response**: `201 Created` (Creates shortcut from template)

## Gamification

### Get User Stats
```http
GET /api/user/stats
```

**Response**: `200 OK`
```json
{
  "level": 5,
  "experience": 1250,
  "experienceToNextLevel": 250,
  "streak": 7,
  "totalShortcuts": 23,
  "totalUsage": 156,
  "achievements": [
    {
      "id": "first_shortcut",
      "name": "First Steps",
      "description": "Created your first shortcut",
      "category": "creation", 
      "xp": 25,
      "unlockedAt": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### Get Achievements
```http
GET /api/achievements
```

**Response**: `200 OK`
```json
[
  {
    "id": "automation_master",
    "name": "Automation Master",
    "description": "Create 100 shortcuts", 
    "category": "creation",
    "xp": 250,
    "unlocked": false,
    "progress": 23,
    "target": 100
  }
]
```

## Integrations

### Airtable Integration

#### Configure Airtable
```http
POST /api/integrations/airtable/configure
Content-Type: application/json

{
  "apiKey": "string",
  "baseId": "string"
}
```

#### Sync to Airtable
```http
POST /api/integrations/airtable/sync
Content-Type: application/json

{
  "shortcutId": 1
}
```

### Bear Integration

#### Export to Bear
```http
POST /api/integrations/bear/export
Content-Type: application/json

{
  "shortcutId": 1,
  "includeActions": true,
  "tags": ["shortcuts", "automation"]
}
```

**Response**: `200 OK`
```json
{
  "bearUrl": "bear://x-callback-url/create?title=Focus%20Mode%20Timer&text=...",
  "markdown": "# Focus Mode Timer\n\n**Description**: Activate Do Not Disturb and start a 25-minute focus session\n\n## Actions\n\n1. **Turn On Do Not Disturb** - Enable focus mode to block notifications\n2. **Start Timer** - Set a 25-minute countdown timer"
}
```

## Development Tools

### OAuth Callback Handler
```http
GET /oauth-callback?code=auth_code&state=xyz123&scope=read+write
```

The OAuth callback handler provides a universal endpoint for OAuth development:

**Features**:
- Supports all major OAuth providers (GitHub, Google, Discord, Spotify, etc.)
- Real-time parameter parsing and categorization
- Color-coded parameter display (codes, tokens, errors, state)
- Copy functionality for individual parameters or complete response
- Success/error status detection

**Use Case**: Set as redirect URI during OAuth app development  
**Example URI**: `https://app.oneseco.com/oauth-callback`

## Error Handling

### Error Response Format
```json
{
  "error": "string",
  "message": "string", 
  "code": "string",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful deletion
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Codes
- `INVALID_CREDENTIALS`: Username or password incorrect
- `USER_EXISTS`: Username already taken
- `SHORTCUT_NOT_FOUND`: Requested shortcut doesn't exist
- `AI_SERVICE_ERROR`: AI generation service unavailable
- `RATE_LIMIT_EXCEEDED`: Too many requests in time window
- `INTEGRATION_ERROR`: Third-party service integration failed

## Rate Limiting

- **Authentication**: 10 requests per minute per IP
- **AI Generation**: 5 requests per minute per user
- **General API**: 100 requests per minute per user
- **OAuth Callback**: No rate limit (development tool)

## Webhooks

### Shortcut Created
```json
{
  "event": "shortcut.created",
  "data": {
    "shortcutId": 1,
    "userId": 1,
    "title": "string",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Achievement Unlocked
```json
{
  "event": "achievement.unlocked", 
  "data": {
    "achievementId": "automation_master",
    "userId": 1,
    "xpAwarded": 250,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { ShortcutCompanionAPI } from '@oneseco/ai-shortcut-companion-sdk';

const api = new ShortcutCompanionAPI({
  baseURL: 'https://app.oneseco.com/api'
});

// Generate a shortcut
const shortcut = await api.generateShortcut({
  prompt: 'Create a morning routine shortcut'
});

// Create the shortcut
await api.createShortcut(shortcut);
```

### Python
```python
import requests

api_base = 'https://app.oneseco.com/api'

# Generate shortcut
response = requests.post(f'{api_base}/generate-shortcut', 
  json={'prompt': 'Create a morning routine shortcut'},
  cookies=session_cookies
)

shortcut = response.json()
```

---

For more information, visit [shortcuts.oneseco.com](https://shortcuts.oneseco.com) or check the [GitHub repository](https://github.com/oneseco-media/ai-shortcut-companion).