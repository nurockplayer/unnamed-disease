import { describe, expect, it } from 'vitest';
import { EVIDENCE } from '../src/content/evidence';
import { CHAPTERS, PUZZLES, SEQUENCES, TABLE_COLUMNS, TABLE_ROWS, haleTalk, tableTruth } from '../src/content/story';
import { evaluate } from '../src/logic/puzzles';
import { canSubmit, initialState, reduce, type Action } from '../src/logic/state';
import type { EvidenceId, PuzzleId, State } from '../src/logic/types';

const run = (actions: Action[], s: State = initialState()) => actions.reduce(reduce, s);
const ALL = Object.keys(EVIDENCE) as EvidenceId[];
const read = (ids: EvidenceId[]): Action[] => ids.map((id) => ({ type: 'read', id }) as Action);

/** 把比較表每一格點到正確答案（空 → 是 → 否） */
const fillTable = (): Action[] =>
  TABLE_ROWS.flatMap((r) =>
    TABLE_COLUMNS.flatMap((c) =>
      (r.facts[c.id] ? [1] : [1, 2]).map(() => ({ type: 'cycleCell', row: r.id, col: c.id }) as Action),
    ),
  );

/** 把某一題所有「證據組合 × 選項」都試一遍，回傳成立的組合 */
function solvedCombos(puzzle: PuzzleId): string[] {
  const p = PUZZLES[puzzle];
  const out: string[] = [];
  const n = p.kind === 'pair' ? 2 : p.kind === 'single' ? 1 : 0;
  const sets: EvidenceId[][] =
    n === 0 ? [[]] : n === 1 ? ALL.map((a) => [a]) : ALL.flatMap((a, i) => ALL.slice(i + 1).map((b) => [a, b]));
  for (const evidence of sets)
    for (const o of p.options) {
      const r = evaluate({ puzzle, evidence, option: o.id, cells: tableTruth() });
      if (n === 2) {
        // 順序不影響判定
        expect(evaluate({ puzzle, evidence: [...evidence].reverse(), option: o.id })).toEqual(r);
      }
      if (r.verdict === 'solved') out.push(`${evidence.join('+')}:${o.id}`);
      else expect(r.lines.length).toBeGreaterThan(0); // 每個未成立的組合都有具體回饋
    }
  return out;
}

