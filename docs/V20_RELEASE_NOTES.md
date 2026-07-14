# V20 Release Notes — Test-Ready Pilot Build

V20 célja nem újabb funkcióhalmozás, hanem a v19-es enterprise spatial / digital twin réteg tesztelhetőbbé és átadhatóbbá tétele.

## Fő újítások

- V20 Testing & QA Center: `/dashboard/v20-test-center`
- V20 readiness API: `/api/ops/v20-readiness`
- tesztelési API-k:
  - `/api/testing/preflight`
  - `/api/testing/scenarios/run`
  - `/api/testing/artifact-audit`
  - `/api/testing/build-plan`
- no-dependency artifact QA, amely npm install nélkül is fut
- scenario coverage check a fő pilot flow-kra
- artifact checksum audit
- automatikus V20 test report generálás
- GitHub Actions workflow a V20 artifact QA-ra

## Mit jelent a V20 állapot?

A V20-at úgy kell kezelni, mint tesztelésre előkészített fejlesztői csomagot. A no-dependency QA ebben a környezetben futtatható, de a teljes production verdicthez továbbra is kell sikeres dependency install, Prisma push/seed, typecheck, Next build és runtime smoke.
