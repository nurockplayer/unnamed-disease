import { CHAPTERS, PUZZLES, SEQUENCES, TABLE_COLUMNS, TABLE_ROWS } from '../content/story';
import { evaluate } from './puzzles';
import type { ChapterId, ColumnId, EvidenceId, RowId, SequenceId, State } from './types';

export type Action =
  | { type: 'start' }
  | { type: 'advance' }
  | { type: 'skip' }
  | { type: 'read'; id: EvidenceId }
  | { type: 'closeReading' }
  | { type: 'look'; id: string }
  | { type: 'talk' }
  | { type: 'openBoard' }
  | { type: 'closeBoard' }
  | { type: 'toggleSlot'; id: EvidenceId }
  | { type: 'pin'; id: EvidenceId }
  | { type: 'clearSlot'; index: 0 | 1 }
  | { type: 'chooseOption'; id: string }
  | { type: 'cycleCell'; row: RowId; col: ColumnId }
  | { type: 'submit' }
  | { type: 'toggleSources' }
  | { type: 'restart' };

function emptyCells(): State['cells'] {
  const row = () => ({ zone: null, factory: null, crowd: null, pump: null });
  return { brewery: row(), workhouse: row(), capworks: row(), coffee: row() };
}

export function initialState(): State {
  return {
    phase: 'title',
    sequence: 'intro',
    step: 0,
    chapter: 1,
    puzzle: 'brewery',
    seen: [],
    reading: null,
    boardOpen: false,
    slots: [null, null],
    option: null,
    cells: emptyCells(),
    attempts: [],
    reply: null,
    look: null,
    anomaly: false,
    showSources: false,
    confirmRestart: false,
  };
}

/** 推理板需要幾格證據 */
export function slotCount(s: State): 0 | 1 | 2 {
  const kind = PUZZLES[s.puzzle].kind;
  return kind === 'pair' ? 2 : kind === 'single' ? 1 : 0;
}

/** 比較表某一列是否已調查（證據讀過） */
export function rowKnown(s: State, row: RowId): boolean {
  const def = TABLE_ROWS.find((r) => r.id === row)!;
  return def.needs.some((set) => set.every((id) => s.seen.includes(id)));
}

/** 比較表 16 格都填了（不一定填對）才顯示結果、才准選欄 */
export function tableFilled(s: State): boolean {
  return TABLE_ROWS.every((r) => rowKnown(s, r.id) && TABLE_COLUMNS.every((c) => s.cells[r.id][c.id] !== null));
}

export function canSubmit(s: State): boolean {
  if (s.option === null) return false;
  const kind = PUZZLES[s.puzzle].kind;
  if (kind === 'table') return tableFilled(s);
  const n = slotCount(s);
  return s.slots.slice(0, n).every((x) => x !== null);
}

/** 本題推理失敗（未成立）的次數 */
export function failures(s: State): number {
  return s.attempts.filter((t) => t.puzzle === s.puzzle && t.verdict !== 'solved' && t.verdict !== 'partial').length;
}

export function reduce(s: State, a: Action): State {
  // 「重新開始」需要連按兩次；做了別的事就取消確認
  if (s.confirmRestart && a.type !== 'restart') s = { ...s, confirmRestart: false };
  return step(s, a);
}

function enterSequence(s: State, id: SequenceId): State {
  return { ...s, phase: 'sequence', sequence: id, step: 0, boardOpen: false, reading: null, look: null };
}

/** 過場結束後要進入的章節 */
const AFTER: Record<SequenceId, ChapterId | 'summary'> = { intro: 1, to2: 2, to3: 3, finale: 'summary' };

function afterSequence(s: State): State {
  const next = AFTER[s.sequence];
  if (next === 'summary') return { ...s, phase: 'summary', step: 0 };
  return {
    ...s,
    phase: 'scene',
    step: 0,
    chapter: next,
    puzzle: CHAPTERS[next].puzzles[0],
    reply: null,
    slots: [null, null],
    option: null,
    look: null,
  };
}

function resetBoard(s: State): State {
  return { ...s, slots: [null, null], option: null };
}

