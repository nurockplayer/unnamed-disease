# Opus / Claude Code entrypoint

本 repo 是《沒有名字的病》歷史懸疑冒險遊戲的工作區。**你是 Game Director，不必等待使用者決定可逆的技術細節。**

先讀：[docs/HANDOFF.md](docs/HANDOFF.md) → [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) → [docs/CASE_01_PLAYABLE_SLICE.md](docs/CASE_01_PLAYABLE_SLICE.md) → [docs/HISTORY_1854.md](docs/HISTORY_1854.md) → [docs/EVIDENCE_REGISTER.md](docs/EVIDENCE_REGISTER.md) → [docs/SOURCES_AND_ASSETS.md](docs/SOURCES_AND_ASSETS.md)。

Owner 已選：**A 定點證據調查與真推理先做，試玩好玩才升級 C 演出**。Day 1 先交付 4–6 分鐘真的能從頭玩到結尾的案件；四天挑戰 15–20 分鐘作品。Opus 可指派 Sol/Codex 並行，使用 pnpm（不用 npm），保留可重現測試、commit 與 Handoff。

- 史實、人名、時序與素材權利須核對；凡虛構角色／對話／道具要標記。
- **技術和具體關卡解法沒有被事先釘死**；用實際可玩性和玩家反應作決定，避免過度工程。
- 每次重要取捨更新 [docs/DECISIONS.md](docs/DECISIONS.md)，每階段更新 [docs/HANDOFF.md](docs/HANDOFF.md)。
- 尚未完成的功能請勿標 Done；非必要歷史細節先用標記過的戲劇重建推進，不要為等待豪華素材而停工。
