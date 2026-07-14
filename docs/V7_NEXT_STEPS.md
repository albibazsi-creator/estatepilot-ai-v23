# V7 Next Steps

## Legfontosabb fejlesztői következő kör

1. Futtasd lokálisan a teljes `release:deep-check` parancsot.
2. Javítsd a Prisma/TypeScript build hibákat.
3. Cseréld le a demo authot Clerk/Auth.js-re.
4. Implementáld a valós R2/S3 adaptert.
5. Kapcsold be a valódi OpenAI Vision és text generálást JSON schema validálással.
6. Készíts normalizált image processing workert thumbnail/blurhash/meta adatokhoz.
7. Kösd be a Resend emailt seller reporthoz és lead értesítéshez.
8. Implementáld Stripe vagy Barion checkout + webhook signature ellenőrzést.
9. Google Calendar OAuth token exchange + event create.
10. E2E tesztek: listing create → media upload → publish → public lead → follow-up → seller report.

## Ami után már sales-demo kompatibilis

- 3 seed listing teljes képpel/tourral.
- Public landing reszponzív design polish.
- 1 kattintásos seller report PDF.
- AI output generálás valós API-val.
- Stabil deploy domainnel.
