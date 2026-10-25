import { EVIDENCE } from '../content/evidence';
import {
  CHAPTERS,
  HALE,
  HISTORY_NOTES,
  LOOKS,
  PUZZLES,
  SEQUENCES,
  TABLE_COLUMNS,
  TABLE_ROWS,
  closingRemark,
  haleTalk,
} from '../content/story';
import { canSubmit, failures, rowKnown, slotCount } from '../logic/state';
import type { Beat, EvidenceId, ProvenanceKind, PuzzleId, State, Verdict } from '../logic/types';
import { portrait, sceneFor } from './scene';

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

function verdictLabel(puzzle: PuzzleId, v: Verdict): string {
  if (puzzle === 'table' && v === 'ruledOut') return '這一欄分不開';
  if (puzzle === 'table' && v === 'solved') return '找到了';
  return VERDICT_LABEL[v];
}

const SKIP_LABEL: Record<State['sequence'], string> = {
  intro: '跳過開場',
  to2: '跳過過場',
  to3: '跳過過場',
  finale: '跳過，看總結',
};

export function render(s: State, opts: { hasSave?: boolean } = {}): string {
  switch (s.phase) {
    case 'title':
      return title(!!opts.hasSave);
    case 'sequence': {
      const beats = SEQUENCES[s.sequence];
      return sequence(beats[s.step], s.step, beats.length, SKIP_LABEL[s.sequence]);
    }
    case 'scene':
      return scene(s);
    case 'summary':
      return summary(s);
  }
}

function title(hasSave: boolean): string {
  return `
<main class="title-screen">
  <p class="kicker">1854・倫敦 Soho</p>
  <h1>沒有名字的病</h1>
  <p class="subtitle">第一案〈沒有染病的人〉</p>
  <div class="title-actions">
    ${hasSave ? '<button class="primary" data-action="continue" data-key="continue" data-testid="continue">繼續調查</button>' : ''}
    <button class="${hasSave ? 'ghost' : 'primary'}" data-action="start" data-key="start" data-testid="start">${
      hasSave ? '從頭開始' : '開始調查'
    }</button>
  </div>
  <p class="note">本作涉及疫病與死亡。遊戲中可隨時展開「史料註記」，查看哪些內容出自史料、哪些是虛構。全程約 15–20 分鐘，進度會自動保存在這個瀏覽器。</p>
  <p class="version">Case 01　原型 v0.2</p>
</main>`;
}

function speakerBlock(name: string): string {
  return `<div class="speaker">${portrait(name)}<span>${esc(name)}</span></div>`;
}

function sequence(beat: Beat, step: number, total: number, skipLabel: string): string {
  return `
<main class="sequence" data-action="advance" data-testid="sequence">
  <div class="beat ${beat.speaker ? 'spoken' : 'narration'}" aria-live="polite">
    ${beat.speaker ? speakerBlock(beat.speaker) : ''}
    <p data-testid="beat-text">${beat.speaker ? '「' : ''}${lines(beat.text)}${beat.speaker ? '」' : ''}</p>
  </div>
  <div class="sequence-controls">
    <span class="progress">${step + 1} / ${total}</span>
    <button class="primary" data-action="advance" data-key="advance" data-testid="advance">繼續 ▸</button>
    <button class="ghost" data-action="skip" data-testid="skip">${skipLabel}</button>
  </div>
</main>`;
}

function objectiveOf(s: State): string {
  if (s.puzzle === 'brewery' && s.anomaly) return '啤酒廠的人和街坊差在哪裡？用證據回答黑爾先生。';
  return PUZZLES[s.puzzle].objective;
}

