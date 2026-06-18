/**
 * SDD Verification Engine
 *
 * Provides structured PASS/FAIL/WARN verification for the sdd-spec-driven schema.
 * Parses verification.md and validates each checklist item against the codebase.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VerificationStatus = 'PASS' | 'FAIL' | 'WARN';

export interface VerificationItem {
  check: string;
  status: VerificationStatus;
  detail: string;
}

export interface VerificationSection {
  name: string;
  items: VerificationItem[];
}

export interface VerificationReport {
  changeName: string;
  scopeSize: 'Small' | 'Medium' | 'Large' | 'Unknown';
  summary: { pass: number; fail: number; warn: number };
  sections: VerificationSection[];
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Extract checklist items (lines matching `- [ ] ...` or `- [x] ...`) grouped by
 * their nearest preceding `##` or `###` heading.
 */
function parseVerificationChecklist(
  content: string
): { sectionName: string; checks: string[]; completed: boolean[] }[] {
  const lines = content.split('\n');
  const sections: { sectionName: string; checks: string[]; completed: boolean[] }[] = [];
  let currentSection = 'Ungrouped';

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)/);
    if (headingMatch) {
      currentSection = headingMatch[1].trim();
      continue;
    }

    const checkMatch = line.match(/^-\s+\[([ xX])\]\s+(.+)/);
    if (checkMatch) {
      let section = sections.find((s) => s.sectionName === currentSection);
      if (!section) {
        section = { sectionName: currentSection, checks: [], completed: [] };
        sections.push(section);
      }
      section.checks.push(checkMatch[2].trim());
      section.completed.push(checkMatch[1].toLowerCase() === 'x');
    }
  }

  return sections;
}

/**
 * Detect scope size from verification.md content.
 */
function detectScopeSize(content: string): 'Small' | 'Medium' | 'Large' | 'Unknown' {
  const scopeMatch = content.match(/\*\*Scope size\*\*:\s*(Small|Medium|Large)/i);
  if (scopeMatch) {
    return scopeMatch[1] as 'Small' | 'Medium' | 'Large';
  }
  return 'Unknown';
}

// ---------------------------------------------------------------------------
// File-system validation helpers
// ---------------------------------------------------------------------------

/**
 * Check if files referenced in a check description exist relative to projectRoot.
 */
function checkFileExists(check: string, projectRoot: string): VerificationItem {
  // Extract file paths from the check text (common patterns)
  const pathPatterns = check.match(/(?:["'`])([^"'`]+\.[a-z]{1,5})(?:["'`])/g);
  if (pathPatterns && pathPatterns.length > 0) {
    const missingFiles: string[] = [];
    for (const raw of pathPatterns) {
      const filePath = raw.replace(/["'`]/g, '');
      const fullPath = path.join(projectRoot, filePath);
      if (!fs.existsSync(fullPath)) {
        missingFiles.push(filePath);
      }
    }
    if (missingFiles.length > 0) {
      return { check, status: 'FAIL', detail: `Missing files: ${missingFiles.join(', ')}` };
    }
    return { check, status: 'PASS', detail: 'All referenced files exist' };
  }

  // If no file paths detected in the check text, it's a manual check — WARN
  return { check, status: 'WARN', detail: 'Manual verification required — no file paths detected in check' };
}

/**
 * Evaluate a single checklist item. If already marked complete ([x]), PASS.
 * Otherwise, attempt automated validation.
 */
