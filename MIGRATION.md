# Migration Guide

## v0.0.2 → v1.0.0

This release introduces a **breaking change** in the plugin architecture. The plugin now uses a factory pattern for better configuration management and TypeScript support.

### What Changed

- Default export changed from plugin object to `createSemverPlugin()` factory function
- Improved semver validation with `validateStrict` support
- Better handling of version prefixes (e.g., `^1.2.3`)
- Configuration is now immutable and scoped per plugin instance

### Migration Steps

#### 1. Dynamic Plugin Loading (Recommended - No Changes Required)

If you're using dynamic plugin loading, **no changes are needed**:

```json
{
  "plugins": ["git-json-resolver-semver"],
  "rules": {
    "dependencies.react": ["semver-max"]
  }
}
```

#### 2. Direct Import Usage

**Before (v0.0.2):**
```ts
import plugin, { semverMax } from "git-json-resolver-semver";
import { resolveConflicts } from "git-json-resolver";

// Plugin configuration (old way)
await plugin.init?.({
  strict: false,
  fallback: "ours"
});

await resolveConflicts({
  customStrategies: {
    "semver-max": semverMax,
  },
  rules: {
    "dependencies.react": ["semver-max"],
  },
});
```

**After (v1.0.0):**
```ts
import createSemverPlugin, { semverMax, init } from "git-json-resolver-semver";
import { resolveConflicts } from "git-json-resolver";

// Option 1: Use factory function with config
const plugin = createSemverPlugin({
  strict: false,
  fallback: "ours"
});

await resolveConflicts({
  customStrategies: plugin.strategies,
  rules: {
    "dependencies.react": ["semver-max"],
  },
});

// Option 2: Use global init (for backward compatibility)
init({
  strict: false,
  fallback: "ours"
});

await resolveConflicts({
  customStrategies: {
    "semver-max": semverMax,
  },
  rules: {
    "dependencies.react": ["semver-max"],
  },
});
```

### New Features

#### Enhanced Semver Validation

The plugin now uses `validateStrict` from compare-versions and properly handles version prefixes:

```ts
// Now properly handles these cases:
"^1.2.3" // Strips ^ prefix before validation
"1.2.3-beta.1" // Handled based on strict mode setting
```

#### Factory Pattern Benefits

```ts
// Create multiple plugin instances with different configs
const strictPlugin = createSemverPlugin({ strict: true });
const flexiblePlugin = createSemverPlugin({ strict: false, fallback: "ours" });
```

### Configuration Options

All configuration options remain the same:

- `strict` (boolean, default: `true`) - Use strict semver validation
- `fallback` (string, default: `"continue"`) - Behavior when both sides invalid
- `preferValid` (boolean, default: `true`) - Prefer valid semver when only one side is valid
- `preferRange` (boolean, default: `false`) - Future feature for range merging
- `workspacePattern` (string, default: `""`) - Pattern for workspace rules

### Troubleshooting

**Error: "Cannot read property 'strategies' of undefined"**
- You're likely importing the old way. Use `createSemverPlugin()` or individual strategy exports.

**Error: "plugin.init is not a function"**
- Use the new `init` named export instead of `plugin.init`.

**Semver validation behaving differently**
- The new validation is more accurate. Check if your versions need the `strict: false` option.