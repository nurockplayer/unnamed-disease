# Opus Game Director Handoff

更新：2026-10-25 JST　｜　狀態：**Case 01 全三段（約 15–20 分鐘）可玩；第二段已改為需讀證據的比較表（D010）；結案頁可送試玩回饋；線上版 https://nurockplayer.github.io/unnamed-disease/ ；尚未有人類盲測**。

## GitHub Handoff 唯一回報入口

**[Issue #1 — Game Director Handoff](https://github.com/nurockplayer/unnamed-disease/issues/1)**。Opus 5.5 開工後，應**自己**在此 Issue 留言，作為 Owner 可直接查看的正式進度與接續紀錄。不要只把結果寫在聊天或未提交的本機文件。

- **首次接手**：回報引擎／執行平台選型（可先標 provisional）、首個可玩的切片和分工。
- **每個有實質完成品的里程碑**：報告已完成範圍、commit/PR、怎麼玩、實際驗證結果與未完成項目。**不必逐 commit 留言**。
- **停止／轉交／重開 session 前**：留下可直接續做的 Handoff 並同步更新本文件；新 session 先讀 live GitHub Issue、main、此文件，再開始動工。
- **每次 merge 後**：驗證合併後的 main 和遊戲實際執行流程，再回報；單有 CI 綠燈不能標為 Gameplay PASS。
- **阻塞時**：如實報告問題與替代方案；能推進的工作繼續做。

建議每則留言保持簡短：`狀態、做到哪裡、版本／連結、如何玩、測試／試玩證據、風險與阻礙、接下來誰做什麼`。**尚未可玩就寫尚未可玩，不得捏造建置或測試結果。**

## 接手時先讀（約 5–10 分鐘）

1. [README](../README.md)：首作與文件導覽
2. [PROJECT_CONTEXT](PROJECT_CONTEXT.md)：Owner 已定方向、未定事項與授權範圍
3. [HISTORY_1854](HISTORY_1854.md)：角色能知道什麼，以及常見失實敘事
4. [EVIDENCE_REGISTER](EVIDENCE_REGISTER.md)：E01–E03 真推理、E04–E10 可擴充
5. [CASE_01_PLAYABLE_SLICE](CASE_01_PLAYABLE_SLICE.md)：Day 1–4 真正可驗收的目標
6. [SOURCES_AND_ASSETS](SOURCES_AND_ASSETS.md)：史料／素材權利
7. [DECISIONS](DECISIONS.md)：後續設計改動的理由

## 已接受的 Day 1 委託

**選型授權**：Opus 5.5 有權自行選擇 Godot 引擎或 Web 原生技術（Godot 也可能採 Web 匯出，技術與交付平台應分開評估），**不必等 Owner 逐項核准**。至少評估：四天可玩的交付風險、互動與畫面手感、素材製作、可在現有環境實際運行／測試的能力、玩家分享成本，以及未來由 A 升級 C 的彈性。可使用短 PoC，但別把一天耗在形式比較。將選擇和捨棄方案簡短記錄在 DECISIONS。

**做一款能玩的遊戲，不是寫下一份企劃書。**

- 建立**實際可執行／可遊玩**的版本。**Opus 5.5 自行選擇 Godot 或 Web 技術**，先檢查工具與發行／測試路徑，再定引擎；不受舊版 Web 優先提案約束。
- 一個定點紀錄室、E01／E02／E03 三張可反覆查看的線索。
- 玩家必須**自己將兩張證據組合**，才能提出「地點相近 ≠ 暴露來源相同」的第一個推論。
- 錯誤／不充分組合有合理提示，不會 softlock；NPC 因玩家推論而回應。
- 4–6 分鐘能看到小結局，也能重新開始。
- 在**所選技術的真實運行環境**走過完整遊戲流程（Godot 編輯器／匯出版本，或 Web 瀏覽器）；留下可重現方式、畫面證據與已知缺口。

**Day 2–4**：擴成 15–20 分鐘、加入第二層病例反例、找未參與製作的人試玩，再談 C 演出。

## Opus 帶隊方式

- Opus：Game Director，對敘事、玩法與架構有取捨權，不要每個低階決策都問 Owner。
- Sol/Codex：可並行負責實作與測試；分清各自檔案所有權，避免覆寫衝突。
- 獨立史料審查：核對時間順序、史實／重建／虛構標籤、真實人物公平描寫。
- 獨立 QA：不看設計文件，在實際運行環境走完充分／不充分推論兩條路。
- **Godot vs Web、具體引擎與工具鏈由 Opus 決定**；如果選 Web，套件管理器也由 Opus 自行選擇。保持 MVP，勿為一款 15 分鐘的推理小品先建通用引擎。
- 重要工程／遊戲取捨，寫入 [DECISIONS.md](DECISIONS.md)；每個階段更新此文件的實際狀態與下一步。
- 每次實質里程碑由 Opus 在 [GitHub Handoff Issue #1](https://github.com/nurockplayer/unnamed-disease/issues/1) 留正式交接留言（引用真實 commit、執行方式與驗證），並更新本文件。重開 session 前先讀最新 GitHub Issue/main/handoff。

## 完成與阻塞的判準

**僅當真的跑起來才可標為 Done**。沒有實際試玩過的功能請標 `implemented / unverified`；歷史未查清請標 `research pending`，非阻斷疑問可先使用虛構角色與低風險替代設計。

遇阻：寫下**已試過什麼、缺乏什麼權限／素材、哪個可行縮小版可以繼續**；不因非必要許可或豪華資產而停止核心推理開發。未取得實際部署權限時只承諾本機運作，不虛稱公開網址。

## 第一位驗收玩家應回答的四個問題

- 前三分鐘知道要調查什麼嗎？
- 發現啤酒廠這個「近處例外」後，有沒有主動想知道為什麼？
- 能自己說出 E02 + E03 的意義，而不只是點擊遊戲提示嗎？
- 想繼續玩下一段嗎？若不想，在哪個操作／情節失去興趣？

## 目前狀態（2026-10-25 更新）

- 線上試玩：https://nurockplayer.github.io/unnamed-disease/（`main` 每次 push 自動部署，見 `.github/workflows/pages.yml`）。本機：`pnpm install && pnpm dev`。
- 技術：Web（Vite + TypeScript，原生 DOM/SVG），D007。內容資料：`src/content/evidence.ts`（11 張證據，含史料註記）、`src/content/story.ts`（過場、章節、謎題、比較表）；判定：`src/logic/puzzles.ts`；狀態：`src/logic/state.ts`。
- 案件結構（D009）：
  1. 紀錄室 9/5：啤酒廠例外 → 「差別在於」取水來源（D008）。
  2. Broad Street 9/6：濟貧院、雷管工廠、咖啡館 → 玩家自己填 4×4 比較表，選出唯一能分開死多／死少的一欄（街泵水）；街泵前鄰居的反例 → 說出推論的限度。
  3. 紀錄室 9/12：Hampstead 寡婦（水會移動）→ 依逐日統計判斷「是拆把手結束了疫情嗎？」（只接受審慎答案）。
  - 結案頁：五步推理鏈、被排除的選項、黑爾先生依「說過頭」次數的三種評語、史實與虛構。
- 測試：Vitest 26（窮舉每題所有證據 × 選項組合，成立組合固定、其餘都有回饋；三段流程；存檔相容）；Playwright 18（桌面＋Pixel 7：結案頁試玩回饋、全案流程含每題至少一次錯誤、不 softlock、重新整理續玩、鍵盤／焦點／Tab 迴圈、手機無橫向捲動）。`E2E_BASE_URL=… pnpm e2e` 可直接驗證線上版。
- 審查：兩次獨立史實審查（數字、日期、頁碼皆核對 Snow 1855；修正已套用）；Codex 程式審查（PR 上自動進行）；AI 盲測五輪（不讀設計與原始碼；2026-10-25 基準報告：五題中四題可憑 Snow 故事猜中）；ChatGPT（oracle-ego）審查 PR #5、#6。**仍無人類盲測。**
- 已知缺口：場景是向量示意畫、無音效；第三段答案對熟悉 Snow 故事的人仍偏好猜，鄰居題與拆把手題的正解都是唯一「最謹慎」的長句；第二段仍可逐列硬試（約 64 次，D010 接受）；主角目前會比 Snow 先提出水源假說（史實稽核 F6，待改）；E06b／E12 是時間上提前的戲劇安排（已在史料註記標明）。
- 下一步：① Owner 依[人類盲測指南](PLAYTEST.md)找 1–2 位不熟 Snow 的人試玩，結案頁「複製回饋」或「在 GitHub 回報」；② DeepSeek（herdr `ud-ds-1`）做 Case 01 polish：主角改為替 Snow 查證的登記處助手（D011）、其餘史實稽核修正、第三段選項語氣對稱、盲測發現的 UX／無障礙 bug；③ 之後才考慮 C 演出（轉場、鏡頭、音效）。

**只有第一款已有穩定可玩版本，才考慮第二款《雲層之後》；這不是拒絕並行研究，而是保護製作焦點。**
