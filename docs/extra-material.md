# Extra Material for the Presentation

## Demo timing guide

- 0–5 min: objective and scope
- 5–15 min: CDK mental model
- 15–25 min: architecture and code tour
- 25–35 min: deploy and use the app
- 35–50 min: live exercise adding `GET /profile/summary`
- 50–58 min: CI/CD, IAM, security gates, production hardening
- 58–60 min: recap and Q&A

## Talking points

### CDK value proposition

CDK is useful when infrastructure has patterns. A platform team can build constructs once, and product teams can consume those constructs without manually copying CloudFormation or Terraform modules.

### Why TypeScript

TypeScript gives autocomplete, interfaces, refactoring, package management, and unit-test options. It also lets backend and frontend developers read the infrastructure code without switching languages.

### Why serverless for the demo

Serverless avoids a network-heavy first session. API Gateway, Lambda, DynamoDB, and S3 can be deployed quickly and demonstrate IAM, assets, policies, environment variables, and outputs.

### Why no authentication

Authentication is important, but it would dominate the hour. This session is about CDK fundamentals and deployment flow.

## Common questions and answers

**Is CDK production-ready?**
Yes, but the demo settings are not production settings. Replace public S3 website hosting with CloudFront/OAC, add auth, add logging/retention, and split accounts.

**Is CDK the same as CloudFormation?**
CDK is a programming model that synthesizes CloudFormation templates. CloudFormation still performs the deployment.

**Can we use Python/Java/C# instead?**
Yes. This demo uses TypeScript because the app is TypeScript and the audience can see infra and app code in one language.

**Should every team write raw CDK?**
Not always. Mature platform teams often expose opinionated constructs to product teams.

**How do we keep permissions least-privilege?**
Use CDK grants for runtime roles, OIDC for CI/CD, and an iterative deploy role policy validated by CloudTrail/IAM Access Analyzer.

## Demo fallback plan

If live deployment is slow:

1. Show `cdk synth` output.
2. Use pre-deployed stack outputs.
3. Run API calls with curl.
4. Show GitHub Actions logs from a previous run.

## Suggested follow-up exercises

- Add `GET /items/{id}`.
- Add request validation in API Gateway.
- Add CloudWatch dashboard widgets.
- Add Cognito authentication.
- Replace S3 website hosting with CloudFront and Origin Access Control.
- Move contact data to Secrets Manager.
- Create an internal `ServerlessCrudApi` construct.
