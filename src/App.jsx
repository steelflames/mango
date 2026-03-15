import{useState,useEffect,useRef,useCallback,useMemo}from"react";

/* ═══════════════════════════════════════════
   QUE CARDS — Pilates Class Planning App
   Color palette: Forest green, spring sage,
   70s brown, burnt orange, warm cream
   ═══════════════════════════════════════════ */

// ─── DESIGN TOKENS ───
const C={
  // Brand
  forest:"#2B4A3E",forestLight:"#3D6B56",sage:"#7A9E8E",sageBg:"#E8F0EB",
  cream:"#F7F5F0",warmWhite:"#FEFCF8",
  brown:"#8B6B4A",brownLight:"#A8896A",brownBg:"#F5EDE4",
  orange:"#C4703A",orangeLight:"#D4915E",orangeBg:"#FBF0E6",
  // Tag category colors
  position:"#5E8A72",bodyRegion:"#9B7B5E",level:"#8B7360",
  focus:"#6B8F7E",modality:"#A0845E",props:"#947B6A",
  // Semantic
  danger:"#A05040",dangerBg:"#FBF0ED",
  include:"#2B4A3E",exclude:"#A05040",
  // UI
  border:"rgba(90,80,60,.1)",borderHover:"rgba(90,80,60,.2)",
  textPrimary:"#3A3A35",textSecondary:"#8A8578",textMuted:"#B8B0A0",
  bgPrimary:"#FEFCF8",bgSecondary:"#F7F5F0",bgTertiary:"#F0EDE6",
};
const R={sm:10,md:14,lg:18,xl:24,pill:50}; // border-radius
const TT={
  position:{l:"Position",c:C.position,i:"◎"},
  bodyRegion:{l:"Body Region",c:C.bodyRegion,i:"△"},
  level:{l:"Level",c:C.level,i:"◈"},
  focus:{l:"Focus",c:C.focus,i:"▬"},
  modality:{l:"Modality",c:C.modality,i:"◇"},
  props:{l:"Props",c:C.props,i:"○"},
};
const IT={position:["Supine","Prone","Side-lying","Seated","Standing","Kneeling","Quadruped"],bodyRegion:["Core","Spine","Upper Body","Lower Body","Full Body","Glutes","Shoulders","Hips"],level:["Beginner","Intermediate","Advanced"],focus:["Stability","Articulation","Rotation","Mobility","Strength","Flexibility","Balance","Coordination","Control","Endurance"],modality:["Mat","Reformer","Chair","Springboard","Tower","Barrel"],props:["None","Magic Circle","Resistance Band","Foam Roller","Small Ball","Weights","Box"]};
const IE=[
{id:1,n:"The Hundred",t:{position:["Supine"],bodyRegion:["Core"],level:["Beginner","Intermediate"],focus:["Endurance","Control"],modality:["Mat"],props:["None"]},no:"Classic warm-up.",cu:"Scoop the belly, long neck, gaze at navel"},
{id:2,n:"Roll Up",t:{position:["Supine"],bodyRegion:["Core","Spine"],level:["Intermediate"],focus:["Articulation","Flexibility"],modality:["Mat"],props:["None"]},no:"Articulate vertebra by vertebra.",cu:"Peel the spine off the mat one vertebra at a time"},
{id:3,n:"Single Leg Circle",t:{position:["Supine"],bodyRegion:["Hips","Core"],level:["Beginner"],focus:["Stability","Mobility"],modality:["Mat"],props:["None"]},no:"Keep pelvis stable.",cu:"Anchor the opposite hip, circle from the joint"},
{id:4,n:"Rolling Like a Ball",t:{position:["Seated"],bodyRegion:["Core","Spine"],level:["Beginner"],focus:["Balance","Control"],modality:["Mat"],props:["None"]},no:"Maintain shape.",cu:"Stay round, eyes on your belly"},
{id:5,n:"Single Leg Stretch",t:{position:["Supine"],bodyRegion:["Core"],level:["Beginner"],focus:["Coordination","Stability"],modality:["Mat"],props:["None"]},no:"Series of 5.",cu:"Shoulders off, switch with control"},
{id:6,n:"Double Leg Stretch",t:{position:["Supine"],bodyRegion:["Core"],level:["Intermediate"],focus:["Coordination","Control"],modality:["Mat"],props:["None"]},no:"Reach long.",cu:"Reach away, scoop, circle in"},
{id:7,n:"Spine Stretch",t:{position:["Seated"],bodyRegion:["Spine","Core"],level:["Beginner"],focus:["Articulation","Flexibility"],modality:["Mat"],props:["None"]},no:"Grow tall first.",cu:"Lift up before you go over"},
{id:8,n:"Swan",t:{position:["Prone"],bodyRegion:["Spine","Upper Body"],level:["Intermediate"],focus:["Strength","Mobility"],modality:["Mat"],props:["None"]},no:"Extension.",cu:"Long spine, open the chest"},
{id:9,n:"Side Kick Series",t:{position:["Side-lying"],bodyRegion:["Lower Body","Glutes","Core"],level:["Intermediate"],focus:["Stability","Strength"],modality:["Mat"],props:["None"]},no:"Hip stacked.",cu:"Stable trunk, move from hip"},
{id:10,n:"Teaser",t:{position:["Supine"],bodyRegion:["Core","Full Body"],level:["Advanced"],focus:["Strength","Balance","Control"],modality:["Mat"],props:["None"]},no:"Quintessential.",cu:"Balance point, reach long"},
{id:11,n:"Teaser Prep",t:{position:["Supine"],bodyRegion:["Core"],level:["Intermediate"],focus:["Stability","Control"],modality:["Mat"],props:["None"]},no:"Build to Teaser.",cu:"Feet down, roll up"},
{id:12,n:"Swimming",t:{position:["Prone"],bodyRegion:["Full Body","Spine"],level:["Intermediate"],focus:["Endurance","Coordination"],modality:["Mat"],props:["None"]},no:"Flutter.",cu:"Long limbs, alternate"},
{id:13,n:"Shoulder Bridge",t:{position:["Supine"],bodyRegion:["Glutes","Lower Body","Core"],level:["Beginner"],focus:["Stability","Strength"],modality:["Mat"],props:["None"]},no:"Articulate spine.",cu:"Press feet, peel hips"},
{id:14,n:"Mermaid",t:{position:["Seated"],bodyRegion:["Spine","Core"],level:["Beginner"],focus:["Flexibility","Mobility"],modality:["Mat","Reformer"],props:["None"]},no:"Lateral flexion.",cu:"Reach up and over"},
{id:15,n:"Cat-Cow",t:{position:["Quadruped"],bodyRegion:["Spine"],level:["Beginner"],focus:["Articulation","Mobility"],modality:["Mat"],props:["None"]},no:"Warm-up.",cu:"Breathe into movement"},
{id:16,n:"Standing Roll Down",t:{position:["Standing"],bodyRegion:["Spine","Core"],level:["Beginner"],focus:["Articulation","Flexibility"],modality:["Mat"],props:["None"]},no:"Opener.",cu:"Nod chin, roll bone by bone"},
{id:17,n:"Footwork",t:{position:["Supine"],bodyRegion:["Lower Body","Core"],level:["Beginner"],focus:["Strength","Stability"],modality:["Reformer"],props:["None"]},no:"Foundational.",cu:"Even pressure through feet"},
{id:18,n:"Plank to Pike",t:{position:["Quadruped"],bodyRegion:["Core","Full Body"],level:["Advanced"],focus:["Strength","Control"],modality:["Mat","Reformer"],props:["None"]},no:"Core pike.",cu:"Strong center, lift from waist"},
];
const IS=[
{id:"sq1",nm:"Spine Warm Up",fc:"Mobility",pk:"Spine Stretch",tags:["Beginner","Mat","Spine"],note:"Great opening flow",it:[{id:"si1",e:15,v:[{id:"sv1",nm:"Single-Leg Cat Cow"},{id:"sv2",nm:"Lateral Cat"}]},{id:"si2",e:16,v:[]},{id:"si3",e:7,v:[]}]},
{id:"sq2",nm:"Series of Five",fc:"Core Endurance",pk:"Double Leg Stretch",tags:["Intermediate","Mat","Core"],note:"Classic ab series",it:[{id:"si4",e:5,v:[]},{id:"si5",e:6,v:[]},{id:"si6",e:3,v:[]}]},
{id:"sq3",nm:"Teaser Progression",fc:"Control",pk:"Teaser",tags:["Advanced","Mat","Full Body"],note:"Build toward full teaser",it:[{id:"si7",e:13,v:[]},{id:"si8",e:11,v:[]},{id:"si9",e:10,v:[]}]},
];
const uid=()=>`_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const cyc=c=>c===0?1:c===1?-1:0;

// ─── HOOKS ───
const useIsMobile=()=>{const[m,s]=useState(window.innerWidth<768);useEffect(()=>{const h=()=>s(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);return m};
const useStore=(key,init)=>{const[v,s]=useState(()=>{try{const d=localStorage.getItem(key);return d?JSON.parse(d):init}catch{return init}});useEffect(()=>{localStorage.setItem(key,JSON.stringify(v))},[key,v]);return[v,s]};

// ─── ICONS ───
const Ic=({n,s=16,c="currentColor",w=1.5})=>{const d={
edit:<path d="M15 5.5l3.5 3.5M6.5 19.5h3.5l9.5-9.5a2.47 2.47 0 0 0-3.5-3.5L6.5 16v3.5z"/>,
x:<path d="M18 6L6 18M6 6l12 12"/>,
plus:<path d="M12 5v14M5 12h14"/>,
search:<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></>,
grip:<>{[[9,5],[15,5],[9,12],[15,12],[9,19],[15,19]].map(([x,y])=><circle key={`${x}${y}`} cx={x} cy={y} r="1.2" fill={c} stroke="none"/>)}</>,
save:<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
chevD:<polyline points="6 9 12 15 18 9"/>,
chevU:<polyline points="18 15 12 9 6 15"/>,
chevR:<polyline points="9 18 15 12 9 6"/>,
sidebar:<><rect x="3" y="3" width="18" height="18" rx="5"/><line x1="9" y1="3" x2="9" y2="21"/></>,
queue:<><rect x="3" y="4" width="18" height="18" rx="5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
seq:<><path d="M4 6h16M4 12h12M4 18h8"/><circle cx="20" cy="12" r="2.5"/><circle cx="16" cy="18" r="2.5"/></>,
grid:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
list:<>{[6,12,18].map(y=><><line key={`l${y}`} x1="8" y1={y} x2="21" y2={y}/><circle key={`c${y}`} cx="4" cy={y} r="1.5" fill={c} stroke="none"/></>)}</>,
group:<><rect x="3" y="3" width="18" height="18" rx="5" strokeDasharray="4 2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></>,
eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
eyeOff:<><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>,
chart:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
note:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
studio:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
sort:<><line x1="4" y1="6" x2="11" y2="6"/><line x1="4" y1="12" x2="8" y2="12"/><line x1="4" y1="18" x2="6" y2="18"/><polyline points="15 15 18 18 21 15"/><line x1="18" y1="4" x2="18" y2="18"/></>,
menu:<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
filter:<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
};return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,display:"block"}}>{d[n]}</svg>};

// ─── CHIP ───
const Ch=({label,state=0,onClick,tc,small,rm,onRm})=>(<span onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:3,padding:small?"2px 8px":"4px 12px",borderRadius:R.pill,border:`1.5px solid ${state===1?C.include:state===-1?C.exclude:(tc||C.textMuted)}`,background:state===1?C.include:state===-1?C.exclude:"transparent",color:state!==0?"#fff":(tc||C.textSecondary),fontSize:small?10:11,fontFamily:"inherit",cursor:onClick?"pointer":"default",transition:"all .15s",textDecoration:state===-1?"line-through":"none",fontWeight:500,userSelect:"none",whiteSpace:"nowrap"}}>{state===1&&<span style={{fontSize:9}}>✓</span>}{state===-1&&<span style={{fontSize:9}}>✕</span>}{label}{rm&&<span onClick={e=>{e.stopPropagation();onRm?.()}} style={{marginLeft:2,cursor:"pointer",opacity:.6,fontSize:9}}>✕</span>}</span>);

// ─── QUE CARD ───
const QC=({ex,vm,onQ,onDetail,mob})=>{
const tags=Object.entries(ex.t).flatMap(([t,vs])=>vs.map(v=>({v,c:TT[t]?.c||C.textMuted}))).slice(0,mob?3:4);
const xtra=Object.values(ex.t).flat().length-(mob?3:4);
const btn=<button onClick={e=>{e.stopPropagation();onQ(ex.id)}} style={{border:`1.5px solid ${C.forest}22`,background:`${C.forest}08`,cursor:"pointer",borderRadius:R.md,padding:"5px 10px",display:"flex",alignItems:"center",gap:3,color:C.forest,fontSize:10,fontWeight:600,fontFamily:"inherit",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=`${C.forest}14`} onMouseLeave={e=>e.currentTarget.style.background=`${C.forest}08`}><Ic n="plus" s={10} c={C.forest}/>Queue</button>;
if(vm==="list")return(<div draggable onDragStart={e=>{e.dataTransfer.setData("type","card");e.dataTransfer.setData("id",String(ex.id))}} onClick={onDetail} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:R.lg,border:`1px solid ${C.border}`,background:C.warmWhite,cursor:"pointer",transition:"all .15s",userSelect:"none"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHover} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
<span style={{fontWeight:600,fontSize:13,fontFamily:"'Instrument Serif',Georgia,serif",color:C.textPrimary,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.n}</span>
<div style={{display:"flex",gap:3}}>{tags.slice(0,3).map((t,i)=><Ch key={i} label={t.v} tc={t.c} small/>)}</div>{btn}</div>);
return(<div draggable onDragStart={e=>{e.dataTransfer.setData("type","card");e.dataTransfer.setData("id",String(ex.id))}} style={{borderRadius:R.xl,border:`1px solid ${C.border}`,background:C.warmWhite,cursor:"grab",transition:"all .2s",display:"flex",flexDirection:"column",overflow:"hidden",userSelect:"none"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHover;e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none"}}>
<div onClick={onDetail} style={{padding:"14px 14px 0",display:"flex",flexDirection:"column",gap:7,cursor:"pointer",flex:1}}>
<h3 style={{margin:0,fontSize:15,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.textPrimary,lineHeight:1.3}}>{ex.n}</h3>
<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{tags.map((t,i)=><Ch key={i} label={t.v} tc={t.c} small/>)}{xtra>0&&<span style={{fontSize:10,color:C.textMuted,alignSelf:"center"}}>+{xtra}</span>}</div>
{ex.cu&&<p style={{margin:0,fontSize:11,color:C.textSecondary,fontStyle:"italic",lineHeight:1.5}}>"{ex.cu}"</p>}
</div><div style={{padding:"8px 14px 12px",display:"flex",justifyContent:"flex-end"}}>{btn}</div></div>)};

// ─── SEQUENCE CARD ───
const SC=({sq,exs,onQ,onUp,onDel,mob})=>{
const[exp,setExp]=useState(false);const[enm,setEnm]=useState(false);const[nm,setNm]=useState(sq.nm);
const[addEx,setAE]=useState(false);const[addSr,setAS]=useState("");const[addVar,setAV]=useState(null);const[varNm,setVN]=useState("");
const nmR=useRef(null);useEffect(()=>{if(enm&&nmR.current)nmR.current.focus()},[enm]);
const saveNm=()=>{if(nm.trim()&&onUp)onUp({...sq,nm:nm.trim()});setEnm(false)};
const mv=(i,d)=>{if(!onUp)return;const a=[...sq.it];const j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];onUp({...sq,it:a})};
const rmI=id=>{if(onUp)onUp({...sq,it:sq.it.filter(i=>i.id!==id)})};
const addI=eid=>{if(onUp)onUp({...sq,it:[...sq.it,{id:uid(),e:eid,v:[]}]});setAS("")};
const doAV=iid=>{if(!varNm.trim()||!onUp)return;onUp({...sq,it:sq.it.map(i=>i.id===iid?{...i,v:[...i.v,{id:uid(),nm:varNm.trim()}]}:i)});setVN("");setAV(null)};
const rmV=(iid,vid)=>{if(onUp)onUp({...sq,it:sq.it.map(i=>i.id===iid?{...i,v:i.v.filter(v=>v.id!==vid)}:i)})};
const af=exs.filter(e=>e.n.toLowerCase().includes(addSr.toLowerCase())&&!sq.it.some(si=>si.e===e.id)).slice(0,6);
return(<div draggable onDragStart={e=>{e.dataTransfer.setData("type","seq");e.dataTransfer.setData("id",sq.id)}} style={{border:`1.5px solid ${C.brown}20`,borderRadius:R.xl,background:C.warmWhite,overflow:"hidden",cursor:"grab"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.brown}40`} onMouseLeave={e=>e.currentTarget.style.borderColor=`${C.brown}20`}>
<div style={{padding:mob?"10px 12px":"12px 14px",display:"flex",alignItems:"center",gap:7}}>
<button onClick={()=>setExp(!exp)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex",transition:"transform .15s",transform:exp?"rotate(90deg)":"rotate(0)"}}><Ic n="chevR" s={14} c={C.brown}/></button>
<Ic n="seq" s={15} c={C.brown}/>
<div style={{flex:1,minWidth:0}}>
{enm?<input ref={nmR} value={nm} onChange={e=>setNm(e.target.value)} onBlur={saveNm} onKeyDown={e=>e.key==="Enter"&&saveNm()} style={{border:"none",borderBottom:`2px solid ${C.brown}`,outline:"none",fontSize:14,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",background:"transparent",width:"100%",padding:"0 0 2px",color:C.textPrimary}}/>
:<span onClick={()=>setEnm(true)} style={{fontSize:14,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.textPrimary,cursor:"text",display:"flex",alignItems:"center",gap:4}}>{sq.nm}<span className="eh" style={{opacity:.2}}><Ic n="edit" s={11} c={C.brown}/></span></span>}
<div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
{sq.fc&&<span style={{fontSize:9,background:`${C.brown}10`,color:C.brown,padding:"2px 7px",borderRadius:R.pill,fontWeight:500}}>{sq.fc}</span>}
{sq.pk&&<span style={{fontSize:9,background:`${C.orange}10`,color:C.orange,padding:"2px 7px",borderRadius:R.pill,fontWeight:500}}>Peak: {sq.pk}</span>}
{sq.tags?.map(tg=><span key={tg} style={{fontSize:9,background:C.bgTertiary,color:C.textSecondary,padding:"2px 7px",borderRadius:R.pill}}>{tg}</span>)}
</div></div>
<button onClick={()=>onQ(sq.id)} style={{border:`1.5px solid ${C.forest}22`,background:`${C.forest}08`,cursor:"pointer",borderRadius:R.md,padding:"5px 8px",display:"flex",alignItems:"center",gap:2,color:C.forest,fontSize:9,fontWeight:600,fontFamily:"inherit"}}><Ic n="plus" s={9} c={C.forest}/>Queue</button>
<button onClick={()=>setExp(!exp)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex",color:C.textMuted}}><Ic n="edit" s={13} c={C.textMuted}/></button>
{onDel&&<button onClick={()=>onDel(sq.id)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}><Ic n="trash" s={13} c={C.danger}/></button>}
</div>
{exp&&<div style={{padding:"6px 14px 12px 24px",borderTop:`1px solid ${C.border}`}}>
{sq.it.map((si,j)=>{const ex=exs.find(e=>e.id===si.e);const isPk=sq.pk&&ex?.n===sq.pk;return <div key={si.id} style={{marginBottom:3}}>
<div style={{display:"flex",alignItems:"center",gap:5,padding:"6px 8px",borderRadius:R.md,border:`1px solid ${C.border}`,background:C.warmWhite}}>
<span style={{fontSize:10,fontWeight:700,color:C.brown,background:`${C.brown}10`,borderRadius:R.sm,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{j+1}</span>
<span style={{flex:1,fontSize:12,fontWeight:isPk?700:500,color:isPk?C.orange:C.textPrimary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?.n||"?"}</span>
{isPk&&<span style={{fontSize:8,background:`${C.orange}12`,color:C.orange,padding:"2px 6px",borderRadius:R.pill,fontWeight:600}}>PEAK</span>}
<button onClick={()=>setAV(addVar===si.id?null:si.id)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}><Ic n="plus" s={11} c={C.brown}/></button>
{j>0&&<button onClick={()=>mv(j,-1)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}><Ic n="chevU" s={11} c={C.textMuted}/></button>}
{j<sq.it.length-1&&<button onClick={()=>mv(j,1)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}><Ic n="chevD" s={11} c={C.textMuted}/></button>}
<button onClick={()=>rmI(si.id)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}><Ic n="x" s={11} c={C.danger}/></button></div>
{si.v.length>0&&<div style={{marginLeft:26,borderLeft:`2px solid ${C.brown}18`,paddingLeft:10,marginTop:2}}>
{si.v.map(v=><div key={v.id} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:R.sm,background:`${C.brown}06`,fontSize:10,color:C.brown,fontWeight:500,marginBottom:2}}>
<span style={{opacity:.4}}>↳</span><span style={{flex:1}}>{v.nm}</span>
<button onClick={()=>rmV(si.id,v.id)} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic n="x" s={9} c={C.textMuted}/></button></div>)}</div>}
{addVar===si.id&&<div style={{marginLeft:26,marginTop:3,display:"flex",gap:4}}>
<input autoFocus value={varNm} onChange={e=>setVN(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAV(si.id)} placeholder="Variation name..." style={{flex:1,border:`1.5px solid ${C.brown}30`,borderRadius:R.md,padding:"5px 9px",fontSize:11,fontFamily:"inherit",outline:"none",background:"transparent",color:C.textPrimary}}/>
<button onClick={()=>doAV(si.id)} style={{border:"none",background:C.brown,color:"#fff",borderRadius:R.md,padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Add</button></div>}
</div>})}
<button onClick={()=>setAE(!addEx)} style={{width:"100%",border:`1.5px dashed ${C.brown}20`,background:addEx?`${C.brown}05`:"transparent",cursor:"pointer",borderRadius:R.md,padding:"6px 10px",display:"flex",alignItems:"center",justifyContent:"center",gap:4,color:C.brown,fontSize:10,fontWeight:600,fontFamily:"inherit",marginTop:4}}><Ic n="plus" s={10} c={C.brown}/>{addEx?"Close":"Add Exercise"}</button>
{addEx&&<div style={{marginTop:4}}>
<input placeholder="Search exercises..." value={addSr} onChange={e=>setAS(e.target.value)} autoFocus style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:R.md,padding:"5px 9px",fontSize:11,fontFamily:"inherit",outline:"none",marginBottom:3,boxSizing:"border-box",background:"transparent",color:C.textPrimary}}/>
<div style={{display:"flex",flexWrap:"wrap",gap:3}}>
{af.map(e=><button key={e.id} onClick={()=>addI(e.id)} style={{border:`1px solid ${C.border}`,background:C.warmWhite,borderRadius:R.md,padding:"4px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit",color:C.textPrimary,fontWeight:500}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.brown} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>{e.n}</button>)}
</div></div>}
</div>}</div>)};

// ─── FULL-SCREEN CARD EDITOR ───
const FullEditor=({ex,at,oc,os})=>{
const[n,sN]=useState(ex?.n||"");const[cu,sCu]=useState(ex?.cu||"");const[no,sNo]=useState(ex?.no||"");const[tags,sTags]=useState(ex?.t||{});
const tog=(tk,tag)=>{const c=tags[tk]||[];sTags({...tags,[tk]:c.includes(tag)?c.filter(x=>x!==tag):[...c,tag]})};
return(<div style={{position:"fixed",inset:0,background:C.cream,zIndex:1000,display:"flex",flexDirection:"column",overflow:"hidden"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:C.warmWhite}}>
<h2 style={{margin:0,fontSize:20,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.textPrimary}}>{ex?"Edit QUE Card":"New QUE Card"}</h2>
<div style={{display:"flex",gap:8}}>
<button onClick={oc} style={{padding:"9px 18px",border:`1.5px solid ${C.border}`,borderRadius:R.lg,background:"transparent",fontSize:13,cursor:"pointer",fontFamily:"inherit",color:C.textSecondary}}>Cancel</button>
<button onClick={()=>{if(n.trim()){os({n:n.trim(),t:tags,no,cu});oc()}}} style={{padding:"9px 22px",border:"none",borderRadius:R.lg,background:C.forest,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{ex?"Save":"Create"}</button>
</div></div>
<div style={{flex:1,overflowY:"auto",padding:"24px 20px",maxWidth:700,margin:"0 auto",width:"100%"}}>
<div style={{marginBottom:24}}>
<label style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:C.textSecondary,display:"block",marginBottom:6}}>Exercise Name</label>
<input value={n} onChange={e=>sN(e.target.value)} autoFocus placeholder="e.g. The Hundred" style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:R.lg,padding:"14px 18px",fontSize:20,fontFamily:"'Instrument Serif',Georgia,serif",fontWeight:600,outline:"none",background:C.warmWhite,boxSizing:"border-box",color:C.textPrimary}}/>
</div>
<div style={{marginBottom:24}}>
<label style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:C.textSecondary,display:"block",marginBottom:6}}>Teaching Cue</label>
<textarea value={cu} onChange={e=>sCu(e.target.value)} placeholder="Main cue for this exercise..." rows={3} style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:R.lg,padding:"14px 18px",fontSize:14,fontFamily:"inherit",fontStyle:"italic",outline:"none",resize:"vertical",background:C.warmWhite,boxSizing:"border-box",color:C.textPrimary}}/>
</div>
<div style={{marginBottom:24}}>
<label style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:C.textSecondary,display:"block",marginBottom:6}}>Notes</label>
<textarea value={no} onChange={e=>sNo(e.target.value)} placeholder="Modifications, precautions..." rows={3} style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:R.lg,padding:"14px 18px",fontSize:14,fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.6,background:C.warmWhite,boxSizing:"border-box",color:C.textPrimary}}/>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
{Object.entries(TT).map(([tk,ti])=>(<div key={tk}>
<label style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:ti.c,display:"block",marginBottom:6}}>{ti.i} {ti.l}</label>
<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
{(at[tk]||[]).map(tag=><Ch key={tag} label={tag} tc={ti.c} state={(tags[tk]||[]).includes(tag)?1:0} onClick={()=>tog(tk,tag)}/>)}
</div></div>))}
</div></div></div>)};

