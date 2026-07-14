import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { buildDemoChecklist, buildDemoSteps } from "../lib/demo-center";

const outDir = join(process.cwd(), "exports");
mkdirSync(outDir, { recursive: true });
const payload = {
  name: "EstatePilot AI v8 demo package",
  createdAt: new Date().toISOString(),
  demoLengthMinutes: 12,
  steps: buildDemoSteps(),
  checklist: buildDemoChecklist(),
  pricing: {
    intro: "29 900 Ft / első ingatlan",
    pro: "89 900 Ft / hó",
    agency: "199 000 Ft / hó-tól"
  }
};
writeFileSync(join(outDir, "estatepilot-v8-demo-package.json"), JSON.stringify(payload, null, 2));
console.log("Demo package exported: exports/estatepilot-v8-demo-package.json");
