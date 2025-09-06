# git-json-resolver-semver

## 0.0.2

### Patch Changes

- 6d78136: Add logs

## 0.0.1

### Patch Changes

- Update compatibility with git-json-resolver v1.3.1 API changes
  - Replace deprecated StrategyStatus enum with individual status constants
  - Update imports to use StrategyStatus_OK, StrategyStatus_CONTINUE, StrategyStatus_FAIL from git-json-resolver/utils
  - Add PluginConfig interface augmentation for better TypeScript support
  - Update dependency to git-json-resolver ^1.3.1
