# V20 Testing Runbook

## 1. Artifact QA dependency install nélkül

```bash
npm run release:v20-check
```

Ez ellenőrzi:

- package.json érvényességét
- script targeteket
- route/page szerkezetet
- local import targeteket
- Prisma schema könnyű integritását
- fő pilot scenario fájlokat
- V20 dokumentációkat és artifact checksumot

## 2. Teljes helyi build teszt

```bash
npm install
npm run db:push
npm run db:seed
npm run typecheck
npm run build
npm run dev
```

## 3. Manuális pilot flow

1. Nyisd meg a dashboardot.
2. Hozz létre vagy ellenőrizd a demo listinget.
3. Generálj AI leírást / social copyt.
4. Nyisd meg a public listinget.
5. Küldj be teszt leadet GDPR checkboxszal.
6. Ellenőrizd a lead scoringot.
7. Generálj seller reportot.
8. Nyisd meg a 3D orchestrator / review / sharing oldalakat.
9. Ellenőrizd a V20 Test Center gate-eket.

## 4. Production szabály

Addig nem production-ready, amíg a `npm run build` és a manuális runtime smoke nem megy át azon a gépen/környezetben, ahol tesztelni fogod.