function scene(s: State): string {
  const chapter = CHAPTERS[s.chapter];
  // 開著文件或推理板時，背景不可聚焦，鍵盤焦點留在對話框內
  const inert = s.reading || s.boardOpen ? ' inert' : '';
  const here = chapter.evidence;
  const earlier = s.seen.filter((id) => !here.includes(id));
  const seenHere = here.filter((id) => s.seen.includes(id)).length;
  return `
<div class="desk-layout">
  <header class="topbar"${inert}>
    <div>
      <span class="case" data-testid="chapter">第一案〈沒有染病的人〉・${esc(chapter.label)}</span>
      <p class="objective" data-testid="objective"><b>目標</b>${esc(objectiveOf(s))}</p>
    </div>
    <button class="ghost small${s.confirmRestart ? ' danger' : ''}" data-action="restart" data-key="restart-desk"
            data-testid="restart">${s.confirmRestart ? '確定重新開始？再按一次' : '重新開始'}</button>
  </header>

  <section class="stage"${inert}>
    ${sceneFor(s.chapter, s.seen)}
    <p class="stage-hint">${esc(chapter.hint)}</p>
  </section>

  <aside class="casefile" aria-label="線索夾"${inert}>
    <h2>線索夾 <span data-testid="clue-count">${seenHere} / ${here.length}</span></h2>
    <ul>
      ${here
        .map((id) =>
          s.seen.includes(id)
            ? clueButton(id)
            : `<li class="unknown">？？？<span>${s.chapter === 2 ? '街上還有地方沒問' : '桌上還有東西沒讀'}</span></li>`,
        )
        .join('')}
    </ul>
    ${
      earlier.length
        ? `<details class="earlier"><summary>先前的線索（${earlier.length}）</summary><ul>${earlier
            .map(clueButton)
            .join('')}</ul></details>`
        : ''
    }
    <button class="primary board-btn" data-action="openBoard" data-key="openBoard" data-testid="open-board">
      打開推理板</button>
  </aside>

  <section class="dialogue" aria-live="polite" data-testid="dialogue"${inert}>
    ${dialogueContent(s, seenHere, here.length)}
  </section>

  ${s.reading ? reader(s) : ''}
  ${s.boardOpen ? board(s) : ''}
</div>`;
}

function clueButton(id: EvidenceId): string {
  const e = EVIDENCE[id];
  return `<li><button class="clue" data-action="read" data-id="${id}" data-key="clue-${id}" data-testid="clue-${id}">
    <b>${esc(e.title)}</b><span>${esc(e.takeaway)}</span></button></li>`;
}

/** testid 只放在桌面對話框那一份，避免推理板開著時出現兩個相同 testid */
function replyBlock(s: State, inBoard = false): string {
  const r = s.reply!;
  // 回應一律由黑爾先生說
  return `${speakerBlock(HALE)}
    <div class="dialogue-body">
      <span class="verdict v-${r.verdict}"${inBoard ? '' : ' data-testid="verdict"'}>${verdictLabel(lastPuzzle(s), r.verdict)}</span>
      ${r.lines.map((l) => `<p>「${lines(l)}」</p>`).join('')}
    </div>`;
}

/** 回應所屬的謎題（成立後 s.puzzle 已換到下一題） */
function lastPuzzle(s: State): PuzzleId {
  return s.attempts.length ? s.attempts[s.attempts.length - 1].puzzle : s.puzzle;
}

