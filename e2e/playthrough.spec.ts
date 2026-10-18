import { expect, test, type Page, type TestInfo } from '@playwright/test';

const documents = {
  E01: { title: '本分區霍亂死亡登記（摘抄）', tags: ['史實', '重建'] },
  E02: { title: 'Broad Street 啤酒廠帳房的回信', tags: ['史實', '虛構'] },
  E03: { title: '你的筆記：啤酒廠門口的談話', tags: ['史實', '虛構'] },
  E08: { title: '致教區的請願信', tags: ['重建', '虛構'] },
} as const;

type Evidence = keyof typeof documents;

const introBeats = [
  '1854 年 9 月 5 日，星期二，傍晚。',
  '上週四深夜起，Broad Street 一帶的霍亂突然暴增。',
  '你是本分區登記處的臨時抄寫助手。',
  '街角又有人死了。',
  '是空氣。陰溝、糞坑、屠宰場',
  '你想起今天下午經過的那間啤酒廠。',
];

const endingBeats = [
  '啤酒廠就在 Broad Street 上。',
  '差別在於，他們不去那個街泵打水。',
  '這證明不了什麼。也許是巧合',
  '但如果你說得對',
  'Poland Street 的濟貧院呢？',
  '聽說有位姓斯諾的醫生',
  '明天一早，去濟貧院。',
];

async function advanceEveryBeat(page: Page, beats: readonly string[]) {
  for (const beat of beats) {
    await expect(page.getByTestId('sequence')).toBeVisible();
    await expect(page.getByTestId('beat-text')).toContainText(beat);
    await page.getByRole('button', { name: '繼續 ▸', exact: true }).click();
  }
  await expect(page.getByTestId('sequence')).toHaveCount(0);
}

async function capture(page: Page, info: TestInfo, moment: string) {
  const path = `test-results/screens/${info.project.name}-${moment}.png`;
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await info.attach(moment, { path, contentType: 'image/png' });
}

async function openDocument(page: Page, id: Evidence) {
  await page.getByTestId(`spot-${id}`).click();
  const reader = page.getByRole('dialog', { name: documents[id].title, exact: true });
  await expect(reader).toBeVisible();
  await expect(page.getByTestId('reader')).toBeVisible();
  return reader;
}

async function collectDocument(page: Page, id: Evidence) {
  const reader = await openDocument(page, id);
  await reader.getByRole('button', { name: '關閉', exact: true }).click();
  await expect(page.getByTestId('reader')).toHaveCount(0);
  await expect(page.getByTestId(`clue-${id}`)).toContainText(documents[id].title);
}

async function openBoard(page: Page) {
  await page.getByTestId('open-board').click();
  await expect(page.getByRole('dialog', { name: '推理板', exact: true })).toBeVisible();
}

async function placePair(page: Page, first: Evidence, second: Evidence) {
  for (const [index, id] of [first, second].entries()) {
    await expect(page.getByTestId(`slot-${index}`)).toContainText('從下方線索選一份');
    await page.getByTestId(`chip-${id}`).click();
    await expect(page.getByTestId(`chip-${id}`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId(`slot-${index}`)).toContainText(documents[id].title);
  }
}

async function expectReply(page: Page, verdict: string) {
  await expect(page.getByRole('dialog', { name: '推理板', exact: true })).toBeVisible();
  await expect(page.getByTestId('board-reply')).toBeVisible();
  await expect(page.getByTestId('board-reply')).toContainText(verdict);
  await expect(page.getByTestId('verdict')).toContainText(verdict);
  await expect(page.getByTestId('summary')).toHaveCount(0);
}

async function finishCase(page: Page, skipEnding = false) {
  await expect(page.getByTestId('submit')).toBeEnabled();
  await page.getByTestId('submit').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  if (skipEnding) {
    await expect(page.getByTestId('beat-text')).toContainText(endingBeats[0]);
    await page.getByRole('button', { name: '跳過，看總結', exact: true }).click();
  } else {
    await advanceEveryBeat(page, endingBeats);
  }
  await expect(page.getByTestId('summary')).toBeVisible();
  await expect(page.getByTestId('summary')).toContainText('第一段・完');
  await expect(page.getByTestId('summary')).toContainText('史實與虛構');
}

async function skipIntro(page: Page) {
  await page.getByRole('button', { name: '開始調查', exact: true }).click();
  await expect(page.getByTestId('sequence')).toBeVisible();
  await page.getByRole('button', { name: '跳過開場', exact: true }).click();
  await expect(page.getByTestId('objective')).toBeVisible();
}

async function expectNoHorizontalScroll(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    if (!document.scrollingElement) throw new Error('The document has no scrolling element');
    return document.scrollingElement.scrollWidth - window.innerWidth;
  })).toBeLessThanOrEqual(0);
}

