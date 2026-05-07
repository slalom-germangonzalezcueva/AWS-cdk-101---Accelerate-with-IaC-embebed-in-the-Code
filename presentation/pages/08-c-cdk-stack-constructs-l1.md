# CDK L1 Constructs Example

```typescript
import { CfnBucket } from 'aws-cdk-lib/aws-s3';

const bucket = new CfnBucket(this, 'ProfileImagesBucket', {
  bucketName: 'lab-aws-cdk-101-stack-s3',
  versioningConfiguration: {
    status: 'Enabled'
  },
  publicAccessBlockConfiguration: {
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true
  }
});
```

<div class="abs-br m-6 text-xl">
  <img src="/assets/Isolated_slalom-White_S-300x300.png" alt="Slalom" width="32" height="32">
</div>