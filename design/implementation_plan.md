# Study Manager - Implementation Plan

## Phase 1: Project Initialization
- [ ] Initialize Next.js project with TypeScript.
  - `npx create-next-app@latest study-manager --typescript --eslint --no-tailwind` (Using Vanilla CSS as per guidelines).
- [ ] Set up folder structure:
  - `components/`: Reusable UI components.
  - `lib/`: Utility functions and API clients.
  - `pages/api/` or `app/api/`: Backend routes.
  - `styles/`: Global styles and CSS modules.
- [ ] Configure `globals.css` with CSS Variables for theming (Dark/Light mode support).

## Phase 2: Database & Backend Foundation
- [ ] Set up PostgreSQL database (Local or Cloud).
- [ ] Initialize Prisma ORM.
- [ ] Define Schema:
  - `User`, `Subject`, `Topic`, `Task`, `ActivityLog`.
- [ ] Create API Utilities:
  - `lib/db.ts`: Prisma client instance.
  - `lib/api-response.ts`: Standardized error/success responses.

## Phase 3: External Integrations (The "Crawler" Layer)
- [ ] **LeetCode Integration**:
  - Create `lib/leetcode.ts`.
  - Implement function to fetch user profile stats.
  - Implement function to fetch daily challenge.
- [ ] **Codeforces Integration**:
  - Create `lib/codeforces.ts`.
  - Implement wrapper for public API to fetch user info and problem sets.

## Phase 4: Core Features Implementation

### 4.1 Curriculum & Subjects
- [ ] Seed database with default subjects (DSA, OS, CN, etc.).
- [ ] Create API `GET /api/subjects`.
- [ ] Build Frontend Page: `/curriculum`.
  - List subjects cards.
  - Progress bars (CSS driven).

### 4.2 Task Scheduler Logic
- [ ] Implement "Daily Task Generator" algorithm:
  - Needs to select 1 LeetCode problem (Easy/Medium based on user setting).
  - Needs to select 1 Topic to read (e.g., "OS - Paging").
- [ ] Create API `GET /api/dashboard` which returns the generated tasks for the day.

### 4.3 Dashboard UI
- [ ] Build `Dashboard` component.
  - "Today's Goal" section.
  - "Streaks" display.
  - "Recent Activity" graph.

## Phase 5: Design & Aesthetics (Polish)
- [ ] Apply "Glassmorphism" effects to cards (translucent backgrounds, blurs).
- [ ] Add micro-interactions (hover states, button clicks).
- [ ] Ensure responsive design for mobile/tablet.

## Phase 6: Deployment & Verification
- [ ] Run full build `npm run build`.
- [ ] Verify all API routes.
- [ ] Test integration with valid/invalid LeetCode usernames.
