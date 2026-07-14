import { writeFileSync } from "fs";
import { execSync } from "child_process";
import pkg from "../package.json";

const files = execSync("find . -type f -not -path './node_modules/*' -not -path './.next/*' | sort", { encoding: "utf-8" }).trim().split("\n");
const manifest = {
  name: pkg.name,
  version: pkg.version,
  generatedAt: new Date().toISOString(),
  fileCount: files.length,
  criticalPaths: files.filter((file) => file.startsWith("./app/api") || file.startsWith("./lib") || file.startsWith("./prisma") || file.startsWith("./docs"))
};
writeFileSync("release-manifest.json", JSON.stringify(manifest, null, 2));
console.log(`release-manifest.json written with ${files.length} files`);