function dialogueContent(s: State, seenHere: number, totalHere: number): string {
  if (s.reply) return replyBlock(s);
  if (s.look) {
    return `<div class="dialogue-body narration">${(LOOKS[s.look] ?? []).map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
  }
  return `${speakerBlock(HALE)}
    <div class="dialogue-body">
      ${haleTalk(s.puzzle, seenHere, totalHere, s.anomaly, failures(s))
        .map((l) => `<p>「${esc(l)}」</p>`)
        .join('')}
    </div>`;
}

function reader(s: State): string {
  const e = EVIDENCE[s.reading!];
  const canPin = slotCount(s) > 0;
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
      ${
        canPin
          ? `<button class="ghost" data-action="pin" data-id="${e.id}" data-key="pin" data-testid="pin">放上推理板</button>`
          : ''
      }
      <button class="primary" data-action="closeReading" data-key="closeReading" data-testid="close-reader">關閉</button>
    </div>
  </article>
</div>`;
}

function board(s: State): string {
  const p = PUZZLES[s.puzzle];
  const n = slotCount(s);
  const ready = canSubmit(s);
  const ruledOut = new Set(
    s.attempts.filter((t) => t.puzzle === s.puzzle && t.verdict === 'ruledOut').map((t) => t.option),
  );
  return `
<div class="modal-backdrop" data-action="closeBoard">
  <section class="modal board" role="dialog" aria-modal="true" aria-labelledby="board-title"
           data-testid="board" data-stop>
    <h2 id="board-title">推理板</h2>
    <p class="question" data-testid="question">${esc(p.asker)}：<b>${esc(p.question)}</b></p>

    ${p.kind === 'table' ? table(s) : ''}
    ${n > 0 ? evidencePicker(s, n as 1 | 2) : ''}

    <h3>${p.kind === 'table' ? '哪一欄能把結果分開？' : '你的判斷'}</h3>
    ${p.kind === 'table' ? '' : `<p class="frame">${esc(p.frame)}</p>`}
    <div class="claims${p.kind === 'none' || p.kind === 'single' ? ' wide' : ''}">
      ${p.options
        .map((o) => {
          const on = s.option === o.id;
          const out = ruledOut.has(o.id);
          return `<button class="claim${on ? ' on' : ''}${out ? ' out' : ''}" aria-pressed="${on}" data-action="chooseOption"
                    data-id="${o.id}" data-key="claim-${o.id}" data-testid="claim-${o.id}">${esc(o.text)}${
                      out ? '<small>已排除</small>' : ''
                    }</button>`;
        })
        .join('')}
    </div>

    ${
      s.reply
        ? `<div class="board-reply" data-testid="board-reply" role="status" tabindex="-1">${replyBlock(s, true)}</div>`
        : ''
    }

    ${attemptsList(s)}
    <div class="modal-actions">
      <button class="ghost" data-action="closeBoard" data-key="closeBoard" data-testid="close-board">回到${
        s.chapter === 2 ? '街上' : '桌前'
      }</button>
      <button class="primary" data-action="submit" data-key="submit" data-testid="submit" ${ready ? '' : 'disabled'}>
        提出</button>
    </div>
  </section>
</div>`;
}

function evidencePicker(s: State, n: 1 | 2): string {
  const slot = (i: 0 | 1) => {
    const id = s.slots[i];
    const name = n === 1 ? '證據' : `證據${i === 0 ? '一' : '二'}`;
    return id
      ? `<button class="slot filled" data-action="clearSlot" data-index="${i}" data-key="slot-${i}" data-testid="slot-${i}">
           <small>${name}</small><b>${esc(EVIDENCE[id].title)}</b><em>點一下移除</em></button>`
      : `<div class="slot empty" data-testid="slot-${i}"><small>${name}</small>從下方線索選一份</div>`;
  };
  return `
    <div class="slots${n === 1 ? ' one' : ''}">${slot(0)}${n === 2 ? `<span class="plus">＋</span>${slot(1)}` : ''}</div>
    <h3>線索（選${n === 1 ? '一' : '兩'}份${n === 2 ? '；已選兩份時，再選會替換證據二' : '；再選會替換'}）</h3>
    ${
      s.seen.length === 0
        ? '<p class="empty-note">還沒有線索。先調查看看。</p>'
        : `${s.seen.length < n ? '<p class="empty-note">線索還不夠，先去調查。</p>' : ''}<div class="chips">${s.seen
            .map((id) => {
              const on = s.slots.includes(id);
              return `<button class="chip${on ? ' on' : ''}" aria-pressed="${on}" data-action="toggleSlot"
                        data-id="${id}" data-key="chip-${id}" data-testid="chip-${id}">${esc(EVIDENCE[id].title)}</button>`;
            })
            .join('')}</div>`
    }`;
}

function table(s: State): string {
  const missing = TABLE_ROWS.filter((r) => !rowKnown(s, r.id)).length;
  const show = (v: boolean | null) => (v === null ? '？' : v ? '是' : '否');
  return `
    <p class="frame">${esc(PUZZLES.table.frame)}</p>
    ${missing ? `<p class="empty-note" data-testid="table-missing">還有 ${missing} 個地方沒調查清楚，表上那幾列先空著。</p>` : ''}
    <table class="compare" data-testid="compare">
      <thead><tr><th scope="col">地方</th>${TABLE_COLUMNS.map((c) => `<th scope="col">${esc(c.label)}？</th>`).join('')}<th scope="col">有霍亂死亡通報？<small>依結果列出</small></th><th scope="col">結果</th></tr></thead>
      <tbody>
      ${TABLE_ROWS.map((r) => {
        if (!rowKnown(s, r.id))
          return `<tr class="unknown-row"><th scope="row">${esc(r.label)}</th><td colspan="${TABLE_COLUMNS.length + 2}">還沒調查</td></tr>`;
        const review = s.reply?.reviewRow === r.id;
        const sources = [...new Set(r.needs.flat())].filter((id) => s.seen.includes(id));
        return `<tr${review ? ' class="needs-review"' : ''}>
          <th scope="row">${esc(r.label)}${review ? '<small>請重讀這一列的證詞</small>' : ''}
            <span class="table-sources">${sources.map((id) => `<button class="link" data-action="read" data-id="${id}"
              data-key="table-read-${r.id}-${id}" data-testid="table-read-${r.id}-${id}">重讀${esc(EVIDENCE[id].object)}</button>`).join('')}</span>
          </th>
          ${TABLE_COLUMNS.map((c) => {
            const v = s.cells[r.id][c.id];
            return `<td data-label="${esc(c.label)}"><button class="cell" data-action="cycleCell"
                 data-id="${r.id}" data-col="${c.id}" data-key="cell-${r.id}-${c.id}" data-testid="cell-${r.id}-${c.id}"
                 aria-label="${esc(r.label)}：${esc(c.label)}？目前${v === null ? '未填' : show(v)}">${show(v)}</button></td>`;
          }).join('')}
          <td data-label="有霍亂死亡通報" data-testid="deaths-${r.id}">${r.reportedDeaths ? '是' : '否'}<small>依結果列出</small></td>
          <td data-label="結果" class="${r.many ? 'many' : 'few'}">${esc(r.result)}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    <p class="muted small-note">點格子切換：？ → 是 → 否。填的是證詞中的供水方式，不表示每個人都喝過。</p>
    <p class="muted small-note">這是四份觀察的對照。咖啡館常客總數不詳，不能拿死亡人數直接排死亡率。</p>`;
}

function attemptsList(s: State): string {
  const mine = s.attempts.filter((t) => t.puzzle === s.puzzle);
  if (!mine.length) return '';
  const p = PUZZLES[s.puzzle];
  return `<details class="attempts"><summary>這一題已提出過 ${mine.length} 次</summary><ol>${mine
    .map((a) => {
      const opt = p.options.find((o) => o.id === a.option)?.text ?? '';
      const ev = a.evidence.map((id) => EVIDENCE[id].object).join('＋');
      return `<li>${ev ? `${esc(ev)} → ` : ''}「${esc(opt)}」<em>（${verdictLabel(a.puzzle, a.verdict)}）</em></li>`;
    })
    .join('')}</ol></details>`;
}

function summary(s: State): string {
  const solved = s.attempts.filter((t) => t.verdict === 'solved');
  const overreaches = s.attempts.filter((t) => t.verdict === 'overreach').length;
  const ruledOut = s.attempts.filter((t) => t.verdict === 'ruledOut');
  const ruledTexts = [
    ...new Set(ruledOut.map((t) => PUZZLES[t.puzzle].options.find((o) => o.id === t.option)?.text ?? '')),
  ].filter(Boolean);
  return `
<main class="summary" data-testid="summary">
  <p class="kicker">第一案〈沒有染病的人〉</p>
  <h1>結案</h1>
  <section>
    <h2>你一路的推理</h2>
    <ol class="chain">${solved
      .map((t) => `<li><b>${esc(chapterOf(t.puzzle))}</b>${esc(PUZZLES[t.puzzle].summary(t.option))}</li>`)
      .join('')}</ol>
    <p class="muted">共提出 ${s.attempts.length} 次推論${
      ruledTexts.length ? `；途中被證據排除的：${ruledTexts.map(esc).join('、')}` : ''
    }。這些都不是定論——是在資訊不完整時，盡量不說錯話的判斷。</p>
  </section>
  <section>
    <h2>黑爾先生</h2>
    <p class="final-claim" data-testid="closing">「${esc(closingRemark(overreaches))}」</p>
  </section>
  <section class="history">
    <h2>史實與虛構</h2>
    <ul>${HISTORY_NOTES.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
    <p class="muted">文中「Snow 1855」指 John Snow，《On the Mode of Communication of Cholera》第二版（1855），頁碼為原書頁碼。</p>
  </section>
  <button class="primary" data-action="restart" data-key="restart" data-testid="play-again">重新開始</button>
</main>`;
}

function chapterOf(p: PuzzleId): string {
  const id = (Object.keys(CHAPTERS) as unknown as (1 | 2 | 3)[]).find((c) => CHAPTERS[c].puzzles.includes(p));
  return id ? `${CHAPTERS[id].label}：` : '';
}
