import type { ChapterId, EvidenceId } from '../logic/types';

/**
 * 場景：向量示意畫＋可點熱點。熱點用 data-action 交給 main.ts 的事件代理。
 * 熱點範圍 shape 格式固定為「M x y H x2 V y2 H x Z」，beacon() 依此找右上角。
 */
export function sceneFor(chapter: ChapterId, seen: EvidenceId[]): string {
  return chapter === 2 ? streetScene(seen) : recordsScene(chapter, seen);
}

function beacon(shape: string): { x: number; y: number } {
  const [, top, right] = shape.match(/\d+/g)!.map(Number);
  return { x: right - 6, y: top + 6 };
}

function evidenceSpot(seen: EvidenceId[]) {
  return (id: EvidenceId, label: string, shape: string, inner: string) => {
    const done = seen.includes(id);
    const b = beacon(shape);
    return `
    <g class="hotspot${done ? ' seen' : ' fresh'}" role="button" tabindex="0" aria-label="${label}"
       data-action="read" data-id="${id}" data-key="spot-${id}" data-testid="spot-${id}">
      <title>${label}</title>
      ${inner}
      <path class="hit" d="${shape}"/>
      ${done ? `<text class="tick" x="${b.x - 4}" y="${b.y + 6}">✓</text>` : `<circle class="beacon" cx="${b.x}" cy="${b.y}" r="9"/>`}
    </g>`;
  };
}

function lookSpot(id: string, label: string, shape: string, inner: string): string {
  return `
  <g class="hotspot look" role="button" tabindex="0" aria-label="${label}"
     data-action="look" data-id="${id}" data-key="spot-${id}" data-testid="spot-${id}">
    <title>${label}</title>
    ${inner}
    <path class="hit" d="${shape}"/>
  </g>`;
}

function haleSpot(shape: string, inner: string): string {
  return `
  <g class="hotspot hale" role="button" tabindex="0" aria-label="和黑爾先生說話"
     data-action="talk" data-key="spot-hale" data-testid="spot-hale">
    <title>和黑爾先生說話</title>
    ${inner}
    <path class="hit" d="${shape}"/>
  </g>`;
}

const DEFS = `
  <defs>
    <radialGradient id="glow" cx="52%" cy="48%" r="60%">
      <stop offset="0" stop-color="#f6c66a" stop-opacity=".35"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a2019"/><stop offset="1" stop-color="#3b2d22"/>
    </linearGradient>
    <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5b3a22"/><stop offset="1" stop-color="#3a2414"/>
    </linearGradient>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b2433"/><stop offset="1" stop-color="#3a3f4a"/>
    </linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#efe3c8"/><stop offset="1" stop-color="#d9c7a2"/>
    </linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8d8f8a"/><stop offset="1" stop-color="#b9b3a3"/>
    </linearGradient>
  </defs>`;

// ---------- 紀錄室（第一、三段） ----------

