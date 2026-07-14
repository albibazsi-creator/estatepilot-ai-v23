# V22 Provider Certification

Each provider now needs:

- required environment variables
- owner
- live/dry-run mode
- SLA target
- smoke test
- rollback path

Start-required providers:

- Auth
- Storage
- Email
- OpenAI
- Monitoring

Pilot fallback providers:

- Billing can be manual invoice during pilot
- Calendar can use internal slot system + ICS export during pilot
