// 配色数据层：类型、默认配色、旧存档迁移，不涉及对比度判定与界面
export interface Palette{background:string;body:string;accent:string}

export const DEFAULT_PALETTE:Palette={background:'#f3efe9',body:'#293839',accent:'#ac7555'};

// 旧存档没有 colors 字段时补默认配色，已有配色原样保留
export function withPalette<P extends {colors?:Palette}>(pair:P):P&{colors:Palette}{
  return {...pair,colors:pair.colors??{...DEFAULT_PALETTE}};
}

// 归一化为 #rrggbb，供 <input type="color"> 使用；非法值回退黑色
export function expandHex(hex:string):string{
  const h=hex.trim().replace(/^#/,'');
  if(/^[0-9a-fA-F]{3}$/.test(h))return '#'+h.split('').map(c=>c+c).join('').toLowerCase();
  if(/^[0-9a-fA-F]{6}$/.test(h))return '#'+h.toLowerCase();
  return '#000000';
}

export function isHexColor(hex:string):boolean{
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}
