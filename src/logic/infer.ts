import type { ClaimId, EvidenceId, Response } from './types';

/**
 * 判定一次推論：兩份證據 + 「兩群人的差別在於＿＿」。
 * 回應刻意不說出正解：只排除站不住的差別，或指出還缺哪一類證據。
 */
export function evaluate(a: EvidenceId, b: EvidenceId, claim: ClaimId): Response {
  const has = (id: EvidenceId) => a === id || b === id;
  // 「這群人幾乎沒事」需要證據：帳房回信，或登記冊上找不到啤酒廠工人
  const spared = has('E02') || has('E01');
  const petitionNote = has('E08')
    ? ['那封請願信講的是臭氣，說的是街坊怎麼病倒——跟啤酒廠的人沒有關係。']
    : [];

  switch (claim) {
    case 'water': {
      if (has('E03') && spared) {
        return { verdict: 'solved', lines: [] };
      }
      if (has('E03')) {
        return {
          verdict: 'insufficient',
          lines: [
            ...petitionNote,
            '他們用別的水，好。但這又怎樣？',
            '你得先讓我看到：啤酒廠的人，結果真的和街坊不一樣。',
          ],
        };
      }
      if (has('E01') && has('E02')) {
        return {
          verdict: 'partial',
          lines: [
            '……登記冊上沒有一個啤酒廠的人，帳房也說沒人重病。',
            '好，我承認：就在疫區正中間，有一群人幾乎沒事。',
            '可你說差別在「水」——這兩份東西，哪一份寫了他們喝什麼？',
          ],
        };
      }
      return {
        verdict: 'insufficient',
        lines: [
          ...petitionNote,
          '水？你放上來的東西裡，沒有一份寫到他們喝什麼水。',
        ],
      };
    }

    case 'air':
    case 'place': {
      const what = claim === 'air' ? '吸的空氣' : '住和做工的地方';
      if (spared) {
        return {
          verdict: 'ruledOut',
          lines: [
            `${what}？啤酒廠就在 Broad Street 上，四周的房子都有死者。`,
            '這正是他們和街坊「一樣」的地方，不是差別。',
            '……等等。你這不就是在說，光靠住在哪裡，解釋不了誰會病倒？',
          ],
        };
      }
      return {
        verdict: 'competing',
        lines: [
          '我本來就這麼想：這幾條街的空氣壞了，住在這裡就危險。',
          '可你要找的是「差別」。你得先找到一群住在這裡、卻沒事的人。',
        ],
      };
    }

    case 'job': {
      if (has('E01')) {
        return {
          verdict: 'ruledOut',
          lines: [
            '釀酒這門手藝能擋病？你自己抄的登記冊上，就有一位 Broad Street 雷管工廠的工人。',
            '行業不同是事實，可光說「行業」什麼也沒解釋。這一行的人每天做的事裡，到底哪一件和街坊不一樣？',
          ],
        };
      }
      return {
        verdict: 'insufficient',
        lines: ['哪一行能保命？', '翻翻登記冊上死者的職業，再來跟我說。'],
      };
    }

    case 'beer': {
      if (has('E03')) {
        return {
          verdict: 'overreach',
          lines: [
            '筆記上寫的是：老闆「認為」他們不喝水。那是老闆的看法。',
            '就算他們真的喝酒——你能說的，也只是：他們說自己從不去街泵打水。',
            '這話要是傳出去，街坊會以為喝酒就能保命——那是要出人命的。',
          ],
        };
      }
      return {
        verdict: 'overreach',
        lines: ['酒？你在哪裡看到他們喝什麼？', '別替證據說它沒說的話。'],
      };
    }

    case 'luck': {
      return {
        verdict: spared ? 'ruledOut' : 'insufficient',
        lines: [
          spared
            ? '一整間啤酒廠的人，在死了這麼多人的街上，一起走運？'
            : '運氣？那你得先找到一群「運氣好」的人。',
          '要是說「運氣」，那就什麼都不用查了。再看看你的筆記。',
        ],
      };
    }
  }
}
