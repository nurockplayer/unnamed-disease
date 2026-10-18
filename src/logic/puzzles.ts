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
      return evaluateTable(sub.cells!, sub.option);
    case 'neighbour':
      return evaluateNeighbour(sub.option);
    case 'hampstead':
      return evaluateHampstead(a, b, sub.option);
    case 'handle':
      return evaluateHandle(a, sub.option);
  }
}

// ---------- 第二段：比較表 ----------

/** 填錯某一格時的提示：指回證據，不直接給答案 */
function cellHint(row: RowId, col: ColumnId): string {
  const label = TABLE_ROWS.find((r) => r.id === row)!.label.replace(/（.*）/, '');
  switch (col) {
    case 'zone':
      return `${label}——它就在 Broad Street 一帶，四周都有死者。`;
    case 'factory':
      return `${label}算不算工廠？濟貧院收容窮人，咖啡館是小店；啤酒廠和雷管工廠才是工廠。`;
    case 'crowd':
      return row === 'coffee'
        ? '咖啡館的常客只是來吃飯，各住各的、各做各的工。'
        : `${label}——那裡有幾十上百人一起住或一起做工。`;
    case 'pump':
      return {
        brewery: '啤酒廠喝什麼水？你的筆記上寫著。',
        workhouse: '濟貧院喝什麼水？院子裡那口井旁的雜役說過。',
        capworks: '雷管工廠那兩桶水，是從哪裡打來的？工頭說過。',
        coffee: '咖啡館中午配餐的是什麼水？老闆娘自己說了。',
      }[row];
  }
}

export function evaluateTable(cells: Record<RowId, Record<ColumnId, boolean | null>>, column: string): Response {
  const wrongCells = TABLE_ROWS.flatMap((r) =>
    TABLE_COLUMNS.filter((c) => cells[r.id][c.id] !== r.facts[c.id]).map((c) => `${r.id}:${c.id}`),
  );
  if (wrongCells.length) {
    return {
      verdict: 'insufficient',
      wrongCells,
      lines: [
        `先別急著挑欄位，表上有 ${wrongCells.length} 格和你問到的不一樣。`,
        ...wrongCells.slice(0, 2).map((k) => {
          const [row, col] = k.split(':') as [RowId, ColumnId];
          return cellHint(row, col);
        }),
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
    case 'pump':
      return {
        verdict: 'solved',
        lines: ['……喝街泵水的兩處，死得多；不喝的兩處，死得少得多。', '四個地方，都對得上。'],
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
