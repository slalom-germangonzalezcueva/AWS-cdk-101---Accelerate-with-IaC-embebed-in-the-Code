# Live exercise

- Add `GET /profile/summary`.

<br>
<br>

## What Changed?

<br>

````md magic-move {lines: true}

```text {*}
1. New Lambda
2. API Gateway resource/method
3. Invoke permission
4. DynamoDB read grant.
```

```ts {1|2|3}
const summaryFn = createNodeFunction('GetCvSummaryFunction', 'profile/summary.ts');
itemsTable.grantReadData(summaryFn);
profile.addResource('summary').addMethod('GET', new apigateway.LambdaIntegration(summaryFn));
```

````

<div class="abs-br m-6 text-xl">
  <img src="/assets/Isolated_slalom-White_S-300x300.png" alt="Slalom" width="32" height="32">
</div>