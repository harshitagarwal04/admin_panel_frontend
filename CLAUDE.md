# ConversAI Labs Admin Frontend

## Overview
Admin frontend for ConversAI Labs Voice AI system. Built with Next.js 14, TypeScript, Tailwind CSS. Manages AI voice agents, leads, calls, and analytics.

## Tech Stack
- **Framework**: Next.js 14 + App Router
- **State**: React Query (@tanstack/react-query) 
- **Auth**: Google OAuth + JWT
- **API**: Environment-based configuration

## Key Features

### 🚀 Production Voice Calling
- Retell AI integration with outbound calling
- Real-time webhooks (new → in_progress → done)
- Call history with transcripts/summaries

### 🎯 Lead Management
- CSV import, smart filtering, status tracking
- One-click call scheduling with instant feedback

### 📞 Call Analytics
- Live status updates, pickup rates, metrics
- Advanced filtering by agent/outcome/date

### 🤖 Agent Management
- Multi-channel (Voice + WhatsApp)
- Template integration, voice configuration
- Real-time status controls

### 🔐 Authentication
- Google OAuth (production) + email login (dev)
- Environment-based auth switching

## Caching Strategy
```typescript
// React Query TTL settings
Agents: 15min | Voices: 24hr | Templates: 4hr
Leads: 2min | Calls: 1min + 30s refresh
```

## Key Hooks
- `useLeads()` - 2min cache, optimistic updates
- `useCallHistory()` - 1min cache + real-time refresh
- `useAgents()` - 15min cache, optimistic CRUD
- `useVoices()` - 24hr cache (static data)

## Environment Config

### Development
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Production
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

## Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript validation
```

## File Structure
```
src/
├── app/           # Pages (Next.js App Router)
├── components/    # UI components
├── hooks/         # React Query hooks
├── lib/           # API clients
├── contexts/      # Auth + Query contexts
└── types/         # TypeScript definitions
```

## Recent Updates
- **Demo Banner**: Shows "5 of 5 calls remaining" with upgrade flow
- **Upgrade Page**: Email contact (connect@conversailabs.com) with copy functionality
- **Clean Logging**: Removed verbose console logs for production
- **Bug Fixes**: Duplicate API calls, Google OAuth COOP issues

## Security Notes
- Google Client ID was removed from git history (cleaned)
- 8 GitHub security alerts pending (1 critical, 3 high)
- Production code sanitized for public release

## Support
**Contact**: connect@conversailabs.com  
**Issues**: Login (check OAuth config), API errors (verify tokens), cache issues (check TTL)

---
**Last Updated**: June 29, 2025 | **Author**: shashuec@gmail.com