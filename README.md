# 沒有名字的病 · The Unnamed Disease

> **1854 年倫敦歷史懸疑偵探遊戲，開發中。** 「沒有名字」是指尚未釐清的致病原因，**不是**宣稱當時的人不知道「霍亂」這個病名。

本專案隸屬於一個正在規劃的跨領域歷史懸疑冒險系列。每篇先讓玩家投入角色、案件與困境，從調查中理解證據、不確定性與歷史，而不是先上科學課。

## 立即試玩（第一案・第一段，約 5 分鐘）

需求：Node 22.12+、24 或 26+（與 Vite 8／Vitest 5 一致）、pnpm。

```bash
pnpm install
pnpm dev          # 開發模式，瀏覽器開 http://localhost:5173
pnpm build && pnpm preview   # 以正式建置試玩
pnpm test         # 推理判定單元測試（Vitest）
pnpm e2e          # 真實 Chromium 走完整流程（Playwright，桌面＋手機尺寸）
```

技術：Vite + TypeScript，原生 DOM／SVG／CSS（決策見 [D007](docs/DECISIONS.md)）。遊戲內容與史料出處集中在 [`src/content/case01.ts`](src/content/case01.ts)，推理判定在 [`src/logic/infer.ts`](src/logic/infer.ts)。

## 現階段方向（已確認）

- **A：2D 定點調查、證據組合與真推理優先**；通過實際試玩，才擴充 **C：人物／鏡頭／場景演出**。
- 第一案暫定〈沒有染病的人〉：1854 年 Broad Street 霍亂事件；從死亡紀錄、啤酒廠與不同水源的矛盾開始。
- 玩家是**虛構的地方紀錄助手**，不取代歷史人物的發現。
- Day 1：4–6 分鐘真正可操作的最小案件；四天衝刺目標：15–20 分鐘真正可遊玩的版本；具體運行／分享形式由 Opus 決定。
- Opus 擔任 Game Director，有設計與工程取捨權；Sol/Codex 可協作。**Godot 或網頁技術由 Opus 5.5 自行評估並決定**；不預先指定引擎、語言或套件管理器。
- 重要史實有來源，戲劇重建與純虛構需標示；不可因懸疑效果扭曲史實。

## 開發進度與交接

**[GitHub Issue #1 — Game Director Handoff](https://github.com/nurockplayer/unnamed-disease/issues/1)** 是 Opus 5.5 每個實質里程碑的正式回報入口；[最新交接摘要](docs/HANDOFF.md) 隨進度同步更新。目前狀態：第一案第一段（紀錄室）可在本機瀏覽器遊玩，見上方「立即試玩」；尚無公開網址與人類盲測。

## 知識庫導覽

| 文件 | 用途 |
| --- | --- |
| [創作定位與已知決策](docs/PROJECT_CONTEXT.md) | 系列願景、首作定位、已決定／未決定的事 |
| [1854 年史實研究](docs/HISTORY_1854.md) | 事件、時間線、時代知識、容易寫錯的地方 |
| [證據與推理題庫](docs/EVIDENCE_REGISTER.md) | E01–E08、遊戲化方向、史實／虛構標籤 |
| [首案可玩切片](docs/CASE_01_PLAYABLE_SLICE.md) | 最小玩法、故事節奏、Day 1–4 驗收 |
| [史料與素材來源](docs/SOURCES_AND_ASSETS.md) | 一手史料、延伸閱讀、歷史圖像授權 |
| [Opus／Codex 交接](docs/HANDOFF.md) | 代理閱讀順序、工作分工、下一步 |
| [決策紀錄](docs/DECISIONS.md) | 確定事項與之後的變更理由 |

**文件狀態：設計背景／第一版研究，不等於已驗收、已實作或歷史學術定論。** 來源與遊戲文本須在製作中持續核對。日後若要改動方向，更新決策紀錄即可。

系列上層歷史構想亦保存在 [Notion：科學史冒險遊戲｜系列構想與跨 Session 討論紀錄](https://app.notion.com/p/3f9d7d8b390781ec8049f6533b1760b4)，但那裡包含已接受方向及尚未批准的早期候選，不能將所有候選視為決議。
