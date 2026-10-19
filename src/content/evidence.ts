import type { Evidence, EvidenceId } from '../logic/types';

/**
 * 全案證據。史實出處 S01 = John Snow, On the Mode of Communication of Cholera, 2nd ed. (1855)，
 * 頁碼為原書頁碼（見 docs/SOURCES_AND_ASSETS.md）。
 */
export const S01 = 'John Snow，《On the Mode of Communication of Cholera》第二版（1855）';

export const EVIDENCE: Record<EvidenceId, Evidence> = {
  E01: {
    id: 'E01',
    object: '死亡登記冊',
    title: '本分區霍亂死亡登記（摘抄）',
    body: [
      '總登記處本週彙整的抄件（至 9 月 2 日止）：Golden Square、Berwick Street、St. Ann’s 三個分區共登記霍亂死者 89 人——其中 79 人死於週五、週六兩天。',
      '以下是本分區這幾天親手登記的條目（9 月 1 日起，節錄）：',
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

  // ---------- 第二段：Broad Street（9 月 6 日） ----------
  E04: {
    id: 'E04',
    object: '濟貧院大門',
    title: 'Poland Street 濟貧院：門房的話',
    body: [
      '「院裡住了五百三十五個人。這陣子死於霍亂的，只有五個。」',
      '「你說還有別的？那些是病倒之後才送進來的，不算院裡的人。」',
      '你回頭看：濟貧院四面，有三面以上被死過人的房子圍著。',
      '黑爾先生小聲算了算：「要是院裡跟四周一樣，該死上一百多人。」',
    ],
    takeaway: '濟貧院 535 人，只有 5 人死於霍亂；它三面以上被有死者的房子包圍。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note:
          '濟貧院四分之三以上被有霍亂死者的房屋包圍，535 名住民中只有 5 人死於霍亂；其他死者是發病後才被收容的。Snow 估計若死亡率與周圍街道相同，應有一百多人死亡。',
        source: `${S01}，p.42`,
      },
      { kind: 'RECONSTRUCTION', note: '5 人是 Snow 的最終統計；9 月 6 日當天的確切數字不詳。' },
      { kind: 'FICTION', note: '門房與這段對話是虛構的；黑爾先生的估算借用 Snow 的推算。' },
    ],
  },
  E05: {
    id: 'E05',
    object: '濟貧院的水泵',
    title: '濟貧院院子裡的水泵',
    body: [
      '院子角落有一口井，井上裝著水泵。提水的雜役說：',
      '「院裡用自己的井，另外接 Grand Junction 水務公司的水。」',
      '「Broad Street 那個泵？院裡從來不派人去那兒打水。」',
    ],
    takeaway: '濟貧院用自己的井和 Grand Junction 公司的水，從不去 Broad Street 街泵打水。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note: '濟貧院院內有水井，另有 Grand Junction Water Works 供水，住民從不派人去 Broad Street 取水。',
        source: `${S01}，p.42`,
      },
      { kind: 'FICTION', note: '雜役與這段對話是虛構的。' },
    ],
  },
  E09: {
    id: 'E09',
    object: '雷管工廠',
    title: 'Broad Street 37 號：雷管工廠工頭的話',
    body: [
      '「廠裡大概兩百個工人。」',
      '「我們在廠裡擺了兩個桶，一直裝滿水，誰渴了誰喝。」',
      '「水從哪來？當然是街上那個泵，就在門口。」',
      '「這幾天，已經有十幾個人死了，都死在自己家裡。」',
    ],
    takeaway: '雷管工廠約 200 人，廠裡兩桶水裝的是街泵的水；已有十幾人死於霍亂。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note:
          '37 Broad Street 的雷管工廠約兩百名工人，廠內兩個水桶一直裝著街泵的水供人飲用；有 18 名工人（16 男 2 女）在自己家中死於霍亂。',
        source: `${S01}，p.43`,
      },
      {
        kind: 'RECONSTRUCTION',
        note: '18 人是 Snow 事後的統計；9 月 6 日當天確切人數不詳，所以工頭只說「十幾個」。',
      },
      { kind: 'FICTION', note: '工頭與這段對話是虛構的。' },
    ],
  },
  E10: {
    id: 'E10',
    object: '咖啡館',
    title: '附近一家咖啡館：老闆娘的話',
    body: [
      '「我這兒中午供餐，配的就是街泵的水——大家都說那水最清涼。」',
      '「我知道的，已經有九個常客死了。九個。」',
      '「街角那些小鋪子，也拿那泵的水加一小匙起泡粉，當『雪酪水』賣。酒館裡兌烈酒，用的也是它。」',
    ],
    takeaway: '咖啡館中午供應街泵的水，已知 9 位常客死亡；小鋪、酒館也拿那泵的水去用。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note:
          '一家咖啡館的老闆娘在 9 月 6 日告訴 Snow，她已知道九位常客死亡；店裡午餐時供應泵水。泵水也被小鋪加起泡粉當 sherbet 賣，酒館用來兌烈酒。',
        source: `${S01}，pp.41–42`,
      },
      {
        kind: 'FICTION',
        note: '主角同一天向她打聽是虛構情節；史料中這些話是她告訴 Snow 的。「大家都說那水最清涼」是戲劇台詞。',
      },
    ],
  },
  // ---------- 第三段：紀錄室（9 月 12 日） ----------
  E06: {
    id: 'E06',
    object: '死亡週報',
    title: '《出生與死亡週報》9 月 9 日號（摘錄）',
    body: [
      'Hampstead 區：「West End，9 月 2 日，雷管製造商之遺孀，59 歲。腹瀉兩小時，流行性霍亂十六小時。」',
      '你在旁邊註了一筆：Hampstead 在西北邊三四哩外。這陣子，那一帶沒有霍亂。',
    ],
    takeaway: 'Hampstead 一位 59 歲寡婦 9/2 死於霍亂——她住在三四哩外，那一帶沒有霍亂。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note: '9 月 9 日的《Weekly Return of Births and Deaths》登錄了這筆 Hampstead 死亡；當時 West End 一帶沒有霍亂。',
        source: `${S01}，p.44`,
      },
      { kind: 'RECONSTRUCTION', note: '週報原文為英文，這裡是中文轉述。' },
    ],
  },
  E06b: {
    id: 'E06b',
    object: '黑爾先生的便條',
    title: '黑爾先生的便條：那位醫生說的事',
    body: [
      '「這幾天，那位姓斯諾的醫生來查登記，說起 Hampstead 那件事。我把他的話記下來：」',
      '「她的兒子說，母親好幾個月沒到過 Broad Street 一帶。」',
      '「每天都有一輛車從 Broad Street 去 West End。她喜歡那口泵的水，家裡習慣讓車捎一大瓶回去。」',
      '「8 月 31 日，星期四取的水。她當晚喝了，週五又喝。週五晚上發病，週六死了。」',
      '「她的姪女來探望，也喝了這水；回到 Islington——地勢高、向來乾淨的地方——也發病死了。」',
      '「家裡的女僕也喝了，沒有病倒，至少不嚴重。」',
    ],
    takeaway: '寡婦好幾個月沒去 Broad Street，卻每天喝從那口街泵運去的水；喝過的姪女也死了。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note:
          '寡婦之子告訴 Snow：母親數月未到 Broad Street；每天有車往返，習慣帶回一大瓶泵水；8/31 取水，當晚與週五飲用，週五晚發病、週六死亡；來訪的姪女飲用後回到 Islington 也死亡；女僕飲用後未發病或不嚴重。',
        source: `${S01}，p.44`,
      },
      {
        kind: 'RECONSTRUCTION',
        note: 'Snow 何時問得這些細節不詳，可能晚於 9 月 12 日；把它提前、並由醫生轉述給黑爾先生，是戲劇安排。',
      },
      { kind: 'FICTION', note: '黑爾先生的便條是虛構的。' },
    ],
  },
  E12: {
    id: 'E12',
    object: '逐日統計表',
    title: '黑爾先生的逐日統計：這一帶的霍亂死亡（暫計）',
    body: [
      '8 月 31 日｜3',
      '9 月 1 日｜70',
      '9 月 2 日｜127',
      '9 月 3 日｜76',
      '9 月 4 日｜71',
      '9 月 5 日｜45',
      '9 月 6 日｜37',
      '9 月 7 日｜32',
      '9 月 8 日｜30　← 這天拆了街泵的把手',
      '9 月 9 日｜24',
      '9 月 10 日｜18',
      '9 月 11 日｜15',
      '（按死亡日期。很多人是前幾天發病，拖了幾天才死；若按發病日算，下降得更早。）',
      '黑爾先生在底下寫：「疫病一起，住戶就開始逃。最慘的幾條街，不到六天就走了四分之三以上的人。」',
    ],
    takeaway: '每日死亡在 9/2 最多，之後逐日減少；住戶也大半逃離了。',
    provenance: [
      {
        kind: 'HISTORICAL_RECORD',
        note: '逐日死亡數取自 Snow 的 Table I「Deaths」欄；最受災的街道不到六天就有四分之三以上的居民離開。',
        source: `${S01}，pp.38, 49–51`,
      },
      {
        kind: 'RECONSTRUCTION',
        note: '取自 Snow 1855 年的最終彙整（三個分區及醫院）；這裡寫成登記員 9 月 12 日的工作統計是簡化——當時手上的數字會更少、更不全。',
      },
    ],
  },
};
