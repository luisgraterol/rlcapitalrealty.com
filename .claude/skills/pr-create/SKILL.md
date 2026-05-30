---
name: pr-create
description: Creates a properly named branch (feat/ or hotfix/) and opens a GitHub PR with a structured description covering Why, What, How, and Tests sections.
argument-hint: "[brief description of the change]"
---

# PR Create

Your job is to create a well-named branch, commit any pending changes, push, and open a GitHub PR with a comprehensive, human-readable description.

## Step 1 — Understand the current state

Run these in parallel:
- `git status` — see what files are staged, unstaged, or untracked
- `git diff HEAD` — see all pending changes (staged + unstaged)
- `git log --oneline -10` — understand recent history and commit style
- `git branch --show-current` — confirm current branch
- `git remote -v` — confirm remote

If already on a `feat/` or `hotfix/` branch with commits ahead of main, skip to Step 4.

## Step 2 — Determine branch type and name

Analyze the changes to decide:

- Use **`feat/`** for: new features, enhancements, refactors, dependency upgrades, config changes, non-urgent improvements
- Use **`hotfix/`** for: bug fixes that affect production behavior, security patches, critical regressions

If the user passed $ARGUMENTS, use that as the basis for the branch name. Otherwise, infer it from the diff.

Branch name rules:
- Format: `feat/<slug>` or `hotfix/<slug>`
- Slug: lowercase, hyphens only, 3–6 words max, descriptive not generic
- Bad: `feat/update`, `feat/fix-stuff`, `hotfix/bug`
- Good: `feat/add-property-search-filters`, `hotfix/null-pointer-on-empty-listing`

## Step 3 — Create the branch and commit

1. Check out the branch from the current HEAD:
   ```
   git checkout -b <branch-name>
   ```

2. Stage all relevant changes. Prefer `git add <specific files>` over `git add -A`. Never stage `.env`, credential files, or large binaries. Warn the user if any such file appears in `git status`.

3. Craft a commit message:
   - First line: imperative, ≤72 chars, no period (e.g. `Add property search filters by bedroom count`)
   - Body (optional): brief context if the "why" isn't obvious
   - Always end with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

4. Commit: `git commit -m "..."` using a HEREDOC to preserve formatting.

## Step 4 — Push the branch

```
git push -u origin <branch-name>
```

## Step 5 — Gather PR content

Before writing the description, collect:
- `git diff main...<branch-name>` — the full diff for this branch
- `git log main...<branch-name> --oneline` — commits on this branch

Analyze the diff carefully. You are writing for a reviewer who has no context.

## Step 6 — Write the PR description

Use this exact structure:

```
## Why
<!-- The motivation. What problem does this solve? What was wrong or missing before?
     Be specific — reference user impact, bugs, product goals, or technical debt. -->

## What
<!-- A precise list of what changed. Files, components, behaviors.
     Use bullet points. One idea per bullet. -->

## How
<!-- The implementation approach. Why this solution over alternatives?
     Call out non-obvious decisions, trade-offs, or patterns used. -->

## Tests
<!-- How was this tested? Manual steps, automated tests added, edge cases considered.
     If no tests were added, explain why (e.g. config-only change, covered by existing suite). -->
```

Rules:
- Replace the HTML comments with actual content — do not leave them in
- Be specific, not vague. "Updated styles" → "Changed button radius from 4px to 8px to match design system"
- If a section is genuinely not applicable, write one sentence explaining why rather than leaving it blank

## Step 7 — Create the PR

```
gh pr create --title "<title>" --body "$(cat <<'EOF'
<full description>
EOF
)"
```

PR title rules:
- Imperative mood, no trailing period
- ≤72 characters
- Should match the branch slug in spirit but be human-readable
- Prefix with type if team convention: `feat:` / `fix:`

## Step 8 — Report back

Print the PR URL and a one-line summary of what was created.
