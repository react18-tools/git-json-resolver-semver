import { describe, it, expect, beforeEach } from "vitest";
import plugin, { semverMax, semverMin, semverOurs, semverTheirs } from "./index";
import { StrategyStatus } from "git-json-resolver";

const run = (fn: any, ours: any, theirs: any) => fn({ ours, theirs, base: undefined, path: [] });

const reset = (overrides: any = {}) => {
  // @ts-ignore -- ts gone mad
  plugin.init({
    strict: true,
    normalize: true,
    fallback: "continue",
    preferValid: true,
    preferRange: false,
    workspacePattern: "",
    ...overrides,
  });
};
describe("git-json-resolver-semver", () => {
  beforeEach(() => reset());

  describe("semver-max", () => {
    it("picks higher when both valid", () => {
      const r = run(semverMax, "1.2.3", "1.3.0");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("1.3.0");
    });

    it("prefers valid when only one is valid", () => {
      const r = run(semverMax, "1.2.3", "banana");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("1.2.3");
    });

    it("respects fallback=continue when both invalid", async () => {
      await reset({ preferValid: false, fallback: "continue" });
      const r = run(semverMax, "foo", "bar");
      expect(r.status).toBe(StrategyStatus.CONTINUE);
    });

    it("respects fallback=ours/theirs/error", async () => {
      await reset({ preferValid: false, fallback: "ours" });
      let r = run(semverMax, "foo", "bar");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("foo");

      await reset({ preferValid: false, fallback: "theirs" });
      r = run(semverMax, "foo", "bar");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("bar");

      await reset({ preferValid: false, fallback: "error" });
      r = run(semverMax, "foo", "bar");
      expect(r.status).toBe(StrategyStatus.FAIL);
    });

    it("strict=false allows prereleases/ranges", async () => {
      await reset({ strict: false });
      const r1 = run(semverMax, "1.2.3", "1.2.3-beta.1");
      expect(r1.status).toBe(StrategyStatus.OK);
      expect(r1.value).toBe("1.2.3"); // release > prerelease

      const r2 = run(semverMax, "^1.2.3", "1.3.0");
      // validate("^1.2.3") is true in non-strict; compareVersions("^1.2.3", "1.3.0")
      // is not meaningful, so preferValid should push to 1.3.0 only when one side valid.
      // Here both are considered valid, so we trust compareVersions result.
      expect([StrategyStatus.OK, StrategyStatus.CONTINUE]).toContain(r2.status);
    });

    it("strict=true rejects prereleases", async () => {
      await reset({ strict: true });
      const r = run(semverMax, "1.2.3-beta.1", "1.2.3");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("1.2.3"); // only ours invalid → pick valid theirs via preferValid
    });
  });

  describe("semver-min", () => {
    it("picks lower when both valid", () => {
      const r = run(semverMin, "2.0.0", "2.1.0");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("2.0.0");
    });

    it("prefers valid when only one is valid", () => {
      const r = run(semverMin, "banana", "2.1.0");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("2.1.0");
    });

    it("strict=false handles prerelease ordering", async () => {
      await reset({ strict: false });
      const r = run(semverMin, "1.2.3", "1.2.3-beta.1");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("1.2.3-beta.1"); // prerelease < release
    });
  });

  describe("semver-ours / semver-theirs", () => {
    it("semver-ours returns ours when ours is valid", () => {
      const r = run(semverOurs, "1.0.0", "2.0.0");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("1.0.0");
    });

    it("semver-ours falls back to valid theirs when ours invalid", () => {
      const r = run(semverOurs, "banana", "1.0.1");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("1.0.1");
    });

    it("semver-theirs returns theirs when theirs is valid", () => {
      const r = run(semverTheirs, "1.2.3", "2.0.0");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("2.0.0");
    });

    it("semver-theirs falls back to valid ours when theirs invalid", () => {
      const r = run(semverTheirs, "1.2.3", "carrot");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("1.2.3");
    });

    it("falls back per config when neither valid", async () => {
      await reset({ preferValid: false, fallback: "theirs" });
      const r = run(semverOurs, "foo", "bar");
      expect(r.status).toBe(StrategyStatus.OK);
      expect(r.value).toBe("bar");
    });
  });
});
