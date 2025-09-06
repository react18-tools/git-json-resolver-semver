import { StrategyFn, StrategyPlugin } from "git-json-resolver";
import { compareVersions, validate, validateStrict } from "compare-versions";
import {
  StrategyStatus_OK,
  StrategyStatus_CONTINUE,
  StrategyStatus_FAIL,
} from "git-json-resolver/utils";

// Augment types for TypeScript support
declare module "git-json-resolver" {
  interface PluginStrategies {
    "semver-max": string;
    "semver-min": string;
    "semver-ours": string;
    "semver-theirs": string;
  }

  interface PluginConfig {
    "git-json-resolver-semver": SemverPluginConfig;
    "json-merge-semver": SemverPluginConfig;
    "git-semver-resolver": SemverPluginConfig;
    "semver-merge-driver": SemverPluginConfig;
    "semver-conflict-resolver": SemverPluginConfig;
  }
}

interface SemverPluginConfig {
  strict?: boolean;
  fallback?: "ours" | "theirs" | "continue" | "error";
  preferValid?: boolean;
  preferRange?: boolean;
  workspacePattern?: string;
}

const defaultConfig: Required<SemverPluginConfig> = {
  strict: true,
  fallback: "continue",
  preferValid: true,
  preferRange: false,
  workspacePattern: "",
};

/**
 * Creates semver-aware strategies for `git-json-resolver`.
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
 * - `strict` → use validateStrict - https://github.com/omichelsen/compare-versions?tab=readme-ov-file#validate-version-numbers-strict
 * - `fallback` → behavior when both invalid (`ours` | `theirs` | `continue` | `error`)
 * - `preferValid` → if only one side is valid semver, take it
 * - `preferRange` → merge into semver range (future)
 * - `workspacePattern` → pattern for workspace rules (e.g. `workspaces:*`)
 */
const createSemverPlugin = (pluginConfig: SemverPluginConfig = defaultConfig): StrategyPlugin => {
  /**
   * Check if a value is a valid semver according to current config.
   */
  const isValidSemver = (val: unknown): val is string => {
    if (typeof val !== "string") return false;
    const version = val.trim().replace(/^\^/, "");
    if (pluginConfig.strict) {
      validateStrict(version);
    }
    return validate(version);
  };

  /**
   * Pick the higher semver version.
   */
  const semverMax: StrategyFn = ({ ours, theirs }) => {
    if (isValidSemver(ours) && isValidSemver(theirs)) {
      const winner = compareVersions(ours, theirs) >= 0 ? ours : theirs;
      return { status: StrategyStatus_OK, value: winner };
    }
    return handleFallback({ ours, theirs });
  };

  /**
   * Pick the lower semver version.
   */
  const semverMin: StrategyFn = ({ ours, theirs }) => {
    if (isValidSemver(ours) && isValidSemver(theirs)) {
      const winner = compareVersions(ours, theirs) <= 0 ? ours : theirs;
      return { status: StrategyStatus_OK, value: winner };
    }
    return handleFallback({ ours, theirs });
  };

  /**
   * Always prefer ours if valid semver, else apply preferValid/fallback rules.
   */
  const semverOurs: StrategyFn = ({ ours, theirs }) => {
    if (isValidSemver(ours)) return { status: StrategyStatus_OK, value: ours };
    return handleFallback({ ours, theirs });
  };

  /**
   * Always prefer theirs if valid semver, else apply preferValid/fallback rules.
   */
  const semverTheirs: StrategyFn = ({ ours, theirs }) => {
    if (isValidSemver(theirs)) return { status: StrategyStatus_OK, value: theirs };
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
    if (pluginConfig.preferValid) {
      if (isValidSemver(ours)) return { status: StrategyStatus_OK, value: ours };
      if (isValidSemver(theirs)) return { status: StrategyStatus_OK, value: theirs };
    }
    switch (pluginConfig.fallback) {
      case "ours":
        return { status: StrategyStatus_OK, value: ours };
      case "theirs":
        return { status: StrategyStatus_OK, value: theirs };
      case "error":
        return { status: StrategyStatus_FAIL, reason: "No valid semver found" };
      case "continue":
      default:
        return { status: StrategyStatus_CONTINUE };
    }
  };

  return {
    strategies: {
      "semver-max": semverMax,
      "semver-min": semverMin,
      "semver-ours": semverOurs,
      "semver-theirs": semverTheirs,
    },
  };
};
export default createSemverPlugin;

const { strategies } = createSemverPlugin(defaultConfig);

export const semverMax = strategies["semver-max"];
export const semverMin = strategies["semver-min"];
export const semverOurs = strategies["semver-ours"];
export const semverTheirs = strategies["semver-theirs"];

export const init = (config: SemverPluginConfig) => {
  Object.assign(defaultConfig, config);
};
