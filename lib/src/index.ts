import { StrategyFn, StrategyPlugin, StrategyStatus } from "git-json-resolver";
import { compareVersions, validate } from "compare-versions";

/**
 * Semver-aware strategies for `git-json-resolver`.
 *
 * ## Strategies
 *
 * | Strategy        | Behavior                                                 | Example (`ours` vs `theirs`) | Result   |
 * |-----------------|----------------------------------------------------------|-------------------------------|----------|
 * | `semver-max`    | Picks the higher valid semver                            | `1.2.3` vs `1.3.0`            | `1.3.0`  |
 * | `semver-min`    | Picks the lower valid semver                             | `2.0.0` vs `2.1.0`            | `2.0.0`  |
 * | `semver-ours`   | Picks `ours` if valid semver, else apply `preferValid` / `fallback` | `1.2.3` vs `banana` | `1.2.3`  |
 * | `semver-theirs` | Picks `theirs` if valid semver, else apply `preferValid` / `fallback` | `foo` vs `2.0.0` | `2.0.0`  |
 *
 * Configuration options (`pluginConfig`):
 * - `strict` → require exact semver (true) or allow ranges/prereleases (false)
 * - `fallback` → behavior when both invalid (`ours` | `theirs` | `continue` | `error`)
 * - `preferValid` → if only one side is valid semver, take it
 * - `preferRange` → merge into semver range (future)
 * - `workspacePattern` → pattern for workspace rules (e.g. `workspaces:*`)
 */

// Augment types for TypeScript support
declare module "git-json-resolver" {
  interface PluginStrategies {
    "semver-max": string;
    "semver-min": string;
    "semver-ours": string;
    "semver-theirs": string;
  }
}

interface SemverPluginConfig {
  strict?: boolean;
  fallback?: "ours" | "theirs" | "continue" | "error";
  preferValid?: boolean;
  preferRange?: boolean;
  workspacePattern?: string;
}

let pluginConfig: Required<SemverPluginConfig> = {
  strict: true,
  fallback: "continue",
  preferValid: true,
  preferRange: false,
  workspacePattern: "",
};

/**
 * Check if a value is a valid semver according to current config.
 */
const isValidSemver = (val: unknown): val is string => {
  if (typeof val !== "string") return false;
  if (pluginConfig.strict) {
    // strict → only plain x.y.z allowed
    return /^\d+\.\d+\.\d+$/.test(val);
  }
  return validate(val); // flexible: ranges, prereleases ok
};

/**
 * Pick the higher semver version.
 */
export const semverMax: StrategyFn = ({ ours, theirs }) => {
  if (isValidSemver(ours) && isValidSemver(theirs)) {
    const winner = compareVersions(ours, theirs) >= 0 ? ours : theirs;
    return { status: StrategyStatus.OK, value: winner };
  }
  if (pluginConfig.preferValid) {
    if (isValidSemver(ours)) return { status: StrategyStatus.OK, value: ours };
    if (isValidSemver(theirs)) return { status: StrategyStatus.OK, value: theirs };
  }
  return handleFallback({ ours, theirs });
};

/**
 * Pick the lower semver version.
 */
export const semverMin: StrategyFn = ({ ours, theirs }) => {
  if (isValidSemver(ours) && isValidSemver(theirs)) {
    const winner = compareVersions(ours, theirs) <= 0 ? ours : theirs;
    return { status: StrategyStatus.OK, value: winner };
  }
  if (pluginConfig.preferValid) {
    if (isValidSemver(ours)) return { status: StrategyStatus.OK, value: ours };
    if (isValidSemver(theirs)) return { status: StrategyStatus.OK, value: theirs };
  }
  return handleFallback({ ours, theirs });
};

/**
 * Always prefer ours if valid semver, else apply preferValid/fallback rules.
 */
export const semverOurs: StrategyFn = ({ ours, theirs }) => {
  if (isValidSemver(ours)) return { status: StrategyStatus.OK, value: ours };
  if (pluginConfig.preferValid && isValidSemver(theirs)) {
    return { status: StrategyStatus.OK, value: theirs };
  }
  return handleFallback({ ours, theirs });
};

/**
 * Always prefer theirs if valid semver, else apply preferValid/fallback rules.
 */
export const semverTheirs: StrategyFn = ({ ours, theirs }) => {
  if (isValidSemver(theirs)) return { status: StrategyStatus.OK, value: theirs };
  if (pluginConfig.preferValid && isValidSemver(ours)) {
    return { status: StrategyStatus.OK, value: ours };
  }
  return handleFallback({ ours, theirs });
};

/**
 * Handle fallback behavior when no valid semver was found.
 */
const handleFallback = ({
  ours,
  theirs,
}: {
  ours: unknown;
  theirs: unknown;
}): ReturnType<StrategyFn> => {
  switch (pluginConfig.fallback) {
    case "ours":
      return { status: StrategyStatus.OK, value: ours };
    case "theirs":
      return { status: StrategyStatus.OK, value: theirs };
    case "error":
      return { status: StrategyStatus.FAIL, reason: "No valid semver found" };
    case "continue":
    default:
      return { status: StrategyStatus.CONTINUE };
  }
};

// Plugin interface for dynamic loading
const plugin: StrategyPlugin = {
  strategies: {
    "semver-max": semverMax,
    "semver-min": semverMin,
    "semver-ours": semverOurs,
    "semver-theirs": semverTheirs,
  },
  init: async (config: SemverPluginConfig) => {
    pluginConfig = { ...pluginConfig, ...config };
  },
};

export default plugin;