function recordsScene(chapter: ChapterId, seen: EvidenceId[]): string {
  const spot = evidenceSpot(seen);
  const later = chapter === 3;
  const items = later
    ? `
  ${spot(
    'E06',
    '死亡週報',
    'M70 370 H400 V540 H70 Z',
    `<g transform="rotate(-3 235 455)">
       <rect x="84" y="378" width="300" height="152" fill="url(#paper)" stroke="#6b4e2e" stroke-width="3"/>
       <rect x="100" y="390" width="268" height="22" fill="#3b3026" opacity=".8"/>
       ${[0, 1, 2, 3, 4].map((i) => `<line x1="100" y1="${428 + i * 18}" x2="${i % 2 ? 360 : 230}" y2="${428 + i * 18}" stroke="#7d6a52" stroke-width="2"/>
       <line x1="250" y1="${428 + i * 18}" x2="368" y2="${428 + i * 18}" stroke="#7d6a52" stroke-width="2"/>`).join('')}
     </g>`,
  )}
  ${spot(
    'E06b',
    '黑爾先生的便條',
    'M420 380 H600 V500 H420 Z',
    `<g transform="rotate(4 510 440)">
       <rect x="440" y="392" width="140" height="100" fill="#f3ead3" stroke="#6b4e2e" stroke-width="3"/>
       ${[0, 1, 2, 3].map((i) => `<path d="M454 ${414 + i * 18} q30 -6 56 0 t56 0" stroke="#3b3026" stroke-width="2" fill="none"/>`).join('')}
     </g>`,
  )}
  ${spot(
    'E12',
    '逐日統計表',
    'M760 360 H985 V560 H760 Z',
    `<g transform="rotate(-4 870 460)">
       <rect x="776" y="372" width="196" height="178" fill="url(#paper)" stroke="#6b4e2e" stroke-width="3"/>
       ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
         const w = [6, 50, 90, 55, 52, 34, 28, 24, 22, 18, 13][i];
         return `<rect x="${800 + i * 15}" y="${530 - w * 1.2}" width="10" height="${w * 1.2}" fill="${i === 8 ? '#8c1f1f' : '#5a4a3a'}"/>`;
       }).join('')}
     </g>`,
  )}`
    : `
  ${spot(
    'E01',
    '死亡登記冊',
    'M70 370 H400 V540 H70 Z',
    `<path d="M80 380 L230 372 L230 530 L80 538 Z" fill="url(#paper)" stroke="#6b4e2e" stroke-width="3"/>
     <path d="M230 372 L390 380 L390 538 L230 530 Z" fill="url(#paper)" stroke="#6b4e2e" stroke-width="3"/>
     ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="96" y1="${398 + i * 18}" x2="214" y2="${394 + i * 18}" stroke="#7d6a52" stroke-width="2"/>
     <line x1="246" y1="${394 + i * 18}" x2="374" y2="${398 + i * 18}" stroke="#7d6a52" stroke-width="2"/>`).join('')}
     <path d="M300 470 q20 -10 50 4" stroke="#5a5048" stroke-width="2" fill="none"/>`,
  )}
  ${spot(
    'E02',
    '啤酒廠的回信',
    'M420 380 H600 V500 H420 Z',
    `<g transform="rotate(-6 510 440)">
       <rect x="432" y="392" width="160" height="104" fill="url(#paper)" stroke="#6b4e2e" stroke-width="3"/>
       <path d="M432 392 L512 446 L592 392" stroke="#9a8462" stroke-width="2" fill="none"/>
       <circle cx="512" cy="446" r="13" fill="#8c1f1f"/>
       <circle cx="512" cy="446" r="7" fill="#a83232"/>
     </g>`,
  )}
  ${spot(
    'E03',
    '你的筆記本',
    'M620 440 H790 V590 H620 Z',
    `<g transform="rotate(8 700 515)">
       <rect x="636" y="452" width="130" height="122" rx="6" fill="#4a3220" stroke="#2b1c11" stroke-width="3"/>
       <rect x="646" y="452" width="8" height="122" fill="#2b1c11"/>
       <rect x="672" y="480" width="70" height="26" fill="#d8c69f" opacity=".85"/>
     </g>
     <line x1="760" y1="590" x2="800" y2="470" stroke="#c9a14e" stroke-width="7" stroke-linecap="round"/>
     <line x1="798" y1="476" x2="802" y2="464" stroke="#2b2b2b" stroke-width="7" stroke-linecap="round"/>`,
  )}
  ${spot(
    'E08',
    '居民請願信',
    'M820 360 H985 V520 H820 Z',
    `<g transform="rotate(5 900 440)">
       <rect x="836" y="370" width="138" height="140" fill="url(#paper)" stroke="#6b4e2e" stroke-width="3"/>
       ${[0, 1, 2, 3, 4].map((i) => `<line x1="850" y1="${392 + i * 16}" x2="958" y2="${392 + i * 16}" stroke="#7d6a52" stroke-width="2"/>`).join('')}
       ${[0, 1, 2].map((i) => `<path d="M${852 + i * 34} 488 q8 -10 16 0 t16 0" stroke="#3b3026" stroke-width="2" fill="none"/>`).join('')}
     </g>`,
  )}`;

  // 第三段：街泵沒了把手
  const pump = later
    ? `<rect x="752" y="200" width="10" height="44" fill="#0d1118"/><rect x="744" y="196" width="26" height="8" fill="#0d1118"/>`
    : `<rect x="752" y="200" width="10" height="44" fill="#0d1118"/><rect x="744" y="196" width="26" height="8" fill="#0d1118"/>
       <path d="M762 210 q16 -4 18 10" stroke="#0d1118" stroke-width="5" fill="none"/>`;

  return `
