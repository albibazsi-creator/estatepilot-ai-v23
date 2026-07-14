import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";

const apiRoot = path.join(process.cwd(), "app", "api");
const routes: { route: string; methods: string[]; file: string }[] = [];

function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    if (stat.isFile() && name === "route.ts") {
      const text = readFileSync(full, "utf8");
      const methods = ["GET", "POST", "PATCH", "DELETE", "PUT"].filter((m) => text.includes(`export async function ${m}`));
      const route = "/api/" + path.relative(apiRoot, path.dirname(full)).replaceAll(path.sep, "/");
      routes.push({ route, methods, file: path.relative(process.cwd(), full) });
    }
  }
}

walk(apiRoot);
routes.sort((a, b) => a.route.localeCompare(b.route));
writeFileSync(path.join(process.cwd(), "docs", "ROUTE_INVENTORY.generated.json"), JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2));
console.log(JSON.stringify({ ok: true, routeCount: routes.length, output: "docs/ROUTE_INVENTORY.generated.json" }, null, 2));
