import './style.css';
import { initialState, reduce, type Action } from './logic/state';
import type { ColumnId, EvidenceId, RowId, State } from './logic/types';
import { buildFeedbackReport, buildPlaytestIssueUrl, FEEDBACK_QUESTIONS } from './logic/feedback';
import { render } from './ui/render';

declare const __BUILD_ID__: string;
const BUILD_ID = typeof __BUILD_ID__ === 'undefined' ? '' : __BUILD_ID__;

const root = document.getElementById('app')!;
let state: State = initialState();

// 進度存在這個瀏覽器；讀不到或格式不符就當作沒有存檔
const SAVE_KEY = 'unnamed-disease/case01/v3';
function loadSave(): State | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as State;
    if (!saved || saved.phase === 'title' || !Array.isArray(saved.seen) || !saved.cells?.brewery) return null;
    return { ...saved, reading: null, boardOpen: false, confirmRestart: false };
  } catch {
    return null;
  }
}
function writeSave(s: State) {
  try {
    // 結案頁也保存，重新整理後還能回來看總結
    if (s.phase === 'title') localStorage.removeItem(SAVE_KEY);
    else localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    // 無痕模式或儲存被封鎖：照常遊玩，只是不存檔
  }
}
let saved = loadSave();

/** 打開文件／推理板之前聚焦的元件，關閉後把焦點還給它 */
let opener: string | null = null;

type Dialog = 'reader' | 'board' | null;
const dialogOf = (s: State): Dialog => (s.reading ? 'reader' : s.boardOpen ? 'board' : null);

function dispatch(action: Action) {
  const next = reduce(state, action);
  if (next === state) return;
  const prev = state;
  state = next;
  writeSave(state);
  if (state.phase !== 'title') saved = null;
  draw(prev, action);
}

function resume() {
  if (!saved) return;
  const prev = state;
  state = saved;
  saved = null;
  draw(prev, null);
}

function focusable(el: HTMLElement | null): HTMLElement | null {
  if (!el || el.closest('[inert]') || (el as HTMLButtonElement).disabled) return null;
  return el;
}

