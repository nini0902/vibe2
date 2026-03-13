<!--
Sync Impact Report
- Version change: template-placeholder -> 1.0.0
- Modified principles:
	- principle-slot-1 -> I. 繁體中文優先
	- principle-slot-2 -> II. 最小可行與可維護
	- principle-slot-3 -> III. 非必要不得新增 Markdown 記錄
	- principle-slot-4 -> IV. Git 階段檢查與關鍵節點提交
	- principle-slot-5 -> V. TDD 必須執行
	- (new) -> VI. Implement 必須同步更新 tasks.md 勾選
	- (new) -> VII. Implement 不得刪除或覆蓋規格文件
	- (new) -> VIII. 網站專案預設靜態前端與 GitHub Pages
- Added sections:
	- 開發與交付約束
	- 實作流程與品質關卡
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/constitution-template.md
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/ (directory not found; no command markdown to update)
- Deferred TODOs:
	- TODO(RATIFICATION_DATE): 缺少可驗證的首次批准日期，待專案維護者補填。
-->

# vibe2 專案憲章

## Core Principles

### I. 繁體中文優先
規格文件、計畫文件、任務文件與 agent 回覆 MUST 使用繁體中文撰寫；若引用外部英文術語，
MUST 以繁體中文補充語意說明，避免關鍵需求被誤讀。
理由：統一語言可降低溝通成本，確保需求、驗收與交付一致。

### II. 最小可行與可維護
所有實作 MUST 以最小可行方案（MVP）優先，先滿足當前需求再擴充；未被需求明確要求之
抽象層、框架封裝或預先優化 SHOULD 避免。
理由：過度設計會增加維護負擔與交付風險。

### III. 非必要不得新增 Markdown 記錄
除非使用者明確要求，實作過程 MUST NOT 新增僅用於「變更紀錄、工作總結、進度報告」的
Markdown 文件。必要資訊應整合於既有規格、計畫或任務文件。
理由：避免文件碎片化與資訊重複。

### IV. Git 階段檢查與關鍵節點提交
每個階段開始與完成前 MUST 執行 git 狀態檢查（至少 `git status`）；在規格確認、計畫完成、
任務分解完成與主要實作里程碑 MUST 進行關鍵節點提交或可追蹤檢查點。
理由：確保變更可追溯、可回溯，降低協作衝突。

### V. TDD 必須執行
功能實作 MUST 採用 TDD：先寫測試、確認失敗、再實作使其通過，最後重構；不得以「先寫完
功能再補測試」取代。
理由：TDD 可在早期鎖定需求邊界並降低回歸風險。

### VI. Implement 必須同步更新 tasks.md 勾選
在 implement 階段，每完成一個任務 MUST 立即更新 `tasks.md` 對應勾選狀態，且提交前
MUST 確認任務狀態與實際程式碼一致。
理由：任務狀態是交付進度與驗收範圍的單一事實來源。

### VII. Implement 不得刪除或覆蓋規格文件
implement 階段 MUST 保護 spec/plan/tasks 與相關設計文件，不得刪除、清空或以模板覆蓋既有
內容；若工具流程可能覆寫，MUST 先採取保護措施（例如檔案存在檢查、差異確認）。
理由：防止需求來源遺失，避免實作偏離已核准規格。

### VIII. 網站專案預設靜態前端與 GitHub Pages
若專案類型為網站且使用者未另行指定，技術選型 MUST 預設為前端靜態網站架構，部署目標
MUST 優先支援 GitHub Pages。
理由：降低部署複雜度並提高可維運性。

## 開發與交付約束

- 流程輸出文件以既有模板為主，禁止無目的擴散。
- 任何偏離 MVP 或 TDD 的決策 MUST 在計畫文件記錄理由與替代方案。
- 若任一原則無法滿足，MUST 先取得使用者同意再繼續執行。

## 實作流程與品質關卡

1. Spec 階段：確認需求以繁體中文完整表述，並完成 git 狀態檢查。
2. Plan 階段：完成憲章檢查清單，確認 MVP、TDD、Git 檢查點與文件保護策略。
3. Tasks 階段：任務必須可驗證、可勾選，且測試任務先於實作任務。
4. Implement 階段：依 TDD 執行，完成即時勾選 `tasks.md`，並持續保護規格文件。
5. 里程碑關卡：每個關鍵節點完成後執行 git 狀態檢查與提交/檢查點標記。

## Governance

- 憲章優先級高於一般實作慣例；衝突時以本憲章為準。
- 修訂程序：提出修訂內容與影響範圍，檢查對 plan/spec/tasks 模板的一致性，經維護者核准後
	合併。
- 版本政策採語意化版本：
	- MAJOR：刪除或重定義既有原則、造成治理不相容。
	- MINOR：新增原則或新增強制章節。
	- PATCH：文字釐清、措辭修正、非語義變更。
- 合規審查：每次 `/speckit.plan`、`/speckit.tasks`、`/speckit.implement` 前後都 MUST 重新
	檢查本憲章條款。

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): 待確認首次批准日期 | **Last Amended**: 2026-03-13