async function tabTo(page: Page, testId: string) {
  const target = page.getByTestId(testId);
  await expect(target).toBeVisible();
  // Navigate with real keyboard input; the bound turns a broken tab order into a failure.
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

// All three journeys run in both projects, including the complete win on Pixel 7.
test('full investigation: every intro beat, four clues, feedback, ending and restart', async ({ page, isMobile }, info) => {
  await capture(page, info, 'title');
  await page.getByRole('button', { name: '開始調查', exact: true }).click();
  await advanceEveryBeat(page, introBeats);
  const objective = page.getByTestId('objective');
  await expect(objective).toBeVisible();
  await expect(objective).toContainText('住在這一帶，就一定逃不過嗎？');
  const originalObjective = await objective.innerText();
  await expect(page.getByTestId('clue-count')).toHaveText('0 / 4');
  if (isMobile) await expectNoHorizontalScroll(page);
  await capture(page, info, 'desk');

  await openBoard(page);
  await expect(page.getByTestId('submit')).toBeDisabled();
  await page.getByTestId('close-board').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  for (const id of ['E01', 'E02', 'E03', 'E08'] as const) {
    const reader = await openDocument(page, id);
    await reader.getByRole('button', { name: '史料註記 ▾', exact: true }).click();
    const provenance = reader.getByTestId('provenance');
    await expect(provenance).toBeVisible();
    // E02/E03 contain both historical and fictional tags; E01/E08 also document reconstructions.
    for (const tag of documents[id].tags) {
      await expect(provenance.getByText(tag, { exact: true }).first()).toBeVisible();
    }
    if (id === 'E02') await capture(page, info, 'reader');
    await reader.getByRole('button', { name: '收起史料註記 ▴', exact: true }).click();
    await expect(reader.getByTestId('provenance')).toHaveCount(0);
    await reader.getByRole('button', { name: '關閉', exact: true }).click();
    await expect(page.getByTestId('reader')).toHaveCount(0);
    await expect(page.getByTestId(`clue-${id}`)).toContainText(documents[id].title);
  }
  await expect(page.getByTestId('clue-count')).toHaveText('4 / 4');
  await expect(page.getByTestId('summary')).toHaveCount(0);
  await expect(page.getByTestId('sequence')).toHaveCount(0);
  await expect(objective).toBeVisible();
  if (isMobile) await expectNoHorizontalScroll(page);

  await page.getByTestId('spot-window').click();
  await expect(page.getByTestId('dialogue')).toContainText('窗外天色暗了');
  await expect(page.getByTestId('dialogue')).toContainText('還有人提著水桶，在街泵前排隊');
  await page.getByTestId('spot-hale').click();
  await expect(page.getByTestId('dialogue')).toContainText('都看過了？那就打開「推理板」。');

  await openBoard(page);
  await placePair(page, 'E01', 'E02');
  await expect(page.getByTestId('submit')).toBeDisabled();
  await page.getByTestId('claim-water').click();
  await page.getByTestId('submit').click();
  await expectReply(page, '有效的觀察');
  await expect(objective).not.toHaveText(originalObjective);
  await expect(objective).toContainText('啤酒廠的人和街坊差在哪裡？');
  await page.getByTestId('board-reply').scrollIntoViewIfNeeded();
  await capture(page, info, 'board-with-reply');

  await page.getByTestId('claim-job').click();
  await page.getByTestId('submit').click();
  await expectReply(page, '這個差別被排除了');
  await expect(page.getByTestId('board-reply')).toContainText('雷管工廠');

  await page.getByTestId('slot-0').click();
  await page.getByTestId('slot-1').click();
  await placePair(page, 'E02', 'E03');
  await page.getByTestId('claim-beer').click();
  await page.getByTestId('submit').click();
  await expectReply(page, '結論說過頭了');

  await page.getByTestId('claim-water').click();
  await expect(page.getByTestId('claim-water')).toHaveAttribute('aria-pressed', 'true');
  await finishCase(page);
  await capture(page, info, 'summary');
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await expect(page.getByRole('button', { name: '開始調查', exact: true })).toBeVisible();
  await expect(page.getByTestId('summary')).toHaveCount(0);
});

test('insufficient evidence never softlocks the investigation; Escape closes both dialogs', async ({ page }) => {
  await skipIntro(page);
  await openDocument(page, 'E01');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('reader')).toHaveCount(0);
  await expect(page.getByTestId('clue-E01')).toBeVisible();
  await collectDocument(page, 'E08');
  await expect(page.getByTestId('clue-count')).toHaveText('2 / 4');
  await expect(page.getByTestId('clue-E02')).toHaveCount(0);
  await expect(page.getByTestId('clue-E03')).toHaveCount(0);

  await openBoard(page);
  await expect(page.getByTestId('chip-E02')).toHaveCount(0);
  await expect(page.getByTestId('chip-E03')).toHaveCount(0);
  await placePair(page, 'E01', 'E08');
  await page.getByTestId('claim-air').click();
  await page.getByTestId('submit').click();
  await expectReply(page, '這個差別被排除了');
  await page.getByTestId('claim-water').click();
  await page.getByTestId('submit').click();
  await expectReply(page, '證據撐不住這句話');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('objective')).toBeVisible();

  // 桌面上的「重新開始」要按兩次；中途做別的事會取消
  await page.getByTestId('restart').click();
  await expect(page.getByTestId('restart')).toContainText('確定重新開始');
  await page.getByTestId('spot-hale').click();
  await expect(page.getByTestId('restart')).toHaveText('重新開始');
  await expect(page.getByTestId('clue-count')).toHaveText('2 / 4');

  await collectDocument(page, 'E02');
  await collectDocument(page, 'E03');
  await expect(page.getByTestId('clue-count')).toHaveText('4 / 4');
  await openBoard(page);
  await page.getByTestId('slot-0').click();
  await page.getByTestId('slot-1').click();
  await placePair(page, 'E02', 'E03');
  await expect(page.getByTestId('claim-water')).toHaveAttribute('aria-pressed', 'true');
  await finishCase(page, true);
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
  await expect(page.getByRole('dialog', { name: documents.E01.title, exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('reader')).toHaveCount(0);
  await expect(page.getByTestId('objective')).toBeVisible();
  await expect(page.getByTestId('clue-count')).toHaveText('1 / 4');
});

test('keyboard focus moves into dialogs, returns to the opener, and lands on feedback', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('start').click();
  await page.getByTestId('skip').click();

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

  await page.getByTestId('chip-E02').focus();
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
  await page.goto('./');
  await page.getByTestId('start').click();
  await page.getByTestId('skip').click();
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
  await page.goto('./');
  await page.getByTestId('start').click();
  await page.getByTestId('skip').click();
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
