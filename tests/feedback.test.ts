import { describe, expect, it } from 'vitest';
import { buildFeedbackReport, buildPlaytestIssueUrl, FEEDBACK_QUESTIONS } from '../src/logic/feedback';
import { initialState } from '../src/logic/state';
import type { State } from '../src/logic/types';

describe('試玩回饋', () => {
  const finished: State = {
    ...initialState(),
    playMs: 18 * 60_000,
    wrongSubmits: { table: 3 },
    attempts: [
      { puzzle: 'table', evidence: [], option: null, verdict: 'wrong' },
      { puzzle: 'table', evidence: [], option: null, verdict: 'solved' },
    ] as unknown as State['attempts'],
  };

  it('報告含版本、時間、每題錯誤次數與四個問題', () => {
    const text = buildFeedbackReport(finished, { [FEEDBACK_QUESTIONS[0]]: '知道' }, 'abc1234');
    expect(text).toContain('版本／日期：abc1234');
    expect(text).toContain('約 18 分鐘');
    expect(text).toMatch(/：3 次/);
    expect(text).toMatch(/：0 次（不同組合）/);
    for (const q of FEEDBACK_QUESTIONS) expect(text).toContain(q);
    expect(text).toContain('A：知道');
    expect(text).toContain('A：（未填）');
  });

  it('舊存檔沒有時間欄位時不出錯', () => {
    expect(buildFeedbackReport(initialState(), {}, '')).toContain('未記錄');
  });

  it('GitHub 網址長度不超過 6000 字元', () => {
    const url = buildPlaytestIssueUrl('長'.repeat(10_000));
    expect(url.length).toBeLessThanOrEqual(6000);
    expect(decodeURIComponent(url)).toContain('已截短');
  });
});