describe('puzzle rules', () => {
  it('brewery: water + the notebook + evidence the brewery was spared', () => {
    expect(solvedCombos('brewery')).toEqual(['E01+E03:water', 'E02+E03:water']);
  });

  it('brewery: air/place ruled out, trade refuted by the cap-factory worker, beer is overreach', () => {
    const ev = (a: EvidenceId, b: EvidenceId, option: string) => evaluate({ puzzle: 'brewery', evidence: [a, b], option });
    expect(ev('E01', 'E02', 'water').verdict).toBe('partial');
    expect(ev('E01', 'E02', 'air').verdict).toBe('ruledOut');
    expect(ev('E01', 'E03', 'job').lines.join('')).toContain('雷管工廠');
    expect(ev('E02', 'E03', 'beer').verdict).toBe('overreach');
    expect(ev('E01', 'E08', 'water').lines.join('')).not.toContain('他們用別的水');
  });

  it('table: only the pump column with every cell right', () => {
    expect(solvedCombos('table')).toEqual([':pump']);
    const cells = tableTruth();
    cells.capworks.pump = false;
    cells.coffee.crowd = true;
    const r = evaluate({ puzzle: 'table', evidence: [], option: 'pump', cells });
    expect(r.verdict).toBe('insufficient');
    expect(r.reviewRow).toBe('capworks');
    expect(r.wrongCells).toBeUndefined();
    for (const col of ['zone', 'factory', 'crowd', 'deaths'])
      expect(evaluate({ puzzle: 'table', evidence: [], option: col, cells: tableTruth() }).verdict).toBe('ruledOut');
  });

  it('table data: the pump column is the only one that separates many deaths from few', () => {
    for (const col of ['zone', 'factory', 'crowd'] as const) {
      const separates = TABLE_ROWS.every((r) => r.facts[col] === r.many);
      expect(separates).toBe(false);
    }
    expect(TABLE_ROWS.every((r) => r.facts.pump === r.many)).toBe(true);
  });

  it('table: exhausts all 65,536 boolean grids × five choices; only one submission solves', () => {
    // Pin the evidence reading independently of tableTruth(), including the well/tubs distinction.
    expect(tableTruth()).toEqual({
      brewery: { zone: true, factory: true, crowd: true, pump: false },
      workhouse: { zone: true, factory: false, crowd: true, pump: false },
      capworks: { zone: true, factory: true, crowd: true, pump: true },
      coffee: { zone: true, factory: false, crowd: false, pump: true },
    });
    const positions = TABLE_ROWS.flatMap((r) => TABLE_COLUMNS.map((c) => [r.id, c.id] as const));
    const solved: string[] = [];
    let silentFailures = 0;
    let checks = 0;
    for (let mask = 0; mask < 2 ** positions.length; mask++) {
      const cells = tableTruth();
      positions.forEach(([r, c], bit) => { cells[r][c] = !!(mask & (1 << bit)); });
      for (const option of PUZZLES.table.options) {
        const reply = evaluate({ puzzle: 'table', evidence: [], option: option.id, cells });
        checks++;
        if (reply.verdict === 'solved') solved.push(`${JSON.stringify(cells)}:${option.id}`);
        else if (!reply.lines.length) silentFailures++;
      }
    }
    expect(checks).toBe(327_680);
    expect(solved).toEqual([`${JSON.stringify(tableTruth())}:pump`]);
    expect(silentFailures).toBe(0);
  });

  it('table: every single unknown cell blocks all five choices and still gives feedback', () => {
    for (const row of TABLE_ROWS) for (const col of TABLE_COLUMNS) {
      const cells: State['cells'] = tableTruth();
      cells[row.id][col.id] = null;
      for (const option of PUZZLES.table.options) {
        const reply = evaluate({ puzzle: 'table', evidence: [], option: option.id, cells });
        expect(reply.verdict).toBe('insufficient');
        expect(reply.reviewRow).toBe(row.id);
        expect(reply.lines.length).toBeGreaterThan(0);
      }
    }
    expect(evaluate({ puzzle: 'table', evidence: [], option: 'pump' }).verdict).toBe('insufficient');
  });

  it('table: different mistakes within the same row do not reveal the wrong boolean cells', () => {
    for (const row of TABLE_ROWS) {
      const replies = TABLE_COLUMNS.map((col) => {
        const cells = tableTruth();
        cells[row.id][col.id] = !cells[row.id][col.id];
        return evaluate({ puzzle: 'table', evidence: [], option: 'pump', cells });
      });
      for (const reply of replies) {
        expect(reply).toEqual(replies[0]);
        expect(reply.reviewRow).toBe(row.id);
        expect(reply.wrongCells).toBeUndefined();
      }
    }
  });

  it('table: the death-report decoy matches three rows but the workhouse refutes it', () => {
    expect(TABLE_ROWS.filter((r) => r.reportedDeaths === r.many).map((r) => r.id)).toEqual([
      'brewery', 'capworks', 'coffee',
    ]);
    const reply = evaluate({ puzzle: 'table', evidence: [], option: 'deaths', cells: tableTruth() });
    expect(reply.verdict).toBe('ruledOut');
    expect(reply.lines.join('')).toContain('535');
    expect(reply.lines.join('')).toContain('5 人');
    // Neither the original columns nor their inverse separates the observations.
    for (const col of TABLE_COLUMNS.filter((c) => c.id !== 'pump')) {
      expect(TABLE_ROWS.every((r) => r.facts[col.id] === !r.many)).toBe(false);
    }
  });

  it('neighbour: only the limited claim is accepted', () => {
    expect(solvedCombos('neighbour')).toEqual([':nothing']);
    expect(evaluate({ puzzle: 'neighbour', evidence: [], option: 'wrong' }).verdict).toBe('overreach');
  });

  it('hampstead: water needs both the weekly return and the note', () => {
    expect(solvedCombos('hampstead')).toEqual(['E06+E06b:water']);
    expect(evaluate({ puzzle: 'hampstead', evidence: ['E06b', 'E03'], option: 'water' }).verdict).toBe('partial');
  });

  it('handle: only the cautious judgment backed by the daily tally', () => {
    expect(solvedCombos('handle')).toEqual(['E12:prudent']);
    expect(evaluate({ puzzle: 'handle', evidence: ['E12'], option: 'ended' }).verdict).toBe('overreach');
    expect(evaluate({ puzzle: 'handle', evidence: ['E12'], option: 'useless' }).verdict).toBe('overreach');
  });
});