function evaluateCheck(
  check: string,
  completed: boolean,
  projectRoot: string
): VerificationItem {
  if (completed) {
    return { check, status: 'PASS', detail: 'Marked complete in verification.md' };
  }

  // Try file-existence checks for manifest/traceability items
  const lowerCheck = check.toLowerCase();
  if (
    lowerCheck.includes('exist') ||
    lowerCheck.includes('manifest') ||
    lowerCheck.includes('created') ||
    lowerCheck.includes('modified')
  ) {
    return checkFileExists(check, projectRoot);
  }

  // Convention compliance checks — can only be verified manually
  if (
    lowerCheck.includes('naming') ||
    lowerCheck.includes('convention') ||
    lowerCheck.includes('approved') ||
    lowerCheck.includes('forbidden') ||
    lowerCheck.includes('style')
  ) {
    return { check, status: 'WARN', detail: 'Convention compliance requires manual review' };
  }

  // Secret/security checks
  if (lowerCheck.includes('secret') || lowerCheck.includes('credential') || lowerCheck.includes('stack trace')) {
    return { check, status: 'WARN', detail: 'Security check requires manual review' };
  }

  // Default: incomplete and can't auto-verify
  return { check, status: 'FAIL', detail: 'Not completed — no automated validation available' };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run structured SDD verification against a change's verification.md.
 *
 * @param changeDir - Absolute path to the change directory
 * @param projectRoot - Absolute path to the project root
 * @returns VerificationReport with PASS/FAIL/WARN per checklist item
 */
export function runSddVerification(changeDir: string, projectRoot: string): VerificationReport {
  const changeName = path.basename(changeDir);
  const verificationPath = path.join(changeDir, 'verification.md');

  if (!fs.existsSync(verificationPath)) {
    return {
      changeName,
      scopeSize: 'Unknown',
      summary: { pass: 0, fail: 1, warn: 0 },
      sections: [
        {
          name: 'Verification File',
          items: [{ check: 'verification.md exists', status: 'FAIL', detail: `Not found at ${verificationPath}` }],
        },
      ],
    };
  }

  const content = fs.readFileSync(verificationPath, 'utf-8');
  const scopeSize = detectScopeSize(content);
  const parsedSections = parseVerificationChecklist(content);

  const sections: VerificationSection[] = [];
  let totalPass = 0;
  let totalFail = 0;
  let totalWarn = 0;

  for (const parsed of parsedSections) {
    const items: VerificationItem[] = [];
    for (let i = 0; i < parsed.checks.length; i++) {
      const item = evaluateCheck(parsed.checks[i], parsed.completed[i], projectRoot);
      items.push(item);
      if (item.status === 'PASS') totalPass++;
      else if (item.status === 'FAIL') totalFail++;
      else totalWarn++;
    }
    sections.push({ name: parsed.sectionName, items });
  }

  return {
    changeName,
    scopeSize,
    summary: { pass: totalPass, fail: totalFail, warn: totalWarn },
    sections,
  };
}

/**
 * Format a VerificationReport as a readable markdown string.
 */
export function formatVerificationReport(report: VerificationReport): string {
  const lines: string[] = [];

  lines.push(`## SDD Verification Report: ${report.changeName}`);
  lines.push('');
  lines.push(`**Scope**: ${report.scopeSize}`);
  lines.push('');
  lines.push('### Summary');
  lines.push('| Status | Count |');
  lines.push('|--------|-------|');
  lines.push(`| PASS   | ${report.summary.pass} |`);
  lines.push(`| FAIL   | ${report.summary.fail} |`);
  lines.push(`| WARN   | ${report.summary.warn} |`);
  lines.push('');

  for (const section of report.sections) {
    lines.push(`### ${section.name}`);
    lines.push('');
    for (const item of section.items) {
      const icon = item.status === 'PASS' ? '✅' : item.status === 'FAIL' ? '❌' : '⚠️';
      lines.push(`- ${icon} **${item.status}**: ${item.check}`);
      lines.push(`  - ${item.detail}`);
    }
    lines.push('');
  }

  // Final assessment
  if (report.summary.fail > 0) {
    lines.push(`**Assessment**: ${report.summary.fail} critical issue(s) found. Fix before archiving.`);
  } else if (report.summary.warn > 0) {
    lines.push(`**Assessment**: No critical issues. ${report.summary.warn} warning(s) to review. Ready for archive with noted improvements.`);
  } else {
    lines.push('**Assessment**: All checks passed. Ready for archive.');
  }

  return lines.join('\n');
}
