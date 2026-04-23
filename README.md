# AWS CDK TypeScript Crash Course Demo: CV Updater

A ready-to-deploy one-hour workshop demo showing how AWS CDK accelerates development teams by defining infrastructure in TypeScript while keeping business logic separate.

## Repository layout

```txt
cv-updater/
├── service/          # Application layer: Lambda handlers, shared code, AWS SDK calls
├── cdk/              # IaC layer: API Gateway, Lambda wiring, DynamoDB, S3, IAM, outputs
├── frontend/         # Demo React UI, deployed to S3 static website hosting
├── bootstrap/        # One-time AWS account warm-up templates and IAM examples
├── docs/             # Slide content, checklist, live exercise, speaker notes
└── .github/workflows # GitHub Actions with OIDC deployment and security gates
```

## The distinction: application vs CDK

- `service/` answers **what the app does**: get profile, update profile, create CV items, generate S3 upload URLs.
- `cdk/` answers **how the app runs in AWS**: create buckets, tables, Lambdas, API routes, IAM grants, and outputs.

CDK does not own the business logic. It packages and deploys the service code.

## Local deploy

```bash
npm run install:all
npm run build
npm run synth
npm run deploy
```

## Live exercise

1. Rename `service/src/profile/summary.example.ts` to `summary.ts`.
2. Uncomment the `summaryFn` block in `cdk/lib/aws-cdk-crash-course-stack.ts`.
3. Run `npm run diff`.
4. Run `npm run deploy`.
5. Test `GET /profile/summary`.