/** 從開始一路玩到某一段的場景 */
function playTo(chapter: 1 | 2 | 3): State {
  let s = run([{ type: 'start' }, { type: 'skip' }]);
  if (chapter === 1) return s;
  s = run(
    [
      ...read(['E01', 'E02', 'E03']),
      { type: 'toggleSlot', id: 'E02' },
      { type: 'toggleSlot', id: 'E03' },
      { type: 'chooseOption', id: 'water' },
      { type: 'submit' },
      { type: 'skip' },
    ],
    s,
  );
  if (chapter === 2) return s;
  return run(
    [
      ...read(['E04', 'E05', 'E09', 'E10']),
      ...fillTable(),
      { type: 'chooseOption', id: 'pump' },
      { type: 'submit' },
      { type: 'chooseOption', id: 'nothing' },
      { type: 'submit' },
      { type: 'skip' },
    ],
    s,
  );
}

describe('game flow', () => {
  it('intro advances beat by beat into chapter 1', () => {
    let s = run([{ type: 'start' }]);
    for (let i = 0; i < SEQUENCES.intro.length; i++) s = reduce(s, { type: 'advance' });
    expect(s.phase).toBe('scene');
    expect(s.chapter).toBe(1);
  });

  it('reading everything never solves a chapter by itself', () => {
    const s = run(read(CHAPTERS[1].evidence), playTo(1));
    expect(s.phase).toBe('scene');
    expect(s.attempts).toHaveLength(0);
  });

  it('chapter 1 → 2 → 3 → finale → summary, with the right puzzles in order', () => {
    const two = playTo(2);
    expect([two.phase, two.chapter, two.puzzle]).toEqual(['scene', 2, 'table']);
    const three = playTo(3);
    expect([three.phase, three.chapter, three.puzzle]).toEqual(['scene', 3, 'hampstead']);
    let s = run(
      [
        ...read(['E06', 'E06b', 'E12']),
        { type: 'toggleSlot', id: 'E06' },
        { type: 'toggleSlot', id: 'E06b' },
        { type: 'chooseOption', id: 'water' },
        { type: 'submit' },
      ],
      three,
    );
    expect(s.puzzle).toBe('handle');
    expect(s.reply?.verdict).toBe('solved'); // 黑爾先生先回應，再問下一題
    s = run([{ type: 'toggleSlot', id: 'E12' }, { type: 'chooseOption', id: 'prudent' }, { type: 'submit' }], s);
    expect([s.phase, s.sequence]).toEqual(['sequence', 'finale']);
    s = reduce(s, { type: 'skip' });
    expect(s.phase).toBe('summary');
    expect(s.attempts.filter((t) => t.verdict === 'solved').map((t) => t.puzzle)).toEqual([
      'brewery',
      'table',
      'neighbour',
      'hampstead',
      'handle',
    ]);
  });

  it('table rows stay locked until their places are investigated', () => {
    let s = playTo(2);
    s = reduce(s, { type: 'cycleCell', row: 'workhouse', col: 'pump' });
    expect(s.cells.workhouse.pump).toBeNull();
    s = run([...read(['E04', 'E05']), { type: 'cycleCell', row: 'workhouse', col: 'pump' }], s);
    expect(s.cells.workhouse.pump).toBe(true);
    s = reduce(s, { type: 'chooseOption', id: 'pump' });
    expect(canSubmit(s)).toBe(false); // 雷管工廠與咖啡館還沒調查
  });

  it('solving the table keeps the board open and moves to the neighbour', () => {
    const s = playTo(2);
    const t = run(
      [
        ...read(['E04', 'E05', 'E09', 'E10']),
        { type: 'openBoard' },
        ...fillTable(),
        { type: 'chooseOption', id: 'pump' },
        { type: 'submit' },
      ],
      s,
    );
    expect(t.boardOpen).toBe(true);
    expect(t.puzzle).toBe('neighbour');
    expect(t.reply?.verdict).toBe('solved');
    expect(t.option).toBeNull();
  });

  it('three failed table submissions unlock source-specific help; rereading preserves cells and retry solves', () => {
    let s = run([...read(['E04', 'E05', 'E09', 'E10']), ...fillTable(),
      { type: 'cycleCell', row: 'workhouse', col: 'pump' }, // false → unknown → true
      { type: 'cycleCell', row: 'workhouse', col: 'pump' },
      { type: 'chooseOption', id: 'pump' },
      { type: 'submit' }, { type: 'submit' }, { type: 'submit' },
    ], playTo(2));
    expect(s.attempts.filter((a) => a.puzzle === 'table')).toHaveLength(3);
    expect(s.puzzle).toBe('table');
    const hint = haleTalk('table', 4, 4, false, 3).join('');
    expect(hint).toContain('自家的井');
    expect(hint).toContain('535');
    const cells = structuredClone(s.cells);
    s = run([{ type: 'read', id: 'E05' }, { type: 'closeReading' }, { type: 'openBoard' }], s);
    expect(s.cells).toEqual(cells);
    s = run([
      { type: 'cycleCell', row: 'workhouse', col: 'pump' },
      { type: 'submit' },
    ], s);
    expect(s.puzzle).toBe('neighbour');
  });

  it('single-slot puzzles replace the slot instead of filling a second one', () => {
    let s = run(read(['E06', 'E12']), playTo(3));
    s = run(
      [
        { type: 'chooseOption', id: 'prudent' },
        { type: 'submit' }, // 還在 hampstead：先解它
      ],
      s,
    );
    s = run(
      [
        { type: 'read', id: 'E06b' },
        { type: 'toggleSlot', id: 'E06' },
        { type: 'toggleSlot', id: 'E06b' },
        { type: 'chooseOption', id: 'water' },
        { type: 'submit' },
        { type: 'toggleSlot', id: 'E06' },
        { type: 'toggleSlot', id: 'E12' },
      ],
      s,
    );
    expect(s.puzzle).toBe('handle');
    expect(s.slots).toEqual(['E12', null]);
  });

  it('resubmitting the same combination is not counted twice, and changing a choice clears stale feedback', () => {
    let s = run(
      [
        ...read(['E01', 'E02']),
        { type: 'toggleSlot', id: 'E01' },
        { type: 'toggleSlot', id: 'E02' },
        { type: 'chooseOption', id: 'air' },
        { type: 'submit' },
        { type: 'submit' },
      ],
      playTo(1),
    );
    expect(s.attempts).toHaveLength(1);
    s = reduce(s, { type: 'chooseOption', id: 'water' });
    expect(s.reply).toBeNull();
  });

  it('restart in a scene needs a second press, and anything else cancels it', () => {
    let s = reduce(playTo(1), { type: 'restart' });
    expect(s.confirmRestart).toBe(true);
    s = reduce(s, { type: 'talk' });
    expect(s.confirmRestart).toBe(false);
    expect(run([{ type: 'restart' }, { type: 'restart' }], s)).toEqual(initialState());
  });
});

describe('content', () => {
  it('every evidence card cites a source and labels what is invented', () => {
    for (const e of Object.values(EVIDENCE)) {
      expect(e.provenance.some((p) => p.source)).toBe(true);
      expect(e.provenance.some((p) => p.kind !== 'HISTORICAL_RECORD')).toBe(true);
    }
  });

  it('every chapter hotspot has an evidence card', () => {
    for (const c of Object.values(CHAPTERS)) for (const id of c.evidence) expect(EVIDENCE[id]).toBeDefined();
  });
});
