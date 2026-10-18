import { ENDING, INTRO } from '../content/case01';
import { evaluate } from './infer';
import type { ClaimId, EvidenceId, State } from './types';

export type Action =
  | { type: 'start' }
  | { type: 'advance' }
  | { type: 'skipIntro' }
  | { type: 'read'; id: EvidenceId }
  | { type: 'closeReading' }
  | { type: 'lookWindow' }
  | { type: 'talk' }
  | { type: 'openBoard' }
  | { type: 'closeBoard' }
  | { type: 'toggleSlot'; id: EvidenceId }
  | { type: 'pin'; id: EvidenceId }
  | { type: 'clearSlot'; index: 0 | 1 }
  | { type: 'chooseClaim'; id: ClaimId }
  | { type: 'submit' }
  | { type: 'dismissReply' }
  | { type: 'toggleSources' }
  | { type: 'restart' };

export function initialState(): State {
  return {
    phase: 'title',
    introStep: 0,
    seen: [],
    reading: null,
    boardOpen: false,
    slots: [null, null],
    claim: null,
    attempts: [],
    reply: null,
    flags: { anomaly: false, air: false, windowSeen: false },
    showSources: false,
  };
}

export function canSubmit(s: State): boolean {
  return s.slots[0] !== null && s.slots[1] !== null && s.claim !== null;
}

export function reduce(s: State, a: Action): State {
  switch (a.type) {
    case 'start':
      return { ...initialState(), phase: 'intro' };

    case 'advance':
      if (s.phase === 'intro') {
        return s.introStep + 1 >= INTRO.length
          ? { ...s, phase: 'desk', introStep: 0 }
          : { ...s, introStep: s.introStep + 1 };
      }
      if (s.phase === 'ending' && s.introStep < ENDING.length) {
        return { ...s, introStep: s.introStep + 1 };
      }
      return s;

    case 'skipIntro':
      return s.phase === 'intro' ? { ...s, phase: 'desk', introStep: 0 } : s;

    case 'read':
      if (s.phase !== 'desk') return s;
      return {
        ...s,
        reading: a.id,
        boardOpen: false,
        reply: null,
        seen: s.seen.includes(a.id) ? s.seen : [...s.seen, a.id],
      };

    case 'closeReading':
      return { ...s, reading: null };

    case 'lookWindow':
      return { ...s, flags: { ...s.flags, windowSeen: true }, reply: null, reading: null };

    case 'talk':
      return { ...s, reply: null, reading: null, flags: { ...s.flags, windowSeen: false } };

    case 'openBoard':
      return s.phase === 'desk' ? { ...s, boardOpen: true, reading: null } : s;

    case 'closeBoard':
      return { ...s, boardOpen: false };

    case 'toggleSlot': {
      if (!s.seen.includes(a.id)) return s;
      const [x, y] = s.slots;
      if (x === a.id) return { ...s, slots: [null, y] };
      if (y === a.id) return { ...s, slots: [x, null] };
      if (x === null) return { ...s, slots: [a.id, y] };
      if (y === null) return { ...s, slots: [x, a.id] };
      // 兩格都滿：替換第二格
      return { ...s, slots: [x, a.id] };
    }

    case 'pin': {
      const placed = s.slots.includes(a.id) ? s : reduce(s, { type: 'toggleSlot', id: a.id });
      return { ...placed, reading: null, boardOpen: true };
    }

    case 'clearSlot': {
      const slots: State['slots'] = [...s.slots];
      slots[a.index] = null;
      return { ...s, slots };
    }

    case 'chooseClaim':
      return { ...s, claim: s.claim === a.id ? null : a.id };

    case 'submit': {
      if (!canSubmit(s)) return s;
      const [x, y] = s.slots as [EvidenceId, EvidenceId];
      const claim = s.claim as ClaimId;
      const reply = evaluate(x, y, claim);
      const attempts = [...s.attempts, { evidence: [x, y] as [EvidenceId, EvidenceId], claim, verdict: reply.verdict }];
      if (reply.verdict === 'solved') {
        return { ...s, attempts, reply, boardOpen: false, phase: 'ending', introStep: 0 };
      }
      return {
        ...s,
        attempts,
        reply,
        flags: {
          ...s.flags,
          anomaly: s.flags.anomaly || (claim === 'anomaly' && reply.verdict === 'partial'),
          air: s.flags.air || reply.verdict === 'competing',
        },
      };
    }

    case 'dismissReply':
      return { ...s, reply: null };

    case 'toggleSources':
      return { ...s, showSources: !s.showSources };

    case 'restart':
      return initialState();
  }
}
