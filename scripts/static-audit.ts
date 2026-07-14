import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";

const root = process.cwd();
const ignore = new Set(["node_modules", ".next", ".git", "public/uploads"]);
const findings: { file: string; issue: string; severity: "warn" | "error" }[] = [];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (ignore.has(name)) return [];
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) return walk(full);
    return [full];
  });
}

for (const file of walk(root)) {
  if (!/\.(ts|tsx|md|json|env|prisma)$/.test(file)) continue;
  const rel = path.relative(root, file);
  const text = readFileSync(file, "utf8");
  if (/sk-[A-Za-z0-9_-]{20,}/.test(text)) findings.push({ file: rel, issue: "OpenAI-looking secret committed", severity: "error" });
  if (text.includes("STRIPE_SECRET_KEY=" + "sk_" + "live")) findings.push({ file: rel, issue: "Live Stripe secret in repo", severity: "error" });
  if (/console\.log\([^\n]*(password|secret|token)/i.test(text)) findings.push({ file: rel, issue: "Potential secret logging", severity: "warn" });
  if (rel.startsWith("app/api/") && text.includes("export async function POST") && !text.includes("getCurrentUser") && !rel.includes("public/") && !rel.includes("webhook") && !rel.includes("health")) {
    findings.push({ file: rel, issue: "Non-public POST route without getCurrentUser guard", severity: "warn" });
  }
}

const errors = findings.filter((f) => f.severity === "error");
console.log(JSON.stringify({ ok: errors.length === 0, findings }, null, 2));
if (errors.length) process.exit(1);
