---
name: code-review-best-practices
description: Reviews changes for security, scalability, performance, code reuse, and maintainability using a structured checklist. Use when the user asks for a code review, wants feedback on a PR, or wants to harden code quality.
---

# Code Review Best Practices

This skill defines how the agent should review code in this repository.

## Review goals

When reviewing changes, always consider:

- **Correctness**: Does the code do what it claims? Are edge cases handled?
- **Security**: Any obvious injection, XSS, auth, or secrets handling issues?
- **Scalability & performance**: Any unnecessary N+1 queries, O(n²) loops, or heavy work in hot paths?
- **Code reuse & abstraction**: Are there opportunities to reuse existing helpers/components?
- **Maintainability**: Is the code easy to read, tested, and aligned with project style?

## How to run a review

1. **Understand the context**
   - Skim the PR description or user summary.
   - Identify: domain (auth, UI, API, DB), primary tech (Next.js, Prisma, tRPC).
2. **Scan the diff in logical groups**
   - Backend (Prisma/tRPC/NextAuth)
   - Frontend pages/components/layouts
   - Config/tooling (tsconfig, biome, workflows)
3. **Apply the checklists below** and collect concrete findings.

## Security checklist

For backend and API changes:

- [ ] Uses **parameterized queries** via Prisma/tRPC (no raw string concatenation)
- [ ] Respects **auth boundaries**:
  - Protected procedures use `protectedProcedure`
  - No sensitive data is exposed in public procedures
- [ ] **Input validation** with Zod for tRPC procedures and API routes
- [ ] No secrets or tokens are logged or checked into source
- [ ] For NextAuth:
  - `AUTH_SECRET`/`NEXTAUTH_URL` sourced from env
  - Session callbacks do not leak sensitive tokens into the client

For frontend:

- [ ] User-controlled content is not dangerously injected (no `dangerouslySetInnerHTML` without santization)
- [ ] Links and redirects respect expected origins (no open redirects)

## Scalability & performance checklist

- [ ] **Database access**
  - Prefer `findMany` with explicit filters/`take`/`skip` for lists
  - Avoid N+1 patterns in loops; consider `include` or batching
- [ ] **API design**
  - tRPC procedures return just enough data for the UI
  - Heavy aggregations are done in the DB when possible
- [ ] **React/Next.js**
  - Client components avoid unnecessary `useEffect` or `useState` overhead
  - Avoid passing huge objects through props when slices would suffice

If you find performance risks, suggest:

- Adding indexes in Prisma schema
- Using pagination or limits
- Moving expensive work to background jobs where appropriate

## Code reuse & maintainability checklist

- [ ] Reuse existing components (`src/components/ui`, `src/components/figma`) instead of duplicating markup
- [ ] Shared logic lives in helpers/hooks (`src/lib`) where it benefits multiple callers
- [ ] Naming is consistent and intention revealing
- [ ] Types are explicit where they clarify behavior (especially around API contracts)
- [ ] Tests (or at least test hooks) exist for critical flows, or you explicitly flag missing tests

## Feedback format

When responding to the user, group findings by severity:

- 🔴 **Critical** – security bugs, data loss risks, or correctness issues
- 🟠 **Major** – significant scalability/maintainability problems that should be addressed soon
- 🟡 **Minor** – style, small refactors, or non-blocking suggestions

Use this template:

```markdown
## Overview
- Short 2–3 sentence summary of what this change does

## Findings

### 🔴 Critical
- [file.ts] [short title] – description + suggestion

### 🟠 Major
- [file.ts] [short title] – description + suggestion

### 🟡 Minor
- [file.tsx] [short title] – description + suggestion

## Suggestions
- 2–4 bullets with concrete next steps (what to fix, where to add tests, etc.)
```

If you find **no critical issues**, still point out at least a couple of improvement ideas (reusability, comments, tests) so the review is useful.

