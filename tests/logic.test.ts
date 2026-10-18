import { describe, expect, it } from 'vitest';
import { CLAIM_ORDER, ENDING, EVIDENCE, EVIDENCE_ORDER, INTRO } from '../src/content/case01';
import { evaluate } from '../src/logic/infer';
import { initialState, reduce, type Action } from '../src/logic/state';
import type { State } from '../src/logic/types';

const run = (actions: Action[], s: State = initialState()) => actions.reduce(reduce, s);
const toDesk = () => run([{ type: 'start' }, { type: 'skipIntro' }]);
const readAll = (s: State) => run(EVIDENCE_ORDER.map((id) => ({ type: 'read', id }) as Action), s);

describe('evaluate', () => {
  it('only water + the drinking-water note + evidence the brewery was spared solves the case', () => {
    const solved: string[] = [];
    for (let i = 0; i < EVIDENCE_ORDER.length; i++)
      for (let j = i + 1; j < EVIDENCE_ORDER.length; j++)
        for (const c of CLAIM_ORDER) {
          const a = EVIDENCE_ORDER[i];
          const b = EVIDENCE_ORDER[j];
          const r1 = evaluate(a, b, c);
          const r2 = evaluate(b, a, c);
          expect(r1).toEqual(r2); // 順序不影響判定
          if (r1.verdict === 'solved') solved.push(`${a}+${b}:${c}`);
          else expect(r1.lines.length).toBeGreaterThan(0); // 每個非成功組合都有具體回饋
        }
    expect(solved).toEqual(['E01+E03:water', 'E02+E03:water']);
  });

  it('E01 + E02 is a valid observation that still lacks the water evidence', () => {
    const r = evaluate('E01', 'E02', 'water');
    expect(r.verdict).toBe('partial');
    expect(r.lines.join('')).toContain('哪一份寫了他們喝什麼');
  });

  it('beer is always overreach, even with the right evidence', () => {
    for (const [a, b] of [['E02', 'E03'], ['E01', 'E03'], ['E01', 'E02']] as const)
      expect(evaluate(a, b, 'beer').verdict).toBe('overreach');
  });

  it('air and place are ruled out once a spared group is on the board', () => {
    expect(evaluate('E01', 'E02', 'air').verdict).toBe('ruledOut');
    expect(evaluate('E02', 'E08', 'place').verdict).toBe('ruledOut');
    expect(evaluate('E03', 'E08', 'air').verdict).toBe('competing');
  });

  it('trade is refuted by the percussion-cap worker in the register', () => {
    expect(evaluate('E01', 'E03', 'job').verdict).toBe('ruledOut');
    expect(evaluate('E01', 'E03', 'job').lines.join('')).toContain('雷管工廠');
  });

  it('water feedback never mentions water evidence the player did not pick', () => {
    const r = evaluate('E01', 'E08', 'water');
    expect(r.verdict).toBe('insufficient');
    expect(r.lines.join('')).not.toContain('他們用別的水');
  });
});

describe('game flow', () => {
  it('intro advances into the desk', () => {
    let s = run([{ type: 'start' }]);
    for (let i = 0; i < INTRO.length; i++) s = reduce(s, { type: 'advance' });
    expect(s.phase).toBe('desk');
  });

  it('reading every item never ends the case on its own', () => {
    const s = readAll(toDesk());
    expect(s.seen).toEqual(EVIDENCE_ORDER);
    expect(s.phase).toBe('desk');
  });

  it('cannot place unseen evidence or submit an incomplete board', () => {
    let s = run([{ type: 'openBoard' }, { type: 'toggleSlot', id: 'E02' }], toDesk());
    expect(s.slots).toEqual([null, null]);
    s = run([{ type: 'read', id: 'E02' }, { type: 'pin', id: 'E02' }, { type: 'chooseClaim', id: 'water' }, { type: 'submit' }], s);
    expect(s.attempts).toHaveLength(0);
    expect(s.boardOpen).toBe(true);
  });

  it('wrong attempts keep the player on the desk, then the right one reaches the ending', () => {
    let s = readAll(toDesk());
    s = run(
      [
        { type: 'openBoard' },
        { type: 'toggleSlot', id: 'E01' },
        { type: 'toggleSlot', id: 'E02' },
        { type: 'chooseClaim', id: 'water' },
        { type: 'submit' },
      ],
      s,
    );
    expect(s.phase).toBe('desk');
    expect(s.flags.anomaly).toBe(true);
    expect(s.reply?.verdict).toBe('partial');

    s = run([{ type: 'clearSlot', index: 0 }, { type: 'toggleSlot', id: 'E03' }, { type: 'submit' }], s);
    expect(s.phase).toBe('ending');
    expect(s.attempts.map((a) => a.verdict)).toEqual(['partial', 'solved']);

    for (let i = 0; i < ENDING.length + 3; i++) s = reduce(s, { type: 'advance' });
    expect(s.introStep).toBe(ENDING.length); // 停在總結頁
    expect(reduce(s, { type: 'restart' })).toEqual(initialState());
  });

  it('resubmitting the same combination is not counted twice, and changing a choice clears stale feedback', () => {
    let s = run(
      [
        { type: 'toggleSlot', id: 'E01' },
        { type: 'toggleSlot', id: 'E02' },
        { type: 'chooseClaim', id: 'air' },
        { type: 'submit' },
        { type: 'submit' },
      ],
      readAll(toDesk()),
    );
    expect(s.attempts).toHaveLength(1);
    expect(s.reply?.verdict).toBe('ruledOut');
    s = reduce(s, { type: 'chooseClaim', id: 'water' });
    expect(s.reply).toBeNull();
  });

  it('restart on the desk needs a second press, and anything else cancels it', () => {
    let s = reduce(toDesk(), { type: 'restart' });
    expect(s.phase).toBe('desk');
    expect(s.confirmRestart).toBe(true);
    s = reduce(s, { type: 'talk' });
    expect(s.confirmRestart).toBe(false);
    s = run([{ type: 'restart' }, { type: 'restart' }], s);
    expect(s).toEqual(initialState());
  });

  it('a third evidence replaces the second slot', () => {
    let s = readAll(toDesk());
    s = run(
      [
        { type: 'toggleSlot', id: 'E01' },
        { type: 'toggleSlot', id: 'E02' },
        { type: 'toggleSlot', id: 'E03' },
      ],
      s,
    );
    expect(s.slots).toEqual(['E01', 'E03']);
  });
});

describe('content', () => {
  it('every evidence card cites at least one historical source and labels fiction', () => {
    for (const e of Object.values(EVIDENCE)) {
      expect(e.provenance.length).toBeGreaterThan(0);
      expect(e.provenance.some((p) => p.kind === 'FICTION' || p.kind === 'RECONSTRUCTION')).toBe(true);
    }
  });
});
