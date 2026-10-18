import './style.css';
import { initialState, reduce, type Action } from './logic/state';
import type { ClaimId, EvidenceId, State } from './logic/types';
import { render } from './ui/render';

const root = document.getElementById('app')!;
let state: State = initialState();

/** 打開文件／推理板之前聚焦的元件，關閉後把焦點還給它 */
let opener: string | null = null;

type Dialog = 'reader' | 'board' | null;
const dialogOf = (s: State): Dialog => (s.reading ? 'reader' : s.boardOpen ? 'board' : null);

function dispatch(action: Action) {
  const next = reduce(state, action);
  if (next === state) return;
  const prev = state;
  state = next;
  draw(prev, action);
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
  root.innerHTML = render(state);
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
  const id = el.dataset.id;
  switch (type) {
    case 'read':
    case 'toggleSlot':
    case 'pin':
      return { type, id: id as EvidenceId };
    case 'chooseClaim':
      return { type, id: id as ClaimId };
    case 'clearSlot':
      return { type, index: el.dataset.index === '1' ? 1 : 0 };
    case 'window':
      return { type: 'lookWindow' };
    case 'restart':
      return { type: 'restart' };
    case 'start':
    case 'advance':
    case 'skipIntro':
    case 'closeReading':
    case 'talk':
    case 'openBoard':
    case 'closeBoard':
    case 'submit':
    case 'toggleSources':
      return { type };
    default:
      return null;
  }
}

root.addEventListener('click', (ev) => {
  const el = (ev.target as Element).closest<HTMLElement>('[data-action], [data-stop]');
  if (!el || el.hasAttribute('data-stop')) return; // 點在 modal 內部空白處不關閉
  const action = actionFrom(el);
  if (action) dispatch(action);
});

root.addEventListener('keydown', (ev) => {
  const el = ev.target as HTMLElement;
  if ((ev.key === 'Enter' || ev.key === ' ') && el.getAttribute('role') === 'button') {
    ev.preventDefault();
    const action = actionFrom(el);
    if (action) dispatch(action);
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    if (state.reading) dispatch({ type: 'closeReading' });
    else if (state.boardOpen) dispatch({ type: 'closeBoard' });
  }
});

draw();
