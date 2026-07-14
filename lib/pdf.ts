import { escapeHtml } from "@/lib/sanitize";

export function renderSellerReportHtml(input: { title: string; period: string; summary: string; metrics: Record<string, unknown>; recommendation?: string }) {
  const metricRows = Object.entries(input.metrics).map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td><strong>${escapeHtml(String(value))}</strong></td></tr>`).join("");
  return `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;margin:40px;color:#0f172a;background:#f8fafc} .card{background:white;border:1px solid #e2e8f0;border-radius:24px;padding:28px;margin-bottom:18px} h1{font-size:32px;margin:0 0 8px} table{width:100%;border-collapse:collapse}td{padding:12px;border-bottom:1px solid #e2e8f0}.muted{color:#64748b}.badge{display:inline-block;background:#0f172a;color:#fff;border-radius:999px;padding:6px 12px;font-size:12px}
  </style>
</head>
<body>
  <div class="card"><span class="badge">EstatePilot AI Seller Report</span><h1>${escapeHtml(input.title)}</h1><p class="muted">${escapeHtml(input.period)}</p></div>
  <div class="card"><h2>Összefoglaló</h2><p>${escapeHtml(input.summary)}</p></div>
  <div class="card"><h2>Mérőszámok</h2><table>${metricRows}</table></div>
  <div class="card"><h2>AI javaslat</h2><p>${escapeHtml(input.recommendation ?? "A forró leadeket 24 órán belül érdemes hívni, és a kreatívokat hetente tesztelni.")}</p></div>
</body></html>`;
}

export function renderPseudoPdfBuffer(html: string) {
  // Starter-safe fallback: return HTML bytes with a PDF-oriented layout.
  // Production: replace with Playwright/Puppeteer or a managed PDF rendering API.
  return Buffer.from(html, "utf-8");
}
