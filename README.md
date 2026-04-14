<p align="center">
  <img src=".github/assets/banner.svg" alt="chrome-extension-template" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/simwai/chrome-extension-template/releases"><img src="https://img.shields.io/github/v/release/simwai/chrome-extension-template?color=7c3aed&labelColor=0d0d1a&logo=github" alt="Latest Release"/></a>
  <a href="https://github.com/simwai/chrome-extension-template/actions/workflows/release.yml"><img src="https://img.shields.io/github/actions/workflow/status/simwai/chrome-extension-template/release.yml?color=a855f7&labelColor=0d0d1a&logo=github-actions&logoColor=white&label=CI" alt="CI"/></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-9333ea?labelColor=0d0d1a" alt="License: MIT"/></a>
  <img src="https://img.shields.io/badge/Manifest-V3-7c3aed?labelColor=0d0d1a&logo=googlechrome&logoColor=white" alt="Manifest V3"/>
  <img src="https://img.shields.io/badge/TypeScript-strict-a855f7?labelColor=0d0d1a&logo=typescript&logoColor=white" alt="TypeScript"/>
  <a href="https://github.com/xojs/xo"><img src="https://img.shields.io/badge/Linter-XO-6d28d9?labelColor=0d0d1a" alt="XO"/></a>
</p>

---

A minimal, opinionated scaffold for Chrome extensions. It provides the architecture, toolchain, and CI/CD pipeline — you provide the logic.

## What's included

| Concern | Solution |
|---|---|
| Extension platform | Manifest V3, service worker entry point |
| Language | Strict TypeScript via `@sindresorhus/tsconfig` |
| Testing | AVA with concurrent execution, Sinon for chrome API mocks |
| Code quality | XO (ESLint + Prettier in one) enforced by Husky on commit |
| Build | Plain `tsc` — no bundler, no hidden magic |
| Release | Semantic Release + GitHub Actions, ZIP artifact on every tag |

## Architecture

Three layers, each independently testable:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1a0a2e', 'primaryTextColor': '#e9d5ff', 'primaryBorderColor': '#7c3aed', 'lineColor': '#a855f7', 'secondaryColor': '#0d0d1a', 'background': '#0a0a18', 'mainBkg': '#1a0a2e', 'nodeBorder': '#7c3aed', 'clusterBkg': '#100e22', 'titleColor': '#c084fc', 'edgeLabelBackground': '#0d0d1a', 'fontFamily': 'Segoe UI, system-ui, sans-serif'}}}%%
graph TB
    subgraph chrome ["Chrome Platform"]
        WN["webNavigation.onBeforeNavigate"]
        TABS["chrome.tabs.update()"]
        STORAGE["chrome.storage.sync"]
    end

    subgraph sw ["Service Worker · background.ts"]
        NH["NavigationHandler"]
    end

    subgraph domain ["Domain Layer"]
        V["Validator"]
        HR["HostRepository"]
    end

    subgraph ui ["Options UI · options.ts"]
        OPT["Options Page"]
    end

    WN -->|navigation details| NH
    NH -->|validate| V
    V -->|check host| HR
    NH -->|read settings| STORAGE
    NH -->|redirect| TABS
    OPT <-->|read / write| STORAGE

    style chrome fill:#100e22,stroke:#6d28d9,color:#c084fc
    style sw fill:#1a0a2e,stroke:#7c3aed,color:#e9d5ff
    style domain fill:#1e0a3c,stroke:#9333ea,color:#e9d5ff
    style ui fill:#150a28,stroke:#a855f7,color:#e9d5ff
```

### Navigation event flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1a0a2e', 'primaryTextColor': '#e9d5ff', 'primaryBorderColor': '#7c3aed', 'lineColor': '#a855f7', 'secondaryColor': '#0d0d1a', 'background': '#0a0a18', 'mainBkg': '#1a0a2e', 'nodeBorder': '#7c3aed', 'clusterBkg': '#100e22', 'titleColor': '#c084fc', 'edgeLabelBackground': '#0d0d1a', 'fontFamily': 'Segoe UI, system-ui, sans-serif'}}}%%
sequenceDiagram
    participant C as Chrome
    participant NH as NavigationHandler
    participant V as Validator
    participant S as chrome.storage.sync

    C->>NH: onBeforeNavigate(details)
    NH->>V: isSupportedHost(url)
    alt unsupported
        V-->>NH: false → return
    end
    NH->>V: isActionablePage(url)
    alt not actionable
        V-->>NH: false → return
    end
    NH->>S: get(settings)
    alt disabled
        S-->>NH: enabled:false → return
    end
    S-->>NH: settings
    NH->>C: YOUR ACTION HERE
```