<svg class="scene" viewBox="0 0 1000 620" role="group" aria-label="紀錄室">
  ${DEFS}
  <rect width="1000" height="620" fill="url(#wall)"/>
  <rect x="30" y="40" width="220" height="250" fill="#2f2219" stroke="#1b130d" stroke-width="4"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="44" y="${56 + i * 58}" width="192" height="44" fill="#3d2c20"/>
  <rect x="${60 + (i % 2) * 30}" y="${64 + i * 58}" width="18" height="30" fill="#7a5a3a"/>
  <rect x="${84 + (i % 2) * 30}" y="${62 + i * 58}" width="14" height="32" fill="#5d4630"/>
  <rect x="${104 + (i % 3) * 20}" y="${66 + i * 58}" width="22" height="28" fill="#6d4a2c"/>`).join('')}

  ${lookSpot(
    later ? 'window3' : 'window',
    '窗外',
    'M640 40 H910 V270 H640 Z',
    `<rect x="640" y="40" width="270" height="230" fill="url(#night)" stroke="#1b130d" stroke-width="10"/>
     <path d="M640 210 L680 170 L700 190 L730 150 L770 175 L800 140 L840 180 L870 160 L910 190 L910 270 L640 270 Z" fill="#141a24"/>
     ${pump}
     <circle cx="690" cy="160" r="5" fill="#f3c46b" opacity=".8"/>
     <circle cx="690" cy="160" r="20" fill="#f3c46b" opacity=".12"/>
     <line x1="775" y1="40" x2="775" y2="270" stroke="#1b130d" stroke-width="6"/>
     <line x1="640" y1="155" x2="910" y2="155" stroke="#1b130d" stroke-width="6"/>`,
  )}

  ${haleSpot(
    'M296 60 H464 V330 H296 Z',
    `<ellipse cx="380" cy="120" rx="34" ry="40" fill="#1a130e"/>
     <path d="M346 112 q-4 30 10 44 M414 112 q4 30 -10 44" stroke="#2e2219" stroke-width="10" fill="none"/>
     <path d="M300 330 L318 190 Q380 150 442 190 L460 330 Z" fill="#17110c"/>
     <path d="M372 172 L380 210 L388 172 Z" fill="#cbbfa8"/>
     <rect x="350" y="70" width="60" height="18" fill="#120d09"/>`,
  )}

  <path d="M0 330 L1000 330 L1000 620 L0 620 Z" fill="url(#desk)"/>
  <path d="M0 330 L1000 330" stroke="#7a5233" stroke-width="4"/>
  <rect width="1000" height="620" fill="url(#glow)" pointer-events="none"/>
  <g pointer-events="none">
    <rect x="512" y="270" width="22" height="70" fill="#e8dcc0"/>
    <ellipse cx="523" cy="342" rx="34" ry="8" fill="#8a6a3c"/>
    <path class="flame" d="M523 236 q12 18 0 32 q-12 -14 0 -32 Z" fill="#ffcf6b"/>
  </g>
  ${items}
</svg>`;
}

// ---------- Broad Street（第二段） ----------

function windows(x: number, y: number, cols: number, rows: number, w = 26, h = 34, gx = 44, gy = 58): string {
  let out = '';
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      out += `<rect x="${x + c * gx}" y="${y + r * gy}" width="${w}" height="${h}" fill="#2a2a2e" stroke="#c9b99a" stroke-width="2"/>`;
  return out;
}

