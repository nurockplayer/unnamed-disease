import type { Claim, ClaimId, Evidence, EvidenceId } from '../logic/types';

/**
 * 第一案〈沒有染病的人〉第一段：紀錄室。
 * 史實出處 S01 = John Snow, On the Mode of Communication of Cholera, 2nd ed. (1855)。
 * 頁碼見 docs/SOURCES_AND_ASSETS.md。
 */

export const S01 = 'John Snow，《On the Mode of Communication of Cholera》第二版（1855）';

export const HALE = '黑爾先生';

export const INTRO: { speaker?: string; text: string }[] = [
  { text: '1854 年 9 月 5 日，星期二，傍晚。\n倫敦 Soho，Golden Square 附近。' },
  {
    text:
      '上週四深夜起，Broad Street 一帶的霍亂突然暴增。\n許多住戶連夜搬走，整排房子關上了門。',
  },
  { text: '你是本分區登記處的臨時抄寫助手。\n這幾天，你抄下的死者，比平常好幾個月還多。' },
  { speaker: HALE, text: '街角又有人死了。' },
  {
    speaker: HALE,
    text:
      '是空氣。陰溝、糞坑、屠宰場——這幾條街的空氣全壞了。\n住在這一帶的人，誰也逃不掉。',
  },
  { text: '你想起今天下午經過的那間啤酒廠。\n它就在 Broad Street 上——照常開門。' },
];

export const OBJECTIVE = '調查桌上的文件，回答黑爾先生：住在這一帶，就一定逃不過嗎？';
export const OBJECTIVE_AFTER_ANOMALY = '啤酒廠的人和街坊差在哪裡？用證據回答黑爾先生。';

export const QUESTION = '住在這一帶，就一定逃不過嗎？';

export const EVIDENCE: Record<EvidenceId, Evidence> = {
  E01: {
    id: 'E01',
    object: '死亡登記冊',
    title: '本分區霍亂死亡登記（摘抄）',
    body: [
      '總登記處本週彙整的抄件（至 9 月 2 日止）：Golden Square、Berwick Street、St. Ann’s 三個分區共登記霍亂死者 89 人——其中 79 人死於週五、週六兩天。',
      '9 月 1 日｜Broad Street｜女，38 歲，洗衣婦｜病程約 12 小時',
      '9 月 1 日｜Cambridge Street｜男，6 歲，學童｜病程約 20 小時',
      '9 月 2 日｜Hopkins Street｜男，Broad Street 雷管工廠工人｜病程約 9 小時',
      '9 月 2 日｜Poland Street｜男，45 歲，裁縫｜病程約 1 天',
      '9 月 3 日｜Marshall Street｜女，60 歲，寡婦｜病程約 14 小時',
      '9 月 3 日｜Berwick Street｜男，31 歲，鞋匠｜病程約 18 小時',
      '……（以下略）',
      '你在頁邊用鉛筆寫了兩行：「地址幾乎都擠在 Broad Street 周圍幾條街。」「翻遍整本，找不到一個啤酒廠的工人。啤酒廠明明就在 Broad Street 上？」',
    ],
    takeaway: '死者擠在 Broad Street 周圍幾條街；名單上找不到啤酒廠的工人。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note:
          '疫情集中在 Broad Street 一帶；至 9/2 止的一週，三個分區登記 89 名霍亂死者，其中 79 人死於週五、週六。',
        source: `${S01}，pp.38–39`,
      },
      {
        kind: 'HISTORICAL_RECORD',
        note: 'Snow 也注意到，登記中沒有啤酒廠工人死於霍亂。',
        source: `${S01}，p.42`,
      },
      {
        kind: 'HISTORICAL_RECORD',
        note: 'Broad Street 37 號的雷管工廠約 200 名工人中，有 18 人在自己家中死於霍亂。',
        source: `${S01}，p.43`,
      },
      {
        kind: 'RECONSTRUCTION',
        note:
          '登記冊格式與逐筆條目為遊戲重建。89／79 的彙整數字史料中是 Snow 向總登記處（General Register Office）抄得；此處改為由登記處助手抄回。為避免與真實死者混淆，條目不列姓名，也不對應真實門牌。',
      },
    ],
  },
  E02: {
    id: 'E02',
    object: '啤酒廠的回信',
    title: 'Broad Street 啤酒廠帳房的回信',
    body: [
      '致 登記處：',
      '閣下詢問本廠工人近況，謹覆如下。',
      '本廠僱工七十餘人。疫病流行以來，無一人患重症；僅兩人一度身體不適，並不嚴重。',
      '—— Broad Street 啤酒廠 帳房 W. 柯林斯　9 月 5 日',
    ],
    takeaway: '啤酒廠七十多名工人沒有人重病，只有兩人輕微不適。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note:
          '啤酒廠僱工七十餘人，無人患嚴重霍亂，僅兩人一度輕微不適。此為業主 Huggins 先生告訴 Snow 的說法。',
        source: `${S01}，p.42`,
      },
      {
        kind: 'FICTION',
        note: '帳房「W. 柯林斯」與這封回信是虛構的；由主角去信詢問也是虛構情節。',
      },
    ],
  },
  E03: {
    id: 'E03',
    object: '你的筆記本',
    title: '你的筆記：啤酒廠門口的談話',
    body: [
      '下午在啤酒廠門口，和一位運酒的車夫說了幾句話。',
      '「廠裡配給我們一定份量的麥芽酒。老闆說，我們根本不喝水。」',
      '「街上那個泵？我們從來不去那兒打水。」',
      '廠裡有自己的深井，另外接 New River 公司的供水。',
      '（自己記一筆：「根本不喝水」只是老闆的看法。）',
    ],
    takeaway: '廠裡配麥芽酒；據說工人從不去街泵打水；廠內有深井，也接 New River 的水。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note:
          '工人有麥芽酒配給；業主相信他們根本不喝水，並確定工人從未從街泵取水；廠內有深井，另用 New River 的供水。',
        source: `${S01}，p.42`,
      },
      {
        kind: 'FICTION',
        note: '車夫與門口談話是虛構的；史料中這些話出自業主對 Snow 的陳述。',
      },
    ],
  },
  E08: {
    id: 'E08',
    object: '居民請願信',
    title: '致教區的請願信',
    body: [
      '敬啟者：',
      '本街一帶陰溝堵塞，糞坑滿溢，入夜後臭不可聞。自臭氣加重以來，鄰里接連病倒，孩子也沒能倖免。',
      '懇請教區速派人清理溝渠、撒布石灰，以免更多人家受害。',
      '—— Marshall Street 住戶九人 謹上',
    ],
    takeaway: '居民把疾病歸咎於惡臭的空氣——這是當時很有影響力的解釋。',
    provenance: [
      {
        kind: 'RECONSTRUCTION',
        note:
          '當時「瘴氣」（污濁空氣致病）是有影響力的解釋，要求清理溝渠也是合理的衛生訴求，並非愚昧。',
        source: 'Royal College of Surgeons，〈Mapping disease〉（S05，背景）',
      },
      { kind: 'FICTION', note: '這封請願信與署名住戶是虛構的。' },
    ],
  },
};

