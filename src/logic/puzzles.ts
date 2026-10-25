import { TABLE_COLUMNS, TABLE_ROWS } from '../content/story';
import { evaluateBrewery } from './infer';
import type { ColumnId, EvidenceId, PuzzleId, Response, RowId } from './types';

/** 一次提交：選了哪些證據、哪個選項，以及（表格題）填的格子 */
export interface Submission {
  puzzle: PuzzleId;
  evidence: EvidenceId[];
  option: string;
  cells?: Record<RowId, Record<ColumnId, boolean | null>>;
}

export function evaluate(sub: Submission): Response {
  const [a, b] = sub.evidence;
  switch (sub.puzzle) {
    case 'brewery':
      return evaluateBrewery(a, b, sub.option);
    case 'table':
      return evaluateTable(sub.cells, sub.option);
    case 'neighbour':
      return evaluateNeighbour(sub.option);
    case 'hampstead':
      return evaluateHampstead(a, b, sub.option);
    case 'handle':
      return evaluateHandle(a, sub.option);
  }
}

// ---------- 第二段：比較表 ----------

/** 同一列的不同錯法收到相同回饋，避免「先全填是，再把紅格反轉」繞過閱讀。 */
const ROW_HINTS: Record<RowId, string[]> = {
  brewery: ['重讀啤酒廠的回信或登記冊，再對照取水筆記：它做什麼、在哪裡、工人用什麼水？'],
  workhouse: ['重讀門房與院內雜役的話。原來的住民和發病後才入院的人要分開；院子那個泵抽的是哪裡的水？'],
  capworks: ['重讀工頭的話：雷管工廠那兩桶水，喝的地方和取水來源是一回事嗎？工人死在家裡，能說明他沒在廠裡喝水嗎？'],
  coffee: ['重讀老闆娘的話：常客來這裡做什麼，配餐時喝到什麼？不要把店名當成飲水的內容。'],
};

export function evaluateTable(cells: Record<RowId, Record<ColumnId, boolean | null>> | undefined, column: string): Response {
  const row = TABLE_ROWS.find((r) => TABLE_COLUMNS.some((c) => cells?.[r.id]?.[c.id] !== r.facts[c.id]));
  if (row) {
    return {
      verdict: 'insufficient',
      reviewRow: row.id,
      lines: [
        `先讓表格撐住你的選擇。${row.label}這一列，還有地方和證詞對不上。`,
        ...ROW_HINTS[row.id],
      ],
    };
  }
  switch (column) {
    case 'zone':
      return {
        verdict: 'ruledOut',
        lines: ['四個地方都在疫區裡——這一欄全打勾，什麼也分不開。', '這就是你昨天說的：光看住在哪裡，解釋不了誰會死。'],
      };
    case 'factory':
      return {
        verdict: 'ruledOut',
        lines: ['啤酒廠和雷管工廠都是工廠：一個幾乎沒事，一個死了十幾個人。', '這一欄分不開。'],
      };
    case 'crowd':
      return {
        verdict: 'ruledOut',
        lines: ['濟貧院五百多人只死了五個；雷管工廠兩百人卻死了十幾個。', '人多不多，分不開結果。'],
      };
    case 'deaths':
      return {
        verdict: 'ruledOut',
        lines: [
          '啤酒廠沒有死亡通報，雷管工廠和咖啡館都有——乍看對得上。可濟貧院也有死者。',
          '535 名原有住民中有 5 人死亡，卻遠比周圍街道的情況輕。「有死者」和「同樣嚴重」不是一回事。',
          '濟貧院這一列，就是這個分法的反例。',
        ],
      };
    case 'pump':
      return {
        verdict: 'solved',
        lines: ['這四份記錄裡，供街泵水的兩處有較多死亡通報，另兩處情況較輕。', '值得繼續追查的是供水來源；這還不是每個人的因果證明。'],
      };
    default:
      return { verdict: 'insufficient', lines: ['選一欄。'] };
  }
}

// ---------- 第二段：街泵前的鄰居 ----------

