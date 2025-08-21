# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visual Development

### Design Principles
- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@agent-design-review` subagent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

## Development Commands

- `npm run dev` - Start development server (runs on port 8080)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

Note: This project does not have a test framework configured.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for React compilation
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Authentication**: Supabase Auth with custom AuthProvider context
- **Database**: Supabase PostgreSQL with typed client
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form with Zod validation
- **Spaced Repetition**: ts-fsrs library for FSRS algorithm implementation
- **Icons**: Lucide React
- **Notifications**: Sonner for toast notifications

## Architecture Overview

### Database Schema
The app uses Supabase with the following key tables:
- `profiles` - User profiles linked to Supabase auth
- `folders` - Organizational containers for decks
- `decks` - Collections of flashcards
- `cards` - Individual flashcards with front/back content
- `card_fsrs` - FSRS scheduling data for spaced repetition

### Application Structure

**Authentication Flow**:
- Uses Supabase Auth with AuthProvider context in `src/hooks/useAuth.tsx`
- Session state managed globally, redirects to /auth when unauthenticated

**Main Pages**:
- `/` - Home page (landing/dashboard)
- `/manage` - Card management interface (Index.tsx)
- `/study` - Study session interface with FSRS scheduling
- `/auth` - Authentication page

**Key Components**:
- `FlashCard` - Interactive card component with flip animation and inline editing
- `AddCardForm` - Form for creating new flashcards
- `AppSidebar` - Navigation sidebar using shadcn sidebar component

**Spaced Repetition System**:
- Uses FSRS (Free Spaced Repetition Scheduler) algorithm via ts-fsrs
- Card scheduling data stored in `card_fsrs` table
- Review states: New, Learning, Review, Relearning

### File Organization

- `/src/components/` - Reusable React components
- `/src/components/ui/` - shadcn/ui component library
- `/src/pages/` - Route-level page components  
- `/src/hooks/` - Custom React hooks
- `/src/integrations/supabase/` - Supabase client and type definitions
- `/src/lib/` - Utility functions
- `/supabase/migrations/` - Database migration files

### Development Notes

- Uses path aliases: `@/` maps to `./src/`
- TypeScript configuration is relaxed (no strict null checks, unused vars allowed)
- ESLint configured with React hooks and refresh rules
- Hot reload enabled in development mode
- Supabase types are auto-generated in `src/integrations/supabase/types.ts`

### Supabase Integration

The app requires Supabase environment variables and uses:
- Row Level Security (RLS) for data access control
- Real-time subscriptions for live updates
- Typed queries using generated TypeScript interfaces

## FSRS Integration

This application uses the [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) library (v5.2.1) to implement the Free Spaced Repetition Scheduler (FSRS) algorithm for optimized flashcard scheduling.

### FSRS Service Architecture

The `FSRSService` class (`src/services/fsrsService.ts`) provides a clean abstraction layer between the ts-fsrs library and the application:

- **Initialization**: Configures FSRS with optimized parameters (90% retention, learning steps: "1m, 10m")
- **Database Integration**: Seamless conversion between FSRS Card objects and Supabase records
- **Review Processing**: Handles card scheduling using the `repeat()` method
- **State Management**: Maps between FSRS enums and database string representations

### Database Schema Mapping

The `card_fsrs` table stores all FSRS scheduling data:

```sql
- state: 'New' | 'Learning' | 'Review' | 'Relearning'
- reps: Total review count
- lapses: Times the card was forgotten  
- difficulty: Card difficulty (1-10)
- stability: Memory stability (90% recall interval)
- scheduled_days: Current interval in days
- elapsed_days: Days since last review
- due_date: Next review date
- last_review: Previous review date
- learning_steps: Current step index for Learning/Relearning cards
```

### Card State Transitions

Cards progress through FSRS states based on user ratings:
- **New** → **Learning** (Again/Hard/Good) or **Review** (Easy)
- **Learning** → Next step (Good), first step (Again), or **Review** (Easy/completion)
- **Review** → **Relearning** (Again) or updated intervals (Hard/Good/Easy)
- **Relearning** → Same as Learning but increments lapses

### Learning Steps Configuration

- **New cards**: "1m, 10m" (1 minute, then 10 minutes)
- **Relearning**: "10m" (10 minutes for forgotten cards)
- Supports micro-learning with sub-day intervals for optimal retention

### FRSR Knowlege Base

- [The TypeScript implementation of FSRS algorithm](context/ts-fsrs)
- [FSRS WIKI](context/fsrs4anki.wiki)

## Production Deployment Security

### Security Headers Configuration

For production deployments, the following HTTP security headers must be configured at the server/CDN level. These headers **cannot** be set via HTML meta tags and must be configured as HTTP response headers:

#### Required Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### Platform-Specific Configuration Examples

**Vercel** - Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev;" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**Netlify** - Add to `_headers` file in public directory:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev;
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

**Apache** - Add to `.htaccess`:
```apache
<IfModule mod_headers.c>
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev;"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

**Nginx** - Add to server block:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev;" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Development vs Production

- **Development**: Security headers are configured in `vite.config.ts` for the dev server
- **Production**: Headers must be configured at the hosting platform/server level
- The `SecurityMeta.tsx` component handles client-side security policies that can be set via meta tags

### Security Header Validation

After deployment, verify headers are properly set using:
- Browser Developer Tools → Network tab
- Online tools like [securityheaders.com](https://securityheaders.com/)
- Command line: `curl -I https://yourdomain.com`