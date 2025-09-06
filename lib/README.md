# git-json-resolver-semver <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

[![test](https://github.com/react18-tools/git-json-resolver-semver/actions/workflows/test.yml/badge.svg)](https://github.com/react18-tools/git-json-resolver-semver/actions/workflows/test.yml)
[![Maintainability](https://qlty.sh/gh/react18-tools/projects/git-json-resolver-semver/maintainability.svg)](https://qlty.sh/gh/react18-tools/projects/git-json-resolver-semver)
[![codecov](https://codecov.io/gh/react18-tools/git-json-resolver-semver/graph/badge.svg)](https://codecov.io/gh/react18-tools/git-json-resolver-semver)
[![Version](https://img.shields.io/npm/v/git-json-resolver-semver.svg?colorB=green)](https://www.npmjs.com/package/git-json-resolver-semver)
[![Downloads](https://img.jsdelivr.com/img.shields.io/npm/d18m/git-json-resolver-semver.svg)](https://www.npmjs.com/package/git-json-resolver-semver)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/git-json-resolver-semver)

**Semver-aware plugin for [`git-json-resolver`](https://github.com/react18-tools/git-json-resolver)** — resolve JSON version conflicts (e.g., `package.json`) via semantic-version strategies.

**Strategies (this release):**

- `semver-max` → pick the higher version
- `semver-min` → pick the lower version
- `semver-ours` → prefer ours if valid, else (optionally) prefer valid theirs
- `semver-theirs` → prefer theirs if valid, else (optionally) prefer valid ours

---

## ✨ Features

- Avoid manual conflict resolution in `package.json`
- Small & tree-shakable (0 runtime dependencies)
- Works with **direct import** or **dynamic plugin loading**
- TypeScript types included

> <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 20px"/> Star the repo if it saved your merge. And and also share it with your friends.

## 📦 Install

```bash
pnpm add git-json-resolver-semver
```

**_or_**

```bash
npm install git-json-resolver-semver
```

**_or_**

```bash
yarn add git-json-resolver-semver
```

Peer dependencies:

```bash
pnpm install git-json-resolver
```

---

## 🚀 Usage

### 1. Direct Import

```ts
import createSemverPlugin, { semverMax } from "git-json-resolver-semver";
import { resolveConflicts } from "git-json-resolver";

// Option 1: Use factory function with custom config
const plugin = createSemverPlugin({
  strict: false,
  fallback: "ours"
});

await resolveConflicts({
  customStrategies: plugin.strategies,
  rules: {
    "dependencies.react": ["semver-max"],
    "devDependencies.vitest": ["semver-min"],
  },
});

// Option 2: Use individual strategy exports
await resolveConflicts({
  customStrategies: {
    "semver-max": semverMax,
  },
  rules: {
    "dependencies.react": ["semver-max"],
    "devDependencies.vitest": ["semver-min"],
  },
});
```

### 2. Dynamic Loading

```json
{
  "plugins": ["git-json-resolver-semver"],
  "rules": {
    "dependencies.react": ["semver-max"],
    "devDependencies.vitest": ["semver-min"]
  }
}
```

**_or_** TypeScript Config

```ts
// git-json-resolver.config.ts
import type { Config } from "git-json-resolver";

const config: Config = {
  plugins: ["git-json-resolver-semver"],
  rules: {
    "dependencies.react": ["semver-max"],
    "devDependencies.vitest": ["semver-min"],
  },
};

export default config;
```

---

## ⚙️ Configuration

### Factory Pattern (Recommended)

```ts
import createSemverPlugin from "git-json-resolver-semver";

const plugin = createSemverPlugin({
  strict: true,           // Use validateStrict for exact semver only
  preferValid: true,      // Prefer valid semver when only one side is valid
  fallback: "continue",   // Behavior when both sides invalid
  preferRange: false,     // Future: merge into semver ranges
  workspacePattern: ""    // Pattern for workspace rules
});
```

### Global Configuration

```ts
import { init } from "git-json-resolver-semver";

init({
  strict: false,  // Allow prereleases and ranges
  fallback: "ours"
});
```

### Behavior Notes

- **strict** mode uses `validateStrict` - only accepts `x.y.z` format
- **preferValid** returns the valid side when the other is invalid
- **fallback** controls behavior when neither side is valid
- Version prefixes like `^1.2.3` are automatically handled

## ⚙️ Strategies

| Strategy        | Behavior                                                              | Example (`ours` vs `theirs`) | Result  |
| --------------- | --------------------------------------------------------------------- | ---------------------------- | ------- |
| `semver-max`    | Picks the higher valid semver                                         | `1.2.3` vs `1.3.0`           | `1.3.0` |
| `semver-min`    | Picks the lower valid semver                                          | `2.0.0` vs `2.1.0`           | `2.0.0` |
| `semver-ours`   | Picks `ours` if valid semver, else apply `preferValid` / `fallback`   | `1.2.3` vs `banana`          | `1.2.3` |
| `semver-theirs` | Picks `theirs` if valid semver, else apply `preferValid` / `fallback` | `foo` vs `2.0.0`             | `2.0.0` |

## 🙏 Acknowledgments

- [`git-json-resolver`](https://github.com/...) for the plugin system
- [`compare-versions`](https://github.com/omichelsen/compare-versions) for lightweight semver checks

## License

This library is licensed under the MPL-2.0 open-source license.

> <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 20px"/> Please enroll in [our courses](https://mayank-chaudhari.vercel.app/courses) or [sponsor](https://github.com/sponsors/mayank1513) our work.

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://mayank-chaudhari.vercel.app" target="_blank">Mayank Kumar Chaudhari</a></p>
```
