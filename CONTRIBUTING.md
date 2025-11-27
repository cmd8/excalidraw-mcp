# Contributing

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with [semantic-release](https://semantic-release.gitbook.io/) for automated versioning.

### Commit Prefixes

| Prefix | Description | Triggers Release? |
|--------|-------------|-------------------|
| `feat:` | New feature | ✅ Yes (minor: 1.x.0) |
| `fix:` | Bug fix | ✅ Yes (patch: 1.0.x) |
| `feat!:` | Breaking change | ✅ Yes (major: x.0.0) |
| `chore:` | Maintenance tasks | ❌ No |
| `docs:` | Documentation only | ❌ No |
| `refactor:` | Code refactoring | ❌ No |
| `ci:` | CI/CD changes | ❌ No |
| `test:` | Adding/updating tests | ❌ No |
| `style:` | Code style changes | ❌ No |

### Examples

```bash
# Triggers a patch release (1.0.0 → 1.0.1)
git commit -m "fix: handle empty diagram files"

# Triggers a minor release (1.0.0 → 1.1.0)
git commit -m "feat: add support for arrows"

# Triggers a major release (1.0.0 → 2.0.0)
git commit -m "feat!: redesign API"

# No release triggered
git commit -m "chore: update dependencies"
git commit -m "docs: update README"
git commit -m "refactor: simplify parser logic"
```

### Workflow

1. Make multiple commits with `chore:`, `docs:`, `refactor:`, etc.
2. When ready to release, push a `feat:` or `fix:` commit
3. semantic-release will bundle all commits since last release into the changelog

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Releases are triggered from here. |
| `feature/*` | New features (e.g., `feature/add-export-tool`) |
| `fix/*` | Bug fixes (e.g., `fix/empty-diagram-crash`) |

### Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make commits on your branch (any prefix is fine)

3. Open a Pull Request to `main`

4. After review, merge to `main`:
   - Use **Squash and merge** for cleaner history
   - Write a proper commit message with `feat:` or `fix:` prefix

5. semantic-release automatically creates a new version
