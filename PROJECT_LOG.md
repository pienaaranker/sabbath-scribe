# SabbathScribe Project Log & Context

## Project Overview
SabbathScribe is a Church Roster Management App built with Next.js. It helps manage assignments for various church roles (e.g., Preacher, Elder on Duty, Sabbath School Hosts) on a weekly (Sabbath) basis. The app supports manual and AI-assisted assignment, people management, and schedule viewing.

## Key Features
- **Role Assignment**: Assign people to church roles for each Sabbath.
- **People Management**: Add, edit, or remove individuals who can be assigned to roles.
- **Schedule View**: View assignments for each Sabbath, filter by role/person, and search.
- **AI Suggestions**: Use AI to suggest optimal assignments based on availability and history.

## Main Data Models (from `src/types/index.ts`)
- **Role**: `{ id, name, description? }`
- **Person**: `{ id, name, contactInfo?, fillableRoleIds?, unavailableDates? }`
- **Assignment**: `{ id, date, roleId, personId }`
- **SabbathAssignment**: `{ roleId, roleName, person }`

## Directory Structure (Key Parts)
- `src/app/` - Next.js app directory, including admin pages for assignments and people.
- `src/components/` - UI and feature components (admin, layout, schedule, ui, etc.).
- `src/context/` - Global app context and state management.
- `src/ai/flows/` - AI flows for assignment suggestions.
- `src/types/` - TypeScript types for core data models.
- `src/lib/` - Utility functions and constants.

## Session Log
_Use this section to record what was done or discussed in each session._

### Session YYYY-MM-DD
- **Summary**: _What was discussed/changed_
- **Files/Features Touched**: _List of files or features worked on_
- **Notes**: _Any important context or decisions_

---

## TODOs / Open Tasks
- [ ] _Add any open tasks or future work here_

---

## Quick Reference
- **Main entry**: `src/app/page.tsx` (renders schedule view)
- **Admin**: `src/app/admin/assignments/`, `src/app/admin/people/`
- **AI Assignment**: `src/ai/flows/suggest-assignments.ts`
- **Global State**: `src/context/app-context.tsx`

---

_Add new session logs and TODOs as you work!_ 