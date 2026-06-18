/**
 * SDD Verification Engine
 *
 * Provides structured PASS/FAIL/WARN verification for the sdd-spec-driven schema.
 * Parses verification.md and validates each checklist item against the codebase.
 */
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
    summary: {
        pass: number;
        fail: number;
        warn: number;
    };
    sections: VerificationSection[];
}
/**
 * Run structured SDD verification against a change's verification.md.
 *
 * @param changeDir - Absolute path to the change directory
 * @param projectRoot - Absolute path to the project root
 * @returns VerificationReport with PASS/FAIL/WARN per checklist item
 */
export declare function runSddVerification(changeDir: string, projectRoot: string): VerificationReport;
/**
 * Format a VerificationReport as a readable markdown string.
 */
export declare function formatVerificationReport(report: VerificationReport): string;
//# sourceMappingURL=verify-sdd.d.ts.map