# Dev Workflow

## Verify before pushing

Run the full check suite before every push:

```bash
npm run verify
```

This runs three steps in sequence:

1. **Unit tests** (`vitest run`) — pure logic in `src/lib`
2. **E2E tests** (`playwright test`) — smoke tests against the dev server
3. **Build** (`next build`) — TypeScript + production compilation

All three must pass for the command to succeed.

## Pre-push hook

A local git hook at `.git/hooks/pre-push` runs `npm run verify` automatically before each push. If any step fails, the push is blocked.

### Bypass

```bash
git push --no-verify
```

Use this only when:

- You are pushing a WIP branch that you know is broken.
- CI will catch any issues before merge.

Do **not** bypass when pushing to `main`.
