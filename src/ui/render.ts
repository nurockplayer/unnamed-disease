import {
  BOARD_FRAME,
  CLAIMS,
  CLAIM_ORDER,
  ENDING,
  EVIDENCE,
  EVIDENCE_ORDER,
  HALE,
  HISTORY_NOTES,
  INTRO,
  OBJECTIVE,
  OBJECTIVE_AFTER_ANOMALY,
  QUESTION,
  WINDOW_TEXT,
  haleTalk,
} from '../content/case01';
import { canSubmit, failures } from '../logic/state';
import type { ProvenanceKind, State, Verdict } from '../logic/types';
import { deskScene, halePortrait } from './scene';

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lines = (t: string) => esc(t).replace(/\n/g, '<br>');

const KIND_LABEL: Record<ProvenanceKind, string> = {
  HISTORICAL_RECORD: '史實',
  RECONSTRUCTION: '重建',
  FICTION: '虛構',
  DISPUTED: '存疑',
};

const VERDICT_LABEL: Record<Verdict, string> = {
  solved: '推論成立',
  partial: '有效的觀察——但還不夠',
  ruledOut: '這個差別被排除了',
  competing: '另一種解釋',
  overreach: '結論說過頭了',
  insufficient: '證據撐不住這句話',
};

export function render(s: State): string {
  switch (s.phase) {
    case 'title':
      return title();
    case 'intro':
      return sequence(INTRO[s.introStep], s.introStep, INTRO.length, '跳過開場');
    case 'desk':
      return desk(s);
    case 'ending':
      return s.introStep < ENDING.length
        ? sequence(ENDING[s.introStep], s.introStep, ENDING.length, '跳過，看總結')
        : summary(s);
  }
}

function title(): string {
  return `
<main class="title-screen">
  <p class="kicker">1854・倫敦 Soho</p>
  <h1>沒有名字的病</h1>
  <p class="subtitle">第一案〈沒有染病的人〉</p>
  <button class="primary" data-action="start" data-key="start" data-testid="start">開始調查</button>
  <p class="note">本作涉及疫病與死亡。遊戲中可隨時展開「史料註記」，查看哪些內容出自史料、哪些是虛構。</p>
  <p class="version">Case 01・第一段　原型 v0.1</p>
</main>`;
}

function sequence(
  beat: { speaker?: string; text: string },
  step: number,
  total: number,
  skipLabel: string,
): string {
  return `
<main class="sequence" data-action="advance" data-testid="sequence">
  <div class="beat ${beat.speaker ? 'spoken' : 'narration'}" aria-live="polite">
    ${beat.speaker ? `<div class="speaker">${halePortrait()}<span>${esc(beat.speaker)}</span></div>` : ''}
    <p data-testid="beat-text">${beat.speaker ? '「' : ''}${lines(beat.text)}${beat.speaker ? '」' : ''}</p>
  </div>
  <div class="sequence-controls">
    <span class="progress">${step + 1} / ${total}</span>
    <button class="primary" data-action="advance" data-key="advance" data-testid="advance">繼續 ▸</button>
    <button class="ghost" data-action="skipIntro" data-testid="skip">${skipLabel}</button>
  </div>
</main>`;
}

function desk(s: State): string {
  const objective = s.flags.anomaly ? OBJECTIVE_AFTER_ANOMALY : OBJECTIVE;
  // 開著文件或推理板時，背景不可聚焦，鍵盤焦點留在對話框內
  const inert = s.reading || s.boardOpen ? ' inert' : '';
  return `
<div class="desk-layout">
  <header class="topbar"${inert}>
    <div>
      <span class="case">第一案〈沒有染病的人〉・紀錄室</span>
      <p class="objective" data-testid="objective"><b>目標</b>${esc(objective)}</p>
    </div>
    <button class="ghost small${s.confirmRestart ? ' danger' : ''}" data-action="restart" data-key="restart-desk"
            data-testid="restart">${s.confirmRestart ? '確定重新開始？再按一次' : '重新開始'}</button>
  </header>

  <section class="stage"${inert}>
    ${deskScene(s.seen)}
    <p class="stage-hint">點擊桌上的文件閱讀；點黑爾先生與他說話；窗外也能看看。</p>
  </section>

  <aside class="casefile" aria-label="線索夾"${inert}>
    <h2>線索夾 <span data-testid="clue-count">${s.seen.length} / ${EVIDENCE_ORDER.length}</span></h2>
    <ul>
      ${EVIDENCE_ORDER.map((id) => {
        const e = EVIDENCE[id];
        return s.seen.includes(id)
          ? `<li><button class="clue" data-action="read" data-id="${id}" data-key="clue-${id}" data-testid="clue-${id}">
               <b>${esc(e.title)}</b><span>${esc(e.takeaway)}</span></button></li>`
          : `<li class="unknown">？？？<span>桌上還有東西沒讀</span></li>`;
      }).join('')}
    </ul>
    <button class="primary board-btn" data-action="openBoard" data-key="openBoard" data-testid="open-board">
      打開推理板</button>
  </aside>

  <section class="dialogue" aria-live="polite" data-testid="dialogue"${inert}>
    ${dialogueContent(s)}
  </section>

  ${s.reading ? reader(s) : ''}
  ${s.boardOpen ? board(s) : ''}
</div>`;
}

