---
layout: default
title: README
parent: Index
nav_order: 5
---

# index

## Modules

- [\<internal\>](-internal-.md)

## Variables

### semverMax

> `const` **semverMax**: `StrategyFn`\<`unknown`\>

Defined in: [index.ts:153](https://github.com/react18-tools/git-json-resolver-semver/blob/50e3ea62d91488fe5a6f02d1c59f11b20e40d81f/lib/src/index.ts#L153)

---

### semverMin

> `const` **semverMin**: `StrategyFn`\<`unknown`\>

Defined in: [index.ts:154](https://github.com/react18-tools/git-json-resolver-semver/blob/50e3ea62d91488fe5a6f02d1c59f11b20e40d81f/lib/src/index.ts#L154)

---

### semverOurs

> `const` **semverOurs**: `StrategyFn`\<`unknown`\>

Defined in: [index.ts:155](https://github.com/react18-tools/git-json-resolver-semver/blob/50e3ea62d91488fe5a6f02d1c59f11b20e40d81f/lib/src/index.ts#L155)

---

### semverTheirs

> `const` **semverTheirs**: `StrategyFn`\<`unknown`\>

Defined in: [index.ts:156](https://github.com/react18-tools/git-json-resolver-semver/blob/50e3ea62d91488fe5a6f02d1c59f11b20e40d81f/lib/src/index.ts#L156)

## Functions

### createSemverPlugin()

> **createSemverPlugin**(`pluginConfig`: [`SemverPluginConfig`](-internal-.md#semverpluginconfig)): `StrategyPlugin`

Defined in: [index.ts:62](https://github.com/react18-tools/git-json-resolver-semver/blob/50e3ea62d91488fe5a6f02d1c59f11b20e40d81f/lib/src/index.ts#L62)

Creates semver-aware strategies for `git-json-resolver`.

## Strategies

| Strategy        | Behavior                                                              | Example (`ours` vs `theirs`) | Result  |
| --------------- | --------------------------------------------------------------------- | ---------------------------- | ------- |
| `semver-max`    | Picks the higher valid semver                                         | `1.2.3` vs `1.3.0`           | `1.3.0` |
| `semver-min`    | Picks the lower valid semver                                          | `2.0.0` vs `2.1.0`           | `2.0.0` |
| `semver-ours`   | Picks `ours` if valid semver, else apply `preferValid` / `fallback`   | `1.2.3` vs `banana`          | `1.2.3` |
| `semver-theirs` | Picks `theirs` if valid semver, else apply `preferValid` / `fallback` | `foo` vs `2.0.0`             | `2.0.0` |

Configuration options (`pluginConfig`):

- `strict` → use validateStrict - https://github.com/omichelsen/compare-versions?tab=readme-ov-file#validate-version-numbers-strict
- `fallback` → behavior when both invalid (`ours` | `theirs` | `continue` | `error`)
- `preferValid` → if only one side is valid semver, take it
- `preferRange` → merge into semver range (future)
- `workspacePattern` → pattern for workspace rules (e.g. `workspaces:*`)

#### Parameters

##### pluginConfig

[`SemverPluginConfig`](-internal-.md#semverpluginconfig) = `defaultConfig`

#### Returns

`StrategyPlugin`

---

### init()

> **init**(`config`: [`SemverPluginConfig`](-internal-.md#semverpluginconfig)): `void`

Defined in: [index.ts:158](https://github.com/react18-tools/git-json-resolver-semver/blob/50e3ea62d91488fe5a6f02d1c59f11b20e40d81f/lib/src/index.ts#L158)

#### Parameters

##### config

[`SemverPluginConfig`](-internal-.md#semverpluginconfig)

#### Returns

`void`
