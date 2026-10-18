export type EvidenceId = 'E01' | 'E02' | 'E03' | 'E08';
/** 推理板上「兩群人的差別在於＿＿」的選項 */
export type ClaimId = 'air' | 'place' | 'job' | 'beer' | 'water' | 'luck';

/** 史實／重建／虛構標記，對應 docs/PROJECT_CONTEXT.md 的標示規則 */
export type ProvenanceKind = 'HISTORICAL_RECORD' | 'RECONSTRUCTION' | 'FICTION' | 'DISPUTED';

export interface Provenance {
  kind: ProvenanceKind;
  note: string;
  source?: string;
}

export interface Evidence {
  id: EvidenceId;
  /** 桌上物件名稱 */
  object: string;
  title: string;
  /** 文件本文（每段一個元素） */
  body: string[];
  /** 主角讀完後的心得，一句話 */
  takeaway: string;
  provenance: Provenance[];
}

export interface Claim {
  id: ClaimId;
  /** 推理板上的短選項 */
  text: string;
}

export type Verdict = 'solved' | 'partial' | 'ruledOut' | 'competing' | 'overreach' | 'insufficient';

export interface Response {
  verdict: Verdict;
  lines: string[];
}

export interface Attempt {
  evidence: [EvidenceId, EvidenceId];
  claim: ClaimId;
  verdict: Verdict;
}

export type Phase = 'title' | 'intro' | 'desk' | 'ending';

export interface State {
  phase: Phase;
  introStep: number;
  /** 依照發現順序 */
  seen: EvidenceId[];
  /** 正在閱讀的證據 */
  reading: EvidenceId | null;
  boardOpen: boolean;
  slots: [EvidenceId | null, EvidenceId | null];
  claim: ClaimId | null;
  attempts: Attempt[];
  /** NPC 最新回應；null 時顯示一般對話 */
  reply: Response | null;
  flags: { anomaly: boolean; windowSeen: boolean };
  showSources: boolean;
  /** 桌面上按過一次「重新開始」，等待第二次確認 */
  confirmRestart: boolean;
}
