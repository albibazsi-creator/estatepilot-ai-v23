# V14 Next Steps

Recommended next work order:

1. Run `npm install` / `npm ci` and fix any TypeScript/Prisma compile issues.
2. Wire Clerk/Auth.js and remove dependency on dev current user.
3. Wire Cloudflare R2 presigned upload.
4. Wire OpenAI image analysis and property copy generation.
5. Wire Resend transactional emails.
6. Add Playwright browser e2e for public listing → lead submit.
7. Deploy staging on Vercel with production env template.
8. Demo with one real listing from a real estate agent.
