import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { EVIDENCE } from '../src/content/evidence';
import { SEQUENCES, TABLE_COLUMNS, TABLE_ROWS } from '../src/content/story';
import type { EvidenceId } from '../src/logic/types';
import legacyTableSave from './fixtures/case01-v3-table.json' with { type: 'json' };

const firstLine = (t: string) => t.split('\n')[0];

async function advanceEveryBeat(page: Page, beats: readonly { text: string }[]) {
  for (const beat of beats) {
    await expect(page.getByTestId('sequence')).toBeVisible();
    await expect(page.getByTestId('beat-text')).toContainText(firstLine(beat.text));
    await page.getByRole('button', { name: '繼續 ▸', exact: true }).click();
  }
  await expect(page.getByTestId('sequence')).toHaveCount(0);
}

/** 進入過場、確認第一拍，然後跳過 */
async function skipSequence(page: Page, id: keyof typeof SEQUENCES) {
  await expect(page.getByTestId('sequence')).toBeVisible();
  await expect(page.getByTestId('beat-text')).toContainText(firstLine(SEQUENCES[id][0].text));
  await page.getByTestId('skip').click();
  await expect(page.getByTestId('sequence')).toHaveCount(0);
}

async function capture(page: Page, info: TestInfo, moment: string) {
  const path = `test-results/screens/${info.project.name}-${moment}.png`;
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await info.attach(moment, { path, contentType: 'image/png' });
}

async function openDocument(page: Page, id: EvidenceId) {
  await page.getByTestId(`spot-${id}`).click();
  const reader = page.getByRole('dialog', { name: EVIDENCE[id].title, exact: true });
  await expect(reader).toBeVisible();
  return reader;
}

async function collect(page: Page, ...ids: EvidenceId[]) {
  for (const id of ids) {
    const reader = await openDocument(page, id);
    await reader.getByRole('button', { name: '關閉', exact: true }).click();
    await expect(page.getByTestId('reader')).toHaveCount(0);
    await expect(page.getByTestId(`clue-${id}`)).toContainText(EVIDENCE[id].title);
  }
}

async function openBoard(page: Page) {
  await page.getByTestId('open-board').click();
  await expect(page.getByRole('dialog', { name: '推理板', exact: true })).toBeVisible();
}

/** 清空證據格，再依序放入 */
async function place(page: Page, ...ids: EvidenceId[]) {
  for (const i of [1, 0]) {
    const slot = page.getByTestId(`slot-${i}`);
    if ((await slot.count()) && (await slot.evaluate((el) => el.tagName === 'BUTTON'))) await slot.click();
  }
  for (const [i, id] of ids.entries()) {
    await page.getByTestId(`chip-${id}`).click();
    await expect(page.getByTestId(`slot-${i}`)).toContainText(EVIDENCE[id].title);
  }
}

/** 選定某個選項（已選就不再點，避免切掉） */
async function choose(page: Page, option: string) {
  const btn = page.getByTestId(`claim-${option}`);
  if ((await btn.getAttribute('aria-pressed')) !== 'true') await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
}

async function answer(page: Page, option: string, verdict: string) {
  await choose(page, option);
  await page.getByTestId('submit').click();
  await expect(page.getByTestId('board-reply')).toContainText(verdict);
}

/** 把比較表某一格點到指定值（？ → 是 → 否 → ？） */
async function setCell(page: Page, row: string, col: string, value: boolean) {
  const cell = page.getByTestId(`cell-${row}-${col}`);
  const want = value ? '是' : '否';
  for (let i = 0; i < 3 && (await cell.innerText()) !== want; i++) await cell.click();
  await expect(cell).toHaveText(want);
}

async function fillTable(page: Page) {
  for (const r of TABLE_ROWS) for (const c of TABLE_COLUMNS) await setCell(page, r.id, c.id, r.facts[c.id]);
}

async function startSkippingIntro(page: Page) {
  await page.getByTestId('start').click();
  await page.getByTestId('skip').click();
  await expect(page.getByTestId('objective')).toBeVisible();
}

/** 第一段最短解法 */
async function solveChapter1(page: Page) {
  await collect(page, 'E02', 'E03');
  await openBoard(page);
  await place(page, 'E02', 'E03');
  await choose(page, 'water');
  await page.getByTestId('submit').click();
  await skipSequence(page, 'to2');
  await expect(page.getByTestId('chapter')).toContainText('第二段');
}

