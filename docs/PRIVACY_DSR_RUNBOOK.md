# Privacy / DSR Runbook

Use `/dashboard/data-privacy` and `/api/privacy/dsar` for data subject requests.

## Supported request types

- `export`: collect lead, consent, appointment and feedback records.
- `delete`: create a deletion review task before manual anonymization.
- `rectify`: track correction requests.

## Production checklist

- Verify requester identity before returning data.
- Never email raw exports without encryption or secure portal delivery.
- Keep deletion audit records without unnecessary personal data.
- Review connected processors: email, SMS, CRM, analytics, storage.
