# Architecture Flow

```mermaid {theme: 'neutral', scale: 0.8}
graph TD
B[Browser] --> C[S3 Frontend]
C --> D[API Geteway]
D --> E[Lambda]
E --> F[DybamoDB]
E --> G[S3]
```

<div class="abs-br m-6 text-xl">
  <img src="/assets/Isolated_slalom-White_S-300x300.png" alt="Slalom" width="32" height="32">
</div>