async function expectNoHorizontalScroll(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        if (!document.scrollingElement) throw new Error('The document has no scrolling element');
        return document.scrollingElement.scrollWidth - window.innerWidth;
      }),
    )
    .toBeLessThanOrEqual(0);
}

async function tabTo(page: Page, testId: string) {
  const target = page.getByTestId(testId);
  await expect(target).toBeVisible();
  // 用真的鍵盤操作；上限讓壞掉的 Tab 順序變成失敗
  for (let presses = 0; presses < 12; presses += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) break;
  }
  await expect(target).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: '開始調查', exact: true })).toBeVisible();
});

test('whole case: three parts, a wrong answer on every question, summary and restart', async ({ page, isMobile }, info) => {
  await capture(page, info, 'title');
  await page.getByTestId('start').click();
  await advanceEveryBeat(page, SEQUENCES.intro);
  const objective = page.getByTestId('objective');
  await expect(objective).toContainText('住在這一帶，就一定逃不過嗎？');
  await expect(page.getByTestId('clue-count')).toHaveText('0 / 4');
  if (isMobile) await expectNoHorizontalScroll(page);
  await capture(page, info, 'desk');

  // ---------- 第一段 ----------
  await openBoard(page);
  await expect(page.getByTestId('submit')).toBeDisabled();
  await page.getByTestId('close-board').click();

  for (const id of ['E01', 'E02', 'E03', 'E08'] as const) {
    const reader = await openDocument(page, id);
    await reader.getByRole('button', { name: '史料註記 ▾', exact: true }).click();
    const provenance = reader.getByTestId('provenance');
    await expect(provenance).toBeVisible();
    for (const p of EVIDENCE[id].provenance) {
      const tag = { HISTORICAL_RECORD: '史實', RECONSTRUCTION: '重建', FICTION: '虛構', DISPUTED: '存疑' }[p.kind];
      await expect(provenance.getByText(tag, { exact: true }).first()).toBeVisible();
    }
    if (id === 'E02') await capture(page, info, 'reader');
    await reader.getByRole('button', { name: '收起史料註記 ▴', exact: true }).click();
    await reader.getByRole('button', { name: '關閉', exact: true }).click();
  }
  await expect(page.getByTestId('clue-count')).toHaveText('4 / 4');
  await expect(page.getByTestId('sequence')).toHaveCount(0);

  await page.getByTestId('spot-window').click();
  await expect(page.getByTestId('dialogue')).toContainText('窗外天色暗了');
  await page.getByTestId('spot-hale').click();
  await expect(page.getByTestId('dialogue')).toContainText('都看過了？');

  await openBoard(page);
  await place(page, 'E01', 'E02');
  await answer(page, 'water', '有效的觀察');
  await expect(objective).toContainText('啤酒廠的人和街坊差在哪裡？');
  await capture(page, info, 'board-with-reply');
  await answer(page, 'job', '這個差別被排除了');
  await expect(page.getByTestId('board-reply')).toContainText('雷管工廠');
  await expect(page.getByTestId('claim-job')).toContainText('已排除');
  await place(page, 'E02', 'E03');
  await answer(page, 'beer', '結論說過頭了');
  await choose(page, 'water');
  await page.getByTestId('submit').click();
  await advanceEveryBeat(page, SEQUENCES.to2);

  // ---------- 第二段 ----------
  await expect(page.getByTestId('chapter')).toContainText('第二段');
  await expect(page.getByTestId('clue-count')).toHaveText('0 / 4');
  await page.getByTestId('spot-pump').click();
  await expect(page.getByTestId('dialogue')).toContainText('街泵的鐵把手');
  await openBoard(page);
  await expect(page.getByTestId('table-missing')).toContainText('3 個地方');
  await page.getByTestId('close-board').click();
  await collect(page, 'E04', 'E05', 'E09', 'E10');
  if (isMobile) await expectNoHorizontalScroll(page);
  await capture(page, info, 'street');

  await openBoard(page);
  await expect(page.getByTestId('table-missing')).toHaveCount(0);
  await fillTable(page);
  await setCell(page, 'capworks', 'pump', false); // 故意填錯一格
  await answer(page, 'pump', '證據撐不住這句話');
  await expect(page.getByTestId('board-reply')).toContainText('雷管工廠那兩桶水');
  await setCell(page, 'capworks', 'pump', true);
  await answer(page, 'crowd', '這一欄分不開');
  await answer(page, 'deaths', '這一欄分不開');
  await expect(page.getByTestId('board-reply')).toContainText('濟貧院這一列');
  await expect(page.getByTestId('deaths-workhouse')).toContainText('是');
  if (isMobile) await expectNoHorizontalScroll(page);
  await capture(page, info, 'table');
  await answer(page, 'pump', '找到了');
  await expect(page.getByTestId('question')).toContainText('我天天喝這泵的水');
  await answer(page, 'wrong', '結論說過頭了');
  await choose(page, 'nothing');
  await page.getByTestId('submit').click();
  await skipSequence(page, 'to3');

  // ---------- 第三段 ----------
  await expect(page.getByTestId('chapter')).toContainText('第三段');
  await page.getByTestId('spot-window3').click();
  await expect(page.getByTestId('dialogue')).toContainText('沒了把手');
  await collect(page, 'E06', 'E06b', 'E12');
  await openBoard(page);
  await place(page, 'E06', 'E06b');
  await answer(page, 'contact', '這個差別被排除了');
  await answer(page, 'water', '推論成立');
  await expect(page.getByTestId('question')).toContainText('是拆把手，結束了這場疫情嗎？');
  await place(page, 'E12');
  await answer(page, 'ended', '結論說過頭了');
  await choose(page, 'prudent');
  await page.getByTestId('submit').click();
  await skipSequence(page, 'finale');

  // ---------- 結案 ----------
  const summary = page.getByTestId('summary');
  await expect(summary).toContainText('結案');
  await expect(summary.locator('.chain li')).toHaveCount(5);
  await expect(page.getByTestId('closing')).toBeVisible();
  await expect(summary).toContainText('史實與虛構');
  await capture(page, info, 'summary');
  await page.getByTestId('play-again').click();
  await expect(page.getByRole('button', { name: '開始調查', exact: true })).toBeVisible();
});

