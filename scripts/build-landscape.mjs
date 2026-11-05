/**
 * Static vector plates for the paper handscroll. Palette comes from DESIGN tokens;
 * all weathering is deterministic and generated here, never in a scroll frame.
 * Run: node scripts/build-landscape.mjs
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const css = await readFile(new URL('src/app.css', root), 'utf8');
const color = name => {
  const value = css.match(new RegExp(`--raw-${name}:\\s*(#[a-fA-F0-9]{6})`))?.[1];
  if (!value) throw new Error(`Missing palette token: ${name}`);
  return value;
};
const palette = {
  paper: color('paper-alt'), chalk: color('paper-deep'), ink: color('ink-soft'),
  stone: color('ink-faint'), moss: color('moss'), gold: color('kintsugi'),
  night: color('night'), nightStone: color('night-soft'), bone: color('bone-muted')
};
const noise = (await readFile(new URL('static/noise.svg', root))).toString('base64');
const n = value => Number(value.toFixed(2));
let seed = 31;
const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const rock = 'M-104-9C-110-22-103-36-99-43L-93-61-78-68C-72-85-60-96-43-99L-29-96-17-105 4-108 19-101 30-103 42-86C57-87 66-78 71-68L85-60 90-41C103-35 107-22 101-11L87-3 48 5 12 8-25 5-51 8-79 1Z';
const gate = 'M-328-520Q-255-500-155-505L202-510Q277-511 328-529L326-506L310-498L308-475L215-474L213-466L209-437L209-390L318-395L318-358L209-354L226-74L233-63L230-27L238-11Q199 6 154-4L151-27L148-86L141-91L144-99L137-384L-155-380L-150-111L-159-106L-163-70L-175-27L-172-8Q-220 7-246-9L-243-27L-238-32L-223-99L-220-357L-316-355L-317-391L-211-392L-211-429L-215-431L-215-472L-307-469L-309-495L-326-503ZM-148-473L-148-430L-26-432L-27-475ZM20-476L20-433L146-434L141-478Z';

function rake(cx, cy, count, spread, flatten, opacity = .16) {
  return `<g fill="none" stroke="${palette.ink}" stroke-width=".8" opacity="${opacity}" mask="url(#ground-fade)">` +
    Array.from({length:count}, (_, i) => {
      const rx = 66 + i * spread, ry = 8 + i * flatten;
      const start = i % 4 === 0 ? .14 : 0;
      const end = i % 4 === 0 ? 5.73 : 6.283;
      const point = t => {
        const irregular = Math.sin(t*3+i*.45)*1.7 + Math.sin(t*7-i*.25)*.55;
        const derivative = Math.cos(t*3+i*.45)*5.1 + Math.cos(t*7-i*.25)*3.85;
        return { x:cx+Math.cos(t)*(rx+irregular), y:cy+Math.sin(t)*(ry+irregular*.27),
          dx:-Math.sin(t)*(rx+irregular)+Math.cos(t)*derivative,
          dy:Math.cos(t)*(ry+irregular*.27)+Math.sin(t)*derivative*.27 };
      };
      // Cubic segments preserve a hand-drawn contour with far fewer coordinates.
      const delta=(end-start)/12;
      const first=point(start);
      let d=`M${n(first.x)} ${n(first.y)}`;
      for(let j=0;j<12;j++) {
        const a=point(start+j*delta), b=point(start+(j+1)*delta);
        d+=`C${n(a.x+a.dx*delta/3)} ${n(a.y+a.dy*delta/3)} ${n(b.x-b.dx*delta/3)} ${n(b.y-b.dy*delta/3)} ${n(b.x)} ${n(b.y)}`;
      }
      return `<path d="${d}" opacity="${n(.75+(i%3)*.12)}"/>`;
    }).join('\n') + '</g>';
}

function definitions(night = false) {
  const ink = night ? palette.nightStone : palette.ink;
  const top = night ? palette.ink : palette.stone;
  seed = 31;
  const pores = Array.from({length:70}, () => `<ellipse cx="${n(random()*210-105)}" cy="${n(random()*118-108)}" rx="${n(.3+random()*1.3)}" ry="${n(.3+random()*.6)}"/>`).join('');
  return `<defs>
  <pattern id="grain" width="176" height="176" patternUnits="userSpaceOnUse"><image href="data:image/svg+xml;base64,${noise}" width="176" height="176"/></pattern>
  <filter id="wear" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency=".09 .16" numOctaves="2" seed="31" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>
  <linearGradient id="stone-face" x1=".1" y1="0" x2=".75" y2="1"><stop stop-color="${top}"/><stop offset=".6" stop-color="${ink}"/><stop offset="1" stop-color="${ink}"/></linearGradient>
  <linearGradient id="reflection" x2="0" y2="1"><stop stop-color="white" stop-opacity=".21"/><stop offset=".5" stop-color="white" stop-opacity=".06"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
  <mask id="reflected" maskUnits="userSpaceOnUse" x="0" y="780" width="1440" height="220"><rect y="780" width="1440" height="220" fill="url(#reflection)"/></mask>
  <radialGradient id="ground-wash"><stop stop-color="white"/><stop offset=".65" stop-color="white" stop-opacity=".8"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
  <mask id="ground-fade"><rect x="0" y="570" width="1440" height="430" fill="url(#ground-wash)"/></mask>
  <path id="rock-shape" d="${rock}"/>
  <clipPath id="rock-clip"><use href="#rock-shape"/></clipPath>
  <g id="rock" filter="url(#wear)">
    <use href="#rock-shape" fill="url(#stone-face)"/>
    <g clip-path="url(#rock-clip)">
      <path d="M-110-69Q-65-62-32-82T45-89L83-67Q30-53-2-65T-92-44Z" fill="${palette.chalk}" opacity=".13"/>
      <path d="M-67-91L-45-76-51-59-35-44-42-12M8-105L-2-79 14-57 5-30 17 7M69-72L49-55 57-41 43-10" fill="none" stroke="${ink}" stroke-width="1.6" opacity=".65"/>
      <path d="M-98-42Q-56-54-14-39T97-32M-90-23Q-48-35-7-22T94-20M-48-73L-26-65-12-68 4-61" fill="none" stroke="${palette.chalk}" stroke-width=".7" opacity=".24"/>
      <g fill="${palette.chalk}" opacity=".35">${pores}</g>
      <use href="#rock-shape" fill="url(#grain)" opacity=".9"/>
    </g>
  </g>
  <g id="moss"><path d="M-93-61L-78-68-71-80-62-79-57-85-48-82-43-88-33-79-22-80-27-70-43-65-58-67-70-57-83-56Z" fill="${palette.moss}" opacity=".55"/><path d="M-88-58L-76-63-68-65M-58-78L-49-73-40-76" fill="none" stroke="${palette.chalk}" stroke-width=".9" opacity=".28"/></g>
  <path id="gate-shape" d="${gate}"/>
  <clipPath id="gate-clip"><use href="#gate-shape"/></clipPath>
  <g id="gate" filter="url(#wear)">
    <use href="#gate-shape" fill="${ink}"/>
    <g clip-path="url(#gate-clip)">
      <path d="M-308-500Q-90-483 310-515L309-505Q80-482-306-487ZM-207-474L-180-473-195-5-220-8ZM166-475L186-475 215-18 191-12ZM-310-388L313-391 313-380-310-378Z" fill="${palette.chalk}" opacity=".16"/>
      <path d="M-199-460L-197-403-204-382-199-313-205-287-204-216-213-184-211-122-220-53M-182-443L-186-353-181-306-188-242M166-454L174-401 172-365 181-292 177-244 187-173 183-132 190-66M197-374L201-308 194-266M-286-499Q-121-493 90-503M-270-382L-93-379M42-379L265-384" stroke="${palette.chalk}" stroke-width="1.1" fill="none" opacity=".25"/>
      <path d="M-201-343L-194-328-199-312M182-241L188-225-185-208M-178-452L-170-446-173-430M108-501L119-496 137-499" stroke="${ink}" stroke-width="3" fill="none"/>
      <use href="#gate-shape" fill="url(#grain)" opacity=".8"/>
    </g>
  </g>
  <g id="step" filter="url(#wear)"><path d="M-108-28Q-83-48-51-50L13-56 68-45 101-26 96-9 48 5-18 9-86-2Z" fill="${ink}"/><path d="M-108-28L-51-50 13-56 68-45 101-26 34-14-48-18Z" fill="${top}"/><path d="M-86-29L-48-26-27-32 8-22 37-25" fill="none" stroke="${palette.chalk}" stroke-width="1" opacity=".28"/><path d="M-108-28Q-83-48-51-50L13-56 68-45 101-26 96-9 48 5-18 9-86-2Z" fill="url(#grain)"/></g>
  </defs>`;
}
const stoneAt = (x,y,sx,sy,angle=0,moss=false) => `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${sx} ${sy})"><use href="#rock"/>${moss?'<use href="#moss"/>':''}</g>`;
const svg = (title, defs, content) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1000" fill="none"><title>${title}</title>\n${defs}\n${content}\n</svg>\n`;

function sanctuary(night) {
  const ground = night ? palette.bone : palette.ink;
  let sand = rake(1020,800,23,28,5.8,.17)+rake(1280,814,11,19,3.1,.1);
  if(night) sand=sand.replaceAll(palette.ink,palette.bone);
  return svg('枯山水 · 风化木与卧石', definitions(night), `
  ${sand}
  <g fill="${ground}" opacity=".10"><ellipse cx="938" cy="794" rx="218" ry="8"/><ellipse cx="1254" cy="807" rx="138" ry="12"/></g>
  <g mask="url(#reflected)"><use href="#gate" transform="translate(949 797) scale(.79 -.42)"/>${stoneAt(1250,802,.66,-.88)}</g>
  <use href="#gate" transform="translate(949 792) rotate(-.35) scale(.79)"/>
  ${stoneAt(1260,802,.65,1.55,-9,true)}
  ${stoneAt(1328,812,.46,.91,13)}
  ${stoneAt(756,793,.48,.38,-8,true)}
  ${stoneAt(838,786,.61,.36,6)}
  ${stoneAt(972,801,.57,.3,-3)}
  ${stoneAt(1398,818,.68,.41,8,true)}
  ${stoneAt(1301,923,.73,.49,11)}
  <g fill="none" stroke="${palette.gold}" opacity="${night?.32:.64}" stroke-width="1.1" stroke-linecap="round"><path d="M1234 666l8 21-4 14 9 23-3 14 10 29"/><path d="M1247 724l13-8 8 2"/></g>
  <use href="#step" transform="translate(863 836) rotate(-3) scale(1 .36)"/>
  <use href="#step" transform="translate(917 877) rotate(7) scale(.82 .39)"/>
  <use href="#step" transform="translate(1050 946) rotate(-8) scale(.72 .34)"/>
  <g stroke="${ground}" stroke-width=".7" opacity=".22"><path d="M1378 809q-8-19-21-26m22 22q3-23-4-35m3 29 12-17M696 800l-7-15m10 13 3-17"/></g>`);
}

function preface() {
  return svg('序 · 淡墨远山', `<defs><linearGradient id="wash" x2="0" y2="1"><stop stop-color="${palette.ink}" stop-opacity=".16"/><stop offset="1" stop-color="${palette.paper}" stop-opacity="0"/></linearGradient></defs>`, `
  <path d="M-30 742L37 714 76 720 136 683 191 700 235 669 283 675 341 627 378 641 427 621 488 663 535 655 601 699 667 680 744 711 807 676 859 689 906 646 968 635 1009 610 1055 626 1103 599 1147 621 1193 652 1231 645 1296 688 1354 670 1450 716V1000H-30Z" fill="url(#wash)" opacity=".55"/>
  <path d="M-40 838L35 801 74 810 119 772 169 788 228 746 264 761 303 740 366 778 419 758 482 797 545 783 606 811 677 793 746 831 810 802 863 816 916 776 972 786 1038 750 1084 768 1126 744 1169 776 1227 794 1299 772 1363 808 1450 792V1000H-40Z" fill="url(#wash)" opacity=".76"/>
  <path d="M45 882Q230 852 417 872T810 880T1190 854T1450 879" stroke="${palette.ink}" stroke-width=".8" opacity=".11"/>
  <g stroke="${palette.ink}" stroke-width="1.2" opacity=".35" stroke-linecap="round"><path d="M1113 419q9-4 16 2 6-9 15-10M1160 394q6-3 10 2 4-6 10-7"/></g>`);
}
function focus() {
  return svg('志 · 苔石与金缮', definitions(), `
  ${rake(1170,854,17,22,4.2,.09)}${rake(135,895,11,20,3.1,.07)}
  <g opacity=".31">${stoneAt(1241,858,1.42,1.64,-7,true)}${stoneAt(1366,884,.73,.65,13,true)}${stoneAt(96,901,1.21,.59,4)}</g>
  <path d="M1213 687l-12 22 7 28-9 22 8 32-7 34m7-34 19-8 9 4" stroke="${palette.gold}" stroke-width="1.25" stroke-linecap="round" opacity=".46"/>
  <g stroke="${palette.moss}" opacity=".36" stroke-linecap="round"><path d="M1308 874q-3-35-19-50m18 40q10-25 4-37m-2 36 14-15"/></g>`);
}
function education() {
  const waves = Array.from({length:14},(_,i)=>`<path d="M${-80+i*11} ${720+i*17}Q${260+i*8} ${704+i*17} ${630+i*9} ${719+i*17}T${1500-i*8} ${712+i*17}" opacity="${n(.15-i*.006)}"/>`).join('\n');
  const leaves = Array.from({length:7},(_,i)=>`<g transform="translate(${-i*12} ${-i*57}) rotate(${-i*3})"><path d="M0 0q-32-15-68-10Q-38-26 0 0M0 0q-24 12-47 33Q-32 7 0 0M2 1q21-21 50-26Q34-6 2 1"/></g>`).join('');
  return svg('行 · 浅水疏竹', '', `
  <g stroke="${palette.ink}" stroke-width=".7">${waves}</g>
  <g fill="${palette.ink}" opacity=".24" transform="translate(422 751)"><path d="M-47 4Q4 17 61 0L45 11Q4 28-34 17Z"/><path d="M-2 7l4-25 3 1 1 25Z"/><path d="M-10-19L17 18" stroke="${palette.ink}" stroke-width="1"/></g>
  <g opacity=".20" stroke="${palette.ink}" fill="${palette.ink}" transform="translate(1348 891)"><path d="M0 0Q-2-164-78-438" fill="none" stroke-width="2.3"/><path d="M39 4Q38-160-11-351" fill="none" stroke-width="1.3"/>${leaves}</g>`);
}
function nightEdges() {
  return svg('道 · 夜墨陶痕', '', `<g fill="none" stroke="${palette.bone}" stroke-width=".65" opacity=".13"><path d="M1382 38l-31 80 14 30-38 58 9 39-32 64 18 37-29 61 14 29-19 66 28 64-21 35 17 89-25 42 31 80-14 65"/><path d="M1336 245l54 14 50-19M1322 346l-32 11-21 39M1316 566l48-15 20 26 56 7M1332 812l67-14 41 21"/><path d="M54 794l19 37-9 29 32 43-11 52 22 45m-43-140-27 7-37-17"/></g>`);
}
const plates = {
  'objects-paper.svg': sanctuary(false), 'objects-night.svg': sanctuary(true),
  'chapter-preface.svg': preface(), 'chapter-focus.svg': focus(),
  'chapter-edu.svg': education(), 'chapter-night.svg': nightEdges()
};
await mkdir(new URL('static/landscape/', root), {recursive:true});
for(const [name, content] of Object.entries(plates)) await writeFile(new URL(`static/landscape/${name}`,root), content);
console.log(`Wrote ${Object.keys(plates).length} static SVG plates (${Math.round(Object.values(plates).reduce((n,s)=>n+Buffer.byteLength(s),0)/1024)} KB).`);