function step(s: State, a: Action): State {
  switch (a.type) {
    case 'start':
      return enterSequence(initialState(), 'intro');

    case 'advance':
      if (s.phase !== 'sequence') return s;
      return s.step + 1 >= SEQUENCES[s.sequence].length ? afterSequence(s) : { ...s, step: s.step + 1 };

    case 'skip':
      return s.phase === 'sequence' ? afterSequence(s) : s;

    case 'read':
      if (s.phase !== 'scene') return s;
      return {
        ...s,
        reading: a.id,
        boardOpen: false,
        reply: null,
        look: null,
        seen: s.seen.includes(a.id) ? s.seen : [...s.seen, a.id],
      };

    case 'closeReading':
      return { ...s, reading: null };

    case 'look':
      return s.phase === 'scene' ? { ...s, look: a.id, reply: null, reading: null } : s;

    case 'talk':
      return { ...s, reply: null, reading: null, look: null };

    case 'openBoard':
      return s.phase === 'scene' ? { ...s, boardOpen: true, reading: null } : s;

    case 'closeBoard':
      return { ...s, boardOpen: false };

    case 'toggleSlot': {
      const n = slotCount(s);
      if (!s.seen.includes(a.id) || n === 0) return s;
      s = { ...s, reply: null }; // 換了選擇，舊回應就不再對應
      const [x, y] = s.slots;
      if (x === a.id) return { ...s, slots: [null, y] };
      if (y === a.id) return { ...s, slots: [x, null] };
      if (x === null || n === 1) return { ...s, slots: [a.id, y] };
      if (y === null) return { ...s, slots: [x, a.id] };
      // 兩格都滿：替換第二格
      return { ...s, slots: [x, a.id] };
    }

    case 'pin': {
      const placed = s.slots.includes(a.id) ? s : step(s, { type: 'toggleSlot', id: a.id });
      return { ...placed, reading: null, boardOpen: true };
    }

    case 'clearSlot': {
      const slots: State['slots'] = [...s.slots];
      slots[a.index] = null;
      return { ...s, slots, reply: null };
    }

    case 'chooseOption': {
      // 比較表填完之前（或又被清空時）不能選欄；已選的可取消
      if (PUZZLES[s.puzzle].kind === 'table' && !tableFilled(s) && s.option !== a.id) return s;
      return { ...s, reply: null, option: s.option === a.id ? null : a.id };
    }

    case 'cycleCell': {
      if (!rowKnown(s, a.row)) return s;
      const v = s.cells[a.row][a.col];
      // 空 → 是 → 否 → 空
      const next = v === null ? true : v ? false : null;
      return { ...s, reply: null, cells: { ...s.cells, [a.row]: { ...s.cells[a.row], [a.col]: next } } };
    }

    case 'submit': {
      if (!canSubmit(s)) return s;
      const evidence = s.slots.slice(0, slotCount(s)) as EvidenceId[];
      const option = s.option!;
      const reply = evaluate({ puzzle: s.puzzle, evidence, option, cells: s.cells });
      const key = (e: EvidenceId[]) => [...e].sort().join('+');
      const repeat =
        PUZZLES[s.puzzle].kind !== 'table' &&
        s.attempts.some((t) => t.puzzle === s.puzzle && t.option === option && key(t.evidence) === key(evidence));
      // 同一組合重送不重複計次
      const attempts = repeat
        ? s.attempts
        : [...s.attempts, { puzzle: s.puzzle, evidence, option, verdict: reply.verdict }];
      const anomaly = s.anomaly || (s.puzzle === 'brewery' && reply.verdict === 'partial');

      if (reply.verdict !== 'solved') return { ...s, attempts, reply, anomaly };

      // 成立：本段還有下一題就留在推理板，否則進過場
      const chapter = CHAPTERS[s.chapter];
      const nextPuzzle = chapter.puzzles[chapter.puzzles.indexOf(s.puzzle) + 1];
      if (nextPuzzle) return resetBoard({ ...s, attempts, anomaly, reply, puzzle: nextPuzzle });
      return resetBoard(enterSequence({ ...s, attempts, anomaly, reply: null }, chapter.next));
    }

    case 'toggleSources':
      return { ...s, showSources: !s.showSources };

    case 'restart':
      if (s.phase === 'scene' && !s.confirmRestart) return { ...s, confirmRestart: true };
      return initialState();
  }
}
