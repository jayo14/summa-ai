# Summa AI — Technical Debt Register

| Item | Type | Cost of leaving it | Cost to fix | Priority |
|---|---|---|---|---|
| Hardcoded Z.ai credentials | Security debt | Credential compromise, no rotation path | Trivial-Low — env vars | Critical |
| Insecure JWT secret default | Security debt | Forgeable tokens in production | Trivial — startup guard | Critical |
| Unused Prisma scaffold | Dead code / poor abstraction | Misleads future readers (human or agent) about where data lives | Low — remove or actually adopt | High |
| Config/reality LLM provider mismatch | Poor abstraction | Config changes silently do nothing | Low-Medium — route real call through config | High |
| Two disconnected auth systems | Poor abstraction | Inconsistent identity state | Medium — resolved by Integration Strategy Decision 1 | High |
| Unbounded prompt context | Scalability debt | Cost/latency grows unpredictably, eventual context overflow | Medium — add budget + recency cutoff | Medium |
| Silent LLM-failure fallback | Observability debt | Masks real incidents | Low — log + surface error state to client | Medium |
| No caching layer | Performance debt | Redundant Cognee calls every turn | Medium | Medium |
| Thin test coverage | Quality debt | Regressions in auth/memory go undetected | Medium-High — needs deliberate investment | Medium |

## Sequencing (respecting "never rewrite everything")

1. Security items first, always — they're also the cheapest to fix and the most expensive to leave.
2. Prisma removal/adoption decision — cheap, unblocks clarity for everything else.
3. LLM provider config alignment — do this alongside the credential fix since it's the same file.
4. Auth unification — depends on the Integration Strategy decision being confirmed with you first, not something to build speculatively.
5. Prompt budget, caching, observability, tests — ongoing hardening, no urgency to rush, but don't defer indefinitely either.
