## IMPORTANT

- PREFER to keep things in one function unless composable or reusable
- DO NOT do unnecessary destructuring of variables
- DO NOT use `else` statements unless necessary
- DO NOT use `try`/`catch` if it can be avoided
- AVOID using `as Type` casting
- AVOID `try`/`catch` where possible
- AVOID `else` statements
- AVOID using `any` type
- AVOID `let` statements
- AVOID `typeof x === 'string'` checks when TypeScript already knows the type; use `x != null` for optional fields
- USE `typeof` checks only for defensive parsing of untrusted JSON or when checking optional number/boolean fields (where truthiness fails for `0`/`false`)
- PREFER single word variable names where possible
- ALWAYS run `pnpm fix` and `pnpm test:changed` after you finish the task 
- ALWAYS check with the user to approve the commit message before you run `git commit` 

## TESTING

- PREFER testing the public API over internal helper functions
- ALWAYS analyze actual call sites to understand what inputs are possible before writing tests
- DO NOT test unreachable code paths (e.g., input validation for formats that callers never produce)
- PREFER meaningful coverage over 100% coverage
- ALWAYS follow this example file and folder structure when creating tests:
```
src/some_dir
├── moduleToTest.ts
└── tests
    └── moduleToTest.tests.ts
```
