# AI Governance Runbook

EstatePilot AI should never present AI outputs as unchecked truth.

## Core controls

1. Every material AI output can be written into `AiDecisionLog`.
2. High-risk decisions should require human approval.
3. Property chat must answer only from listing facts and knowledge base.
4. Virtual staging must always preserve original image and show disclosure.
5. AI evaluation runs should be executed before public launch.

## Decision types

- `lead_scoring`
- `listing_description`
- `property_chat_answer`
- `seller_report_summary`
- `staging_recommendation`
- `price_positioning`
- `campaign_plan`

## Release gate

Before production, require:

- zero critical guardrail failures
- AI eval score above 85
- no unapproved high-risk decision logs
- staging disclosure on all staged images