function draw(prev: State | null = null, action: Action | null = null) {
  const activeKey = (document.activeElement as HTMLElement | null)?.dataset?.key ?? null;
  // 同一個 modal 重繪時保留捲動位置（例如展開史料註記、在推理板上換線索）
  const modal = root.querySelector<HTMLElement>('.modal');
  const kept = modal ? { id: modal.dataset.testid, top: modal.scrollTop } : null;
  root.innerHTML = render(state, { hasSave: !!saved });
  const dialog = root.querySelector<HTMLElement>('.modal');
  if (dialog && kept && dialog.dataset.testid === kept.id) dialog.scrollTop = kept.top;
  else if (dialog && !kept) dialog.classList.add('opening');

  // 焦點管理：開對話框→移進框內；關對話框→回到開啟者；其餘→還給同一個元件
  const before = prev ? dialogOf(prev) : null;
  const now = dialogOf(state);
  const byKey = (k: string | null) => (k ? root.querySelector<HTMLElement>(`[data-key="${k}"]`) : null);
  let target: HTMLElement | null = null;
  if (now && now !== before) {
    if (!before) opener = activeKey;
    target = dialog?.querySelector<HTMLElement>(
      now === 'reader' ? '[data-key="closeReading"]' : '[data-key^="chip-"], [data-key^="claim-"]',
    ) ?? null;
  } else if (!now && before) {
    target = focusable(byKey(opener)) ?? focusable(byKey('openBoard'));
    opener = null;
  } else if (now === 'board' && action?.type === 'submit') {
    // 送出後把焦點移到黑爾先生的回應，螢幕報讀器才會唸出來
    target = root.querySelector<HTMLElement>('.board-reply');
  } else {
    target = focusable(byKey(activeKey));
    // 同一個對話框重繪、原本的元件消失時（例如移除證據格），留在框內
    if (!target && now) {
      target = dialog?.querySelector<HTMLElement>('[data-key]:not([disabled])') ?? null;
    }
  }
  if (!target && prev && prev.phase !== state.phase) {
    target = root.querySelector<HTMLElement>('[data-key="advance"], [data-key="start"], [data-key="restart"]');
  }
  target?.focus({ preventScroll: true });
  if (action?.type === 'submit') {
    root.querySelector('.board-reply')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

function actionFrom(el: HTMLElement): Action | null {
  const type = el.dataset.action;
  const id = el.dataset.id ?? '';
  switch (type) {
    case 'read':
      return { type, id: id as EvidenceId };
    case 'toggleSlot':
      return { type, id: id as EvidenceId };
    case 'pin':
      return { type, id: id as EvidenceId };
    case 'chooseOption':
      return { type, id };
    case 'look':
      return { type, id };
    case 'cycleCell':
      return { type, row: id as RowId, col: el.dataset.col as ColumnId };
    case 'clearSlot':
      return { type, index: el.dataset.index === '1' ? 1 : 0 };
    case 'start':
    case 'advance':
    case 'skip':
    case 'closeReading':
    case 'talk':
    case 'openBoard':
    case 'closeBoard':
    case 'submit':
    case 'toggleSources':
    case 'restart':
      return { type };
    default:
      return null;
  }
}

root.addEventListener('click', (ev) => {
  const el = (ev.target as Element).closest<HTMLElement>('[data-action], [data-stop]');
  if (!el || el.hasAttribute('data-stop')) return; // 點在 modal 內部空白處不關閉
  if (el.dataset.action === 'continue') return resume();
  if (el.dataset.action === 'copyFeedback') {
    void copyFeedback();
    return;
  }
  if (el.dataset.action === 'githubFeedback') {
    openGithubFeedback();
    return;
  }
  const action = actionFrom(el);
  if (action) dispatch(action);
});

function feedbackAnswers(): Partial<Record<(typeof FEEDBACK_QUESTIONS)[number], string>> {
  return Object.fromEntries(FEEDBACK_QUESTIONS.map((question, i) => [
    question,
    root.querySelector<HTMLTextAreaElement>(`#feedback-answer-${i}`)?.value ?? '',
  ]));
}

function feedbackReport(): string {
  return buildFeedbackReport(state, feedbackAnswers(), BUILD_ID);
}

function showFeedbackFallback(report: string) {
  const fallback = root.querySelector<HTMLElement>('[data-testid="feedback-fallback"]');
  const textarea = root.querySelector<HTMLTextAreaElement>('#feedback-report');
  const status = root.querySelector<HTMLElement>('[data-testid="feedback-status"]');
  if (!fallback || !textarea) return;
  fallback.hidden = false;
  textarea.value = report;
  textarea.focus();
  textarea.select();
  status!.textContent = '無法直接複製。回饋文字已選取，請使用鍵盤複製。';
}

async function copyFeedback() {
  const report = feedbackReport();
  const status = root.querySelector<HTMLElement>('[data-testid="feedback-status"]');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(report);
    status!.textContent = '回饋已複製，可以貼到聊天訊息。';
  } catch {
    showFeedbackFallback(report);
  }
}

function openGithubFeedback() {
  const target = buildPlaytestIssueUrl(feedbackReport());
  const opened = window.open(target, '_blank');
  if (opened) opened.opener = null;
  if (!opened) {
    const status = root.querySelector<HTMLElement>('[data-testid="feedback-status"]');
    status!.textContent = '瀏覽器未開啟新分頁。';
    const link = document.createElement('a');
    link.href = target;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '按此開啟 GitHub 回報表單';
    status!.append(' ', link);
  }
}

root.addEventListener('keydown', (ev) => {
  const el = ev.target as HTMLElement;
  if ((ev.key === 'Enter' || ev.key === ' ') && el.getAttribute('role') === 'button') {
    ev.preventDefault();
    const action = actionFrom(el);
    if (action) dispatch(action);
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Tab') {
    // 對話框開著時，Tab／Shift+Tab 在框內循環
    const dialog = root.querySelector<HTMLElement>('.modal');
    if (!dialog) return;
    const items = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), summary, [tabindex="0"]')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const inside = dialog.contains(document.activeElement);
    if (ev.shiftKey && (!inside || document.activeElement === first)) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && (!inside || document.activeElement === last)) {
      ev.preventDefault();
      first.focus();
    }
    return;
  }
  if (ev.key === 'Escape') {
    if (state.reading) dispatch({ type: 'closeReading' });
    else if (state.boardOpen) dispatch({ type: 'closeBoard' });
  }
});

draw();