// ─── TAG MANAGER ───
const TagMgr=({tk,ti,tags,oc,onRen,onDel,onAdd})=>{const[nt,sN]=useState("");const[ei,sE]=useState(null);const[ev,sV]=useState("");
return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.25)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={oc}>
<div onClick={e=>e.stopPropagation()} style={{background:C.warmWhite,borderRadius:R.xl,padding:24,width:"100%",maxWidth:360,maxHeight:"80vh",overflowY:"auto",boxShadow:"0 16px 48px rgba(0,0,0,.1)"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h3 style={{margin:0,fontSize:16,fontWeight:600,color:ti.c}}>{ti.i} {ti.l}</h3><button onClick={oc} style={{border:"none",background:"none",cursor:"pointer",padding:4,color:C.textMuted,display:"flex"}}><Ic n="x" s={16}/></button></div>
<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:14}}>
{tags.map((tag,j)=><div key={tag} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:R.md,background:C.bgSecondary}}>
{ei===j?<input value={ev} onChange={e=>sV(e.target.value)} autoFocus onBlur={()=>{if(ev.trim())onRen(tag,ev.trim());sE(null)}} onKeyDown={e=>{if(e.key==="Enter"){if(ev.trim())onRen(tag,ev.trim());sE(null)}}} style={{flex:1,border:"none",borderBottom:`2px solid ${ti.c}`,outline:"none",background:"transparent",fontSize:13,fontFamily:"inherit",color:C.textPrimary}}/>
:<span style={{flex:1,fontSize:13,color:C.textPrimary}}>{tag}</span>}
<button onClick={()=>{sE(j);sV(tag)}} style={{border:"none",background:"none",cursor:"pointer",padding:2,color:C.textMuted,display:"flex"}}><Ic n="edit" s={13}/></button>
<button onClick={()=>onDel(tag)} style={{border:"none",background:"none",cursor:"pointer",padding:2,color:C.danger,display:"flex"}}><Ic n="trash" s={13}/></button>
</div>)}</div>
<div style={{display:"flex",gap:6}}><input placeholder="Add new tag..." value={nt} onChange={e=>sN(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nt.trim()){onAdd(nt.trim());sN("")}}} style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:R.md,padding:"8px 12px",fontSize:13,outline:"none",fontFamily:"inherit",background:"transparent",color:C.textPrimary}}/><button onClick={()=>{if(nt.trim()){onAdd(nt.trim());sN("")}}} style={{border:"none",background:ti.c,color:"#fff",borderRadius:R.md,padding:"8px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Add</button></div>
</div></div>};

// ─── SAVE PLAN MODAL ───
const SaveModal=({oc,os})=>{const[nm,sNm]=useState("Today's Class");const[tags,sTags]=useState([]);const[ti,sTi]=useState("");
const add=()=>{if(ti.trim()&&tags.length<3&&!tags.includes(ti.trim())){sTags([...tags,ti.trim()]);sTi("")}};
return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.25)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={oc}>
<div onClick={e=>e.stopPropagation()} style={{background:C.warmWhite,borderRadius:R.xl,padding:24,width:"100%",maxWidth:400,boxShadow:"0 16px 48px rgba(0,0,0,.1)"}}>
<h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.textPrimary}}>Save Class Plan</h3>
<input value={nm} onChange={e=>sNm(e.target.value)} placeholder="Plan name" style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:R.lg,padding:"12px 16px",fontSize:15,fontFamily:"'Instrument Serif',Georgia,serif",fontWeight:600,outline:"none",marginBottom:14,background:"transparent",boxSizing:"border-box",color:C.textPrimary}}/>
<div style={{marginBottom:14}}>
<div style={{fontSize:11,fontWeight:600,color:C.textSecondary,marginBottom:6}}>Tags (1-3 required)</div>
<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{tags.map(t=><Ch key={t} label={t} tc={C.forest} rm onRm={()=>sTags(tags.filter(x=>x!==t))}/>)}</div>
{tags.length<3&&<div style={{display:"flex",gap:6}}>
<input value={ti} onChange={e=>sTi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="e.g. Intermediate, Mat" style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:R.md,padding:"8px 12px",fontSize:12,outline:"none",fontFamily:"inherit",background:"transparent",color:C.textPrimary}}/>
<button onClick={add} style={{border:`1.5px solid ${C.forest}22`,background:`${C.forest}08`,color:C.forest,borderRadius:R.md,padding:"8px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Add</button></div>}
</div>
<div style={{display:"flex",gap:8}}>
<button onClick={oc} style={{flex:1,padding:11,border:`1.5px solid ${C.border}`,borderRadius:R.lg,background:"transparent",fontSize:13,cursor:"pointer",fontFamily:"inherit",color:C.textSecondary}}>Cancel</button>
<button onClick={()=>{if(nm.trim()&&tags.length>=1){os(nm.trim(),tags);oc()}}} disabled={tags.length<1} style={{flex:1,padding:11,border:"none",borderRadius:R.lg,background:tags.length>=1?C.forest:C.textMuted,color:"#fff",fontSize:13,fontWeight:600,cursor:tags.length>=1?"pointer":"default",fontFamily:"inherit"}}>{tags.length<1?"Need 1+ tag":"Save Plan"}</button>
</div></div></div>};

// ─── MAIN APP ───
export default function App(){
const mob=useIsMobile();
const[exs,sExs]=useStore("que_exs",IE);
const[at,sAt]=useStore("que_tags",IT);
const[seqs,sSeqs]=useStore("que_seqs",IS);
const[qi,sQi]=useStore("que_queue",[]);
const[saved,sSaved]=useStore("que_plans",[]);
const[fs,sFs]=useState({});const[sr,sSr]=useState("");const[vm,sVm]=useState(mob?"list":"grid");const[sort,sSort]=useState("abc");
const[mt,sMt]=useState(null);const[showEditor,sSE]=useState(null);const[showNS,sSNS]=useState(false);const[showSave,sShowSave]=useState(false);
const[sc,sSc]=useState(mob);const[showQ,sShowQ]=useState(!mob);
const[tab,sTab]=useState("cards");const[sqSr,sSqSr]=useState("");
// Mobile: show overlay panels
const[mobPanel,sMobPanel]=useState(null); // "queue"|"filters"|null

const toggleF=useCallback((k,clr)=>sFs(p=>clr?{...p,[k]:0}:{...p,[k]:cyc(p[k]||0)}),[]);
const filtered=useMemo(()=>{let r=[...exs];if(sr){const l=sr.toLowerCase();r=r.filter(e=>e.n.toLowerCase().includes(l)||e.cu?.toLowerCase().includes(l)||Object.values(e.t).flat().some(t=>t.toLowerCase().includes(l)))}const inc={},exc={};Object.entries(fs).forEach(([k,s])=>{if(s===0)return;const[t,tag]=k.split("::");if(s===1)(inc[t]=inc[t]||[]).push(tag);else(exc[t]=exc[t]||[]).push(tag)});r=r.filter(ex=>{for(const[t,ts]of Object.entries(exc))if(ts.some(tg=>(ex.t[t]||[]).includes(tg)))return false;for(const[t,ts]of Object.entries(inc))if(!ts.some(tg=>(ex.t[t]||[]).includes(tg)))return false;return true});if(sort==="abc")r.sort((a,b)=>a.n.localeCompare(b.n));else if(sort==="recent")r.sort((a,b)=>b.id-a.id);return r},[exs,fs,sr,sort]);
const filteredSeqs=useMemo(()=>{let r=[...seqs];if(sqSr){const l=sqSr.toLowerCase();r=r.filter(s=>s.nm.toLowerCase().includes(l)||(s.fc||"").toLowerCase().includes(l)||(s.pk||"").toLowerCase().includes(l)||(s.tags||[]).some(t=>t.toLowerCase().includes(l)))}if(sort==="abc")r.sort((a,b)=>a.nm.localeCompare(b.nm));return r},[seqs,sqSr,sort]);
const filteredPlans=useMemo(()=>{let r=[...saved];const inc={},exc={};Object.entries(fs).forEach(([k,s])=>{if(s===0)return;const[t,tag]=k.split("::");if(s===1)(inc[t]=inc[t]||[]).push(tag);else(exc[t]=exc[t]||[]).push(tag)});if(Object.keys(inc).length>0||Object.keys(exc).length>0)r=r.filter(p=>{const pt=p.tags||[];for(const[,ts]of Object.entries(exc))if(ts.some(t=>pt.includes(t)))return false;for(const[,ts]of Object.entries(inc))if(!ts.some(t=>pt.includes(t)))return false;return true});return r},[saved,fs]);

const addEx=({n,t,no,cu})=>sExs(p=>[...p,{id:Math.max(0,...p.map(e=>e.id))+1,n,t,no,cu}]);
const upEx=u=>sExs(p=>p.map(e=>e.id===u.id?u:e));
const renTag=(tk,o,n)=>{sAt(p=>({...p,[tk]:p[tk].map(t=>t===o?n:t)}));sExs(p=>p.map(e=>({...e,t:{...e.t,[tk]:(e.t[tk]||[]).map(t=>t===o?n:t)}})))};
const delTag=(tk,tn)=>{sAt(p=>({...p,[tk]:p[tk].filter(t=>t!==tn)}));sExs(p=>p.map(e=>({...e,t:{...e.t,[tk]:(e.t[tk]||[]).filter(t=>t!==tn)}})));sFs(p=>{const n={...p};delete n[`${tk}::${tn}`];return n})};
const addTagG=(tk,tn)=>{if(!(at[tk]||[]).includes(tn))sAt(p=>({...p,[tk]:[...(p[tk]||[]),tn]}))};
const addCardQ=exId=>sQi(p=>[...p,{id:uid(),type:"card",exId}]);
const addSeqQ=seqId=>sQi(p=>[...p,{id:uid(),type:"seq",seqId}]);
const savePlan=(nm,tags)=>{sSaved(p=>[...p,{id:uid(),name:nm,tags,items:[...qi],date:new Date().toLocaleDateString()}]);sQi([])};

const ac=Object.values(fs).filter(v=>v!==0).length;

return(<div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",fontFamily:"'DM Sans',sans-serif",background:C.cream,color:C.textPrimary}}>

{/* ─── TOP BAR ─── */}
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:mob?"0 12px":"0 16px",height:mob?52:50,flexShrink:0,borderBottom:`1px solid ${C.border}`,background:C.warmWhite}}>
<div style={{display:"flex",alignItems:"center",gap:mob?2:4}}>
{mob&&<button onClick={()=>sMobPanel(mobPanel==="filters"?null:"filters")} style={{border:"none",background:"none",cursor:"pointer",padding:6,display:"flex",color:mobPanel==="filters"?C.forest:C.textSecondary,position:"relative"}}><Ic n="filter" s={18}/>{ac>0&&<span style={{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:4,background:C.orange}}/>}</button>}
{!mob&&<Ic n="seq" s={18} c={C.forest}/>}
{[{k:"cards",l:mob?"Cards":"QUE Cards",c:C.forest},{k:"sequences",l:mob?"Seq":"Sequences",c:C.brown},{k:"studio",l:"Studio",c:C.orange}].map(({k,l,c})=>(<button key={k} onClick={()=>sTab(k)} style={{border:"none",background:"none",cursor:"pointer",padding:mob?"12px 8px":"13px 12px",fontSize:mob?12:12,fontFamily:"inherit",fontWeight:tab===k?600:400,color:tab===k?c:C.textMuted,borderBottom:tab===k?`2.5px solid ${c}`:"2.5px solid transparent",marginBottom:-1,transition:"all .15s"}}>{l}</button>))}
</div>
<div style={{display:"flex",gap:mob?4:6,alignItems:"center"}}>
{qi.length>0&&!mob&&<button onClick={()=>sShowSave(true)} style={{border:`1.5px solid ${C.forest}22`,background:`${C.forest}08`,color:C.forest,borderRadius:R.lg,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><Ic n="save" s={12} c={C.forest}/>Save</button>}
{mob?<button onClick={()=>sMobPanel(mobPanel==="queue"?null:"queue")} style={{border:mobPanel==="queue"?`2px solid ${C.forest}`:`1.5px solid ${C.border}`,background:mobPanel==="queue"?`${C.forest}08`:"transparent",color:mobPanel==="queue"?C.forest:C.textSecondary,borderRadius:R.lg,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:3,position:"relative"}}><Ic n="queue" s={14} c={mobPanel==="queue"?C.forest:C.textSecondary}/>{qi.length>0&&<span style={{background:C.forest,color:"#fff",borderRadius:R.pill,padding:"0 5px",fontSize:9,fontWeight:700}}>{qi.length}</span>}</button>
:<button onClick={()=>sShowQ(!showQ)} style={{border:showQ?`2px solid ${C.forest}`:`1.5px solid ${C.border}`,background:showQ?`${C.forest}08`:"transparent",color:showQ?C.forest:C.textSecondary,borderRadius:R.lg,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><Ic n="queue" s={13} c={showQ?C.forest:C.textSecondary}/>Queue{qi.length>0&&<span style={{background:C.forest,color:"#fff",borderRadius:R.pill,padding:"0 6px",fontSize:9,fontWeight:700}}>{qi.length}</span>}</button>}
{tab==="cards"&&<button onClick={()=>sSE({})} style={{border:"none",background:C.forest,color:"#fff",borderRadius:R.lg,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><Ic n="plus" s={12} c="#fff"/>{mob?"":"New Card"}</button>}
{tab==="sequences"&&<button onClick={()=>sSNS(true)} style={{border:"none",background:C.brown,color:"#fff",borderRadius:R.lg,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><Ic n="plus" s={12} c="#fff"/>{mob?"":"New Seq"}</button>}
</div></div>

{/* ─── BODY ─── */}
<div style={{flex:1,display:"flex",overflow:"hidden",position:"relative"}}>

{/* Mobile overlay panels */}
{mob&&mobPanel==="filters"&&<div style={{position:"absolute",inset:0,zIndex:100,background:C.warmWhite,overflowY:"auto",padding:16}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
<h3 style={{margin:0,fontSize:16,fontWeight:600,color:C.textPrimary}}>Filters</h3>
<button onClick={()=>sMobPanel(null)} style={{border:"none",background:"none",cursor:"pointer",padding:4,display:"flex",color:C.textSecondary}}><Ic n="x" s={20}/></button>
</div>
<div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:R.lg,border:`1.5px solid ${C.border}`,background:C.cream,marginBottom:12}}>
<Ic n="search" s={14} c={C.textMuted}/><input type="text" placeholder="Search..." value={sr} onChange={e=>sSr(e.target.value)} style={{border:"none",outline:"none",background:"transparent",fontSize:14,fontFamily:"inherit",width:"100%",color:C.textPrimary}}/>
</div>
{ac>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,padding:"8px 12px",borderRadius:R.md,background:`${C.forest}08`,border:`1px solid ${C.forest}15`}}><span style={{fontSize:12,color:C.forest,fontWeight:500}}>{ac} active</span><button onClick={()=>{Object.keys(fs).forEach(k=>{if(fs[k]!==0)toggleF(k,true)})}} style={{border:"none",background:"none",color:C.danger,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Clear</button></div>}
{Object.entries(TT).map(([tk,ti])=>(<div key={tk} style={{marginBottom:14}}>
<div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:ti.c,marginBottom:6,display:"flex",alignItems:"center",gap:4}}><span>{ti.i}</span>{ti.l}
<button onClick={()=>{sMobPanel(null);sMt(tk)}} style={{marginLeft:"auto",border:"none",background:"none",cursor:"pointer",padding:2,color:C.textMuted,display:"flex"}}><Ic n="edit" s={12}/></button>
</div>
<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(at[tk]||[]).map(tag=><Ch key={`${tk}::${tag}`} label={tag} state={fs[`${tk}::${tag}`]||0} onClick={()=>toggleF(`${tk}::${tag}`)} tc={ti.c}/>)}</div>
</div>))}
</div>}

{mob&&mobPanel==="queue"&&<div style={{position:"absolute",inset:0,zIndex:100,background:C.warmWhite,display:"flex",flexDirection:"column",overflow:"hidden"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
<h3 style={{margin:0,fontSize:16,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.forest,display:"flex",alignItems:"center",gap:6}}><Ic n="queue" s={18} c={C.forest}/>The Queue</h3>
<div style={{display:"flex",gap:6}}>
{qi.length>0&&<button onClick={()=>{sMobPanel(null);sShowSave(true)}} style={{border:`1.5px solid ${C.forest}22`,background:`${C.forest}08`,color:C.forest,borderRadius:R.md,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Save</button>}
<button onClick={()=>sMobPanel(null)} style={{border:"none",background:"none",cursor:"pointer",padding:4,color:C.textSecondary,display:"flex"}}><Ic n="x" s={20}/></button>
</div></div>
<div style={{flex:1,overflowY:"auto",padding:12}}>
{qi.length===0?<div style={{textAlign:"center",padding:"40px 16px",color:C.textMuted}}><Ic n="queue" s={32} c={C.bgTertiary}/><p style={{fontSize:14,margin:"10px 0 4px",fontWeight:500,color:C.textSecondary}}>Empty queue</p><p style={{fontSize:12,margin:0}}>Add exercises from QUE Cards</p></div>
:<div style={{display:"flex",flexDirection:"column",gap:6}}>
{qi.map((item,i)=>{
if(item.type==="card"){const ex=exs.find(e=>e.id===item.exId);return <div key={item.id} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 12px",borderRadius:R.lg,border:`1px solid ${C.border}`,background:C.warmWhite}}>
<span style={{fontSize:11,fontWeight:700,color:C.forest,background:`${C.forest}10`,borderRadius:R.sm,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
<span style={{flex:1,fontSize:13,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.textPrimary}}>{ex?.n||"?"}</span>
<button onClick={()=>sQi(p=>p.filter(x=>x.id!==item.id))} style={{border:"none",background:"none",cursor:"pointer",padding:4,display:"flex"}}><Ic n="x" s={14} c={C.danger}/></button></div>}
if(item.type==="seq"){const sq=seqs.find(s=>s.id===item.seqId);return <div key={item.id} style={{borderRadius:R.lg,border:`1.5px solid ${C.brown}20`,background:`${C.brown}04`,padding:"10px 12px"}}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<span style={{fontSize:11,fontWeight:700,color:C.forest,background:`${C.forest}10`,borderRadius:R.sm,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
<Ic n="seq" s={14} c={C.brown}/><span style={{flex:1,fontSize:13,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.brown}}>{sq?.nm||"?"}</span>
<button onClick={()=>sQi(p=>p.filter(x=>x.id!==item.id))} style={{border:"none",background:"none",cursor:"pointer",padding:4,display:"flex"}}><Ic n="x" s={14} c={C.danger}/></button></div>
{sq&&<div style={{marginTop:6,paddingLeft:30}}>{sq.it.map((si,j)=>{const ex=exs.find(e=>e.id===si.e);return <div key={si.id} style={{fontSize:11,color:C.textSecondary,padding:"2px 0"}}>{j+1}. {ex?.n}</div>})}</div>}
</div>}return null})}
</div>}
{qi.length>0&&<div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
<button onClick={()=>sQi([])} style={{width:"100%",border:`1.5px solid ${C.danger}20`,background:`${C.danger}06`,color:C.danger,borderRadius:R.md,padding:"8px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Clear Queue</button></div>}
</div>}

{/* Desktop sidebar */}
{!mob&&!sc&&<div style={{width:236,minWidth:236,borderRight:`1px solid ${C.border}`,overflowY:"auto",height:"100%",background:C.warmWhite,display:"flex",flexDirection:"column"}}>
<div style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
<span style={{fontSize:10,fontWeight:600,letterSpacing:".06em",color:C.textSecondary,textTransform:"uppercase"}}>Filters</span>
<button onClick={()=>sSc(true)} style={{border:"none",background:"none",cursor:"pointer",padding:3,color:C.textMuted,display:"flex"}}><Ic n="sidebar" s={14}/></button></div>
<div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
<div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 10px",borderRadius:R.lg,border:`1.5px solid ${C.border}`,background:C.cream,marginBottom:10}}>
<Ic n="search" s={13} c={C.textMuted}/><input type="text" placeholder="Search..." value={sr} onChange={e=>sSr(e.target.value)} style={{border:"none",outline:"none",background:"transparent",fontSize:12,fontFamily:"inherit",width:"100%",color:C.textPrimary}}/>{sr&&<button onClick={()=>sSr("")} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex",color:C.textMuted}}><Ic n="x" s={12}/></button>}</div>
<div style={{display:"flex",alignItems:"center",gap:4,marginBottom:10}}>
<Ic n="sort" s={12} c={C.textMuted}/>
<select value={sort} onChange={e=>sSort(e.target.value)} style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:R.md,padding:"5px 8px",fontSize:11,fontFamily:"inherit",background:"transparent",color:C.textSecondary,outline:"none"}}><option value="abc">A → Z</option><option value="recent">Recent</option></select></div>
{ac>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"6px 10px",borderRadius:R.md,background:`${C.forest}06`,border:`1px solid ${C.forest}12`}}><span style={{fontSize:11,color:C.forest,fontWeight:500}}>{ac} active</span><button onClick={()=>Object.keys(fs).forEach(k=>{if(fs[k]!==0)toggleF(k,true)})} style={{border:"none",background:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Clear</button></div>}
{Object.entries(TT).map(([tk,ti])=>(<div key={tk} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",marginBottom:4,borderBottom:`1px solid ${C.border}`}}>
<span style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:ti.c,display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:9}}>{ti.i}</span>{ti.l}</span>
<button onClick={()=>sMt(tk)} style={{color:C.textMuted,cursor:"pointer",display:"flex",border:"none",background:"none",padding:2}} onMouseEnter={e=>e.currentTarget.style.color=ti.c} onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}><Ic n="edit" s={11}/></button></div>
<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{(at[tk]||[]).map(tag=><Ch key={`${tk}::${tag}`} label={tag} state={fs[`${tk}::${tag}`]||0} onClick={()=>toggleF(`${tk}::${tag}`)} tc={ti.c} small/>)}</div>
</div>))}
</div></div>}
{!mob&&sc&&<div style={{width:44,minWidth:44,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:10,background:C.warmWhite}}>
<button onClick={()=>sSc(false)} style={{border:"none",background:"none",cursor:"pointer",padding:4,color:C.textMuted,display:"flex"}}><Ic n="sidebar" s={15}/></button>
{ac>0&&<span style={{fontSize:9,fontWeight:700,background:C.forest,color:"#fff",borderRadius:R.pill,padding:"2px 6px",marginTop:8}}>{ac}</span>}
</div>}

{/* CENTER */}
<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
{tab==="cards"&&<>
<div style={{padding:mob?"8px 12px":"6px 16px",borderBottom:`1px solid ${C.border}`,background:C.warmWhite,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<span style={{fontSize:11,color:C.textSecondary}}>{filtered.length} QUE Cards</span>
{!mob&&<div style={{display:"flex",gap:3,padding:2,borderRadius:R.md,background:C.bgTertiary}}>
{[["grid","grid"],["list","list"]].map(([m,i])=>(<button key={m} onClick={()=>sVm(m)} style={{padding:"4px 8px",border:"none",borderRadius:R.sm,cursor:"pointer",display:"flex",background:vm===m?C.warmWhite:"transparent",boxShadow:vm===m?"0 1px 3px rgba(0,0,0,.04)":"none"}}><Ic n={i} s={13} c={vm===m?C.textPrimary:C.textMuted}/></button>))}
</div>}</div>
<div style={{flex:1,overflowY:"auto",padding:mob?"10px 12px":"14px 16px"}}>
{filtered.length===0?<div style={{textAlign:"center",padding:"40px",color:C.textMuted}}><p style={{fontSize:14}}>No matches</p></div>
:<div style={{display:vm==="grid"&&!mob?"grid":"flex",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",flexDirection:"column",gap:mob?6:vm==="grid"?10:6}}>
{filtered.map((ex,i)=>(<div key={ex.id} style={{animation:`fadeIn .2s ease ${i*.02}s both`}}><QC ex={ex} vm={mob?"list":vm} onQ={addCardQ} onDetail={()=>sSE(ex)} mob={mob}/></div>))}
</div>}</div></>}

{tab==="sequences"&&<>
<div style={{padding:mob?"8px 12px":"6px 16px",borderBottom:`1px solid ${C.border}`,background:C.warmWhite,display:"flex",alignItems:"center",gap:8}}>
<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderRadius:R.lg,border:`1.5px solid ${C.border}`,background:C.cream,flex:1,maxWidth:mob?"100%":300}}><Ic n="search" s={13} c={C.textMuted}/><input type="text" placeholder="Search sequences..." value={sqSr} onChange={e=>sSqSr(e.target.value)} style={{border:"none",outline:"none",background:"transparent",fontSize:12,fontFamily:"inherit",width:"100%",color:C.textPrimary}}/></div>
{!mob&&<span style={{fontSize:11,color:C.textSecondary}}>{filteredSeqs.length} seq</span>}
</div>
<div style={{flex:1,overflowY:"auto",padding:mob?"10px 12px":"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
{filteredSeqs.length===0&&<div style={{textAlign:"center",padding:"40px",color:C.textMuted}}><Ic n="seq" s={28} c={C.bgTertiary}/><p style={{fontSize:14,margin:"10px 0"}}>No sequences</p></div>}
{filteredSeqs.map(sq=><SC key={sq.id} sq={sq} exs={exs} onQ={addSeqQ} onUp={u=>sSeqs(p=>p.map(s=>s.id===u.id?u:s))} onDel={id=>sSeqs(p=>p.filter(s=>s.id!==id))} mob={mob}/>)}
</div></>}

{tab==="studio"&&<>
<div style={{padding:mob?"8px 12px":"6px 16px",borderBottom:`1px solid ${C.border}`,background:C.warmWhite,fontSize:11,color:C.textSecondary}}>{filteredPlans.length} saved plan{filteredPlans.length!==1?"s":""}</div>
<div style={{flex:1,overflowY:"auto",padding:mob?"10px 12px":"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
{filteredPlans.length===0&&<div style={{textAlign:"center",padding:"40px",color:C.textMuted}}><Ic n="studio" s={28} c={C.bgTertiary}/><p style={{fontSize:14,margin:"10px 0"}}>No saved plans yet</p></div>}
{filteredPlans.map(p=><div key={p.id} style={{border:`1px solid ${C.border}`,borderRadius:R.xl,padding:"12px 14px",background:C.warmWhite}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.textPrimary}}>{p.name}</div>
<div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{p.tags?.map(tg=><span key={tg} style={{fontSize:9,background:`${C.forest}08`,color:C.forest,padding:"2px 8px",borderRadius:R.pill,fontWeight:500}}>{tg}</span>)}<span style={{fontSize:9,color:C.textMuted}}>{p.items.length} items · {p.date}</span></div></div>
<button onClick={()=>{sQi(p.items);sShowQ(true);if(mob)sMobPanel("queue")}} style={{border:`1.5px solid ${C.forest}22`,background:`${C.forest}08`,color:C.forest,borderRadius:R.lg,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Load</button>
<button onClick={()=>sSaved(pr=>pr.filter(x=>x.id!==p.id))} style={{border:"none",background:"none",cursor:"pointer",padding:4,display:"flex"}}><Ic n="trash" s={14} c={C.danger}/></button>
</div></div>)}
</div></>}
</div>

{/* Desktop Queue */}
{!mob&&showQ&&<div style={{width:320,minWidth:320,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.warmWhite,height:"100%"}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const t=e.dataTransfer.getData("type"),id=e.dataTransfer.getData("id");if(t==="card")addCardQ(parseInt(id));else if(t==="seq")addSeqQ(id)}}>
<div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
<h3 style={{margin:0,fontSize:15,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.forest,display:"flex",alignItems:"center",gap:6}}><Ic n="queue" s={16} c={C.forest}/>The Queue</h3>
{qi.length>0&&<button onClick={()=>sQi([])} style={{border:"none",background:"none",color:C.danger,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Clear</button>}
</div>
<div style={{fontSize:11,color:C.textSecondary,fontWeight:500,fontFamily:"'Instrument Serif',Georgia,serif"}}>Plan for Today</div>
</div>
<div style={{flex:1,overflowY:"auto",padding:"8px 10px",display:"flex",flexDirection:"column",gap:4}}>
{qi.length===0&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 14px",color:C.textMuted,textAlign:"center"}}><Ic n="queue" s={28} c={C.bgTertiary}/><p style={{fontSize:12,margin:"8px 0 3px",fontWeight:500,color:C.textSecondary}}>Empty</p><p style={{fontSize:10,margin:0}}>Drag cards here or use + Queue</p></div>}
{qi.map((item,i)=>{
if(item.type==="card"){const ex=exs.find(e=>e.id===item.exId);return <div key={item.id} draggable style={{display:"flex",alignItems:"center",gap:5,padding:"7px 10px",borderRadius:R.lg,border:`1px solid ${C.border}`,background:C.warmWhite,cursor:"grab"}}>
<Ic n="grip" s={10} c={C.bgTertiary}/>
<span style={{fontSize:10,fontWeight:700,color:C.forest,background:`${C.forest}10`,borderRadius:R.sm,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
<span style={{flex:1,fontSize:12,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.textPrimary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?.n||"?"}</span>
<button onClick={()=>sQi(p=>p.filter(x=>x.id!==item.id))} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}><Ic n="x" s={11} c={C.danger}/></button></div>}
if(item.type==="seq"){const sq=seqs.find(s=>s.id===item.seqId);return <div key={item.id} draggable style={{borderRadius:R.lg,border:`1.5px solid ${C.brown}18`,background:`${C.brown}04`,overflow:"hidden",cursor:"grab"}}>
<div style={{display:"flex",alignItems:"center",gap:5,padding:"7px 10px"}}>
<Ic n="grip" s={10} c={C.bgTertiary}/>
<span style={{fontSize:10,fontWeight:700,color:C.forest,background:`${C.forest}10`,borderRadius:R.sm,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
<Ic n="seq" s={11} c={C.brown}/><span style={{flex:1,fontSize:11,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.brown,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sq?.nm||"?"}</span>
<button onClick={()=>sQi(p=>p.filter(x=>x.id!==item.id))} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}><Ic n="x" s={11} c={C.danger}/></button></div>
{sq&&<div style={{padding:"2px 10px 6px 36px"}}>{sq.it.map((si,j)=>{const ex=exs.find(e=>e.id===si.e);return <div key={si.id} style={{fontSize:10,color:C.textSecondary,padding:"2px 0"}}>{j+1}. {ex?.n}</div>})}</div>}
</div>}return null})}
</div></div>}
</div>

{/* Modals */}
{mt&&<TagMgr tk={mt} ti={TT[mt]} tags={at[mt]||[]} oc={()=>sMt(null)} onRen={(o,n)=>renTag(mt,o,n)} onDel={t=>delTag(mt,t)} onAdd={t=>addTagG(mt,t)}/>}
{showEditor!==null&&<FullEditor ex={showEditor?.id?showEditor:null} at={at} oc={()=>sSE(null)} os={d=>{if(showEditor?.id)upEx({...showEditor,...d});else addEx(d)}}/>}
{showNS&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.25)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>sSNS(false)}><div onClick={e=>e.stopPropagation()} style={{background:C.warmWhite,borderRadius:R.xl,padding:24,width:"100%",maxWidth:380,boxShadow:"0 16px 48px rgba(0,0,0,.1)"}}>
<h3 style={{margin:"0 0 14px",fontSize:16,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:C.brown,display:"flex",alignItems:"center",gap:6}}><Ic n="seq" s={18} c={C.brown}/>New Sequence</h3>
<input id="nsn" placeholder="Sequence name" autoFocus style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:R.lg,padding:"10px 14px",fontSize:14,outline:"none",marginBottom:10,fontFamily:"inherit",background:"transparent",boxSizing:"border-box",color:C.textPrimary}}/>
<div style={{display:"flex",gap:8,marginBottom:10}}>
<div style={{flex:1}}><div style={{fontSize:10,color:C.brown,fontWeight:600,marginBottom:4}}>Focus</div><input id="nsf" placeholder="e.g. Articulation" style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:R.md,padding:"7px 10px",fontSize:12,outline:"none",fontFamily:"inherit",background:"transparent",boxSizing:"border-box",color:C.textPrimary}}/></div>
<div style={{flex:1}}><div style={{fontSize:10,color:C.orange,fontWeight:600,marginBottom:4}}>Peak Exercise</div><input id="nsp" placeholder="e.g. Teaser" style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:R.md,padding:"7px 10px",fontSize:12,outline:"none",fontFamily:"inherit",background:"transparent",boxSizing:"border-box",color:C.textPrimary}}/></div></div>
<div style={{display:"flex",gap:8}}><button onClick={()=>sSNS(false)} style={{flex:1,padding:10,border:`1.5px solid ${C.border}`,borderRadius:R.lg,background:"transparent",fontSize:13,cursor:"pointer",fontFamily:"inherit",color:C.textSecondary}}>Cancel</button>
<button onClick={()=>{const n=document.getElementById("nsn").value,f=document.getElementById("nsf").value,p=document.getElementById("nsp").value;if(n.trim()){sSeqs(prev=>[...prev,{id:uid(),nm:n.trim(),fc:f.trim(),pk:p.trim(),tags:[],note:"",it:[]}]);sSNS(false)}}} style={{flex:1,padding:10,border:"none",borderRadius:R.lg,background:C.brown,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Create</button></div>
</div></div>}
{showSave&&<SaveModal oc={()=>sShowSave(false)} os={savePlan}/>}

<style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.eh:hover{opacity:.5!important}`}</style>
</div>)}