test('insufficient evidence never softlocks; Escape closes both dialogs; restart needs two presses', async ({ page }) => {
  await startSkippingIntro(page);
  await openDocument(page, 'E01');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('reader')).toHaveCount(0);
  await collect(page, 'E08');
  await expect(page.getByTestId('clue-count')).toHaveText('2 / 4');

  await openBoard(page);
  await expect(page.getByTestId('chip-E02')).toHaveCount(0);
  await place(page, 'E01', 'E08');
  await answer(page, 'air', '這個差別被排除了');
  await answer(page, 'water', '證據撐不住這句話');
  await expect(page.getByTestId('board-reply')).not.toContainText('他們用別的水');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByTestId('restart').click();
  await expect(page.getByTestId('restart')).toContainText('確定重新開始');
  await page.getByTestId('spot-hale').click();
  await expect(page.getByTestId('restart')).toHaveText('重新開始');
  await expect(page.getByTestId('clue-count')).toHaveText('2 / 4');

  await solveChapter1(page);
});

test('progress survives a reload and resumes in the same part', async ({ page }) => {
  await startSkippingIntro(page);
  await solveChapter1(page);
  await collect(page, 'E09');
  await page.reload();
  await expect(page.getByTestId('continue')).toBeVisible();
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('chapter')).toContainText('第二段');
  await expect(page.getByTestId('clue-E09')).toBeVisible();
  await expect(page.getByTestId('clue-count')).toHaveText('1 / 4');
});

test('keyboard only: Tab, Enter, Space and Escape reach and read a scene hotspot', async ({ page }) => {
  await tabTo(page, 'start');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('sequence')).toBeVisible();
  await tabTo(page, 'skip');
  await page.keyboard.press('Space');
  await expect(page.getByTestId('objective')).toBeVisible();
  await tabTo(page, 'spot-E01');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: EVIDENCE.E01.title, exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('reader')).toHaveCount(0);
  await expect(page.getByTestId('clue-count')).toHaveText('1 / 4');
});

test('keyboard focus moves into dialogs, returns to the opener, and lands on feedback', async ({ page }) => {
  await startSkippingIntro(page);

  await page.getByTestId('spot-E02').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('close-reader')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('spot-E02')).toBeFocused();

  await page.getByTestId('spot-E03').focus();
  await page.keyboard.press('Enter');
  await page.getByTestId('pin').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('chip-E02')).toBeFocused();

  await page.keyboard.press('Enter');
  await page.getByTestId('claim-beer').focus();
  await page.keyboard.press('Enter');
  await page.getByTestId('submit').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('board-reply')).toBeFocused();
  await expect(page.getByTestId('board-reply')).toContainText('結論說過頭了');

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('spot-E03')).toBeFocused();
});

