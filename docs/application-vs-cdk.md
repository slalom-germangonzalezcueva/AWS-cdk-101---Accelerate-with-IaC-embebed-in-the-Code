# Application vs CDK distinction

## `service/` — application layer

This folder contains code that would still exist even if the team deployed manually, with Terraform, Serverless Framework, or any other IaC tool.

Responsibilities:

- Lambda handlers
- Input validation
- DynamoDB commands
- S3 pre-signed upload URL logic
- Shared response helpers
- Application models and types

Key idea:

> The service owns business behavior.

## `cdk/` — infrastructure layer

This folder contains code that describes AWS resources and connects them together.

Responsibilities:

- DynamoDB table
- S3 buckets
- API Gateway REST API
- Lambda function definitions
- IAM grants
- Stack outputs
- `cdk-nag` security checks

Key idea:

> CDK owns deployment behavior.
