import type {
  Beat,
  ChapterId,
  ColumnId,
  EvidenceId,
  Option,
  PuzzleId,
  RowId,
  SequenceId,
} from '../logic/types';
export type { ColumnId };

/** 第一案〈沒有染病的人〉：三段的敘事、場景與謎題文字。 */

export const HALE = '黑爾先生';
export const NEIGHBOUR = '街泵前的鄰居';

// ---------- 過場 ----------

export const SEQUENCES: Record<SequenceId, Beat[]> = {
  intro: [
    { text: '1854 年 9 月 5 日，星期二，傍晚。\n倫敦 Soho，Golden Square 附近。' },
    { text: '上週四深夜起，Broad Street 一帶的霍亂突然暴增。\n許多住戶連夜搬走，整排房子關上了門。' },
    { text: '你是本分區登記處的臨時抄寫助手。\n這幾天，你抄下的死者，比平常好幾個月還多。' },
    { speaker: HALE, text: '街角又有人死了。' },
    { speaker: HALE, text: '是空氣。陰溝、糞坑、屠宰場——這幾條街的空氣全壞了。\n住在這一帶的人，誰也逃不掉。' },
    { text: '你想起今天下午經過的那間啤酒廠。\n它就在 Broad Street 上——照常開門。' },
  ],
  to2: [
    { speaker: HALE, text: '……啤酒廠就在 Broad Street 上。那些工人，和死者吸的是同一條街的空氣。' },
    { speaker: HALE, text: '你是說……差別在於，他們不去那個街泵打水。' },
    { speaker: HALE, text: '這證明不了什麼。也許是巧合，也許是那口深井比較乾淨，也許還有別的原因。' },
    { speaker: HALE, text: '但如果你說得對——' },
    {
      speaker: HALE,
      text: 'Poland Street 的濟貧院呢？五百多人擠在一起，四周大半的房子都有人死。\n他們的水，又是從哪裡來的？',
    },
    { speaker: HALE, text: '聽說有位姓斯諾的醫生，這兩天也在這一帶打聽死者喝哪裡的水。' },
    { text: '1854 年 9 月 6 日，星期三，上午。\nBroad Street。' },
    { text: '街上的人少了一大半。不少門窗釘上了木板。' },
    { speaker: HALE, text: '濟貧院、門口擺著水桶的雷管工廠，還有街角那間咖啡館。\n一處一處問。問完了，我們把它們排在一起比。' },
  ],
  to3: [
    { speaker: NEIGHBOUR, text: '……哼。' },
    { text: '鄰居提起水桶，頭也不回地走了。' },
    { speaker: HALE, text: '這張表說的是「誰比較危險」，不是「喝了就一定會死」。說得好。' },
    { speaker: HALE, text: '……接下來，是委員會和醫生們的事。' },
    { speaker: HALE, text: '我們是登記處。我們能做的，是把每一筆都記清楚。' },
    { text: '9 月 7 日晚，斯諾醫生向 St. James 教區監護委員會陳述了他的調查。' },
    { text: '第二天，9 月 8 日，Broad Street 街泵的把手被拆了下來。' },
    { text: '1854 年 9 月 12 日，星期二。\n紀錄室。' },
    { speaker: HALE, text: '把手拆了。街上的人，也走得差不多了。' },
    { speaker: HALE, text: '可是有兩樣東西，我想讓你看看。\n一個住在好幾哩外的人，也死於這場霍亂。' },
  ],
  finale: [
    { speaker: HALE, text: '……說不準，卻還是得做決定。\n這大概是這份差事最難的地方。' },
    { text: '那年秋天，疫情漸漸平息。\n斯諾醫生事後統計，這場爆發共奪走六百多條人命。' },
    { text: '第二年，他把這次調查寫進新版的書裡，\n連同一張標滿死者住址的地圖。' },
    { text: '而你抄下的那些名字，每一個，都曾經是某個人。' },
  ],
};

// ---------- 章節與場景 ----------

export interface Chapter {
  id: ChapterId;
  label: string;
  /** 這一段可調查的證據（場景熱點） */
  evidence: EvidenceId[];
  /** 場景提示 */
  hint: string;
  puzzles: PuzzleId[];
  /** 進下一段的過場；最後一段為 finale */
  next: SequenceId;
}