test('Tab and Shift+Tab stay inside an open dialog', async ({ page }) => {
  await startSkippingIntro(page);
  await page.getByTestId('spot-E01').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('close-reader')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('toggle-sources')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByTestId('close-reader')).toBeFocused();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(
      () => !!document.activeElement && !!document.querySelector('[data-testid="reader"]')?.contains(document.activeElement),
    );
    expect(inside).toBe(true);
  }
});

test('focus survives re-renders inside a dialog', async ({ page }) => {
  await startSkippingIntro(page);
  await page.getByTestId('spot-E01').focus();
  await page.keyboard.press('Enter');
  await page.getByTestId('toggle-sources').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('provenance')).toBeVisible();
  await expect(page.getByTestId('toggle-sources')).toBeFocused();
  await page.getByTestId('pin').focus();
  await page.keyboard.press('Enter');
  await page.getByTestId('slot-0').focus();
  await page.keyboard.press('Enter');
  const inBoard = await page.evaluate(
    () => !!document.querySelector('[data-testid="board"]')?.contains(document.activeElement),
  );
  expect(inBoard).toBe(true);
});


test('part two: source-level feedback, three-failure hint, reread, reload and keyboard repair', async ({ page, isMobile }, info) => {
  await startSkippingIntro(page);
  await solveChapter1(page);
  await collect(page, 'E04', 'E05', 'E09', 'E10');
  await openBoard(page);
  await fillTable(page);
  await setCell(page, 'workhouse', 'pump', true); // 院內有泵，不等於街泵供水
  for (let i = 0; i < 3; i++) await answer(page, 'pump', '證據撐不住這句話');
  await expect(page.getByTestId('question')).not.toContainText('我天天喝');
  await expect(page.locator('.compare .needs-review')).toHaveCount(1);
  await expect(page.locator('.compare .needs-review')).toContainText('濟貧院');
  await expect(page.locator('.compare td.wrong')).toHaveCount(0);
  if (isMobile) await expectNoHorizontalScroll(page);
  await capture(page, info, 'table-reread');

  await page.getByTestId('table-read-workhouse-E05').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('reader')).toContainText('院子底下自己的井水');
  await page.keyboard.press('Escape');
  await page.getByTestId('spot-hale').click();
  await expect(page.getByTestId('dialogue')).toContainText('自家的井');
  await expect(page.getByTestId('dialogue')).toContainText('535');
  await page.reload();
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('chapter')).toContainText('第二段');
  await openBoard(page);
  await expect(page.getByTestId('cell-workhouse-pump')).toHaveText('是');
  await expect(page.getByTestId('cell-coffee-pump')).toHaveText('是');
  await expect(page.getByTestId('claim-pump')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('cell-workhouse-pump').focus();
  await page.keyboard.press('Space');
  await expect(page.getByTestId('cell-workhouse-pump')).toHaveText('否');
  await expect(page.getByTestId('cell-workhouse-pump')).toBeFocused();
  await page.getByTestId('submit').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('question')).toContainText('我天天喝這泵的水');
  if (isMobile) await expectNoHorizontalScroll(page);
});

test('save compatibility: resumes a frozen pre-D010 v3 table without changing any saved cells', async ({ page }) => {
  // Literal old-format fixture, independent of current initialState()/tableTruth().
  await page.evaluate((saved) => localStorage.setItem('unnamed-disease/case01/v3', JSON.stringify(saved)), legacyTableSave);
  await page.reload();
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('chapter')).toContainText('第二段');
  await openBoard(page);
  for (const [row, cells] of Object.entries(legacyTableSave.cells)) {
    for (const [col, value] of Object.entries(cells)) {
      await expect(page.getByTestId(`cell-${row}-${col}`)).toHaveText(value === null ? '？' : value ? '是' : '否');
    }
  }
  await expect(page.getByTestId('claim-crowd')).toContainText('已排除');
  await expect(page.getByTestId('submit')).toBeDisabled();
  await setCell(page, 'coffee', 'pump', true);
  await answer(page, 'pump', '找到了');
  await expect(page.getByTestId('question')).toContainText('我天天喝這泵的水');
});
