# Live coding exercise: add `GET /profile/summary`

Goal: demonstrate the end-to-end CDK developer loop in 5 minutes.

## Steps

### 1. Enable the Lambda source file

```bash
mv service/src/profile/summary.example.ts service/src/profile/summary.ts
```

### 2. Enable the infrastructure route

In `cdk/lib/aws-cdk-crash-course-stack.ts`, uncomment:

```ts
const summaryFn = createNodeFunction('GetCvSummaryFunction', 'profile/summary.ts');
itemsTable.grantReadData(summaryFn);
profile.addResource('summary').addMethod('GET', new apigateway.LambdaIntegration(summaryFn));
```

### 3. Show the CDK diff

```bash
npm run diff
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Test

```bash
API_URL="https://replace-me.execute-api.us-east-1.amazonaws.com/dev"
curl -s "$API_URL/profile/summary" | jq
```
