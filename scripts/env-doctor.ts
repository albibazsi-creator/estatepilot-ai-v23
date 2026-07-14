import { runConfigDoctor, summarizeDoctor } from "../lib/config-doctor";

const checks = runConfigDoctor();
const summary = summarizeDoctor(checks);
console.log("EstatePilot AI production doctor");
console.table(checks.map((check) => ({ key: check.key, severity: check.severity, status: check.status })));
console.log("Summary:", summary);
if (summary.errors > 0) process.exitCode = 1;
