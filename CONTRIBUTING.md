# Contributing

Thank you for taking the time to contribute. Please follow these guidelines to keep the codebase consistent.

## Setup

```bash
git clone https://github.com/simwai/chrome-extension-template.git
cd chrome-extension-template
npm ci
```

## Workflow

| Task | Command |
|---|---|
| Build | `npm run build` |
| Test | `npm test` |
| Lint + format | `npm run format` |

Husky runs `npm run format` and `npm test` on every commit automatically — no manual step needed.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) so Semantic Release can generate changelogs correctly:

| Prefix | When to use |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `chore:` | Tooling, deps, config |
| `docs:` | Documentation only |
| `test:` | Adding or updating tests |
| `refactor:` | No behaviour change |

## Pull requests

- One logical change per PR
- Include tests for any new behaviour
- All existing tests must pass
- Follow the existing dependency injection pattern — no direct `chrome` global references inside classes
