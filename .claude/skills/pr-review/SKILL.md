---
name: pr-review
description: Performs a thorough code review of a GitHub PR, classifying each finding as Critical / Major / Minor / Nit, then posts the review after user confirmation.
argument-hint: "[PR number or leave blank for current branch's PR]"
---

# PR Review

Your job is to perform a rigorous, fair, and actionable code review — then post it to GitHub after the user confirms.

## Step 1 — Identify the target PR

If $ARGUMENTS contains a number, that is the PR number. Use it directly.

Otherwise, detect the PR for the current branch:
```
gh pr view --json number,title,url,baseRefName,headRefName,body
```

If no PR exists for the current branch, tell the user and stop.

## Step 2 — Collect all review material

Run in parallel:
- `gh pr view <number> --json title,body,author,baseRefName,headRefName,additions,deletions,changedFiles`
- `gh pr diff <number>` — the full unified diff
- `gh pr view <number> --json comments,reviews` — existing comments and reviews (to avoid duplicating feedback already given)

Also collect repo context to make the review accurate:
- Read key config files if present: `package.json`, `tsconfig.json`, `.eslintrc*`, relevant `README` sections
- Skim the files changed to understand their role in the codebase (use `gh pr view <number> --json files` to get the list, then read the originals for context)

## Step 3 — Perform the review

Analyze the diff systematically. Think like a senior engineer who cares about correctness, maintainability, and the long-term health of the codebase — not just style.

**Review axes (check all that apply):**

- **Correctness**: Logic errors, off-by-one, wrong conditions, unhandled nulls, race conditions, data loss
- **Security**: Injection, XSS, insecure defaults, secrets in code, missing auth/authz checks, OWASP top 10
- **Performance**: N+1 queries, unnecessary re-renders, missing indexes, blocking calls
- **Reliability**: Missing error handling, swallowed exceptions, no retry logic where expected
- **Maintainability**: Duplication, unclear naming, overly complex logic, missing or misleading comments
- **Test coverage**: Missing tests for new behavior, tests that don't actually assert anything meaningful
- **API/Interface design**: Breaking changes, confusing signatures, missing validation
- **Dependencies**: Unnecessary additions, known vulnerabilities, version pinning issues

**Severity classification — apply consistently:**

| Level | Meaning | Example |
|-------|---------|---------|
| **Critical** | Must fix before merge. Risk of data loss, security breach, production outage, or fundamental breakage | SQL injection, unhandled promise rejection that crashes the server, auth bypass |
| **Major** | Should fix before merge. Significant bug, poor design that will cause pain, or missing important behavior | Wrong business logic, missing input validation at an API boundary, a test that never runs |
| **Minor** | Worth fixing but won't block. Suboptimal code, small bugs in edge cases, unclear naming | Redundant null check, variable name that could be more descriptive, missing a non-critical error path |
| **Nit** | Purely stylistic or trivial. Fix or ignore — reviewer has no strong opinion | Trailing whitespace, minor wording tweak, preference for one valid pattern over another |

**When in doubt about severity, go one level lower** — over-classifying minor things as Critical damages trust in the review.

## Step 4 — Draft the review

Structure the output as follows:

```
## PR Review: <PR title>

**Branch:** `<head>` → `<base>`  
**Files changed:** N | **+additions** | **-deletions**

---

### Summary

<2–4 sentences. Overall assessment: is this PR ready to merge? What is the dominant concern if any? Be direct but fair.>

---

### Findings

#### 🔴 Critical

- **[File:Line]** `<short label>`  
  <Explanation of the problem. Why it matters. What could go wrong. Concrete suggestion for how to fix it.>

#### 🟠 Major

- **[File:Line]** `<short label>`  
  <Same structure.>

#### 🟡 Minor

- **[File:Line]** `<short label>`  
  <Same structure.>

#### 🔵 Nit

- **[File:Line]** `<short label>`  
  <Brief note. One or two sentences max.>

---

### Verdict

- [ ] **Approve** — ready to merge as-is or after nits
- [ ] **Request changes** — one or more Critical or Major issues must be addressed
- [ ] **Comment** — observations only, no blocking issues

<State your verdict here and why.>
```

Rules:
- Every finding must reference the file and approximate line number from the diff
- Every finding must include a concrete, actionable suggestion — not just "this is wrong"
- Omit sections that have zero findings — don't write "#### 🔴 Critical\n\nNone."
- If the PR is clean, say so clearly in the Summary and write a short, positive Findings section

## Step 5 — Confirm with the user

Display the full review draft to the user. Then ask:

> "Ready to post this review to PR #<number>? Reply yes to post, or tell me what to change."

Wait for the response. Do not post until the user explicitly confirms.

If the user asks for edits, apply them and show the updated draft before asking again.

## Step 6 — Post the review

Determine the event type from the verdict:
- Approve → `--approve`
- Request changes → `--request-changes`
- Comment → `--comment`

Post with:
```
gh pr review <number> --<event> --body "$(cat <<'EOF'
<full review body>
EOF
)"
```

Confirm success and print the URL to the review.
