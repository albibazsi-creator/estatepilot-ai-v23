const checks = [
  "prisma/schema.prisma",
  "app/dashboard/deals/page.tsx",
  "app/dashboard/team/page.tsx",
  "app/dashboard/demo-center/page.tsx",
  "app/api/deals/route.ts",
  "docs/V8_RELEASE_NOTES.md",
  "docs/V8_DEMO_PACKAGE.md"
];

async function main() {
  const { existsSync } = await import("fs");
  let score = 0;
  for (const path of checks) {
    const ok = existsSync(path);
    if (ok) score += 10;
    console.log(`${ok ? "OK" : "MISS"} ${path}`);
  }
  console.log(`Handoff static score: ${score}/${checks.length * 10}`);
  if (score < checks.length * 10) process.exitCode = 1;
}
main();
