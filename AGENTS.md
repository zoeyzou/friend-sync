## FriendTrack Agent Guide

Compact guidance for agents working on this repo. Keep answers short and code-focused.

### 1. Overall architecture (T3-style)

- **Stack**: Next.js App Router, tRPC, Prisma/Postgres, NextAuth, React Query.
- **Boundaries**:
  - **App layer** in `src/app/**` – routing, layouts, and simple page composition (no direct DB or Prisma).
  - **Features** in `src/features/**` – user-facing flows (dialogs, forms, mutations) built from entities and shared.
  - **Entities** in `src/entities/**` – domain-centric UI and helpers for core concepts like friends and meetings.
  - **Shared** in `src/shared/**` – cross-cutting UI and utilities used by multiple features/containers:
    - `shared/widgets/**` for top-level reusable containers (e.g. `app-shell`).
    - `shared/ui/**` (optional) for design-system primitives.
    - `shared/lib/**` for generic helpers (e.g. `reminder-utils`).
  - **API** in `src/server/api/**` (tRPC routers; all data access goes through here).
  - **Persistence** only via Prisma in `src/server/db.ts` and tRPC routers.
- **Screaming architecture**: Directories and files should read like features and domains:
  - `src/app/(app)/overview`, `friends`, `meetups`, `reminders`
  - `src/entities/{friend,meeting}/**`
  - `src/features/{add-friend,log-meetup}/**`
  - `src/shared/widgets/app-shell/**`
  - `src/server/api/routers/{friends,meetings,reminders}.ts`
  - `src/lib/*` / `src/shared/lib/*` for cross-cutting domain utilities.

### 2. Routing, auth, and protection

- **Routes**:
  - Public: `/`, `/auth/signin`.
  - Auth-required: `/overview`, `/friends`, `/meetups`, `/reminders`.
- **Auth**:
  - Server: use `auth()` from `~/server/auth` in server components and API.
  - Client: use `useSession()` from `next-auth/react`.
- **Protection**:
  - Middleware in `src/middleware.ts` is the single source of truth for protected paths.
  - When adding new authenticated pages under `(app)`, update `protectedPaths` and `config.matcher` if needed.
  - The **home page** (`src/app/page.tsx`) should redirect:
    - Unauthenticated → `/auth/signin`
    - Authenticated → `/overview`

### 3. tRPC and API design

- **Routers** live in `src/server/api/routers/*.ts`.
  - Use `protectedProcedure` for anything tied to the logged-in user.
  - Use `publicProcedure` only when absolutely no auth is required.
- **Ownership & security**:
  - Always scope DB queries with `userId: ctx.session.user.id` for user-owned records.
  - When taking IDs (e.g. `friendId`, `meetingId`), **verify ownership** in the router before updating/deleting.
- **Pagination & performance**:
  - Prefer explicit `{ take, skip, cursor }` over fetching unbounded lists.
  - Keep API responses lean; compute heavy derived data in dedicated endpoints or `src/lib` helpers.

### 4. Prisma and data access

- **Never call Prisma from React components**; only from tRPC routers or scripts.
- **Queries**:
  - Always filter by `userId` for multi-tenant data.
  - Use `include`/`select` to avoid over-fetching.
  - For “overdue” logic, reuse `src/lib/reminder-utils.ts` rather than duplicating date math.
- **Migrations**:
  - Schema changes go via `prisma/schema.prisma` and proper migration scripts (do not hot-edit the DB from code).

### 5. UI, state, styles, and data fetching

- **Client-side data**:
  - Use `api.<router>.<procedure>.useQuery/useMutation` from `~/trpc/react`.
  - Invalidate queries intentionally:
    - After friend changes: `friends.getAll`, `reminders.stats`, and any directly affected lists.
    - After meetup changes: `meetings.getAll`, `friends.getAll`, `reminders.stats`.
- **Layout / containers**:
  - Root layout: `src/app/layout.tsx` wraps `SessionProvider` **outside** `TRPCReactProvider`.
  - App shell:
    - Shared widget in `src/shared/widgets/app-shell` is the main dashboard frame.
    - `src/app/(app)/_components/app-shell.tsx` simply re-exports the shared widget for routing.
- **Styles and shared bits**:
  - Global styles and theme tokens live in `src/styles/**` and should not be redefined per feature.
  - Any reusable UI primitives, layout helpers, or hooks that don’t belong to a single feature go under `src/shared/**`:
    - `shared/ui/**` for presentational components.
    - `shared/widgets/**` for larger containers.
    - `shared/lib/**` for reusable logic.
- **Patterns**:
  - Prefer feature-specific components in `src/features/**` and entity widgets in `src/entities/**`.
  - Treat `src/shared/**` as the only place for cross-feature styles, widgets, and helpers.
  - Avoid global mutable singletons beyond what T3 already sets up (tRPC client and React Query).

### 6. Domain rules for reminders & meetups

- Use `src/lib/reminder-utils.ts`:
  - `getNextReminderDate(friend)` for next reminder date.
  - `isOverdue(friend, now?)` for overdue checks.
- When updating meetups:
  - `meetings.create` must confirm the friend belongs to the current user before updating `lastContact`.
  - Keep reminder statistics consistent by invalidating related queries after mutations.

### 7. Testing and workflows

- **Component and feature tests**:
  - Use Vitest + Testing Library (`vitest.config.mts`, `src/test/setup.ts`) for React components.
  - Co-locate tests next to implementations (e.g. `FriendCard.test.tsx` beside `FriendCard.tsx`).
  - Prefer `userEvent` for user interactions over low-level `fireEvent`.
- **Protected routes**: keep `src/middleware.protected-routes.test.ts` passing when changing middleware or auth flows.
- **CI expectations**:
  - `npm run typecheck`
  - `npm run check` (Biome)
  - `npm run build`
  - Agent PR review workflow in `.github/workflows/agent-pr-review.yml` should continue to work (do not break its interface).

### 8. Agent skills & workflows

- **Architecture**:
  - `clean-ddd-hexagonal` (`ccheney/robust-skills@clean-ddd-hexagonal`) – use for DDD, clean, hexagonal, and screaming architecture decisions.
- **Testing / TDD**:
  - `tdd` (`pproenca/dot-skills@tdd`) – follow red/green/refactor loops, design tests first for new behavior and for refactors that change contracts.
- **Code review & PRs**:
  - `.cursor/skills/pr-workflow` – for PR workflows and summaries.
  - `.cursor/skills/code-review-best-practices` – for security, scalability, and maintainability review guidance.

### 9. Style & conventions

- TypeScript, strict and explicit where practical; avoid `any`.
- Prefer small, cohesive modules named by feature and responsibility.
- Keep comments high-signal: document invariants, domain rules, and non-obvious decisions, not trivial code behavior.