export const EVIDENCE_ORDER: EvidenceId[] = ['E01', 'E02', 'E03', 'E08'];

export const WINDOW_TEXT = [
  '窗外天色暗了。風從南邊吹來，帶著陰溝的氣味。',
  'Broad Street 那頭，還有人提著水桶，在街泵前排隊。',
];

export const BOARD_FRAME = '就在疫區正中間，有一群人幾乎沒事。他們和死去的街坊，差別在於——';

export const CLAIMS: Record<ClaimId, Claim> = {
  air: { id: 'air', text: '吸的空氣' },
  place: { id: 'place', text: '住和做工的地方' },
  job: { id: 'job', text: '從事的行業' },
  beer: { id: 'beer', text: '喝麥芽酒' },
  water: { id: 'water', text: '取水的來源' },
  luck: { id: 'luck', text: '運氣與體質' },
};

export const CLAIM_ORDER: ClaimId[] = ['air', 'place', 'job', 'beer', 'water', 'luck'];

/** 與黑爾先生交談時，依進度給出的提示 */
export function haleTalk(seenCount: number, anomaly: boolean, failures: number): string[] {
  if (seenCount === 0) {
    return [
      '登記冊、啤酒廠的回信、你的筆記，還有那封請願信，都在桌上。',
      '你要是不同意我，就拿證據來。',
    ];
  }
  if (seenCount < 2) {
    return ['桌上的東西還沒看完吧？點一下就能讀。讀過的會收進右邊的線索夾，隨時能重看。'];
  }
  if (failures >= 3) {
    return [
      '空氣、街道，他們和街坊都一樣。那他們每天做的事裡，有哪一件和街坊不同？',
      '你的筆記本上，記了啤酒廠門口那段談話。',
    ];
  }
  if (anomaly) {
    return [
      '就算啤酒廠是個例外——為什麼偏偏是他們？',
      '他們和街坊吸的是同一條街的空氣。差別到底在哪裡？',
    ];
  }
  if (seenCount < 4) {
    return [
      '還有東西沒看。',
      '想好了就打開「推理板」：挑兩份證據，告訴我那群人和街坊差在哪裡。',
    ];
  }
  return ['都看過了？那就打開「推理板」。', '挑兩份證據，告訴我那群人和街坊差在哪裡。'];
}

export const ENDING: { speaker?: string; text: string }[] = [
  { speaker: HALE, text: '……啤酒廠就在 Broad Street 上。那些工人，和死者吸的是同一條街的空氣。' },
  { speaker: HALE, text: '你是說……差別在於，他們不去那個街泵打水。' },
  {
    speaker: HALE,
    text: '這證明不了什麼。也許是巧合，也許是那口深井比較乾淨，也許還有別的原因。',
  },
  { speaker: HALE, text: '但如果你說得對——' },
  {
    speaker: HALE,
    text:
      'Poland Street 的濟貧院呢？五百多人擠在一起，四周大半的房子都有人死。\n他們的水，又是從哪裡來的？',
  },
  {
    speaker: HALE,
    text: '聽說有位姓斯諾的醫生，這兩天也在這一帶打聽死者喝哪裡的水。',
  },
  { text: '明天一早，去濟貧院。' },
];

export const HISTORY_NOTES: string[] = [
  '1854 年人們已知道「霍亂」這個病名；當時沒有定論的，是它如何傳播。',
  'John Snow 早在 1849 年就已發表霍亂經由水傳播的觀點；1854 年 9 月 3 日晚他檢查了街泵的水，之後逐一查問死者的飲水（Snow 1855, pp.39–40）。黑爾先生口中的傳聞是戲劇重建：史料沒有記下他每一天的行程。',
  '9 月 7 日晚，Snow 向 St. James 教區監護委員會陳述調查結果；9 月 8 日，Broad Street 街泵的把手被移除（Snow 1855, p.40）。',
  '依 Snow 自己的統計，把手移除前，新病例已大幅減少；居民大量出逃也減少了死亡。Snow 自己承認無法單憑時間順序判定拆把手的效果，所以不能說「拆掉把手就立刻終結了疫情」（Snow 1855, pp.38, 51–52）。',
  '主角、黑爾先生、帳房、車夫與請願信皆為虛構；啤酒廠工人的人數、病況與取水方式出自 Snow 對業主 Huggins 先生的記錄（Snow 1855, p.42）。',
];
