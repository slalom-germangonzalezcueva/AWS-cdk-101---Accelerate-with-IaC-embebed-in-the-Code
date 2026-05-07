# CDK L3 Constructs Example

```typescript
  import { StaticWebsite } from '@aws-solutions-constructs/aws-s3-cloudfront';

const website = new StaticWebsite(this, 'ProfileImagesBucket', {
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'error.html'
});
```

<div class="abs-br m-6 text-xl">
  <img src="/assets/Isolated_slalom-White_S-300x300.png" alt="Slalom" width="32" height="32">
</div>