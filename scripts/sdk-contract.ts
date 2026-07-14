import fs from "fs";
const required = [
  "app/api/partner/listings/route.ts",
  "app/api/privacy/dsar/route.ts",
  "app/api/ai/decisions/route.ts",
  "sdk/typescript/client.ts",
  "docs/SDK_EXAMPLES.md"
];
const missing = required.filter((p) => !fs.existsSync(p));
if (missing.length) {
  console.error("Missing SDK contract files:", missing);
  process.exit(1);
}
console.log("SDK contract files present.");
