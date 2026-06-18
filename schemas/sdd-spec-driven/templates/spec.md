<!-- Brownfield Rule: If no openspec/specs/{domain}/spec.md exists for this domain, -->
<!-- create a [BASELINE] section first documenting current behavior, then [NEW] on top. -->

## ADDED Requirements

### Requirement: <!-- requirement name --> [BR-#]
<!-- Requirement description using RFC 2119 keywords: MUST/SHALL/SHOULD/MAY -->
<!-- Tag with [BASELINE] if documenting existing behavior, [NEW] if introducing new -->

#### Scenario: <!-- scenario name --> [AC-#]
- **GIVEN** <!-- precondition with specific data -->
- **WHEN** <!-- action with specific input -->
- **THEN** <!-- expected outcome with specific output -->

#### Scenario: <!-- edge case name --> [AC-#]
- **GIVEN** <!-- precondition for edge case -->
- **WHEN** <!-- action triggering edge case -->
- **THEN** <!-- expected error handling or boundary behavior -->

## MODIFIED Requirements

### Requirement: <!-- existing requirement name --> [BR-#]
<!-- Copy ENTIRE existing requirement block from openspec/specs/<capability>/spec.md -->
<!-- Edit to reflect new behavior. Header text must match exactly. -->

#### Scenario: <!-- scenario name --> [AC-#]
- **GIVEN** <!-- updated precondition -->
- **WHEN** <!-- updated action -->
- **THEN** <!-- updated expected outcome -->

## REMOVED Requirements

### Requirement: <!-- requirement being removed --> [BR-#]
**Reason**: <!-- why this requirement is being removed -->
**Migration**: <!-- how consumers should migrate -->
