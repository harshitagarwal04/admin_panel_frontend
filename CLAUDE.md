# ConversAI Labs Admin Frontend - Project Documentation

## Project Overview
This is the admin frontend for ConversAI Labs Voice AI system, built with Next.js 14, TypeScript, and Tailwind CSS. The application manages AI voice agents, leads, calls, and provides comprehensive analytics for voice calling campaigns.

## Recent Major Work Completed

### 🚀 Production Voice Calling Integration (Latest)
**Status: COMPLETED** 
- **Real Voice Calling**: Integrated with Retell AI outbound system using +1(607)499-4542
- **Live Call Status**: Real-time webhook updates (new → in_progress → done)
- **Enhanced Call History**: Shows actual call outcomes, duration, transcripts, and AI summaries
- **Backend Integration**: Connected to production API at `voice-ai-admin-api-762279639608.us-central1.run.app`

### 🎯 React Query Caching System
**Status: COMPLETED**
- **Intelligent Caching**: Added @tanstack/react-query with optimized TTL settings
- **Performance Optimization**: Eliminated duplicate API calls and improved loading times
- **Cache Strategy**:
  - Agents: 15 minutes (moderate changes)
  - Voices: 24 hours (static data)
  - Templates: 4 hours (semi-static)
  - Leads: 2 minutes (frequent changes)
  - Calls: 1 minute + 30s refresh (real-time updates)

### 📱 WhatsApp Integration
**Status: COMPLETED**
- **Multi-Channel Support**: Voice + WhatsApp channels for agents
- **Conversation Management**: Unified interface for voice/WhatsApp handoffs
- **Scheduling Options**: Realistic/aggressive/gentle/custom calling schedules
- **Frontend-Only Storage**: Demo WhatsApp functionality with local state

### 🔐 Authentication System
**Status: WORKING** (Fixed Google OAuth COOP issues)
- **Google OAuth**: Production login with proper COOP headers
- **Development Login**: Email-based test login for development
- **Environment Detection**: Automatic switching between dev/prod auth methods
- **Error Handling**: Comprehensive logging and error messages

## Current Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: Google OAuth + JWT tokens
- **Icons**: Lucide React

### Key Custom Hooks
```typescript
// Lead Management
useLeads() - 2min cache, optimistic updates
useCreateLead() - Instant UI feedback
useScheduleCall() - Real-time call scheduling
useImportLeadsCSV() - Bulk import with cache invalidation

// Call Management  
useCallHistory() - 1min cache + 30s refresh
useCallMetrics() - Real-time webhook data

// Agent Management
useAgents() - 15min cache, optimistic CRUD
useVoices() - 24hr cache (static data)
useToggleAgentStatus() - Instant status updates

// Templates
useTemplates() - 4hr cache, frontend filtering
```

### API Integration
- **Base URL**: `https://voice-ai-admin-api-762279639608.us-central1.run.app/api/v1`
- **Authentication**: Bearer JWT tokens
- **Real-time Updates**: Webhook integration for call status
- **Error Handling**: Comprehensive error boundaries and retry logic

### Caching Strategy
```typescript
// QueryProvider configuration
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,    // 5 minutes default
    gcTime: 10 * 60 * 1000,      // 10 minutes garbage collection
    retry: 2,                     // Retry failed requests
    refetchOnWindowFocus: false   // Prevent excessive refetching
  }
}
```

## Key Features Implemented

### 🎯 Lead Management
- **Smart Filtering**: Real-time search by name, phone, agent
- **Status Management**: new → in_progress → done workflow
- **CSV Import**: Bulk lead import with validation
- **Schedule Calls**: One-click call scheduling with instant feedback

### 📞 Call History & Analytics
- **Real-time Data**: Live call status updates via webhooks
- **Comprehensive Metrics**: Pickup rates, attempt averages, active agents
- **Call Details**: Duration, outcomes, transcripts, AI summaries
- **Advanced Filtering**: By agent, outcome, date range, search

### 🤖 Agent Management
- **Multi-Channel**: Voice + WhatsApp support
- **Template Integration**: Industry/use-case based agent creation
- **Voice Configuration**: Retell AI voice selection
- **Status Controls**: Active/inactive with instant updates

### 🏢 Company Management
- **Profile Setup**: Onboarding flow for new companies
- **Usage Limits**: Agent limits, concurrent calls, minute tracking
- **Settings**: Company-wide configurations and preferences

## Environment Configuration

### Development
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
# Uses test login with any email
```

### Production
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://voice-ai-admin-api-762279639608.us-central1.run.app/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-domain.com
```

## Commands to Remember

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # TypeScript validation
```

### Deployment
```bash
git add .
git commit -m "Description"
git push origin main
```

## Recent Bug Fixes

### 🐛 Duplicate API Calls (FIXED)
- **Problem**: useAgents() was fetching both agents AND voices
- **Solution**: Separated concerns - useAgents() only fetches agents, useVoices() handles voices separately
- **Result**: Eliminated duplicate /api/v1/agents/voices/ calls

### 🔐 Google OAuth COOP Issues (FIXED)
- **Problem**: Cross-Origin-Opener-Policy blocking Google OAuth popups
- **Solution**: Added proper COOP headers in next.config.js
- **Result**: Google OAuth login working properly

### 🎯 Template Selection UX (IMPROVED)
- **Problem**: Complex industry + use case dropdowns
- **Solution**: Single use case dropdown with frontend filtering
- **Result**: Simpler, faster template selection

## File Structure
```
src/
├── app/                 # Next.js 14 App Router pages
├── components/          # Reusable UI components
│   ├── agents/         # Agent management components
│   ├── auth/           # Authentication components  
│   ├── calls/          # Call history components
│   ├── leads/          # Lead management components
│   ├── ui/             # Base UI components
│   └── whatsapp/       # WhatsApp integration
├── contexts/           # React contexts (Auth, Query)
├── hooks/              # Custom React Query hooks
├── lib/                # API clients and utilities
├── types/              # TypeScript type definitions
└── styles/             # Global styles and Tailwind config
```

## Next Development Priorities

1. **Security Vulnerabilities**: Address 8 GitHub security alerts (1 critical, 3 high)
2. **Error Monitoring**: Add proper error tracking and monitoring
3. **Performance**: Further optimize bundle size and loading times
4. **Testing**: Add comprehensive test suite
5. **Documentation**: API documentation and user guides

## Support & Maintenance

### Common Issues
- **Login Problems**: Check Google OAuth configuration and COOP headers
- **API Errors**: Verify backend status and token validity
- **Caching Issues**: Clear React Query cache or check TTL settings
- **Build Errors**: Run `npm run typecheck` to identify TypeScript issues

### Debugging
- **Development**: Use browser console for detailed API logging
- **Production**: Check Vercel logs and error tracking
- **Network**: Use browser DevTools Network tab for API inspection

---

**Last Updated**: June 28, 2025  
**Author**: shashuec@gmail.com  
**Repository**: conversailabs/admin_panel_frontend