export function evaluateNeighbour(option: string): Response {
  switch (option) {
    case 'nothing':
      return { verdict: 'solved', lines: [] };
    case 'lucky':
      return {
        verdict: 'insufficient',
        lines: ['這不是回答，是打發人。', '他說的是實話——喝了沒事的人確實有。你得說清楚，這為什麼推翻不了你的表。'],
      };
    case 'wrong':
      return {
        verdict: 'overreach',
        lines: ['一個人沒事，就推翻四個地方的對照？', '那啤酒廠和雷管工廠的差別，你又要怎麼解釋？'],
      };
    case 'clear':
      return {
        verdict: 'competing',
        lines: ['看起來清，就一定乾淨嗎？', '你的眼睛只看得見水，這張表看得見人。'],
      };
    default:
      return { verdict: 'insufficient', lines: ['你想說什麼？'] };
  }
}

// ---------- 第三段：Hampstead ----------

export function evaluateHampstead(a: EvidenceId, b: EvidenceId, option: string): Response {
  const has = (id: EvidenceId) => a === id || b === id;
  const details = has('E06b');
  const known = details || has('E06');
  switch (option) {
    case 'water':
      if (details && has('E06'))
        return {
          verdict: 'solved',
          lines: ['她住得遠，喝的卻是 Broad Street 那口泵的水。', '我們一直盯著住址——該追的，是水走到了哪裡。'],
        };
      if (details)
        return {
          verdict: 'partial',
          lines: ['便條說清楚了她喝什麼。', '可她是不是死於霍亂、什麼時候死的？把週報也放上來。'],
        };
      return {
        verdict: 'insufficient',
        lines: ['週報只寫了她怎麼死的，沒寫她喝了什麼。'],
      };
    case 'air':
    case 'place':
      return known
        ? {
            verdict: 'ruledOut',
            lines: [
              `${option === 'air' ? '空氣' : '住處'}？West End 好好的，那一帶根本沒有霍亂，她的鄰居也沒事。`,
              '她和鄰居一樣的地方，不可能是差別。',
            ],
          }
        : { verdict: 'insufficient', lines: ['你說的是誰？先把週報放上來。'] };
    case 'age':
      return details
        ? {
            verdict: 'ruledOut',
            lines: [
              '喝了同一瓶水的姪女也死了；女僕喝了，沒有病倒，至少不嚴重。',
              '光說年紀，解釋不了為什麼偏偏是喝過這瓶水的人。',
            ],
          }
        : { verdict: 'insufficient', lines: ['年紀？你手上有什麼能說明這一點？'] };
    case 'contact':
      return details
        ? {
            verdict: 'ruledOut',
            lines: ['她好幾個月沒到過 Broad Street，West End 一帶也沒有霍亂病人。', '她能接觸到的病人在哪裡？'],
          }
        : { verdict: 'insufficient', lines: ['接觸了誰？你手上沒有能說明這一點的東西。'] };
    default:
      return { verdict: 'insufficient', lines: ['你想說什麼？'] };
  }
}

// ---------- 第三段：把手 ----------

export function evaluateHandle(e: EvidenceId, option: string): Response {
  const tally = e === 'E12';
  switch (option) {
    case 'prudent':
      return tally
        ? { verdict: 'solved', lines: [] }
        : {
            verdict: 'partial',
            lines: ['我同意你的結論。', '可我問的是時間——拿那張逐日統計來說。'],
          };
    case 'ended':
      return {
        verdict: 'overreach',
        lines: tally
          ? [
              '你看統計表：死得最多是 2 號，之後一天比一天少——早在 8 號拆把手之前。',
              '很多人家也早就逃走了。把功勞全算給把手，說得太滿。',
            ]
          : ['你憑什麼這麼說？先看看那張逐日統計。'],
      };
    case 'useless':
      return {
        verdict: 'overreach',
        lines: tally
          ? [
              '數字往下掉，是因為泵水變乾淨了，還是因為喝它的人逃的逃、死的死？這張表分不出來。',
              '說「沒用」，跟說「立刻見效」一樣，都說得太滿。',
            ]
          : ['你憑什麼這麼說？先看看那張逐日統計。'],
      };
    case 'drains':
      return {
        verdict: 'competing',
        lines: ['清溝渠有好處，我不反對。', '可它解釋不了啤酒廠和雷管工廠的差別，也解釋不了 Hampstead。'],
      };
    default:
      return { verdict: 'insufficient', lines: ['你想說什麼？'] };
  }
}