export const CHAPTERS: Record<ChapterId, Chapter> = {
  1: {
    id: 1,
    label: '第一段・紀錄室（9 月 5 日）',
    evidence: ['E01', 'E02', 'E03', 'E08'],
    hint: '點擊桌上的文件閱讀；點黑爾先生與他說話；窗外也能看看。',
    puzzles: ['brewery'],
    next: 'to2',
  },
  2: {
    id: 2,
    label: '第二段・Broad Street（9 月 6 日）',
    evidence: ['E04', 'E05', 'E09', 'E10'],
    hint: '點擊街上的地方打聽消息；街泵和啤酒廠也能看看。',
    puzzles: ['table', 'neighbour'],
    next: 'to3',
  },
  3: {
    id: 3,
    label: '第三段・紀錄室（9 月 12 日）',
    evidence: ['E06', 'E06b', 'E12'],
    hint: '桌上有新的文件。窗外的街泵也看得見。',
    puzzles: ['hampstead', 'handle'],
    next: 'finale',
  },
};

/** 不是證據、但可以看的場景細節 */
export const LOOKS: Record<string, string[]> = {
  window: ['窗外天色暗了。風從南邊吹來，帶著陰溝的氣味。', 'Broad Street 那頭，還有人提著水桶，在街泵前排隊。'],
  pump: [
    '街泵的鐵把手被磨得發亮。旁邊一位鄰居剛打滿一桶，水看起來清清亮亮。',
    '聽說那位斯諾醫生 3 號晚上檢查過這口泵的水，也沒看出多少髒東西。',
  ],
  brewery: ['啤酒廠的大門照常開著，搬酒桶的工人互相吆喝。', '你已經知道他們喝的是什麼水了。'],
  window3: ['Broad Street 那頭，街泵還立在原地——只是沒了把手。', '排隊打水的人不見了。'],
};

// ---------- 謎題 ----------

export type PuzzleKind = 'pair' | 'single' | 'none' | 'table';

export interface Puzzle {
  id: PuzzleId;
  kind: PuzzleKind;
  objective: string;
  /** 推理板上方的問題 */
  question: string;
  /** 問題由誰提出 */
  asker: string;
  /** 選項前的句子 */
  frame: string;
  options: Option[];
  /** 總結頁用：成立的答案怎麼說 */
  summary: (option: string) => string;
}

