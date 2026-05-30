---
name: pr-address
description: Addresses each issue from a PR review one at a time — fixing, acknowledging, or disputing with clear reasoning. Commits fixes and replies to each comment on GitHub.
argument-hint: "[PR number or leave blank for current branch's PR]"
---

# PR Address

Your job is to work through every open review comment on a PR systematically — one at a time — applying fixes where warranted, acknowledging where agreed without a code change, and respectfully disputing where the reviewer is mistaken. Then push the changes and reply to each comment on GitHub.

## Step 1 — Identify the target PR

If $ARGUMENTS contains a number, use it. Otherwise detect from the current branch:
```
gh pr view --json number,title,headRefName,baseRefName
```

If not on a PR branch, tell the user and stop.

## Step 2 — Fetch all review comments

Collect everything in parallel:
```
gh pr view <number> --json reviews,comments,reviewThreads
gh api repos/{owner}/{repo}/pulls/<number>/reviews
gh api repos/{owner}/{repo}/pulls/<number>/comments
```

Filter to only **unresolved** threads. Group comments by thread so you understand the full context of each discussion. Sort by severity if severity labels are present (Critical first), otherwise process in file order.

Also fetch the current state of changed files so you can read the actual code being discussed:
```
gh pr view <number> --json files
```

## Step 3 — Present the plan to the user

Before touching any code, show the user a numbered list of all open issues:

```
Found N open review comments:

1. [Critical] src/api/auth.ts:42 — Missing input validation on email field
2. [Major] src/components/ListingCard.tsx:18 — useEffect missing dependency
3. [Minor] src/utils/format.ts:7 — Variable name `d` is unclear
4. [Nit] src/styles/globals.css:104 — Trailing whitespace
...

I'll address these one at a time. You can tell me to skip, dispute, or override my judgment on any item.
```

Wait for the user to say "go" or give any specific instructions before proceeding.

## Step 4 — Address each issue one at a time

For each comment thread, in order:

### 4a — Read and understand the comment

- Read the full thread (not just the first message)
- Read the actual code at the referenced location using the Read tool
- Read surrounding context (±20 lines) to understand intent

### 4b — Decide the action

Apply good engineering judgment:

**Fix** when:
- The reviewer is correct and the code has a real problem
- The fix is clear and doesn't introduce risk
- It's a Critical or Major issue — always fix these unless there's a strong reason not to

**Acknowledge without code change** when:
- The reviewer raises a valid point but the "fix" is out of scope for this PR
- The behavior is intentional and already handled elsewhere
- The suggestion is valid but deferred to a follow-up ticket

**Dispute** when:
- The reviewer misunderstood the intent or context
- The suggested change would introduce a regression or violate a constraint
- The code is correct and the reviewer's assumption is wrong
- Be respectful and specific — cite the reason, not just "you're wrong"

**Decline nits** when:
- The nit is purely stylistic and the current form is also valid
- Fixing it would cause noisy diff churn with no functional benefit

### 4c — Apply the fix (if fixing)

- Read the file before editing
- Make the minimal change needed to address the issue — do not refactor surrounding code opportunistically
- Verify the change is correct by re-reading the edited section
- Do not combine multiple fixes in one edit unless they are in the same file and tightly related

### 4d — Show the user what you did

After each item, print a brief status:

```
✅ Fixed — src/api/auth.ts:42
   Added `z.string().email()` validation before the DB call.

   Reply to post: "Fixed — added Zod email validation in the request handler before the DB query."
```

or:

```
💬 Acknowledged — src/utils/format.ts:7
   You're right that `d` is unclear. Renaming is out of scope here but I've opened a note.

   Reply to post: "Good catch — agreed on the naming. I'll address this in a follow-up cleanup PR to keep this diff focused."
```

or:

```
🚫 Disputed — src/components/ListingCard.tsx:18
   The dependency array is intentionally empty — this effect should only run on mount. Adding the dep would cause an infinite loop because `onSelect` is recreated each render and the parent doesn't memoize it.

   Reply to post: "The empty dep array is intentional here — `onSelect` is recreated on every parent render and not memoized, so adding it would cause an infinite re-render loop. Happy to add a comment explaining this if that helps."
```

Ask the user to confirm each reply before posting, OR if the user said "just do it" at the start, proceed automatically and report after.

## Step 5 — Commit all fixes together

After all issues are addressed:

1. Run `git diff` to review all changes
2. Stage changed files specifically (not `git add -A`)
3. Write a commit message that lists what was addressed:

```
Address PR review feedback

- Fix missing email validation in auth handler (Critical)
- Fix useEffect dependency array in ListingCard (Major)
- Rename `d` → `date` in format utility (Minor)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

4. Commit and push:
```
git commit -m "..."
git push
```

## Step 6 — Reply to each comment thread on GitHub

For each thread, post the reply drafted in Step 4d:

```
gh api repos/{owner}/{repo}/pulls/<number>/comments/<comment_id>/replies \
  -X POST \
  -f body="<reply text>"
```

For resolved threads (Fixed items), also resolve the thread:
```
gh api repos/{owner}/{repo}/pulls/<number>/reviews \
  -X POST \
  -f event="COMMENT" \
  -f body=""
```

Or use `gh pr review <number> --comment --body "..."` for a general response if replying to individual threads isn't possible via the CLI.

## Step 7 — Final report

Print a summary:

```
PR #<N> — Review addressed

✅ Fixed (N):     list of items
💬 Acknowledged (N): list of items  
🚫 Disputed (N):  list of items

Changes pushed to <branch>. Replies posted on GitHub.
```

If any items were deferred or need follow-up, list them explicitly so the user can create follow-up tickets or branches.