function streetScene(seen: EvidenceId[]): string {
  const spot = evidenceSpot(seen);
  return `
<svg class="scene" viewBox="0 0 1000 620" role="group" aria-label="Broad Street">
  ${DEFS}
  <rect width="1000" height="620" fill="url(#sky)"/>
  <!-- 遠景屋頂與煙囪 -->
  <path d="M0 150 L60 120 L120 140 L200 100 L280 130 L360 96 L440 126 L520 92 L600 124 L700 90 L780 118 L860 96 L1000 130 L1000 200 L0 200 Z" fill="#6f6a63"/>
  ${[90, 330, 560, 880].map((x) => `<rect x="${x}" y="70" width="18" height="50" fill="#5a544d"/>`).join('')}

  <!-- 濟貧院 -->
  <rect x="20" y="130" width="290" height="340" fill="#6b4535"/>
  <rect x="20" y="130" width="290" height="14" fill="#4b2f24"/>
  ${windows(40, 160, 6, 3)}
  <text x="165" y="330" text-anchor="middle" font-size="15" fill="#e8dcc0" font-family="serif" letter-spacing="2">WORKHOUSE</text>
  ${spot(
    'E04',
    '濟貧院大門',
    'M100 340 H220 V470 H100 Z',
    `<path d="M112 470 V380 Q160 340 208 380 V470 Z" fill="#2b1d16" stroke="#c9b99a" stroke-width="3"/>
     <line x1="160" y1="352" x2="160" y2="470" stroke="#c9b99a" stroke-width="2"/>`,
  )}
  ${spot(
    'E05',
    '濟貧院院子裡的水泵',
    'M232 380 H306 V470 H232 Z',
    `<rect x="236" y="400" width="66" height="70" fill="#4b3a2e"/>
     ${[0, 1, 2, 3, 4].map((i) => `<line x1="${242 + i * 14}" y1="396" x2="${242 + i * 14}" y2="470" stroke="#1d1712" stroke-width="3"/>`).join('')}
     <rect x="262" y="420" width="10" height="46" fill="#2f3a3a"/>
     <path d="M272 428 q14 -4 16 8" stroke="#2f3a3a" stroke-width="4" fill="none"/>`,
  )}

  <!-- 啤酒廠 -->
  ${lookSpot(
    'brewery',
    '啤酒廠大門',
    'M318 200 H468 V448 H318 Z',
    `<rect x="318" y="200" width="150" height="270" fill="#7a6248"/>
     <text x="393" y="236" text-anchor="middle" font-size="14" fill="#2a1c10" font-family="serif" letter-spacing="2">BREWERY</text>
     <rect x="344" y="300" width="98" height="170" fill="#3b2a1c"/>
     <ellipse cx="350" cy="452" rx="18" ry="22" fill="#8a6036"/>
     <ellipse cx="438" cy="452" rx="18" ry="22" fill="#8a6036"/>`,
  )}

  <!-- 雷管工廠 -->
  <rect x="620" y="170" width="180" height="300" fill="#5c5a55"/>
  ${windows(640, 196, 3, 3, 30, 36, 54, 62)}
  ${spot(
    'E09',
    '雷管工廠（37 號）',
    'M620 380 H800 V490 H620 Z',
    `<rect x="660" y="390" width="56" height="80" fill="#2a2724"/>
     <text x="688" y="384" text-anchor="middle" font-size="14" fill="#e8dcc0" font-family="serif">No. 37</text>
     <ellipse cx="744" cy="470" rx="20" ry="8" fill="#3a2a1c"/>
     <rect x="726" y="442" width="36" height="28" fill="#6b4a2c"/>
     <ellipse cx="774" cy="472" rx="16" ry="7" fill="#3a2a1c"/>
     <rect x="760" y="448" width="28" height="24" fill="#6b4a2c"/>`,
  )}

  <!-- 咖啡館 -->
  <rect x="810" y="200" width="180" height="270" fill="#6a5040"/>
  ${windows(830, 224, 3, 2, 30, 36, 54, 60)}
  ${spot(
    'E10',
    '街角咖啡館',
    'M810 330 H990 V490 H810 Z',
    `<path d="M810 350 L990 350 L978 384 L822 384 Z" fill="#7a2e26"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${822 + i * 26} 384 l13 12 l13 -12" fill="#7a2e26"/>`).join('')}
     <text x="900" y="342" text-anchor="middle" font-size="13" fill="#e8dcc0" font-family="serif" letter-spacing="1">COFFEE ROOMS</text>
     <rect x="830" y="400" width="140" height="70" fill="#f0c674" opacity=".55"/>
     <rect x="884" y="400" width="32" height="70" fill="#2b1d16"/>`,
  )}

  <!-- 街道 -->
  <rect x="0" y="470" width="1000" height="150" fill="#5e574e"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<line x1="${i * 110}" y1="540" x2="${i * 110 + 70}" y2="540" stroke="#4d473f" stroke-width="3"/>`).join('')}

  <!-- 街泵與鄰居 -->
  ${lookSpot(
    'pump',
    'Broad Street 街泵',
    'M478 340 H612 V560 H478 Z',
    `<rect x="508" y="380" width="26" height="150" fill="#2f3a3a"/>
     <rect x="500" y="370" width="42" height="16" fill="#26302f"/>
     <path d="M534 400 q30 -10 38 18" stroke="#26302f" stroke-width="7" fill="none" stroke-linecap="round"/>
     <path d="M508 470 h-18 v8 h18" fill="#26302f"/>
     <ellipse cx="490" cy="532" rx="16" ry="5" fill="#3a3a3a"/>
     <ellipse cx="584" cy="460" rx="14" ry="16" fill="#3b2d22"/>
     <path d="M562 556 L566 486 Q584 470 602 486 L606 556 Z" fill="#4a3b30"/>
     <rect x="590" y="526" width="20" height="24" fill="#7a6a52"/>`,
  )}

  <!-- 黑爾先生 -->
  ${haleSpot(
    'M372 470 H452 V615 H372 Z',
    `<ellipse cx="412" cy="500" rx="17" ry="20" fill="#1a130e"/>
     <rect x="394" y="470" width="36" height="12" fill="#120d09"/>
     <path d="M380 615 L388 528 Q412 512 436 528 L444 615 Z" fill="#17110c"/>
     <path d="M408 522 L412 540 L416 522 Z" fill="#cbbfa8"/>`,
  )}
