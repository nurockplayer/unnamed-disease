import type { ClaimId, EvidenceId, Response } from './types';

/**
 * 判定一次推論：兩份證據 + 一個結論。
 * 回應刻意不說出正解，只指出「缺哪一類證據」或「結論說過頭」。
 */
export function evaluate(a: EvidenceId, b: EvidenceId, claim: ClaimId): Response {
  const has = (id: EvidenceId) => a === id || b === id;
  const petitionNote = has('E08')
    ? ['那封請願信講的是臭氣——它支持的是另一種解釋，幫不了你這句話。']
    : [];

  switch (claim) {
    case 'water': {
      if (has('E02') && has('E03')) {
        return { verdict: 'solved', lines: [] };
      }
      if (!has('E02')) {
        return {
          verdict: 'insufficient',
          lines: [
            ...petitionNote,
            '他們用別的水，好。但這又怎樣？',
            '你得先讓我看到：啤酒廠的人，結果真的和街坊不一樣。',
          ],
        };
      }
      return {
        verdict: 'insufficient',
        lines: [
          ...petitionNote,
          '同一區、結果不同——這我承認。',
          '可你說差別在水，憑什麼？登記冊和回信上，可沒寫他們喝哪裡的水。',
        ],
      };
    }

    case 'anomaly': {
      if (has('E01') && has('E02')) {
        return {
          verdict: 'partial',
          lines: [
            '……登記冊上沒有一個啤酒廠的人，帳房也說沒人重病。',
            '好，我承認：就在疫區正中間，有一群人幾乎沒事。',
            '可是為什麼偏偏是他們？他們和街坊吸的是同一條街的空氣。差別到底在哪裡？',
          ],
        };
      }
      if (has('E02') && has('E03')) {
        return {
          verdict: 'partial',
          lines: [
            '對，啤酒廠的人幾乎沒事。',
            '可你手上那張筆記，寫的是他們喝什麼水——你想說的，恐怕不只「有例外」吧？',
          ],
        };
      }
      if (has('E02')) {
        return {
          verdict: 'partial',
          lines: [
            '啤酒廠的人沒事，這我看到了。',
            '可你怎麼知道他們和死者算「同一區」？拿登記冊上的地址來比比看。',
          ],
        };
      }
      return {
        verdict: 'insufficient',
        lines: [
          ...petitionNote,
          '「一群人」？哪一群？',
          '拿出他們的狀況來，不然這只是你的感覺。',
        ],
      };
    }

    case 'air': {
      if (has('E02')) {
        return {
          verdict: 'insufficient',
          lines: [
            '等等——你自己放上了啤酒廠的回信。',
            '七十多個人在同一條街的空氣裡做工，卻沒有人重病。這不正好跟你的說法打架嗎？',
          ],
        };
      }
      if (has('E01') && has('E08')) {
        return {
          verdict: 'competing',
          lines: [
            '正是我說的。死者擠在這幾條街，住戶也說臭氣一重就有人倒下。',
            '……不過，你剛才翻登記冊時，好像停在某一頁很久？',
          ],
        };
      }
      return {
        verdict: 'competing',
        lines: [
          '我本來就這麼想。',
          '但光憑這兩份東西，說服不了一個不同意的人——你自己真的相信嗎？',
        ],
      };
    }

    case 'beer': {
      if (has('E03')) {
        return {
          verdict: 'overreach',
          lines: [
            '筆記上寫的是：老闆「認為」他們不喝水。那是老闆的看法。',
            '就算他們真的喝酒——你能說的，也只是老闆很確定他們不從街泵取水。',
            '這話要是傳出去，街坊會以為喝酒就能保命——那是要出人命的。',
          ],
        };
      }
      return {
        verdict: 'overreach',
        lines: ['酒？你在哪裡看到他們喝什麼？', '別替證據說它沒說的話。'],
      };
    }

    case 'proven': {
      if (has('E02') && has('E03')) {
        return {
          verdict: 'overreach',
          lines: [
            '一間啤酒廠、七十多個人——這是一個值得注意的例外，不是證明。',
            '你連死者裡有誰喝過那泵的水都還沒問。話說得太滿，委員會第一個就不信。',
            '說你真正能說的就好。',
          ],
        };
      }
      return {
        verdict: 'overreach',
        lines: ['證實？你連誰喝過那泵的水都還沒問過。', '先說你手上的證據能撐得住的話。'],
      };
    }
  }
}
