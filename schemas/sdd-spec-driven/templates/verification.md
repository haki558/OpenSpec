## Scope Classification

<!-- Auto-determined from specs/design/tasks. Do NOT manually override. -->
<!-- Count AC-# IDs from specs and files from design manifests. -->

- **AC-# count**: <!-- number -->
- **File count**: <!-- number -->
- **Scope size**: <!-- Small (≤3 AC, ≤5 files) | Medium (≤10 AC, ≤15 files) | Large (>10 AC or >15 files) -->

---

## Core Checks (All Scopes)

### AC-# → Test Mapping

| AC-# | Scenario | Test Name | Status |
|------|----------|-----------|--------|
| <!-- AC-1 --> | <!-- scenario name --> | <!-- TestClass.testMethod --> | <!-- ✅ / ❌ --> |

### Code Traceability Checklist

- [ ] All files in "Creates" manifest exist in the codebase
- [ ] All files in "Modifies" manifest have been changed
- [ ] No files outside the manifest were created or modified
- [ ] No Do-Not-Touch files were modified

### Constitution Compliance Checklist

- [ ] Naming conventions followed (files, functions, variables, DB objects)
- [ ] Only approved libraries/frameworks used
- [ ] No forbidden patterns present (check config.yaml boundaries)
- [ ] Code style consistent with project conventions

---

## Extended Checks (Medium + Large Scope)

<!-- Include this section only if scope is Medium or Large -->

### API Schema Table

| Endpoint | Method | Path | Request Body | Response Body | Auth |
|----------|--------|------|-------------|---------------|------|
| <!-- name --> | <!-- GET/POST/PUT/DELETE --> | <!-- /api/v1/... --> | <!-- schema or N/A --> | <!-- schema --> | <!-- required/optional/none --> |

### Business Rule Coverage

| BR-# | Rule | Implemented | Happy Path Tested | Edge Case Tested |
|------|------|-------------|-------------------|------------------|
| <!-- BR-1 --> | <!-- rule name --> | <!-- ✅ / ❌ --> | <!-- ✅ / ❌ --> | <!-- ✅ / ❌ --> |

---

## Comprehensive Checks (Large Scope Only)

<!-- Include this section only if scope is Large -->

### Data Schema Table

| Entity | Table | Key Fields | Constraints | Migration Required |
|--------|-------|------------|-------------|-------------------|
| <!-- entity --> | <!-- table_name --> | <!-- field1, field2 --> | <!-- NOT NULL, UNIQUE, FK --> | <!-- Yes/No --> |

### Boundary Scan Checklist

- [ ] Input validation present on all external-facing endpoints
- [ ] No secrets, API keys, or credentials in source code
- [ ] No stack traces or internal details leaked in error responses
- [ ] Error messages are safe for end-user consumption
- [ ] Rate limiting or abuse prevention considered (if applicable)