function dialogueContent(s: State): string {
  if (s.reply) {
    return `
    <div class="speaker">${halePortrait()}<span>${HALE}</span></div>
    <div class="dialogue-body">
      <span class="verdict v-${s.reply.verdict}" data-testid="verdict">${VERDICT_LABEL[s.reply.verdict]}</span>
      ${s.reply.lines.map((l) => `<p>「${lines(l)}」</p>`).join('')}
    </div>`;
  }
  if (s.flags.windowSeen) {
    return `<div class="dialogue-body narration">${WINDOW_TEXT.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
  }
  return `
    <div class="speaker">${halePortrait()}<span>${HALE}</span></div>
    <div class="dialogue-body">
      ${haleTalk(s.seen.length, s.flags.anomaly, failures(s))
        .map((l) => `<p>「${esc(l)}」</p>`)
        .join('')}
    </div>`;
}

function reader(s: State): string {
  const e = EVIDENCE[s.reading!];
  return `
<div class="modal-backdrop" data-action="closeReading">
  <article class="modal document" role="dialog" aria-modal="true" aria-labelledby="doc-title"
           data-testid="reader" data-stop>
    <p class="doc-object">${esc(e.object)}</p>
    <h2 id="doc-title">${esc(e.title)}</h2>
    <div class="doc-body">${e.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    <p class="takeaway"><b>你記下：</b>${esc(e.takeaway)}</p>
    <button class="link" data-action="toggleSources" data-key="toggleSources" data-testid="toggle-sources">
      ${s.showSources ? '收起史料註記 ▴' : '史料註記 ▾'}</button>
    ${
      s.showSources
        ? `<ul class="provenance" data-testid="provenance">${e.provenance
            .map(
              (p) => `<li><span class="tag t-${p.kind}">${KIND_LABEL[p.kind]}</span>${esc(p.note)}
               ${p.source ? `<cite>${esc(p.source)}</cite>` : ''}</li>`,
            )
            .join('')}</ul>`
        : ''
    }
    <div class="modal-actions">
      <button class="ghost" data-action="pin" data-id="${e.id}" data-key="pin" data-testid="pin">放上推理板</button>
      <button class="primary" data-action="closeReading" data-key="closeReading" data-testid="close-reader">關閉</button>
    </div>
  </article>
</div>`;
}

function board(s: State): string {
  const slot = (i: 0 | 1) => {
    const id = s.slots[i];
    return id
      ? `<button class="slot filled" data-action="clearSlot" data-index="${i}" data-key="slot-${i}" data-testid="slot-${i}">
           <small>證據${i === 0 ? '一' : '二'}</small><b>${esc(EVIDENCE[id].title)}</b><em>點一下移除</em></button>`
      : `<div class="slot empty" data-testid="slot-${i}"><small>證據${i === 0 ? '一' : '二'}</small>從下方線索選一份</div>`;
  };
  const ready = canSubmit(s);
  return `
<div class="modal-backdrop" data-action="closeBoard">
  <section class="modal board" role="dialog" aria-modal="true" aria-labelledby="board-title"
           data-testid="board" data-stop>
    <h2 id="board-title">推理板</h2>
    <p class="question">黑爾先生的問題：<b>${esc(QUESTION)}</b></p>

    <div class="slots">${slot(0)}<span class="plus">＋</span>${slot(1)}</div>

    <h3>線索（選兩份；已選兩份時，再選會替換證據二）</h3>
    ${
      s.seen.length === 0
        ? '<p class="empty-note">還沒有線索。先讀讀桌上的文件。</p>'
        : `${s.seen.length < 2 ? '<p class="empty-note">至少需要兩份線索，桌上還有東西沒讀。</p>' : ''}<div class="chips">${EVIDENCE_ORDER.filter((id) => s.seen.includes(id))
            .map((id) => {
              const on = s.slots.includes(id);
              return `<button class="chip${on ? ' on' : ''}" aria-pressed="${on}" data-action="toggleSlot"
                        data-id="${id}" data-key="chip-${id}" data-testid="chip-${id}">${esc(EVIDENCE[id].title)}</button>`;
            })
            .join('')}</div>`
    }

    <h3>你的判斷</h3>
    <p class="frame">${esc(BOARD_FRAME)}</p>
    <div class="claims">
      ${CLAIM_ORDER.map((id) => {
        const on = s.claim === id;
        const out = s.attempts.some((t) => t.claim === id && t.verdict === 'ruledOut');
        return `<button class="claim${on ? ' on' : ''}${out ? ' out' : ''}" aria-pressed="${on}" data-action="chooseClaim"
                  data-id="${id}" data-key="claim-${id}" data-testid="claim-${id}">${esc(CLAIMS[id].text)}${
                    out ? '<small>已排除</small>' : ''
                  }</button>`;
      }).join('')}
    </div>

    ${
      s.reply
        ? `<div class="board-reply" data-testid="board-reply" role="status" tabindex="-1">
             <div class="speaker">${halePortrait()}<span>${HALE}</span></div>
             <div><span class="verdict v-${s.reply.verdict}">${VERDICT_LABEL[s.reply.verdict]}</span>
             ${s.reply.lines.map((l) => `<p>「${lines(l)}」</p>`).join('')}</div>
           </div>`
        : ''
    }

    <div class="modal-actions">
      <button class="ghost" data-action="closeBoard" data-key="closeBoard" data-testid="close-board">回到桌前</button>
      <button class="primary" data-action="submit" data-key="submit" data-testid="submit" ${ready ? '' : 'disabled'}>
        向黑爾先生提出</button>
    </div>
    ${
      s.attempts.length
        ? `<details class="attempts"><summary>已提出過 ${s.attempts.length} 次</summary><ol>${s.attempts
            .map(
              (a) =>
                `<li>${esc(EVIDENCE[a.evidence[0]].object)}＋${esc(EVIDENCE[a.evidence[1]].object)} → 差別在於「${esc(
                  CLAIMS[a.claim].text,
                )}」<em>（${VERDICT_LABEL[a.verdict]}）</em></li>`,
            )
            .join('')}</ol></details>`
        : ''
    }
  </section>
</div>`;
}

function summary(s: State): string {
  const final = s.attempts[s.attempts.length - 1];
  return `
<main class="summary" data-testid="summary">
  <p class="kicker">第一案〈沒有染病的人〉</p>
  <h1>第一段・完</h1>
  <section>
    <h2>你的推論</h2>
    <p class="final-claim">「同一條街、同樣的空氣，啤酒廠的人卻幾乎沒事。差別可能在於：${esc(
      CLAIMS[final.claim].text,
    )}。」</p>
    <p>依據：${esc(EVIDENCE[final.evidence[0]].title)}、${esc(EVIDENCE[final.evidence[1]].title)}</p>
    <p class="muted">向黑爾先生提出了 ${s.attempts.length} 次${
      s.attempts.some((t) => t.verdict === 'ruledOut')
        ? `，途中排除了：${[...new Set(s.attempts.filter((t) => t.verdict === 'ruledOut').map((t) => CLAIMS[t.claim].text))]
            .map(esc)
            .join('、')}`
        : ''
    }。這不是定論——只是一條值得追下去的線。</p>
  </section>
  <section>
    <h2>下一段</h2>
    <p>Poland Street 濟貧院：五百多人，四面疫區。他們喝的是什麼水？<span class="muted">（製作中）</span></p>
  </section>
  <section class="history">
    <h2>史實與虛構</h2>
    <ul>${HISTORY_NOTES.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
    <p class="muted">文中「Snow 1855」指 John Snow，《On the Mode of Communication of Cholera》第二版（1855），頁碼為原書頁碼。</p>
  </section>
  <button class="primary" data-action="restart" data-key="restart" data-testid="play-again">重新開始</button>
</main>`;
}
