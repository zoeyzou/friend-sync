---
name: pr-workflow
description: Guides the agent through creating, updating, and summarizing pull requests using this repository's git and GitHub conventions. Use when the user wants to open a PR, refine its description, or understand what will be included.
---

# PR Workflow

This skill describes how the agent should help with pull requests in this repo.

## When to apply this skill

Use this skill when:

- The user asks to **create, update, or summarize a PR**
- The user wants a **list of changes** grouped into logical commits for review
- You need to **draft PR titles/descriptions** that match the existing style
- The user wants a **PR checklist** before merging

## Git & PR conventions

- Branches:
  - Work happens on feature branches (for example `feature/new-design`)
  - PRs target `main` unless the user says otherwise
- Commits:
  - Prefer small, focused commits with imperative subject lines
  - Use prefixes like `feat:`, `fix:`, `chore:`, `style:`, `refactor:` when appropriate
- PR titles:
  - Summarize the main user-visible change
  - Avoid implementation details in the title

## Step-by-step: creating a PR

When the user asks you to open a PR:

1. **Understand the diff**
   - Run `git status` and `git diff` (and `git diff --cached` if needed)
   - Group changes into 1–3 logical bullets (features, refactors, infra)
2. **Check branch state**
   - Run `git rev-parse --abbrev-ref HEAD` to confirm you are on the feature branch
   - If the branch is behind `main`, suggest the user rebase or merge before opening the PR
3. **Draft the PR title**
   - Use the format: `<type>: <short description>`
   - Examples:
     - `feat: add FriendTrack dashboard shell`
     - `fix: handle missing auth secret gracefully`
4. **Draft the PR body**
   - Use this template:

     ```markdown
     ## Summary
     - [high-level change 1]
     - [high-level change 2]

     ## Details
     - [optional: note breaking changes, migrations, env vars]

     ## Screenshots
     - [optional: desktop]
     - [optional: mobile]

     ## Checklist
     - [ ] Tests pass locally (`npm test` / `npm run typecheck`)
     - [ ] Linting passes (`npm run check`)
     - [ ] Migrations applied (`npm run db:full` or equivalent) if schema changed
     ```

5. **Create the PR (using gh)**
   - Use the `gh` CLI when available:
     - `gh pr create --base main --head <current-branch> --title "<title>" --body "<body>"`
   - If `gh` is not configured, output the **title and body** and tell the user to paste them into the GitHub UI.

## Updating an existing PR

When the user wants to update an open PR:

1. Confirm whether new commits are needed or only the description needs refining.
2. For description changes, re-run the summary/Details/Checklist template and provide an updated body.
3. Suggest adding screenshots or links to staging if that will help reviewers.

## Example interaction

**User:** "Open a PR for the new dashboard design."

**Agent (using this skill):**

1. Inspect commits on the feature branch.
2. Draft:
   - Title: `feat: add FriendTrack dashboard shell and routed pages`
   - Body using the template above, listing overview/friends/meetups/reminders pages and auth changes.
3. Run `gh pr create` or output the ready-to-paste text.

