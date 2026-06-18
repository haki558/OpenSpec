## OpenSpec → SDD Adaptation

### 1. Custom Schema: `sdd-spec-driven`

Fork `spec-driven` and modify the artifact DAG:

```
Default OpenSpec:  proposal → specs → design → tasks
SDD Adapted:      proposal → specs → design → tasks → verification
```

- Add `verification` artifact (depends on specs + `tasks`)
- Change specs to depend on `proposal` (same as default — no interview artifact)
- Change `design` to depend on specs (not `proposal` — specs must exist before design)
- Keep `tasks` depending on specs + `design`
- `apply.requires: [tasks]` unchanged
- No `interview` artifact — clarifications are inline in proposal
- No tier classification artifact or scoring — verification self-scales from actual content

---

### 2. Enhanced `config.yaml` Structure

Replace OpenSpec's free-text context with a structured project constitution block covering:

- **Project identity**: name, domain, who uses it
- **Tech stack**: languages, frameworks, versions, key libraries
- **Domain glossary**: terms with project-specific meanings (disambiguates for the AI)
- **Architecture constraints**: API style, package structure, auth model, DB naming
- **Boundaries (MUST NOTs)**: forbidden patterns, libraries, practices
- **Per-artifact rules**: injected into each artifact's generation prompt

Rules needed for each artifact ID:
- `proposal`: require affected domains, in/out scope, inline clarifications
- specs: require BR-#/AC-# IDs, Given/When/Then format, RFC 2119 keywords, edge cases per business rule, baseline-first for missing domain specs
- `design`: require file manifests with traceability, Do-Not-Touch list, architecture decisions with rationale
- `tasks`: require spec traceability (BR-#/AC-#) per task, exact files per task, test artifact names per task, dependency ordering
- `verification`: scale checks proportionally to actual BR-#/AC-#/entity/endpoint/file counts from specs+design+tasks
- `verify` (for `/opsx:verify`): read `verification.md`, validate each line item, report PASS/FAIL/WARN

---

### 3. Template Changes (6 templates)

**`proposal.md`**
- Intent (problem statement, 1-2 sentences)
- Scope (numbered in-scope deliverables + explicit out-of-scope exclusions)
- Affected domains (which `openspec/specs/{domain}/` areas are touched)
- Blast radius (downstream components affected — for brownfield)
- Clarifications section (AI probes for gaps, human answers inline; depth self-regulates based on scope complexity)
- Decisions section (key choices made during clarification, with rationale — serves as reviewer brief)

**`spec.md`** (delta format)
- ADDED/MODIFIED/REMOVED sections
- Every requirement tagged `[BR-#]`
- Every scenario tagged `[AC-#]`
- Given/When/Then with concrete values (not vague)
- Edge case scenarios mandatory for every business rule
- RFC 2119 keywords (MUST/SHALL/SHOULD/MAY)
- Brownfield rule: if no domain spec exists, create baseline `[BASELINE]` first, then delta `[NEW]` on top

**`design.md`**
- Technical approach
- Architecture decisions with rationale (what, why, rejected alternatives) citing BR-#
- File manifest: creates table (path, purpose, traces to BR-#/AC-#)
- File manifest: modifies table (path, what changes, traces to BR-#/AC-#)
- Do-Not-Touch list (files explicitly outside scope)
- Data flow (sequence diagram or description)

**`tasks.md`**
- Grouped by dependency layer (data → service → API → UI)
- Each task has: checkbox, title, traces-to (BR-#/AC-#), files (create/modify paths), tests (exact test class + method name + expected result)
- Dependency ordering section (which groups must complete before others)

**`verification.md`**
- Auto-scaled check depth based on actual counts from specs/design/tasks:
  - **Small scope** (≤3 AC-#s, ≤5 files): AC tests + code traceability + constitution compliance
  - **Medium scope** (≤10 AC-#s, ≤15 files): add API schema validation + business rule coverage
  - **Large scope** (>10 AC-#s or >15 files): add data schema validation + boundary scan
- AC-# → test name mapping table
- Code traceability checklist (files in manifest exist, no extra files, no DNT violations)
- Constitution compliance checklist (naming, approved libraries, no forbidden patterns)
- API schema table (endpoint, method, path, request, response, auth) — medium+large
- Business rule coverage table (BR-#, implemented, happy path tested, edge case tested) — medium+large
- Data schema table (entity, table, fields, constraints, migration) — large only
- Boundary scan checklist (input validation, no secrets, no stack traces) — large only

---

### 4. Team Coordination Convention

- Extend `.openspec.yaml` per-change metadata: add `assignee`, `reviewer`, `affected-domains`
- Add project-level `openspec/active-work.yaml`: tracks which changes are active, who owns them, which domains are claimed, current status (proposing/speccing/implementing/verifying/done)
- Convention-based (not tooling-enforced) — readable by AI and teammates

---

### 5. Brownfield Seed-Spec Rule

- When a change targets a domain with no existing `openspec/specs/{domain}/spec.md`:
  - Spec artifact must FIRST create a baseline documenting current behavior from code scan
  - Then apply the delta on top
  - Baseline requirements tagged `[BASELINE]`, new requirements tagged `[NEW]`
- Enforced via specs rule in `config.yaml`, not a separate artifact or workflow

---

### 6. Things Explicitly NOT Changed

| OpenSpec Default | Keep As-Is | Reason |
|-----------------|-----------|--------|
| No gatekeeper / auto-loaded interceptor | Keep | Token efficiency; trust devs to invoke workflow |
| Fluid actions (no phase gates) | Keep | Lower friction for 2-5 dev teams |
| `/opsx:apply` as executor | Keep | No need for separate `@sdd-executor` agent |
| `/opsx:verify` as verifier | Keep (enhanced via rules) | No need for separate `@sdd-verifier` agent session |
| `/opsx:archive` with delta sync | Keep | Archive protocol already matches SDD's merge-to-living-spec |
| `/opsx:explore` for unclear requirements | Keep | Good low-overhead pre-work option |
| Change-as-folder model | Keep | Natural parallel work isolation |
| Schema customization system | Keep | Extension point for the SDD schema |
| `config.yaml` context/rules injection | Keep (content changed, mechanism same) | Already does what constitution needs |

---

### 7. Net Artifact Count

| | Default OpenSpec | SDD Adapted |
|--|-----------------|-------------|
| Artifacts in schema | 4 (proposal, specs, design, tasks) | 5 (+ verification) |
| DAG depth | 3 levels | 4 levels |
| Extra config files | 0 | 1 (active-work.yaml) |
| Files removed from SDD | N/A | constitution.md, copilot-instructions.md (gatekeeper), 3 agent files, 7 skill files, 4 quality gate files |
