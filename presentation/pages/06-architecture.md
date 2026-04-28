# Architecture Flow

```mermaid {theme: 'neutral', scale: 0.8}
graph TD
B[Browser] --> C[CloudFront]
D[S3 Bucket Front] --> C
C <--> E[API Geteway]
E --> F[Lambda]
E --> G[DybamoDB]
```

<div class="abs-br m-6 text-xl">
  <img src="/assets/Isolated_slalom-White_S-300x300.png" alt="Slalom" width="32" height="32">
</div>