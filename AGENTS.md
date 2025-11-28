## IMPORTANT

- Try to keep things in one function unless composable or reusable
- DO NOT do unnecessary destructuring of variables
- DO NOT use `else` statements unless necessary
- DO NOT use `try`/`catch` if it can be avoided
- AVOID using `as Type` casting
- AVOID `try`/`catch` where possible
- AVOID `else` statements
- AVOID using `any` type
- AVOID `let` statements
- PREFER single word variable names where possible
- After you finish the task run `pnpm fix`
- Before you run `git commit` ALWAYS check with the user to approve the commit message

## TESTING

- PREFER testing the public API over internal helper functions
- ALWAYS analyze actual call sites to understand what inputs are possible before writing tests
- DO NOT test unreachable code paths (e.g., input validation for formats that callers never produce)
- PREFER meaningful coverage over 100% coverage
- RUN tests with `pnpm test` or `pnpm test:changed` for changed files
