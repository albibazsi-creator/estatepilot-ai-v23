# V8 Next Steps

## Build stabilizáció

- `npm install`
- `npm run prisma:validate`
- `npm run typecheck`
- `npm run build`
- Next.js 15 route param kompatibilitás ellenőrzése minden dinamikus API route-nál.

## Valódi szolgáltatások

- Clerk/Auth.js session lookup a demo user stub helyett.
- Cloudflare R2 presigned upload a local upload intent után.
- OpenAI Vision valós képelemzés.
- Resend email küldés lead/seller report/proposal irányba.
- Stripe/Barion checkout élesítés.
- Google Calendar token exchange + slot sync.

## Product polish

- Drag-and-drop media reorder.
- Public chat UI átvezetése a safe-answer logikára.
- Seller portal aktivitási feed megjelenítése share token alapján.
- PDF export Playwrighttal.
- Agency branding beállítások: logo, színek, domain.
