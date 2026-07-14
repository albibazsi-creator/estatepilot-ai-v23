import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

type ContractRoute = {
  method: string;
  path: string;
  tag: string;
  summary: string;
  requiresAuth: boolean;
  stability: "stable" | "beta" | "mock";
};

const manualRoutes: ContractRoute[] = [
  { method: "GET", path: "/api/health", tag: "ops", summary: "Runtime health check", requiresAuth: false, stability: "stable" },
  { method: "GET", path: "/api/public/listings/{slug}", tag: "public-listing", summary: "Public listing data room", requiresAuth: false, stability: "stable" },
  { method: "POST", path: "/api/public/listings/{slug}/lead", tag: "lead-capture", summary: "Create GDPR-consented public lead", requiresAuth: false, stability: "stable" },
  { method: "POST", path: "/api/public/listings/{slug}/chat", tag: "property-chat", summary: "Ask property-grounded AI chat", requiresAuth: false, stability: "beta" },
  { method: "POST", path: "/api/public/listings/{slug}/book", tag: "booking", summary: "Create viewing request", requiresAuth: false, stability: "beta" },
  { method: "GET", path: "/api/listings", tag: "listings", summary: "List agency listings", requiresAuth: true, stability: "stable" },
  { method: "POST", path: "/api/listings", tag: "listings", summary: "Create listing", requiresAuth: true, stability: "stable" },
  { method: "POST", path: "/api/listings/{id}/ai/generate-description", tag: "ai", summary: "Generate platform-specific listing copy", requiresAuth: true, stability: "beta" },
  { method: "POST", path: "/api/listings/{id}/media/analyze", tag: "ai", summary: "Analyze uploaded listing media", requiresAuth: true, stability: "beta" },
  { method: "POST", path: "/api/reports/{id}/pdf", tag: "seller-report", summary: "Export seller report as HTML/PDF fallback", requiresAuth: true, stability: "beta" },
  { method: "GET", path: "/api/providers/health", tag: "ops", summary: "Provider health matrix", requiresAuth: true, stability: "stable" },
  { method: "GET", path: "/api/ops/v12-readiness", tag: "ops", summary: "Go-live readiness summary", requiresAuth: true, stability: "stable" },
  { method: "GET", path: "/api/ops/v13-readiness", tag: "ops", summary: "V13 pilot readiness summary", requiresAuth: true, stability: "stable" },
  { method: "GET", path: "/api/contracts/openapi", tag: "contract", summary: "OpenAPI-like contract snapshot", requiresAuth: true, stability: "stable" },
  { method: "GET", path: "/api/metering/usage", tag: "metering", summary: "Usage and estimated cost snapshot", requiresAuth: true, stability: "stable" }
];

function routeFileToApiPath(filePath: string) {
  const relative = filePath.replace(process.cwd(), "").replace(/\\/g, "/");
  return relative
    .replace(/^\/app/, "")
    .replace(/\/route\.(ts|tsx|js)$/, "")
    .replace(/\[([^\]]+)\]/g, "{$1}") || "/";
}

export function discoverApiRouteFiles() {
  const apiDir = path.join(process.cwd(), "app", "api");
  const files: string[] = [];
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      if (stat.isFile() && /route\.(ts|tsx|js)$/.test(entry)) files.push(full);
    }
  }
  walk(apiDir);
  return files.sort().map((file) => ({ file, path: routeFileToApiPath(file) }));
}

export function generateOpenApiContract() {
  const discovered = discoverApiRouteFiles();
  const paths: Record<string, any> = {};
  for (const route of manualRoutes) {
    paths[route.path] ||= {};
    paths[route.path][route.method.toLowerCase()] = {
      tags: [route.tag],
      summary: route.summary,
      "x-requires-auth": route.requiresAuth,
      "x-stability": route.stability,
      responses: {
        "200": { description: "Success" },
        "400": { description: "Validation error" },
        "401": { description: "Unauthorized" },
        "429": { description: "Rate limited" },
        "500": { description: "Internal error" }
      }
    };
  }
  for (const route of discovered) {
    if (!paths[route.path]) {
      paths[route.path] = {
        get: {
          tags: [route.path.split("/")[2] || "api"],
          summary: `Discovered route: ${route.path}`,
          "x-requires-auth": !route.path.startsWith("/api/public") && route.path !== "/api/health",
          "x-stability": "beta",
          responses: { "200": { description: "Success" } }
        }
      };
    }
  }
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "EstatePilot AI Partner + App API",
      version: "0.13.0",
      description: "V13 generated contract for pilot, partner API and go-live validation. Dynamic routes are represented with {param}."
    },
    servers: [{ url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" }],
    paths,
    "x-generated-at": new Date().toISOString(),
    "x-discovered-route-count": discovered.length,
    "x-manual-contract-count": manualRoutes.length
  };
  const checksum = crypto.createHash("sha256").update(JSON.stringify(spec.paths)).digest("hex");
  return { spec, checksum, routeCount: Object.keys(paths).length, discoveredCount: discovered.length, manualCount: manualRoutes.length };
}

export async function saveApiContractSnapshot(agencyId?: string | null, createdByEmail?: string | null) {
  const result = generateOpenApiContract();
  const snapshot = await prisma.apiContractSnapshot.create({
    data: {
      agencyId: agencyId ?? null,
      version: "v13",
      status: "generated",
      routeCount: result.routeCount,
      checksum: result.checksum,
      specJson: result.spec,
      createdByEmail: createdByEmail ?? null
    }
  });
  return { ...result, snapshot };
}

export async function getApiContractSummary(agencyId?: string | null) {
  const generated = generateOpenApiContract();
  const latest = await prisma.apiContractSnapshot.findFirst({ where: { agencyId: agencyId ?? null }, orderBy: { createdAt: "desc" } });
  const coverage = Math.min(100, Math.round((generated.manualCount / Math.max(generated.routeCount, 1)) * 100));
  return {
    ...generated,
    latest,
    coverage,
    status: latest?.checksum === generated.checksum ? "in_sync" : latest ? "changed_since_snapshot" : "no_snapshot"
  };
}