export const PUZZLES: Record<PuzzleId, Puzzle> = {
  brewery: {
    id: 'brewery',
    kind: 'pair',
    objective: '調查桌上的文件，回答黑爾先生：住在這一帶，就一定逃不過嗎？',
    question: '住在這一帶，就一定逃不過嗎？',
    asker: HALE,
    frame: '就在疫區正中間，有一群人幾乎沒事。他們和死去的街坊，差別在於——',
    options: [
      { id: 'air', text: '吸的空氣' },
      { id: 'place', text: '住和做工的地方' },
      { id: 'job', text: '從事的行業' },
      { id: 'beer', text: '喝麥芽酒' },
      { id: 'water', text: '取水的來源' },
      { id: 'luck', text: '運氣與體質' },
    ],
    summary: () => '同一條街、同樣的空氣，啤酒廠的人卻幾乎沒事。差別可能在於：取水的來源。',
  },
  table: {
    id: 'table',
    kind: 'table',
    objective: '到濟貧院、雷管工廠和咖啡館打聽，填好比較表：哪一欄能把死得多和死得少的地方分開？',
    question: '四個地方都在疫區裡。哪一欄，能把「死得多」和「死得少」分開？',
    asker: HALE,
    frame: '依你問到的話，把表填完，再選出能把結果分開的那一欄。',
    options: [
      { id: 'zone', text: '在疫區裡' },
      { id: 'factory', text: '是工廠' },
      { id: 'crowd', text: '幾十人以上同住或共事' },
      { id: 'pump', text: '喝 Broad Street 街泵的水' },
    ],
    summary: () => '四個地方排在一起：喝街泵水的兩處死得多，不喝的兩處死得少得多。',
  },
  neighbour: {
    id: 'neighbour',
    kind: 'none',
    objective: '回答街泵前那位鄰居。',
    question: '「我天天喝這泵的水，一點事也沒有！你們那張表是胡說。」',
    asker: NEIGHBOUR,
    frame: '你怎麼回答他？',
    options: [
      { id: 'lucky', text: '你只是運氣好；換作別人，早就倒下了。' },
      { id: 'nothing', text: '喝了不一定會病；可是喝這泵水的地方，死的人多得多。' },
      { id: 'wrong', text: '既然有人喝了沒事，也許問題根本不在水。' },
      { id: 'clear', text: '水看起來這麼清，說不定真的跟水無關。' },
    ],
    summary: () => '喝了不一定會病；可是喝這泵水的地方，死的人多得多——一個例外推翻不了整張對照。',
  },
  hampstead: {
    id: 'hampstead',
    kind: 'pair',
    objective: '讀週報和黑爾先生的便條：住在好幾哩外的人，為什麼也死了？',
    question: '她住得那麼遠，為什麼也死了？',
    asker: HALE,
    frame: '她住在好幾哩外的 Hampstead，那一帶沒有霍亂。她和 Hampstead 的鄰居，差別在於——',
    options: [
      { id: 'air', text: '吸的空氣' },
      { id: 'place', text: '住的地方' },
      { id: 'age', text: '年紀與體質' },
      { id: 'contact', text: '接觸過病人' },
      { id: 'water', text: '喝的水從哪裡來' },
    ],
    summary: () => '她住得遠，喝的卻是從 Broad Street 運去的泵水——要追的是水，不只是住址。',
  },
  handle: {
    id: 'handle',
    kind: 'single',
    objective: '回答黑爾先生：是拆把手結束了這場疫情嗎？',
    question: '9 月 8 日拆了街泵的把手。是拆把手，結束了這場疫情嗎？',
    asker: HALE,
    frame: '選一份證據，再說出你的判斷：',
    options: [
      { id: 'ended', text: '是的：把手一拆，死亡就一天天少了，可見是它結束了疫情。' },
      { id: 'useless', text: '沒有用：死亡在拆把手前就在減少，拆不拆都一樣。' },
      { id: 'prudent', text: '說不準是不是它結束了疫情；但證據大多指向那口泵，先停用是對的。' },
      { id: 'drains', text: '問題出在陰溝和臭氣；該做的是清溝渠、撒石灰。' },
    ],
    summary: () => '說不準是不是拆把手結束了疫情；但在證據大多指向那口泵時，先停用它是合理的預防。',
  },
};

// ---------- 比較表 ----------

export interface TableRow {
  id: RowId;
  label: string;
  /** 這一列需要讀過的證據（任一組成立即可） */
  needs: EvidenceId[][];
  /** 每一欄的正確答案（玩家自己填） */
  facts: Record<ColumnId, boolean>;
  result: string;
  many: boolean;
}

export const TABLE_COLUMNS: { id: ColumnId; label: string }[] = [
  { id: 'zone', label: '在疫區裡' },
  { id: 'factory', label: '是工廠' },
  { id: 'crowd', label: '幾十人以上同住或共事' },
  { id: 'pump', label: '喝 Broad Street 街泵的水' },
];

export const TABLE_ROWS: TableRow[] = [
  {
    id: 'brewery',
    label: '啤酒廠（七十餘名工人）',
    needs: [['E03', 'E02'], ['E03', 'E01']],
    facts: { zone: true, factory: true, crowd: true, pump: false },
    result: '幾乎沒事',
    many: false,
  },
  {
    id: 'workhouse',
    label: '濟貧院（535 名住民）',
    needs: [['E04', 'E05']],
    facts: { zone: true, factory: false, crowd: true, pump: false },
    result: '535 人中 5 人死亡',
    many: false,
  },
  {
    id: 'capworks',
    label: '雷管工廠（約 200 名工人）',
    needs: [['E09']],
    facts: { zone: true, factory: true, crowd: true, pump: true },
    result: '十幾人死亡',
    many: true,
  },
  {
    id: 'coffee',
    label: '咖啡館的常客',
    needs: [['E10']],
    facts: { zone: true, factory: false, crowd: false, pump: true },
    result: '已知 9 位常客死亡',
    many: true,
  },
];

/** 表格每一格的正確答案 */
export function tableTruth(): Record<RowId, Record<ColumnId, boolean>> {
  return Object.fromEntries(TABLE_ROWS.map((r) => [r.id, { ...r.facts }])) as Record<
    RowId,
    Record<ColumnId, boolean>
  >;
}

// ---------- 黑爾先生的提示 ----------