## Project structure

```
chrome-extension-template/
├── .github/
│   ├── assets/banner.svg
│   └── workflows/release.yml
├── .husky/pre-commit            # format + test on every commit
├── src/
│   ├── tests/
│   │   ├── host-repository.test.ts
│   │   ├── navigation-handler.test.ts
│   │   ├── validator.test.ts
│   │   └── test-types.ts
│   ├── background.ts            # service worker entry point
│   ├── host-repository.ts       # supported host registry
│   ├── manifest.json
│   ├── navigation-handler.ts    # core event logic — inject your action here
│   ├── options.html
│   ├── options.ts               # settings UI (chrome.storage.sync)
│   ├── types.ts                 # shared domain types
│   └── validator.ts             # URL validation rules
├── CONTRIBUTING.md
├── package.json
├── tsconfig.json
└── LICENSE.md
```

## Getting started

### Prerequisites

- Node.js ≥ 20
- Google Chrome

### Install

```bash
# Use this repo as a GitHub template, then clone your new repo:
git clone https://github.com/<you>/<your-extension>.git
cd <your-extension>
npm ci
```

### Develop

```bash
npm run build       # tsc → dist/
npm test            # AVA test suite
npm run format      # XO auto-fix + Prettier
```

### Load in Chrome

1. `npm run build`
2. Open `chrome://extensions`, enable **Developer mode**
3. **Load unpacked** → select the `dist/` folder

## Customisation

Work through these files in order:

1. **`src/manifest.json`** — set name, description, `host_permissions`, and any additional `permissions`
2. **`src/types.ts`** — define your domain types and `UserSettings` shape
3. **`src/background.ts`** — replace the `hosts` array with your target hosts
4. **`src/validator.ts`** — implement `isActionablePage()` with your URL rules
5. **`src/navigation-handler.ts`** — replace the `TODO` in `handleNavigation()` with your core logic
6. **`src/options.html` + `src/options.ts`** — add your settings fields and storage keys
7. **`src/tests/`** — update tests to cover your validation rules and handler logic

## Release workflow

Push a `v*` tag or trigger the workflow manually. GitHub Actions handles the rest:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1a0a2e', 'primaryTextColor': '#e9d5ff', 'primaryBorderColor': '#7c3aed', 'lineColor': '#a855f7', 'secondaryColor': '#0d0d1a', 'background': '#0a0a18', 'mainBkg': '#1a0a2e', 'nodeBorder': '#7c3aed', 'clusterBkg': '#100e22', 'titleColor': '#c084fc', 'edgeLabelBackground': '#0d0d1a', 'fontFamily': 'Segoe UI, system-ui, sans-serif'}}}%%
flowchart LR
    TAG(["git push tag v*"]) --> CI
    subgraph CI ["GitHub Actions"]
        T[npm test] --> B[npm run build] --> Z[npm run zip] --> SR[Semantic Release] --> R[GitHub Release + .zip]
    end

    style TAG fill:#1a0a2e,stroke:#7c3aed,color:#e9d5ff
    style CI fill:#100e22,stroke:#7c3aed,color:#c084fc
    style T fill:#1e0a3c,stroke:#9333ea,color:#e9d5ff
    style B fill:#1e0a3c,stroke:#9333ea,color:#e9d5ff
    style Z fill:#1e0a3c,stroke:#9333ea,color:#e9d5ff
    style SR fill:#1e0a3c,stroke:#9333ea,color:#e9d5ff
    style R fill:#1e0a3c,stroke:#9333ea,color:#e9d5ff
```

Add a `TOKEN` secret (GitHub personal access token with `repo` scope) to your repository settings before triggering a release.

## Design decisions

**Why dependency injection for `chrome`?**
The `chrome` global only exists inside the extension runtime. Injecting it as a constructor argument lets every class that touches Chrome APIs be instantiated and tested in Node.js with Sinon stubs — no special test environment or polyfill needed.

**Why no bundler?**
Plain `tsc` keeps the build transparent and the output readable. Manifest V3 service workers support ES modules natively, so a bundler adds complexity without benefit for most extensions. Add one (Vite, esbuild) when you need tree-shaking across large dependency graphs.

**Why XO over raw ESLint?**
XO bundles ESLint, Prettier, and a curated ruleset into a single dependency with a minimal config surface. One `npm run format` command handles both linting and formatting.

**Why `chrome.storage.sync` over `localStorage`?**
`sync` replicates settings across all of the user's Chrome profiles automatically, and is accessible from service workers where `localStorage` is not available.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE.md)
