import { describe, expect, it } from 'vitest';
import { CLAIM_ORDER, ENDING, EVIDENCE, EVIDENCE_ORDER, INTRO } from '../src/content/case01';
import { evaluate } from '../src/logic/infer';
import { initialState, reduce, type Action } from '../src/logic/state';
import type { State } from '../src/logic/types';

const run = (actions: Action[], s: State = initialState()) => actions.reduce(reduce, s);
const toDesk = () => run([{ type: 'start' }, { type: 'skipIntro' }]);
const readAll = (s: State) => run(EVIDENCE_ORDER.map((id) => ({ type: 'read', id }) as Action), s);

describe('evaluate', () => {
  it('only E02 + E03 with the water claim solves the case', () => {
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
    expect(solved).toEqual(['E02+E03:water']);
  });

  it('E01 + E02 is a valid but insufficient observation', () => {
    expect(evaluate('E01', 'E02', 'anomaly').verdict).toBe('partial');
  });

  it('beer and proven claims are always overreach, even with the right evidence', () => {
    expect(evaluate('E02', 'E03', 'beer').verdict).toBe('overreach');
    expect(evaluate('E02', 'E03', 'proven').verdict).toBe('overreach');
  });

  it('air claim with the brewery letter is challenged by that letter', () => {
    expect(evaluate('E01', 'E02', 'air').lines.join('')).toContain('啤酒廠');
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
        { type: 'chooseClaim', id: 'anomaly' },
        { type: 'submit' },
      ],
      s,
    );
    expect(s.phase).toBe('desk');
    expect(s.flags.anomaly).toBe(true);
    expect(s.reply?.verdict).toBe('partial');

    s = run(
      [
        { type: 'clearSlot', index: 0 },
        { type: 'toggleSlot', id: 'E03' },
        { type: 'chooseClaim', id: 'water' },
        { type: 'submit' },
      ],
      s,
    );
    expect(s.phase).toBe('ending');
    expect(s.attempts.map((a) => a.verdict)).toEqual(['partial', 'solved']);

    for (let i = 0; i < ENDING.length + 3; i++) s = reduce(s, { type: 'advance' });
    expect(s.introStep).toBe(ENDING.length); // 停在總結頁
    expect(reduce(s, { type: 'restart' })).toEqual(initialState());
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
