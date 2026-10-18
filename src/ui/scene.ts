import type { EvidenceId } from '../logic/types';

/** 紀錄室桌面。熱點用 data-action 交給 main.ts 的事件代理。 */
export function deskScene(seen: EvidenceId[]): string {
  const cls = (id: EvidenceId) => `hotspot${seen.includes(id) ? ' seen' : ' fresh'}`;
  const spot = (id: EvidenceId, label: string, shape: string, inner: string) => `
    <g class="${cls(id)}" role="button" tabindex="0" aria-label="${label}"
       data-action="read" data-id="${id}" data-key="spot-${id}" data-testid="spot-${id}">
      ${inner}
      <path class="hit" d="${shape}"/>
      ${seen.includes(id) ? '' : `<circle class="beacon" cx="${beacon(shape).x}" cy="${beacon(shape).y}" r="9"/>`}
      ${seen.includes(id) ? `<text class="tick" x="${beacon(shape).x - 4}" y="${beacon(shape).y + 6}">✓</text>` : ''}
    </g>`;

  return `
<svg class="scene" viewBox="0 0 1000 620" role="group" aria-label="紀錄室">
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
  </defs>

  <rect width="1000" height="620" fill="url(#wall)"/>
  <!-- 牆上的櫃子 -->
  <rect x="30" y="40" width="220" height="250" fill="#2f2219" stroke="#1b130d" stroke-width="4"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="44" y="${56 + i * 58}" width="192" height="44" fill="#3d2c20"/>
  <rect x="${60 + (i % 2) * 30}" y="${64 + i * 58}" width="18" height="30" fill="#7a5a3a"/>
  <rect x="${84 + (i % 2) * 30}" y="${62 + i * 58}" width="14" height="32" fill="#5d4630"/>
  <rect x="${104 + (i % 3) * 20}" y="${66 + i * 58}" width="22" height="28" fill="#6d4a2c"/>`).join('')}

  <!-- 窗 -->
  <g class="hotspot window" role="button" tabindex="0" aria-label="窗外"
     data-action="window" data-key="spot-window" data-testid="spot-window">
    <rect x="640" y="40" width="270" height="230" fill="url(#night)" stroke="#1b130d" stroke-width="10"/>
    <path d="M640 210 L680 170 L700 190 L730 150 L770 175 L800 140 L840 180 L870 160 L910 190 L910 270 L640 270 Z" fill="#141a24"/>
    <rect x="752" y="200" width="10" height="44" fill="#0d1118"/>
    <rect x="744" y="196" width="26" height="8" fill="#0d1118"/>
    <path d="M762 210 q16 -4 18 10" stroke="#0d1118" stroke-width="5" fill="none"/>
    <circle cx="690" cy="160" r="5" fill="#f3c46b" opacity=".8"/>
    <circle cx="690" cy="160" r="20" fill="#f3c46b" opacity=".12"/>
    <line x1="775" y1="40" x2="775" y2="270" stroke="#1b130d" stroke-width="6"/>
    <line x1="640" y1="155" x2="910" y2="155" stroke="#1b130d" stroke-width="6"/>
    <path class="hit" d="M640 40 H910 V270 H640 Z"/>
  </g>

  <!-- 黑爾先生 -->
  <g class="hotspot hale" role="button" tabindex="0" aria-label="和黑爾先生說話"
     data-action="talk" data-key="spot-hale" data-testid="spot-hale">
    <ellipse cx="380" cy="120" rx="34" ry="40" fill="#1a130e"/>
    <path d="M346 112 q-4 30 10 44 M414 112 q4 30 -10 44" stroke="#2e2219" stroke-width="10" fill="none"/>
    <path d="M300 330 L318 190 Q380 150 442 190 L460 330 Z" fill="#17110c"/>
    <path d="M372 172 L380 210 L388 172 Z" fill="#cbbfa8"/>
    <rect x="350" y="70" width="60" height="18" fill="#120d09"/>
    <path class="hit" d="M296 60 H464 V330 H296 Z"/>
  </g>

  <!-- 桌面 -->
  <path d="M0 330 L1000 330 L1000 620 L0 620 Z" fill="url(#desk)"/>
  <path d="M0 330 L1000 330" stroke="#7a5233" stroke-width="4"/>
  <rect width="1000" height="620" fill="url(#glow)" pointer-events="none"/>

  <!-- 蠟燭 -->
  <g pointer-events="none">
    <rect x="512" y="270" width="22" height="70" fill="#e8dcc0"/>
    <ellipse cx="523" cy="342" rx="34" ry="8" fill="#8a6a3c"/>
    <path class="flame" d="M523 236 q12 18 0 32 q-12 -14 0 -32 Z" fill="#ffcf6b"/>
  </g>

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
  )}
</svg>`;
}

/** 熱點右上角，用來放「未讀」光點或「已讀」勾號。shape 格式固定為 M x y H x2 V y2 H x Z */
function beacon(shape: string): { x: number; y: number } {
  const [, top, right] = shape.match(/\d+/g)!.map(Number);
  return { x: right - 6, y: top + 6 };
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
