# CDK L2 Constructs Example

```typescript
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';

const bucket = new Bucket(this, 'ProfileImagesBucket', {
  bucketName: 'lab-aws-cdk-101-stack-s3',
  versioned: true,
  encryption: BucketEncryption.S3_MANAGED,
  removalPolicy: RemovalPolicy.DESTROY
});

bucket.grantRead(myLambdaFunction);
bucket.addLifecycleRule({
  expiration: Duration.days(90)
});
```

<div class="abs-br m-6 text-xl">
  <img src="/assets/Isolated_slalom-White_S-300x300.png" alt="Slalom" width="32" height="32">
</div>