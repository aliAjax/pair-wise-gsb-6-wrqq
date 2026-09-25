// 界面层：配色卡组件，只负责展示与编辑，判定结果由外部传入
import {useEffect,useState} from 'react';
import {expandHex,type Palette} from './palette';
import {ACCENT_MIN_CONTRAST,BODY_MIN_CONTRAST,type PaletteVerdict} from './contrast';

const fields:{key:keyof Palette;label:string}[]=[
  {key:'background',label:'背景色'},
  {key:'body',label:'正文色'},
  {key:'accent',label:'强调色'},
];

function thresholdOf(key:keyof Palette):number|null{
  if(key==='body')return BODY_MIN_CONTRAST;
  if(key==='accent')return ACCENT_MIN_CONTRAST;
  return null;
}

function HexField({value,onCommit}:{value:string;onCommit:(v:string)=>void}){
  const [draft,setDraft]=useState(value);
  useEffect(()=>setDraft(value),[value]);
  return <input type="text" value={draft} spellCheck={false}
    onChange={e=>{
      const v=e.target.value;
      setDraft(v);
      const n=v.startsWith('#')?v:'#'+v;
      if(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(n))onCommit(n.toLowerCase());
    }}
    onBlur={()=>setDraft(value)}/>;
}

export default function ColorCard({colors,verdict,onChange}:{colors:Palette;verdict:PaletteVerdict;onChange:(next:Palette)=>void}){
  const set=(key:keyof Palette,value:string)=>onChange({...colors,[key]:value});
  const ratioOf=(key:keyof Palette)=>key==='body'?verdict.body:key==='accent'?verdict.accent:null;
  return <div className="color-card">
    <div className="color-head">
      <div><span>COLOR CARD</span><h3>配色卡</h3></div>
      <em className={verdict.publishable?'status ok':'status pending'}>{verdict.publishable?'可发布':'待处理'}</em>
    </div>
    <div className="color-rows">
      {fields.map(f=>{
        const min=thresholdOf(f.key);
        const ratio=ratioOf(f.key);
        const failing=min!==null&&(ratio===null||ratio<min);
        return <div className="color-row" key={f.key}>
          <span>{f.label}</span>
          <input type="color" value={expandHex(colors[f.key])} onChange={e=>set(f.key,e.target.value)}/>
          <HexField value={colors[f.key]} onCommit={v=>set(f.key,v)}/>
          {min===null
            ?<small className="ratio">参照底色</small>
            :<small className={failing?'ratio fail':'ratio'}>{ratio===null?'—':ratio.toFixed(2)} / {min.toFixed(1)}</small>}
        </div>;
      })}
    </div>
    <p className="color-note">正文对比度需 ≥ {BODY_MIN_CONTRAST}，强调色需 ≥ {ACCENT_MIN_CONTRAST}，未达标前保持待处理。</p>
  </div>;
}
