# Upstream Sync Protocol

This fork (`@lennox/openspec`) tracks `@fission-ai/openspec` upstream.

## Branch Model

| Branch | Purpose | Commit Policy |
|--------|---------|---------------|
| `main` | Upstream mirror | **Never** commit directly. Only `git merge upstream/main`. |
| `lennox` | Default branch. All Lennox changes. | All work goes here. |

## Sync Cadence

**Weekly** — every Monday, or as needed when upstream releases.

## Sync Steps

```bash
# 1. Fetch upstream
git fetch upstream

# 2. Update mirror branch
git checkout main
git merge upstream/main --ff-only
git push origin main

# 3. Merge into lennox
git checkout lennox
git merge main

# 4. Resolve conflicts (if any — see below)
# 5. Push
git push origin lennox
```

## Modified Files (Expect Conflicts Here)

These are the **only** upstream files modified by the Lennox fork.
All other Lennox additions are in new files/directories that never conflict.

| File | What Changed | Merge Strategy |
|------|-------------|----------------|
| `package.json` | `name`, `repository`, version suffix | Keep Lennox name/repo. Adopt upstream version, re-add `-lennox.N` suffix. |
| `src/core/init.ts` | `DEFAULT_SCHEMA` changed to `sdd-spec-driven`, schema picker added | Keep Lennox default + picker. Adopt any upstream init changes around it. |
| `src/core/change-metadata/schema.ts` | Added `assignee`, `reviewer` optional fields | Keep Lennox fields. Adopt any new upstream fields. |
| `src/core/templates/workflows/verify-change.ts` | Added SDD-specific verification hook | Keep Lennox hook. Adopt any upstream verify changes. |

## Additive Files (Never Conflict)

| Path | Purpose |
|------|---------|
| `schemas/sdd-spec-driven/` | SDD schema, templates, config-template |
| `src/core/verify-sdd.ts` | Structured PASS/FAIL/WARN verification engine |
| `lennox/` | Fork docs, active-work template |
| `docs/lennox-sdd.md` | Lennox-specific documentation |

## Version Convention

Format: `<upstream-version>-lennox.<N>`

Example: upstream `1.5.0` → fork `1.5.0-lennox.1`

Increment `-lennox.N` for Lennox-only changes between upstream syncs.
Reset to `-lennox.1` on each upstream version bump.
