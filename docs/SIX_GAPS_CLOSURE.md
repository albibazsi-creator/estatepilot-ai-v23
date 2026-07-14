# Six gaps closure map

| Gap | V21 implementation | Start gate |
| --- | --- | --- |
| Stable build | Build hardening dashboard + no-dependency artifact check | `release:v21-check`, typecheck, build |
| Live AI | OpenAI wiring plan, AI endpoint matrix, guardrail rules | OpenAI env + AI eval smoke |
| Live 3D | Spatial worker bridge, accepted scene outputs, manifest QA | worker health + manifest validation |
| Premium UX | 2-minute demo flow and UX principles | one complete demo listing |
| CRM automation | lead → score → task → deal → seller activity loop | lead submit creates next action |
| Integrations | launch matrix for auth/storage/email/calendar/billing/monitoring | provider health matrix |

V21 is meant to make the missing work explicit and actionable before launch, not hide it behind mock success screens.
