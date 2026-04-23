# AWS Account Warm-Up Checklist

Use this before the Teams session so the live demo focuses on CDK, not account plumbing.

## 1. Decide naming and scope

- AWS account ID: `<ACCOUNT_ID>`
- AWS region: `us-east-1` or your standard sandbox region
- GitHub org/user: `<GITHUB_ORG>`
- GitHub repo: `<GITHUB_REPO>`
- Branch that can deploy: `main`
- CDK stack name: `CdkCvUpdaterDemoStack`

## 2. Install tools locally

```bash
node --version      # recommend 22+
npm --version
aws --version       # AWS CLI v2
npx cdk --version   # CDK v2
```

## 3. Configure local AWS administrator or platform-engineering credentials

Use SSO or a temporary admin session only for one-time setup:

```bash
aws sts get-caller-identity
aws configure get region
```

## 4. CDK bootstrap bucket / GitHub artifact bucket

CDK needs a bootstrap stack named `CDKToolkit`. It creates the CDK asset bucket used for Lambda bundles and frontend assets.

```bash
cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
```

Validate:

```bash
aws cloudformation describe-stacks --stack-name CDKToolkit --region <REGION>
aws s3 ls | grep cdk-
```

## 5. Create IAM OIDC role for GitHub Actions

Deploy the provided bootstrap template:

```bash
aws cloudformation deploy \
  --stack-name github-oidc-cdk-cv-updater \
  --template-file bootstrap/github-oidc-deploy-role.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    GitHubOrg=<GITHUB_ORG> \
    GitHubRepo=<GITHUB_REPO> \
    GitHubBranch=main \
    DemoStackName=CdkCvUpdaterDemoStack \
  --region <REGION>
```

Capture the output:

```bash
aws cloudformation describe-stacks \
  --stack-name github-oidc-cdk-cv-updater \
  --query "Stacks[0].Outputs[?OutputKey=='RoleArn'].OutputValue" \
  --output text
```

Create GitHub repository secret:

- Name: `AWS_GITHUB_DEPLOY_ROLE_ARN`
- Value: role ARN from the output above

## 6. IAM policy scope included in the demo role

The deploy role is scoped to:

- GitHub OIDC trust for one org/repo/branch.
- CloudFormation changes for `CdkCvUpdaterDemoStack` and `CDKToolkit`.
- CDK bootstrap asset bucket access matching `cdk-*-assets-<account>-<region>`.
- Demo services: API Gateway, Lambda, DynamoDB, S3, CloudWatch Logs.
- IAM role creation/pass-role only for stack-generated roles and CDK bootstrap roles.

This is a demo-level least-privilege baseline. In a production platform, validate with IAM Access Analyzer and gradually replace `Resource: "*"` entries where AWS resource-level constraints are available.

## 7. Later live extension: AWS Secrets Manager

When adding a new resource such as Secrets Manager to store phone/email, add the policy statement from:

```text
bootstrap/secrets-manager-permission-addition.json
```

Recommended secret naming convention:

```text
cv-updater/contact-default
```

Then update the CDK stack with a `secretsmanager.Secret` construct and grant read/write access only to the Lambda that needs it.

## 8. GitHub Actions pipeline gates

Included workflows:

- `.github/workflows/deploy.yml`
  - Build frontend
  - TypeScript type-check
  - `npm audit --audit-level=high`
  - `cdk synth` with `cdk-nag`
  - Deploy only on `main`
- `.github/workflows/codeql.yml`
  - CodeQL JavaScript/TypeScript analysis

Optional additions for a longer version:

- `cfn-lint` over `cdk.out/*.template.json`
- Checkov for CloudFormation output
- Trivy filesystem scan
- SonarCloud only if the repo/project can use SonarCloud's free public-project tier or you already have a SonarQube server

## 9. Pre-session smoke test

```bash
npm install
npm --prefix frontend install
npm run frontend:build
npm run build
npm run synth
npm run deploy
```

Check outputs:

- `ApiUrl`
- `FrontendWebsiteUrl`
- `DynamoDbTableName`
- `ProfileImagesBucketName`

Test one API call:

```bash
curl -s -X POST "<ApiUrl>items" \
  -H 'Content-Type: application/json' \
  -d '{"type":"skill","title":"AWS CDK"}' | jq
```
