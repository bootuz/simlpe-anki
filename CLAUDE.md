# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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