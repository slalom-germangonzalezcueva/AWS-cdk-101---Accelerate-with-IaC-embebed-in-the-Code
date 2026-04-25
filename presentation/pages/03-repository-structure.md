# Repository Structure

<br>

```
.
├── cdk
│   ├── bin
│   │   └── app.ts
│   ├── cdk.json
│   ├── lib
│   │   └── aws-cdk-crash-course-stack.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend
│   ├── dist
│   │   └── index.html
│   ├── index.html
│   ├── package.json
│   ├── src
│   │   ├── main.tsx
│   │   └── styles.css
│   └── tsconfig.json
└── service
    ├── package.json
    ├── src
    │   ├── images
    │   │   └── create-upload-url.ts
    │   ├── items
    │   │   ├── create.ts
    │   │   ├── delete.ts
    │   │   ├── list.ts
    │   │   └── update.ts
    │   ├── profile
    │   │   ├── get.ts
    │   │   ├── summary.example.ts
    │   │   └── update.ts
    │   └── shared
    │       ├── dynamo.ts
    │       ├── response.ts
    │       └── types.ts
    └── tsconfig.json
```

<div class="abs-br m-6 text-xl">
  <img src="/assets/Isolated_slalom-White_S-300x300.png" alt="Slalom" width="32" height="32">
</div>

<style>
  .slidev-code, 
  .shiki {
    font-size: 0.5rem!important; /* Adjust to your preferred size */
    line-height: 0.7rem!important;  /* Optional: adjust spacing */
  }
</style>