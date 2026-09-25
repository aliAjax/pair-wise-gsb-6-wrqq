// 对比度判定层：WCAG 相对亮度与对比度计算、可发布判定，不依赖界面
import type {Palette} from './palette';

export const BODY_MIN_CONTRAST=4.5;
export const ACCENT_MIN_CONTRAST=3;

function parseHex(hex:string):[number,number,number]|null{
  const h=hex.trim().replace(/^#/,'');
  if(/^[0-9a-fA-F]{3}$/.test(h))return h.split('').map(c=>parseInt(c+c,16)) as [number,number,number];
  if(/^[0-9a-fA-F]{6}$/.test(h))return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)) as [number,number,number];
  return null;
}

function channel(v:number):number{
  const s=v/255;
  return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4);
}

export function luminance(hex:string):number|null{
  const rgb=parseHex(hex);
  if(!rgb)return null;
  const [r,g,b]=rgb;
  return 0.2126*channel(r)+0.7152*channel(g)+0.0722*channel(b);
}

// 非法颜色返回 null，调用方按不达标处理
export function contrastRatio(foreground:string,background:string):number|null{
  const a=luminance(foreground),b=luminance(background);
  if(a===null||b===null)return null;
  const hi=Math.max(a,b),lo=Math.min(a,b);
  return (hi+0.05)/(lo+0.05);
}

export interface PaletteVerdict{body:number|null;accent:number|null;publishable:boolean}

// 正文对比度 < 4.5 或强调色对比度 < 3 时不可发布
export function evaluatePalette(palette:Palette):PaletteVerdict{
  const body=contrastRatio(palette.body,palette.background);
  const accent=contrastRatio(palette.accent,palette.background);
  return {body,accent,publishable:body!==null&&body>=BODY_MIN_CONTRAST&&accent!==null&&accent>=ACCENT_MIN_CONTRAST};
}