</svg>`;
}

// ---------- 頭像 ----------

export function portrait(speaker: string): string {
  if (speaker === '黑爾先生') return halePortrait();
  return `<svg class="portrait" viewBox="0 0 80 80" aria-hidden="true">
    <rect width="80" height="80" fill="#2a2019"/>
    <ellipse cx="40" cy="36" rx="15" ry="17" fill="#a88a6a"/>
    <path d="M22 28 q18 -18 36 0 q-4 -14 -18 -14 q-14 0 -18 14 z" fill="#3b2d22"/>
    <path d="M12 80 L18 60 Q40 50 62 60 L68 80 Z" fill="#4a3b30"/>
  </svg>`;
}

export function halePortrait(): string {
  return `<svg class="portrait" viewBox="0 0 80 80" aria-hidden="true">
    <rect width="80" height="80" fill="#2a2019"/>
    <ellipse cx="40" cy="34" rx="15" ry="18" fill="#b89a7a"/>
    <path d="M25 30 q-3 14 5 22 M55 30 q3 14 -5 22" stroke="#4a3626" stroke-width="5" fill="none"/>
    <path d="M24 22 q16 -14 32 0 v-6 h-32 z" fill="#1a130e"/>
    <path d="M12 80 L18 58 Q40 48 62 58 L68 80 Z" fill="#17110c"/>
    <path d="M36 56 L40 66 L44 56 Z" fill="#cbbfa8"/>
  </svg>`;
}
