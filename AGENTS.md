# Working guidance for AI development agents

This repository contains the **historical reference pack and MVP brief** for `The Unnamed Disease`, an 1854 London detective game. Before implementation, read `docs/HANDOFF.md`, `docs/PROJECT_CONTEXT.md`, `docs/HISTORY_1854.md`, `docs/EVIDENCE_REGISTER.md`, and `docs/CASE_01_PLAYABLE_SLICE.md`.

**Owner decision:** implement **A: point-and-click evidence investigation and actual player-made inferences** first; only later consider **C: enhanced cinematics/character animation**. Don't expand the 4-day prototype into a general-purpose game engine, city simulation, or RPG.

**Historical boundaries:** Never invent facts about real people, imply Snow first developed his water theory in 1854, present the 1855 published map as a 1854 prop, suggest beer prevents cholera, or claim that pump-handle removal instantly stopped the epidemic. Label historical facts vs. dramatized reconstructions vs. fiction; cite source IDs in `docs/SOURCES_AND_ASSETS.md`.

Opus is Game Director and may revise implementation details. Sol/Codex may implement in delegated areas. Prefer **pnpm (not npm)**. Keep a real browser-playable build, reproducible tests, a decision log, and concise next-action handoff. Update `docs/DECISIONS.md` and `docs/HANDOFF.md` when plans change.
