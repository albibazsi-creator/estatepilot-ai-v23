# V9 Next Steps

## Highest priority

- Replace demo `getCurrentUser()` with Clerk/Auth.js.
- Add real API-key authorization middleware to partner API v2 endpoints.
- Connect OpenAI vision and text generation to translation and guardrail evaluation.
- Make R2/S3 upload intent return real presigned URLs.
- Add migrations and run a real `npm run build`.

## After that

- Add Playwright E2E: create listing → upload media → generate translation → public lead → report.
- Add Stripe/Barion payment webhooks.
- Add domain verification job that checks DNS TXT.
- Add multi-tenant brand rendering on public listing pages.
