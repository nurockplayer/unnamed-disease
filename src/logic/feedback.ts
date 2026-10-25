import { PUZZLES } from '../content/story';
import type { PuzzleId, State } from './types';

export const FEEDBACK_QUESTIONS = [
  '前三分鐘知道要調查什麼嗎？',
  '發現啤酒廠這個「近處例外」後，有沒有主動想知道為什麼？',
  '能自己說出 E02 + E03 的意義，而不只是點擊遊戲提示嗎？',
  '想繼續玩下一段嗎？若不想，在哪個操作／情節失去興趣？',
] as const;

export type FeedbackAnswers = Partial<Record<(typeof FEEDBACK_QUESTIONS)[number], string>>;

const PUZZLE_IDS = Object.keys(PUZZLES) as PuzzleId[];

function durationLabel(state: State): string {
  const start = state.chapterStartedAt?.[1];
  const end = state.finishedAt;
  if (typeof start !== 'number' || typeof end !== 'number') return '未記錄';
  const minutes = Math.max(0, Math.round((end - start) / 60_000));
  return `約 ${minutes} 分鐘`;
}

function attemptSummary(state: State): string[] {
  return PUZZLE_IDS.map((puzzle) => {
    const entries = state.attempts.filter((attempt) => attempt.puzzle === puzzle);
    const solvedAt = entries.findIndex((attempt) => attempt.verdict === 'solved');
    const beforeSolve = (solvedAt < 0 ? entries : entries.slice(0, solvedAt)).filter(
      (attempt) => attempt.verdict !== 'solved',
    ).length;
    return `- ${PUZZLES[puzzle].objective}：${beforeSolve} 次`;
  });
}

export function buildFeedbackStats(state: State): string {
  return [
    `總遊玩時間：${durationLabel(state)}`,
    '各謎題在解出前的錯誤／部分推論次數：',
    ...attemptSummary(state),
  ].join('\n');
}

export function buildFeedbackReport(
  state: State,
  answers: FeedbackAnswers,
  buildId: string,
  date = new Date().toLocaleDateString('zh-TW'),
): string {
  const version = buildId.trim() || date;
  const answerLines = FEEDBACK_QUESTIONS.map((question) => `Q：${question}\nA：${answers[question]?.trim() || '（未填）'}`);
  return [
    '《沒有名字的病》試玩回饋',
    `版本／日期：${version}`,
    buildFeedbackStats(state),
    '',
    ...answerLines,
  ].join('\n');
}

/** GitHub 預填網址限制在 6000 字元內，過長時保留報告開頭並提示已截短。 */
export function buildPlaytestIssueUrl(report: string): string {
  const makeUrl = (body: string) => {
    const url = new URL('https://github.com/nurockplayer/unnamed-disease/issues/new');
    url.searchParams.set('title', '《沒有名字的病》盲測回饋');
    url.searchParams.set('body', body);
    url.searchParams.set('labels', 'playtest');
    return url.toString();
  };
  let url = makeUrl(report);
  if (url.length <= 6000) return url;

  const points = Array.from(report);
  let low = 0;
  let high = points.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const candidate = makeUrl(`${points.slice(0, mid).join('')}\n\n（內容過長，已截短；完整回饋可用「複製回饋」貼上。）`);
    if (candidate.length <= 6000) low = mid;
    else high = mid - 1;
  }
  url = makeUrl(`${points.slice(0, low).join('')}\n\n（內容過長，已截短；完整回饋可用「複製回饋」貼上。）`);
  return url;
}
