# 1-hour Teams presentation: AWS CDK TypeScript crash course

## Slide 1 — Title
**AWS CDK Crash Course: IaC for TypeScript Teams**

## Slide 2 — Why CDK?
- Infrastructure can be reviewed like code.
- Teams can reuse TypeScript knowledge.
- AWS resources can be composed with constructs.
- App and infrastructure changes can move together through CI/CD.

## Slide 3 — Demo scope
Included: S3, API Gateway, Lambda, DynamoDB, React frontend, GitHub OIDC.
Excluded: authentication, multi-user tenancy, VPCs, load balancers.

## Slide 4 — Repository structure
`service/` is application logic. `cdk/` is IaC.

## Slide 5 — What belongs in service?
Lambda handlers, validation, AWS SDK calls, application types.

## Slide 6 — What belongs in CDK?
Resources, routes, Lambda wiring, IAM grants, outputs, cdk-nag.

## Slide 7 — Architecture
Browser → S3 frontend → API Gateway → Lambda → DynamoDB/S3.

## Slide 8 — DynamoDB design
Single-table model with `pk = CV#default` and generic item sort keys.

## Slide 9 — CDK stack walkthrough
Show Table, Bucket, RestApi, NodejsFunction, IAM grants, outputs.

## Slide 10 — Integration point
CDK packages service handlers from `../service/src`.

## Slide 11 — Local workflow
`npm run install:all`, `npm run build`, `npm run synth`, `npm run deploy`.

## Slide 12 — AWS account warm-up
Bootstrap CDK, create GitHub OIDC role, add deploy role ARN to GitHub secrets.

## Slide 13 — GitHub Actions
Build service, build frontend, build CDK, audit, synth, deploy from main.

## Slide 14 — Security gates
TypeScript, npm audit, cdk-nag, CodeQL, optional Semgrep.

## Slide 15 — Live exercise
Add `GET /profile/summary`.

## Slide 16 — What changed?
New Lambda, API Gateway resource/method, invoke permission, DynamoDB read grant.

## Slide 17 — Production considerations
Cognito, CloudFront/OAC, WAF, alarms, environments, retention policies.

## Slide 18 — Closing
CDK lets TypeScript teams own infrastructure safely and review changes as code.