export function haleTalk(
  puzzle: PuzzleId,
  seenHere: number,
  totalHere: number,
  anomaly: boolean,
  failures: number,
): string[] {
  switch (puzzle) {
    case 'brewery':
      if (seenHere === 0)
        return ['登記冊、啤酒廠的回信、你的筆記，還有那封請願信，都在桌上。', '你要是不同意我，就拿證據來。'];
      if (seenHere < 2)
        return ['桌上的東西還沒看完吧？點一下就能讀。讀過的會收進線索夾，隨時能重看。'];
      if (failures >= 3)
        return [
          '空氣、街道，他們和街坊都一樣。那他們每天做的事裡，有哪一件和街坊不同？',
          '你的筆記本上，記了啤酒廠門口那段談話。',
        ];
      if (anomaly)
        return ['就算啤酒廠是個例外——為什麼偏偏是他們？', '他們和街坊吸的是同一條街的空氣。差別到底在哪裡？'];
      if (seenHere < totalHere)
        return ['還有東西沒看。', '想好了就打開「推理板」：挑兩份證據，告訴我那群人和街坊差在哪裡。'];
      return ['都看過了？那就打開「推理板」。', '挑兩份證據，告訴我那群人和街坊差在哪裡。'];

    case 'table':
      if (failures >= 3)
        return ['一欄一欄看：哪一欄，打勾的地方都死得多、沒打勾的地方都死得少？'];
      if (seenHere < totalHere)
        return ['濟貧院的大門和院子、雷管工廠、那間咖啡館——每一處都問問。', '問過的地方，會出現在推理板的比較表上。'];
      return ['都問過了。打開推理板，照你問到的話把表填起來。', '我說是臭氣，你說是水。表填好了，讓它自己說話。'];

    case 'neighbour':
      return ['那位鄰居還在等你回答。', '他說的是實話——喝了沒事的人確實有。'];

    case 'hampstead':
      if (failures >= 3)
        return ['她和鄰居吸一樣的空氣、住一樣的地方。', '她每天喝的東西，是從哪裡來的？'];
      if (seenHere < totalHere) return ['週報、我的便條、統計表，都在桌上。'];
      return ['她住得那麼遠，為什麼也死了？打開推理板告訴我。'];

    case 'handle':
      return ['拆把手，結束了這場疫情嗎？', '看看那張逐日統計，再回答我。'];
  }
}

// ---------- 結尾 ----------

/** 依玩家「說過頭」的次數，黑爾先生最後的評語 */
export function closingRemark(overreaches: number): string {
  if (overreaches === 0) return '這幾天，你沒有一次把話說滿。這在登記處，是難得的本事。';
  if (overreaches <= 2) return '你有幾次衝得太快，可每一次，你都退回來看證據。';
  return '你常常急著下結論。下次，先讓證據把話說完。';
}

export const HISTORY_NOTES: string[] = [
  '1854 年人們已知道「霍亂」這個病名；當時沒有定論的，是它如何傳播。',
  'John Snow 早在 1849 年就已發表霍亂經由水傳播的觀點；1854 年 9 月 3 日晚他檢查了街泵的水，之後逐一查問死者的飲水（Snow 1855, pp.39–40）。',
  '啤酒廠、濟貧院、雷管工廠與咖啡館的人數、死亡與取水方式，都出自 Snow 的記錄（Snow 1855, pp.41–43）；向主角說出這些話的人是虛構的。',
  '9 月 7 日晚，Snow 向 St. James 教區監護委員會陳述調查結果；9 月 8 日，街泵的把手被移除（Snow 1855, p.40）。',
  'Hampstead 寡婦的死亡登在 9 月 9 日的週報；經 Fraser 醫生提醒，Snow 向她兒子問得取水與姪女的細節（Snow 1855, p.44），問到的日期不詳。由醫生轉述給黑爾先生是戲劇重建。',
  '依 Snow 自己的統計，把手移除前新病例已大幅減少，居民大量出逃也減少了死亡；Snow 承認無法判定拆把手時井水是否仍帶著病因（Snow 1855, pp.38, 51–52）。',
  'Snow 也承認，有許多人喝了泵水卻沒有發病（Snow 1855, p.44）。',
  '主角、黑爾先生、帳房、車夫、門房、工頭、老闆娘、鄰居與請願信皆為虛構。',
];
