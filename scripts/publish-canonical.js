const { execSync } = require("child_process");

// Publish canonical packages
[
  "json-merge-semver",
  "git-semver-resolver",
  "semver-merge-driver",
  "semver-conflict-resolver",
].forEach(pkg => {
  try {
    execSync(
      `sed -i -e "s/name.*/name\\": \\"${pkg.replace(/\//g, "\\\\/")}\\",/" lib/package.json`,
    );
    execSync("cd lib && npm publish --provenance --access public");
  } catch (err) {
    console.error(`Error publishing ${pkg}: `, err);
  }
});
