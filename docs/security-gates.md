# Security gates for the demo pipeline

Included gates:

- TypeScript checks with `tsc --noEmit`
- `npm audit --audit-level=high`
- CDK synth
- `cdk-nag`
- CodeQL
- Optional Semgrep scan

SonarQube is useful but optional for this workshop. For a 1-hour crash course, CodeQL + Semgrep + cdk-nag keeps the focus on deployable CDK.
