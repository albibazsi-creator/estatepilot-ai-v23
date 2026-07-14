# V22 AI SLA and Evals

AI must be treated as a production subsystem, not a copy generator.

## Required traces
- prompt hash
- model
- latency
- cost estimate
- decision id
- guardrail result

## Required evals
- property chat unknowns
- listing description truthfulness
- vision room classification
- seller report plain Hungarian

## Hard safety rule
When the property knowledge base does not contain the answer, the AI must say that the exact data is not available and route the question to the agent.
