export type EvidenceId =
  | 'E01'
  | 'E02'
  | 'E03'
  | 'E08'
  | 'E04'
  | 'E05'
  | 'E09'
  | 'E10'
  | 'E06'
  | 'E06b'
  | 'E12';

export type ChapterId = 1 | 2 | 3;
export type PuzzleId = 'brewery' | 'table' | 'neighbour' | 'hampstead' | 'handle';
export type SequenceId = 'intro' | 'to2' | 'to3' | 'finale';

/** 比較表的列與欄 */
export type RowId = 'brewery' | 'workhouse' | 'capworks' | 'coffee';
export type ColumnId = 'zone' | 'factory' | 'crowd' | 'pump';

/** 史實／重建／虛構標記，對應 docs/PROJECT_CONTEXT.md 的標示規則 */
export type ProvenanceKind = 'HISTORICAL_RECORD' | 'RECONSTRUCTION' | 'FICTION' | 'DISPUTED';

export interface Provenance {
  kind: ProvenanceKind;
  note: string;
  source?: string;
}

export interface Evidence {
  id: EvidenceId;
  /** 場景物件名稱 */
  object: string;
  title: string;
  /** 文件本文（每段一個元素） */
  body: string[];
  /** 主角讀完後的心得，一句話 */
  takeaway: string;
  provenance: Provenance[];
}

export interface Option {
  id: string;
  text: string;
}

export type Verdict = 'solved' | 'partial' | 'ruledOut' | 'competing' | 'overreach' | 'insufficient';

export interface Response {
  verdict: Verdict;
  lines: string[];
  /** 舊存檔回覆的逐格標記；新表格回覆使用 reviewRow，不公開逐格答案。 */
  wrongCells?: string[];
  /** 比較表只指向需重讀的一列，不逐格公開是／否答案。 */
  reviewRow?: RowId;
}

export interface Attempt {
  puzzle: PuzzleId;
  evidence: EvidenceId[];
  option: string;
  verdict: Verdict;
}

export interface Beat {
  speaker?: string;
  text: string;
}

export type Phase = 'title' | 'sequence' | 'scene' | 'summary';

export interface State {
  phase: Phase;
  sequence: SequenceId;
  step: number;
  chapter: ChapterId;
  puzzle: PuzzleId;
  /** 依照發現順序 */
  seen: EvidenceId[];
  /** 正在閱讀的證據 */
  reading: EvidenceId | null;
  boardOpen: boolean;
  slots: [EvidenceId | null, EvidenceId | null];
  option: string | null;
  /** 比較表：玩家依證據填的格子 */
  cells: Record<RowId, Record<ColumnId, boolean | null>>;
  attempts: Attempt[];
  /** NPC 最新回應；null 時顯示一般對話 */
  reply: Response | null;
  /** 正在看的場景細節（窗外、街泵…） */
  look: string | null;
  anomaly: boolean;
  showSources: boolean;
  /** 場景中按過一次「重新開始」，等待第二次確認 */
  confirmRestart: boolean;
}
