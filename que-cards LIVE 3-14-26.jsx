import{useState,useEffect,useRef,useCallback,useMemo}from"react";

// ─── DATA ───
const TT={position:{l:"Position",c:"#5B7E6B",i:"◎"},bodyRegion:{l:"Body Region",c:"#8B6B5B",i:"△"},level:{l:"Level",c:"#6B5B8B",i:"◈"},focus:{l:"Focus",c:"#5B748B",i:"▬"},modality:{l:"Modality",c:"#8B7B5B",i:"◇"},props:{l:"Props",c:"#7B5B6B",i:"○"}};
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
sidebar:<><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/></>,
queue:<><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
seq:<><path d="M4 6h16M4 12h12M4 18h8"/><circle cx="20" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></>,
grid:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
list:<>{[6,12,18].map(y=><><line key={`l${y}`} x1="8" y1={y} x2="21" y2={y}/><circle key={`c${y}`} cx="4" cy={y} r="1" fill={c} stroke="none"/></>)}</>,
group:<><rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray="4 2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></>,
eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
eyeOff:<><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>,
chart:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
note:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
studio:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
sparkle:<path d="M12 2l2 6.5L21 12l-7 3.5L12 22l-2-6.5L3 12l7-3.5Z" fill="none"/>,
sort:<><line x1="4" y1="6" x2="11" y2="6"/><line x1="4" y1="12" x2="8" y2="12"/><line x1="4" y1="18" x2="6" y2="18"/><polyline points="15 15 18 18 21 15"/><line x1="18" y1="4" x2="18" y2="18"/></>,
};return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,display:"block"}}>{d[n]}</svg>};

// ─── CHIP ───
const Ch=({label,state=0,onClick,tc,small,rm,onRm})=>(<span onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:3,padding:small?"1px 6px":"3px 9px",borderRadius:16,border:`1px solid ${state===1?"#2D5A3D":state===-1?"#8B3A3A":(tc||"#999")}`,background:state===1?"#2D5A3D":state===-1?"#8B3A3A":"transparent",color:state!==0?"#fff":(tc||"#888"),fontSize:small?9:10,fontFamily:"inherit",cursor:onClick?"pointer":"default",transition:"all .15s",textDecoration:state===-1?"line-through":"none",fontWeight:500,userSelect:"none",whiteSpace:"nowrap"}}>{state===1&&<span style={{fontSize:8}}>✓</span>}{state===-1&&<span style={{fontSize:8}}>✕</span>}{label}{rm&&<span onClick={e=>{e.stopPropagation();onRm?.()}} style={{marginLeft:1,cursor:"pointer",opacity:.6,fontSize:8}}>✕</span>}</span>);

// ─── FILTER SIDEBAR (no view toggle - moved to center header) ───
const FP=({co,ot,at,fs,onF,om,sr,os,sort,onSort})=>{
const[sec,setSec]=useState({});const ac=Object.values(fs).filter(v=>v!==0).length;
return(<div style={{width:co?44:236,minWidth:co?44:236,borderRight:"1px solid rgba(128,128,128,.06)",overflowY:co?"hidden":"auto",overflowX:"hidden",height:"100%",transition:"width .2s,min-width .2s",background:"var(--color-background-primary,#fff)",display:"flex",flexDirection:"column"}}>
<div style={{padding:co?"10px 0":"10px 12px",display:"flex",alignItems:"center",justifyContent:co?"center":"space-between",borderBottom:"1px solid rgba(128,128,128,.05)",flexShrink:0}}>
{!co&&<span style={{fontSize:9,fontWeight:600,letterSpacing:".06em",color:"#888",textTransform:"uppercase"}}>Filters</span>}
<button onClick={ot} style={{border:"none",background:"none",cursor:"pointer",padding:3,color:"#999",display:"flex"}}><Ic n="sidebar" s={14} c="#999"/></button></div>
{co&&ac>0&&<div style={{display:"flex",justifyContent:"center",pt:8}}><span style={{fontSize:9,fontWeight:700,background:"#2D5A3D",color:"#fff",borderRadius:10,padding:"1px 6px",marginTop:8}}>{ac}</span></div>}
{!co&&<div style={{flex:1,overflowY:"auto",padding:"8px 12px"}}>
{/* Search */}
<div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 8px",borderRadius:7,border:"1px solid rgba(128,128,128,.08)",background:"rgba(128,128,128,.015)",marginBottom:8}}>
<Ic n="search" s={12} c="#aaa"/><input type="text" placeholder="Search..." value={sr} onChange={e=>os(e.target.value)} style={{border:"none",outline:"none",background:"transparent",fontSize:11,fontFamily:"inherit",width:"100%",color:"var(--color-text-primary,#333)"}}/>
{sr&&<button onClick={()=>os("")} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex",color:"#bbb"}}><Ic n="x" s={10}/></button>}</div>
{/* Sort */}
<div style={{display:"flex",alignItems:"center",gap:4,marginBottom:8}}>
<Ic n="sort" s={11} c="#aaa"/>
<select value={sort} onChange={e=>onSort(e.target.value)} style={{flex:1,border:"1px solid rgba(128,128,128,.08)",borderRadius:6,padding:"3px 6px",fontSize:10,fontFamily:"inherit",background:"transparent",color:"var(--color-text-primary,#555)",outline:"none"}}>
<option value="abc">A → Z</option><option value="recent">Recent</option><option value="count-asc"># QUEs: Low → High</option><option value="count-desc"># QUEs: High → Low</option>
</select></div>
{/* Active filters */}
{ac>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"5px 8px",borderRadius:6,background:"rgba(45,90,61,.03)",border:"1px solid rgba(45,90,61,.06)"}}>
<span style={{fontSize:10,color:"#2D5A3D",fontWeight:500}}>{ac} active</span>
<button onClick={()=>Object.keys(fs).forEach(k=>{if(fs[k]!==0)onF(k,true)})} style={{border:"none",background:"none",color:"#8B3A3A",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Clear</button></div>}
{/* Tag groups */}
{Object.entries(TT).map(([tk,ti])=>(<div key={tk} style={{marginBottom:9}}>
<div onClick={()=>setSec(p=>({...p,[tk]:!p[tk]}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",padding:"3px 0",marginBottom:3,borderBottom:"1px solid rgba(128,128,128,.04)"}}>
<span style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:ti.c,display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:8}}>{ti.i}</span>{ti.l}</span>
<div style={{display:"flex",alignItems:"center",gap:4}}>
<span onClick={e=>{e.stopPropagation();om(tk)}} style={{color:"#ccc",cursor:"pointer",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.color=ti.c} onMouseLeave={e=>e.currentTarget.style.color="#ccc"} title="Manage tags"><Ic n="edit" s={10}/></span>
<span style={{display:"flex",transition:"transform .15s",transform:sec[tk]?"rotate(-180deg)":"rotate(0)"}}><Ic n="chevD" s={10} c="#aaa"/></span></div></div>
{!sec[tk]&&<div style={{display:"flex",flexWrap:"wrap",gap:3}}>{(at[tk]||[]).map(tag=><Ch key={`${tk}::${tag}`} label={tag} state={fs[`${tk}::${tag}`]||0} onClick={()=>onF(`${tk}::${tag}`)} tc={ti.c} small/>)}</div>}
</div>))}
</div>}</div>)};

// ─── QUE CARD ───
const QC=({ex,vm,onQ,onDetail})=>{
const tags=Object.entries(ex.t).flatMap(([t,vs])=>vs.map(v=>({v,c:TT[t]?.c||"#999"}))).slice(0,4);
const xtra=Object.values(ex.t).flat().length-4;
const btn=<button onClick={e=>{e.stopPropagation();onQ(ex.id)}} style={{border:"1px solid rgba(45,90,61,.08)",background:"rgba(45,90,61,.03)",cursor:"pointer",borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:2,color:"#2D5A3D",fontSize:9,fontWeight:600,fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(45,90,61,.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(45,90,61,.03)"}><Ic n="plus" s={9} c="#2D5A3D"/>Queue</button>;
if(vm==="list")return(<div draggable onDragStart={e=>{e.dataTransfer.setData("type","card");e.dataTransfer.setData("id",String(ex.id))}} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 11px",borderRadius:7,border:"1px solid rgba(128,128,128,.05)",background:"var(--color-background-primary,#fff)",cursor:"grab",transition:"all .12s",userSelect:"none"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(128,128,128,.15)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(128,128,128,.05)"}><span style={{color:"#ddd",display:"flex"}}><Ic n="grip" s={11} c="#ddd"/></span><span onClick={onDetail} style={{fontWeight:600,fontSize:12,fontFamily:"'Instrument Serif',Georgia,serif",color:"var(--color-text-primary,#333)",cursor:"pointer",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.n}</span><div style={{display:"flex",gap:2}}>{tags.slice(0,3).map((t,i)=><Ch key={i} label={t.v} tc={t.c} small/>)}</div>{btn}</div>);
return(<div draggable onDragStart={e=>{e.dataTransfer.setData("type","card");e.dataTransfer.setData("id",String(ex.id))}} style={{borderRadius:10,border:"1px solid rgba(128,128,128,.05)",background:"var(--color-background-primary,#fff)",cursor:"grab",transition:"all .2s",display:"flex",flexDirection:"column",overflow:"hidden",userSelect:"none"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(128,128,128,.15)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(128,128,128,.05)";e.currentTarget.style.transform="none"}}><div onClick={onDetail} style={{padding:"11px 11px 0",display:"flex",flexDirection:"column",gap:5,cursor:"pointer",flex:1}}><h3 style={{margin:0,fontSize:13,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"var(--color-text-primary,#333)",lineHeight:1.3}}>{ex.n}</h3><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{tags.map((t,i)=><Ch key={i} label={t.v} tc={t.c} small/>)}{xtra>0&&<span style={{fontSize:9,color:"#999"}}>+{xtra}</span>}</div>{ex.cu&&<p style={{margin:0,fontSize:9,color:"#999",fontStyle:"italic",lineHeight:1.4}}>"{ex.cu}"</p>}</div><div style={{padding:"5px 11px 9px",display:"flex",justifyContent:"flex-end"}}>{btn}</div></div>)};

// ─── SEQUENCE CARD (editable + sortable dropdown) ───
const SC=({sq,exs,onQ,onEd,onUp,onDel})=>{
const[exp,setExp]=useState(false);
const[enm,setEnm]=useState(false);const[nm,setNm]=useState(sq.nm);
const[addEx,setAddEx]=useState(false);const[addSr,setAddSr]=useState("");
const[addVar,setAddVar]=useState(null);const[varNm,setVarNm]=useState("");
const nmRef=useRef(null);
useEffect(()=>{if(enm&&nmRef.current)nmRef.current.focus()},[enm]);
const saveNm=()=>{if(nm.trim()&&onUp)onUp({...sq,nm:nm.trim()});setEnm(false)};
const mvItem=(idx,d)=>{if(!onUp)return;const a=[...sq.it];const j=idx+d;if(j<0||j>=a.length)return;[a[idx],a[j]]=[a[j],a[idx]];onUp({...sq,it:a})};
const rmItem=id=>{if(onUp)onUp({...sq,it:sq.it.filter(i=>i.id!==id)})};
const addItem=exId=>{if(onUp)onUp({...sq,it:[...sq.it,{id:uid(),e:exId,v:[]}]});setAddSr("")};
const doAddVar=itemId=>{if(!varNm.trim()||!onUp)return;onUp({...sq,it:sq.it.map(i=>i.id===itemId?{...i,v:[...i.v,{id:uid(),nm:varNm.trim()}]}:i)});setVarNm("");setAddVar(null)};
const rmVar=(itemId,vId)=>{if(onUp)onUp({...sq,it:sq.it.map(i=>i.id===itemId?{...i,v:i.v.filter(v=>v.id!==vId)}:i)})};
const addFiltered=exs.filter(e=>e.n.toLowerCase().includes(addSr.toLowerCase())&&!sq.it.some(si=>si.e===e.id)).slice(0,8);
return(<div draggable onDragStart={e=>{e.dataTransfer.setData("type","seq");e.dataTransfer.setData("id",sq.id)}} style={{border:"1px solid rgba(91,116,139,.12)",borderRadius:10,background:"var(--color-background-primary,#fff)",overflow:"hidden",cursor:"grab"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(91,116,139,.25)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(91,116,139,.12)"}>
<div style={{padding:"9px 12px",display:"flex",alignItems:"center",gap:6}}>
<button onClick={()=>setExp(!exp)} style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex",transition:"transform .15s",transform:exp?"rotate(90deg)":"rotate(0)"}}><Ic n="chevR" s={12} c="#5B748B"/></button>
<Ic n="seq" s={13} c="#5B748B"/>
<div style={{flex:1,minWidth:0}}>
{enm?<input ref={nmRef} value={nm} onChange={e=>setNm(e.target.value)} onBlur={saveNm} onKeyDown={e=>e.key==="Enter"&&saveNm()} style={{border:"none",borderBottom:"2px solid #5B748B",outline:"none",fontSize:13,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",background:"transparent",width:"100%",padding:"0 0 2px",color:"var(--color-text-primary,#333)"}}/>
:<span onClick={()=>setEnm(true)} style={{fontSize:13,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"var(--color-text-primary,#333)",cursor:"text",display:"flex",alignItems:"center",gap:4}}>{sq.nm}<span className="eh" style={{opacity:.2}}><Ic n="edit" s={10} c="#5B748B"/></span></span>}
<div style={{display:"flex",gap:4,marginTop:2,flexWrap:"wrap"}}>
{sq.fc&&<span style={{fontSize:8,background:"rgba(91,116,139,.06)",color:"#5B748B",padding:"1px 5px",borderRadius:8,fontWeight:500}}>{sq.fc}</span>}
{sq.pk&&<span style={{fontSize:8,background:"rgba(107,91,139,.06)",color:"#6B5B8B",padding:"1px 5px",borderRadius:8,fontWeight:500}}>Peak: {sq.pk}</span>}
{sq.tags?.map(tg=><span key={tg} style={{fontSize:8,background:"rgba(128,128,128,.04)",color:"#888",padding:"1px 5px",borderRadius:8}}>{tg}</span>)}
<span style={{fontSize:8,color:"#aaa"}}>{sq.it.length} ex</span>
</div></div>
<button onClick={()=>onQ(sq.id)} style={{border:"1px solid rgba(45,90,61,.1)",background:"rgba(45,90,61,.03)",cursor:"pointer",borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:2,color:"#2D5A3D",fontSize:9,fontWeight:600,fontFamily:"inherit"}}><Ic n="plus" s={9} c="#2D5A3D"/>Queue</button>
{onDel&&<button onClick={()=>onDel(sq.id)} title="Delete" style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex",color:"#c88"}}><Ic n="trash" s={12} c="#c88"/></button>}
</div>
{exp&&<div style={{padding:"4px 12px 10px 20px",borderTop:"1px solid rgba(128,128,128,.04)"}}>
{sq.it.map((si,j)=>{const ex=exs.find(e=>e.id===si.e);const isPk=sq.pk&&ex?.n===sq.pk;
return <div key={si.id} style={{marginBottom:2}}>
<div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 6px",borderRadius:6,border:"1px solid rgba(128,128,128,.04)",background:"var(--color-background-primary,#fff)"}}>
<span style={{fontSize:9,fontWeight:700,color:"#5B748B",background:"rgba(91,116,139,.06)",borderRadius:4,width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{j+1}</span>
<span style={{flex:1,fontSize:11,fontWeight:isPk?700:500,color:isPk?"#6B5B8B":"var(--color-text-primary,#444)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?.n||"?"}</span>
{isPk&&<span style={{fontSize:7,background:"rgba(107,91,139,.08)",color:"#6B5B8B",padding:"1px 4px",borderRadius:6,fontWeight:600}}>PEAK</span>}
<button onClick={()=>setAddVar(addVar===si.id?null:si.id)} title="Add variation" style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex",color:"#5B748B"}}><Ic n="plus" s={10} c="#5B748B"/></button>
{j>0&&<button onClick={()=>mvItem(j,-1)} style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex"}}><Ic n="chevU" s={10} c="#aaa"/></button>}
{j<sq.it.length-1&&<button onClick={()=>mvItem(j,1)} style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex"}}><Ic n="chevD" s={10} c="#aaa"/></button>}
<button onClick={()=>rmItem(si.id)} style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex"}}><Ic n="x" s={10} c="#c88"/></button>
</div>
{si.v.length>0&&<div style={{marginLeft:22,borderLeft:"2px solid rgba(91,116,139,.08)",paddingLeft:8,marginTop:1}}>
{si.v.map(v=><div key={v.id} style={{display:"flex",alignItems:"center",gap:3,padding:"2px 6px",borderRadius:4,background:"rgba(91,116,139,.02)",fontSize:9,color:"#5B748B",fontWeight:500,marginBottom:1}}>
<span style={{opacity:.4}}>↳</span><span style={{flex:1}}>{v.nm}</span>
<button onClick={()=>rmVar(si.id,v.id)} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic n="x" s={8} c="#aab"/></button>
</div>)}</div>}
{addVar===si.id&&<div style={{marginLeft:22,marginTop:2,display:"flex",gap:3}}>
<input autoFocus value={varNm} onChange={e=>setVarNm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAddVar(si.id)} placeholder="Variation name..." style={{flex:1,border:"1px solid rgba(91,116,139,.12)",borderRadius:5,padding:"3px 7px",fontSize:10,fontFamily:"inherit",outline:"none",background:"transparent",color:"var(--color-text-primary,#333)"}}/>
<button onClick={()=>doAddVar(si.id)} style={{border:"none",background:"#5B748B",color:"#fff",borderRadius:5,padding:"3px 8px",fontSize:9,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Add</button>
</div>}
</div>})}
{/* Add exercise to sequence */}
<div style={{marginTop:4}}>
<button onClick={()=>setAddEx(!addEx)} style={{width:"100%",border:"1px dashed rgba(91,116,139,.12)",background:addEx?"rgba(91,116,139,.02)":"transparent",cursor:"pointer",borderRadius:6,padding:"4px 8px",display:"flex",alignItems:"center",justifyContent:"center",gap:3,color:"#5B748B",fontSize:9,fontWeight:600,fontFamily:"inherit"}}><Ic n="plus" s={9} c="#5B748B"/>{addEx?"Close":"Add Exercise"}</button>
{addEx&&<div style={{marginTop:3}}>
<input placeholder="Search exercises..." value={addSr} onChange={e=>setAddSr(e.target.value)} autoFocus style={{width:"100%",border:"1px solid rgba(128,128,128,.08)",borderRadius:5,padding:"3px 7px",fontSize:10,fontFamily:"inherit",outline:"none",marginBottom:2,boxSizing:"border-box",background:"transparent",color:"var(--color-text-primary,#333)"}}/>
<div style={{display:"flex",flexWrap:"wrap",gap:2}}>
{addFiltered.map(e=><button key={e.id} onClick={()=>addItem(e.id)} style={{border:"1px solid rgba(128,128,128,.06)",background:"var(--color-background-primary,#fff)",borderRadius:5,padding:"2px 7px",fontSize:9,cursor:"pointer",fontFamily:"inherit",color:"var(--color-text-primary,#444)",fontWeight:500}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(91,116,139,.25)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(128,128,128,.06)"}>{e.n}</button>)}
</div></div>}
</div>
</div>}
</div>)};

// ─── STUDIO PLAN CARD ───
const PlanCard=({plan,onLoad,onDel})=>(<div style={{border:"1px solid rgba(128,128,128,.08)",borderRadius:10,padding:"10px 12px",background:"var(--color-background-primary,#fff)",transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,90,61,.2)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(128,128,128,.08)"}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:14,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"var(--color-text-primary,#333)"}}>{plan.name}</div>
<div style={{display:"flex",gap:3,marginTop:3,flexWrap:"wrap"}}>
{plan.tags?.map(tg=><span key={tg} style={{fontSize:8,background:"rgba(45,90,61,.05)",color:"#2D5A3D",padding:"1px 5px",borderRadius:8,fontWeight:500}}>{tg}</span>)}
<span style={{fontSize:8,color:"#aaa"}}>{plan.items.length} items · {plan.date}</span>
</div></div>
<button onClick={()=>onLoad(plan)} style={{border:"1px solid rgba(45,90,61,.1)",background:"rgba(45,90,61,.03)",color:"#2D5A3D",borderRadius:7,padding:"4px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Load</button>
<button onClick={()=>onDel(plan.id)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}><Ic n="trash" s={12} c="#c88"/></button>
</div></div>);

// ─── QUEUE ANALYZER ───
const QAnalyzer=({qi,exs,seqs})=>{
const ids=[];qi.forEach(i=>{if(i.type==="card")ids.push(i.exId);else if(i.type==="seq"){const s=seqs.find(x=>x.id===i.seqId);if(s)s.it.forEach(x=>ids.push(x.e))}else if(i.type==="group")i.children.forEach(c=>ids.push(c.exId))});
const all=ids.map(id=>exs.find(e=>e.id===id)).filter(Boolean);
if(!all.length)return <div style={{padding:"20px 12px",textAlign:"center",color:"#bbb",fontSize:10}}>Add exercises to analyze</div>;
const tally=k=>{const m={};all.forEach(ex=>(ex.t[k]||[]).forEach(t=>{m[t]=(m[t]||0)+1}));return Object.entries(m).sort((a,b)=>b[1]-a[1])};
const pos=tally("position"),reg=tally("bodyRegion"),lvl=tally("level"),foc=tally("focus");
const mx=Math.max(...[...pos,...reg,...foc].map(([,c])=>c),1);
const lvlMap={Beginner:1,Intermediate:2,Advanced:3};
const arc=all.map(ex=>Math.max(...(ex.t.level||[]).map(l=>lvlMap[l]||1)));
const pi=arc.indexOf(Math.max(...arc));const peakEx=all[pi];
const miss=(k,pool)=>{const has=new Set(tally(k).map(([x])=>x));return pool.filter(x=>!has.has(x))};
const mPos=miss("position",IT.position),mReg=miss("bodyRegion",IT.bodyRegion),mFoc=miss("focus",IT.focus);
const Bar=({l,v,c})=>(<div style={{display:"flex",alignItems:"center",gap:4,padding:"1px 0"}}><span style={{fontSize:8,color:"#888",width:70,textAlign:"right",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</span><div style={{flex:1,height:10,background:"rgba(128,128,128,.03)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(6,(v/mx)*100)}%`,background:c,borderRadius:3}}/></div><span style={{fontSize:8,color:"#aaa",width:12}}>{v}</span></div>);
return(<div style={{padding:"10px 12px",fontSize:10}}>
<div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
{[{l:"Exercises",v:all.length,c:"#2D5A3D"},{l:"Positions",v:pos.length,c:"#5B7E6B"},{l:"Regions",v:reg.length,c:"#8B6B5B"},{l:"Focus",v:foc.length,c:"#5B748B"}].map(({l,v,c})=>(<div key={l} style={{background:"rgba(128,128,128,.02)",border:"1px solid rgba(128,128,128,.05)",borderRadius:7,padding:"6px 10px",flex:1,minWidth:60}}><div style={{fontSize:16,fontWeight:600,color:c,fontFamily:"'Instrument Serif',Georgia,serif"}}>{v}</div><div style={{fontSize:8,color:"#999"}}>{l}</div></div>))}
</div>
{/* Difficulty arc */}
<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:"#6B5B8B",marginBottom:4}}>Difficulty Arc</div>
<div style={{display:"flex",alignItems:"end",gap:1,height:36}}>
{arc.map((lv,i)=>(<div key={i} style={{flex:1,maxWidth:20}}><div style={{height:lv*10,background:i===pi?"#6B5B8B":"rgba(107,91,139,.15)",borderRadius:"3px 3px 0 0",transition:"height .3s"}}/></div>))}
</div>{peakEx&&<div style={{fontSize:8,color:"#6B5B8B",marginTop:2}}>Peak: {peakEx.n}</div>}
</div>
{[{t:"Positions",d:pos,c:"#5B7E6B"},{t:"Body Regions",d:reg,c:"#8B6B5B"},{t:"Focus",d:foc,c:"#5B748B"},{t:"Level",d:lvl,c:"#6B5B8B"}].map(({t,d,c})=>(<div key={t} style={{marginBottom:8}}><div style={{fontSize:9,fontWeight:600,color:c,marginBottom:2}}>{t}</div>{d.map(([k,v])=><Bar key={k} l={k} v={v} c={c}/>)}</div>))}
{(mPos.length>0||mReg.length>0||mFoc.length>0)&&<div style={{padding:"8px 10px",borderRadius:7,border:"1px solid rgba(139,58,58,.06)",background:"rgba(139,58,58,.02)",marginTop:4}}>
<div style={{fontSize:9,fontWeight:600,color:"#8B3A3A",marginBottom:4}}>Missing</div>
{mPos.length>0&&<div style={{fontSize:8,color:"#8B3A3A",marginBottom:2}}>Positions: {mPos.join(", ")}</div>}
{mReg.length>0&&<div style={{fontSize:8,color:"#8B3A3A",marginBottom:2}}>Regions: {mReg.join(", ")}</div>}
{mFoc.length>0&&<div style={{fontSize:8,color:"#8B3A3A"}}>Focus: {mFoc.join(", ")}</div>}
</div>}
</div>)};

// ─── INLINE SEQUENCE EDITOR (used in Queue and Sidebar) ───
const QSeqEdit=({sq,exs,showVars,onUp})=>{
const[addEx,setAE]=useState(false);const[addSr,setAS]=useState("");const[addVar,setAV]=useState(null);const[varNm,setVN]=useState("");
const[enm,setEnm]=useState(false);const[nm,setNm]=useState(sq.nm);const nmR=useRef(null);
useEffect(()=>{if(enm&&nmR.current)nmR.current.focus()},[enm]);
const saveNm=()=>{if(nm.trim())onUp({...sq,nm:nm.trim()});setEnm(false)};
const mv=(idx,d)=>{const a=[...sq.it];const j=idx+d;if(j<0||j>=a.length)return;[a[idx],a[j]]=[a[j],a[idx]];onUp({...sq,it:a})};
const rmI=id=>onUp({...sq,it:sq.it.filter(i=>i.id!==id)});
const addI=eid=>{onUp({...sq,it:[...sq.it,{id:uid(),e:eid,v:[]}]});setAS("")};
const doAV=iid=>{if(!varNm.trim())return;onUp({...sq,it:sq.it.map(i=>i.id===iid?{...i,v:[...i.v,{id:uid(),nm:varNm.trim()}]}:i)});setVN("");setAV(null)};
const rmV=(iid,vid)=>onUp({...sq,it:sq.it.map(i=>i.id===iid?{...i,v:i.v.filter(v=>v.id!==vid)}:i)});
const af=exs.filter(e=>e.n.toLowerCase().includes(addSr.toLowerCase())&&!sq.it.some(si=>si.e===e.id)).slice(0,6);
return(<div style={{padding:"4px 7px 8px 18px",borderTop:"1px solid rgba(91,116,139,.06)"}}>
{/* Editable name */}
<div style={{marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
{enm?<input ref={nmR} value={nm} onChange={e=>setNm(e.target.value)} onBlur={saveNm} onKeyDown={e=>e.key==="Enter"&&saveNm()} style={{border:"none",borderBottom:"1.5px solid #5B748B",outline:"none",fontSize:10,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",background:"transparent",width:"100%",padding:"0 0 1px",color:"var(--color-text-primary,#333)"}}/>
:<span onClick={()=>setEnm(true)} style={{fontSize:10,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"#5B748B",cursor:"text",display:"flex",alignItems:"center",gap:3}}>{sq.nm}<span className="eh" style={{opacity:.2}}><Ic n="edit" s={8} c="#5B748B"/></span></span>}
{sq.fc&&<span style={{fontSize:7,background:"rgba(91,116,139,.06)",color:"#5B748B",padding:"1px 4px",borderRadius:6}}>{sq.fc}</span>}
</div>
{/* Exercise list */}
{sq.it.map((si,j)=>{const ex=exs.find(e=>e.id===si.e);const isPk=sq.pk&&ex?.n===sq.pk;
return <div key={si.id} style={{marginBottom:1}}>
<div style={{display:"flex",alignItems:"center",gap:3,padding:"3px 5px",borderRadius:5,border:"1px solid rgba(128,128,128,.03)",background:"var(--color-background-primary,#fff)"}}>
<span style={{fontSize:8,fontWeight:700,color:"#5B748B",width:14,textAlign:"center",flexShrink:0}}>{j+1}</span>
<span style={{flex:1,fontSize:9,fontWeight:isPk?700:500,color:isPk?"#6B5B8B":"var(--color-text-primary,#555)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?.n||"?"}</span>
{isPk&&<span style={{fontSize:6,background:"rgba(107,91,139,.08)",color:"#6B5B8B",padding:"0px 3px",borderRadius:4,fontWeight:600}}>PEAK</span>}
<button onClick={()=>setAV(addVar===si.id?null:si.id)} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex",color:"#5B748B"}}><Ic n="plus" s={8} c="#5B748B"/></button>
{j>0&&<button onClick={()=>mv(j,-1)} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic n="chevU" s={8} c="#aaa"/></button>}
{j<sq.it.length-1&&<button onClick={()=>mv(j,1)} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic n="chevD" s={8} c="#aaa"/></button>}
<button onClick={()=>rmI(si.id)} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic n="x" s={8} c="#c88"/></button>
</div>
{showVars&&si.v.length>0&&<div style={{marginLeft:16,borderLeft:"1.5px solid rgba(91,116,139,.08)",paddingLeft:6}}>
{si.v.map(v=><div key={v.id} style={{display:"flex",alignItems:"center",gap:2,padding:"1px 4px",fontSize:8,color:"#5B748B"}}>
<span style={{opacity:.4}}>↳</span><span style={{flex:1}}>{v.nm}</span>
<button onClick={()=>rmV(si.id,v.id)} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic n="x" s={7} c="#aab"/></button>
</div>)}</div>}
{addVar===si.id&&<div style={{marginLeft:16,marginTop:1,display:"flex",gap:2}}>
<input autoFocus value={varNm} onChange={e=>setVN(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAV(si.id)} placeholder="Variation..." style={{flex:1,border:"1px solid rgba(91,116,139,.1)",borderRadius:4,padding:"2px 5px",fontSize:8,fontFamily:"inherit",outline:"none",background:"transparent",color:"var(--color-text-primary,#333)"}}/>
<button onClick={()=>doAV(si.id)} style={{border:"none",background:"#5B748B",color:"#fff",borderRadius:4,padding:"2px 6px",fontSize:7,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Add</button>
</div>}
</div>})}
{/* Add exercise */}
<button onClick={()=>setAE(!addEx)} style={{width:"100%",border:"1px dashed rgba(91,116,139,.1)",background:addEx?"rgba(91,116,139,.02)":"transparent",cursor:"pointer",borderRadius:5,padding:"3px 6px",display:"flex",alignItems:"center",justifyContent:"center",gap:2,color:"#5B748B",fontSize:8,fontWeight:600,fontFamily:"inherit",marginTop:2}}><Ic n="plus" s={8} c="#5B748B"/>{addEx?"Close":"Add Exercise"}</button>
{addEx&&<div style={{marginTop:2}}>
<input placeholder="Search..." value={addSr} onChange={e=>setAS(e.target.value)} autoFocus style={{width:"100%",border:"1px solid rgba(128,128,128,.06)",borderRadius:4,padding:"2px 5px",fontSize:8,fontFamily:"inherit",outline:"none",marginBottom:1,boxSizing:"border-box",background:"transparent",color:"var(--color-text-primary,#333)"}}/>
<div style={{display:"flex",flexWrap:"wrap",gap:1}}>
{af.map(e=><button key={e.id} onClick={()=>addI(e.id)} style={{border:"1px solid rgba(128,128,128,.04)",background:"var(--color-background-primary,#fff)",borderRadius:4,padding:"1px 5px",fontSize:8,cursor:"pointer",fontFamily:"inherit",color:"var(--color-text-primary,#444)"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(91,116,139,.2)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(128,128,128,.04)"}>{e.n}</button>)}
</div></div>}
</div>)};

// ─── THE QUEUE ───
const TQ=({items,setItems,exs,seqs,showVars,setShowVars,onMakeSeq,showAnalyze,setShowAnalyze,onUpSeq})=>{
const[dragIdx,setDI]=useState(null);const[dropIdx,setDO]=useState(null);
const[editGrp,setEG]=useState(null);const[grpName,setGN]=useState("");
const[sel,setSel]=useState(new Set());const[showAdd,setSA]=useState(false);const[addSr,setAS]=useState("");
const[expSeq,setExpSeq]=useState(new Set());
const gr=useRef(null);useEffect(()=>{if(editGrp&&gr.current)gr.current.focus()},[editGrp]);
const rm=id=>setItems(p=>p.filter(i=>i.id!==id));
const toggleSel=id=>setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n});
const groupSel=()=>{if(sel.size<2)return;const sa=[...sel];const ch=items.filter(i=>sa.includes(i.id)&&i.type==="card").map(i=>({id:uid(),exId:i.exId}));if(ch.length<2)return;const fi=items.findIndex(i=>sa.includes(i.id));const ni=items.filter(i=>!sa.includes(i.id)||i.type!=="card");ni.splice(Math.min(fi,ni.length),0,{id:uid(),type:"group",name:"New Group",children:ch});setItems(ni);setSel(new Set())};
const ungroup=gid=>setItems(p=>{const i=p.findIndex(x=>x.id===gid);if(i<0)return p;const g=p[i];if(g.type!=="group")return p;const ex=g.children.map(c=>({id:uid(),type:"card",exId:c.exId}));const n=[...p];n.splice(i,1,...ex);return n});
const renGrp=(id,nm)=>setItems(p=>p.map(i=>i.id===id?{...i,name:nm}:i));
const toggleExpSeq=id=>setExpSeq(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n});
// Drag handlers
const hDS=(e,i)=>{setDI(i);e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("qIdx",String(i))};
const hDO=(e,i)=>{e.preventDefault();if(dragIdx!==null&&dragIdx!==i)setDO(i)};
const hDr=(e,i)=>{e.preventDefault();const f=dragIdx;if(f===null||f===i){setDI(null);setDO(null);return}setItems(p=>{const a=[...p];const[item]=a.splice(f,1);a.splice(f<i?i-1:i,0,item);return a});setDI(null);setDO(null)};
const hDE=()=>{setDI(null);setDO(null)};
const hExtDrop=e=>{e.preventDefault();const t=e.dataTransfer.getData("type"),id=e.dataTransfer.getData("id");if(t==="card")setItems(p=>[...p,{id:uid(),type:"card",exId:parseInt(id)}]);else if(t==="seq")setItems(p=>[...p,{id:uid(),type:"seq",seqId:id}]);setDI(null);setDO(null)};
const addF=exs.filter(e=>e.n.toLowerCase().includes(addSr.toLowerCase())).slice(0,10);
const fc=items.reduce((a,i)=>a+(i.type==="group"?i.children.length:i.type==="seq"?(seqs.find(s=>s.id===i.seqId)?.it.length||0):1),0);

return(<div style={{width:320,minWidth:320,borderLeft:"1px solid rgba(128,128,128,.06)",display:"flex",flexDirection:"column",background:"var(--color-background-primary,#fff)",height:"100%"}} onDragOver={e=>e.preventDefault()} onDrop={hExtDrop}>
{/* Header */}
<div style={{padding:"10px 12px",borderBottom:"1px solid rgba(128,128,128,.04)",flexShrink:0}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
<h3 style={{margin:0,fontSize:14,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"#2D5A3D",display:"flex",alignItems:"center",gap:5}}><Ic n="queue" s={15} c="#2D5A3D"/>The Queue</h3>
<div style={{display:"flex",gap:3,alignItems:"center"}}>
<button onClick={()=>setShowAnalyze(!showAnalyze)} title="Analyzer" style={{border:showAnalyze?"1px solid rgba(107,91,139,.2)":"none",background:showAnalyze?"rgba(107,91,139,.04)":"none",cursor:"pointer",padding:"2px 4px",borderRadius:5,display:"flex",color:showAnalyze?"#6B5B8B":"#ccc"}}><Ic n="chart" s={12} c={showAnalyze?"#6B5B8B":"#ccc"}/></button>
<button onClick={()=>setShowVars(!showVars)} title={showVars?"Hide variations":"Show variations"} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex",color:showVars?"#5B748B":"#ccc"}}><Ic n={showVars?"eye":"eyeOff"} s={12} c={showVars?"#5B748B":"#ccc"}/></button>
{sel.size>=2&&<button onClick={groupSel} style={{border:"1px solid rgba(128,128,128,.12)",background:"rgba(128,128,128,.02)",cursor:"pointer",borderRadius:5,padding:"2px 6px",display:"flex",alignItems:"center",gap:2,color:"#555",fontSize:8,fontWeight:600,fontFamily:"inherit"}}><Ic n="group" s={9} c="#555"/>Group</button>}
{items.length>0&&<button onClick={()=>{setItems([]);setSel(new Set())}} style={{border:"none",background:"none",color:"#c88",fontSize:9,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Clear</button>}
</div></div>
<div style={{fontSize:10,color:"var(--color-text-primary,#555)",fontWeight:500,fontFamily:"'Instrument Serif',Georgia,serif"}}>Plan for Today</div>
<span style={{fontSize:9,color:"#999"}}>{fc} exercises</span>
</div>

{/* Add Exercise */}
<div style={{padding:"5px 10px",borderBottom:"1px solid rgba(128,128,128,.03)",flexShrink:0}}>
<button onClick={()=>setSA(!showAdd)} style={{width:"100%",border:"1px dashed rgba(45,90,61,.12)",background:showAdd?"rgba(45,90,61,.02)":"transparent",cursor:"pointer",borderRadius:7,padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"center",gap:4,color:"#2D5A3D",fontSize:10,fontWeight:600,fontFamily:"inherit"}}><Ic n="plus" s={11} c="#2D5A3D"/>{showAdd?"Close":"Add Exercise"}</button>
{showAdd&&<div style={{marginTop:4}}>
<input placeholder="Search exercises..." value={addSr} onChange={e=>setAS(e.target.value)} autoFocus style={{width:"100%",border:"1px solid rgba(128,128,128,.08)",borderRadius:6,padding:"4px 8px",fontSize:10,fontFamily:"inherit",outline:"none",marginBottom:3,boxSizing:"border-box",background:"transparent",color:"var(--color-text-primary,#333)"}}/>
<div style={{display:"flex",flexDirection:"column",gap:1,maxHeight:110,overflowY:"auto"}}>
{addF.map(ex=>(<button key={ex.id} onClick={()=>{setItems(p=>[...p,{id:uid(),type:"card",exId:ex.id}])}} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 7px",borderRadius:5,border:"1px solid rgba(128,128,128,.04)",background:"var(--color-background-primary,#fff)",cursor:"pointer",fontSize:10,fontFamily:"inherit",color:"var(--color-text-primary,#444)",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,90,61,.2)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(128,128,128,.04)"}><span style={{flex:1,fontWeight:500}}>{ex.n}</span><Ic n="plus" s={9} c="#2D5A3D"/></button>))}
</div></div>}
</div>

{/* Analyzer panel */}
{showAnalyze&&<div style={{borderBottom:"1px solid rgba(128,128,128,.04)",maxHeight:280,overflowY:"auto",flexShrink:0}}>
<QAnalyzer qi={items} exs={exs} seqs={seqs}/></div>}

{/* Queue items */}
<div style={{flex:1,overflowY:"auto",padding:"5px 8px",display:"flex",flexDirection:"column",gap:2}}>
{items.length===0&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 12px",color:"#ccc",textAlign:"center"}}><Ic n="queue" s={22} c="#ddd"/><p style={{fontSize:11,margin:"6px 0 2px",fontWeight:500,color:"#aaa"}}>Empty</p><p style={{fontSize:9,margin:0,color:"#ccc"}}>Drag cards or use + Add Exercise</p></div>}
{items.map((item,i)=>{const isOv=dropIdx===i,isDr=dragIdx===i;
if(item.type==="card"){const ex=exs.find(e=>e.id===item.exId);return(<div key={item.id} draggable onDragStart={e=>hDS(e,i)} onDragOver={e=>hDO(e,i)} onDrop={e=>hDr(e,i)} onDragEnd={hDE} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 7px",borderRadius:7,border:sel.has(item.id)?"1.5px solid rgba(45,90,61,.3)":"1px solid rgba(128,128,128,.04)",background:isDr?"rgba(45,90,61,.03)":"var(--color-background-primary,#fff)",opacity:isDr?.5:1,borderTop:isOv?"2px solid #2D5A3D":"none",cursor:"grab"}}><Ic n="grip" s={9} c="#ddd"/><input type="checkbox" checked={sel.has(item.id)} onChange={()=>toggleSel(item.id)} style={{width:11,height:11,accentColor:"#2D5A3D",cursor:"pointer"}}/><span style={{flex:1,fontSize:11,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"var(--color-text-primary,#333)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?.n||"?"}</span><button onClick={()=>rm(item.id)} style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex"}}><Ic n="x" s={9} c="#c88"/></button></div>)}
if(item.type==="seq"){const sq=seqs.find(s=>s.id===item.seqId);const isExp=expSeq.has(item.id);return(<div key={item.id} draggable onDragStart={e=>hDS(e,i)} onDragOver={e=>hDO(e,i)} onDrop={e=>hDr(e,i)} onDragEnd={hDE} style={{borderRadius:7,border:"1px solid rgba(91,116,139,.1)",overflow:"hidden",background:"rgba(91,116,139,.01)",opacity:isDr?.5:1,borderTop:isOv?"2px solid #5B748B":"none",cursor:"grab"}}>
<div style={{display:"flex",alignItems:"center",gap:4,padding:"5px 7px"}}><Ic n="grip" s={9} c="#ddd"/>
<button onClick={()=>toggleExpSeq(item.id)} style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex",transition:"transform .15s",transform:isExp?"rotate(90deg)":"rotate(0)"}}><Ic n="chevR" s={10} c="#5B748B"/></button>
<Ic n="seq" s={10} c="#5B748B"/><span style={{flex:1,fontSize:10,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"#5B748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sq?.nm||"?"}</span>
<button onClick={()=>toggleExpSeq(item.id)} title="Edit sequence" style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex",color:isExp?"#5B748B":"#ccc"}}><Ic n="edit" s={10} c={isExp?"#5B748B":"#ccc"}/></button>
<button onClick={()=>rm(item.id)} style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex"}}><Ic n="x" s={9} c="#c88"/></button></div>
{isExp&&sq&&<QSeqEdit sq={sq} exs={exs} showVars={showVars} onUp={updated=>onUpSeq(updated)}/>}
</div>)}
if(item.type==="group"){return(<div key={item.id} draggable onDragStart={e=>hDS(e,i)} onDragOver={e=>hDO(e,i)} onDrop={e=>hDr(e,i)} onDragEnd={hDE} style={{borderRadius:8,border:"1.5px dashed rgba(128,128,128,.12)",overflow:"hidden",background:"rgba(128,128,128,.01)",opacity:isDr?.5:1,borderTop:isOv?"2px solid #555":"none",cursor:"grab"}}>
<div style={{display:"flex",alignItems:"center",gap:3,padding:"5px 7px",background:"rgba(128,128,128,.015)"}}><Ic n="grip" s={9} c="#ddd"/><Ic n="group" s={10} c="#888"/>
{editGrp===item.id?<input ref={gr} value={grpName} onChange={e=>setGN(e.target.value)} onBlur={()=>{renGrp(item.id,grpName||"Group");setEG(null)}} onKeyDown={e=>e.key==="Enter"&&(renGrp(item.id,grpName||"Group"),setEG(null))} style={{flex:1,border:"none",borderBottom:"1.5px solid #555",outline:"none",fontSize:10,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",background:"transparent",color:"var(--color-text-primary,#333)"}}/>
:<span onClick={()=>{setEG(item.id);setGN(item.name)}} style={{flex:1,fontSize:10,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"var(--color-text-primary,#444)",cursor:"text",display:"flex",alignItems:"center",gap:2}}>{item.name}<span className="eh" style={{opacity:.15}}><Ic n="edit" s={8} c="#888"/></span></span>}
<button onClick={()=>onMakeSeq(item)} title="→ Sequence" style={{border:"1px solid rgba(91,116,139,.1)",background:"rgba(91,116,139,.02)",cursor:"pointer",borderRadius:4,padding:"1px 5px",display:"flex",alignItems:"center",gap:2,color:"#5B748B",fontSize:7,fontWeight:600,fontFamily:"inherit"}}><Ic n="seq" s={8} c="#5B748B"/>→Seq</button>
<button onClick={()=>ungroup(item.id)} title="Ungroup" style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex"}}><Ic n="x" s={9} c="#aaa"/></button>
<button onClick={()=>rm(item.id)} style={{border:"none",background:"none",cursor:"pointer",padding:1,display:"flex"}}><Ic n="trash" s={9} c="#c88"/></button>
</div>
<div style={{padding:"2px 7px 5px 28px"}}>{item.children.map((c,j)=>{const ex=exs.find(e=>e.id===c.exId);return <div key={c.id} style={{fontSize:9,color:"#666",padding:"1px 0"}}>{j+1}. {ex?.n||"?"}</div>})}</div>
</div>)}return null})}
</div></div>)};

// ─── FULL-SCREEN CARD EDITOR ───
const FullEditor=({ex,at,oc,os})=>{
const[n,sN]=useState(ex?.n||"");const[cu,sCu]=useState(ex?.cu||"");const[no,sNo]=useState(ex?.no||"");const[tags,sTags]=useState(ex?.t||{});
const tog=(tk,tag)=>{const c=tags[tk]||[];sTags({...tags,[tk]:c.includes(tag)?c.filter(x=>x!==tag):[...c,tag]})};
return(<div style={{position:"fixed",inset:0,background:"var(--color-background-primary,#fff)",zIndex:1000,display:"flex",flexDirection:"column",overflow:"hidden"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",borderBottom:"1px solid rgba(128,128,128,.06)"}}>
<h2 style={{margin:0,fontSize:20,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"var(--color-text-primary,#333)"}}>{ex?"Edit QUE Card":"New QUE Card"}</h2>
<div style={{display:"flex",gap:8}}>
<button onClick={oc} style={{padding:"8px 16px",border:"1px solid rgba(128,128,128,.1)",borderRadius:9,background:"transparent",fontSize:12,cursor:"pointer",fontFamily:"inherit",color:"#666"}}>Cancel</button>
<button onClick={()=>{if(n.trim()){os({n:n.trim(),t:tags,no,cu});oc()}}} style={{padding:"8px 20px",border:"none",borderRadius:9,background:"#2D5A3D",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{ex?"Save":"Create"}</button>
</div></div>
<div style={{flex:1,overflowY:"auto",padding:"24px",maxWidth:700,margin:"0 auto",width:"100%"}}>
<div style={{marginBottom:20}}>
<label style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:"#888",display:"block",marginBottom:5}}>Exercise Name</label>
<input value={n} onChange={e=>sN(e.target.value)} autoFocus placeholder="e.g. The Hundred" style={{width:"100%",border:"1px solid rgba(128,128,128,.1)",borderRadius:10,padding:"12px 16px",fontSize:18,fontFamily:"'Instrument Serif',Georgia,serif",fontWeight:600,outline:"none",background:"transparent",boxSizing:"border-box",color:"var(--color-text-primary,#333)"}}/>
</div>
<div style={{marginBottom:20}}>
<label style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:"#888",display:"block",marginBottom:5}}>Teaching Cue</label>
<textarea value={cu} onChange={e=>sCu(e.target.value)} placeholder="Main cue for this exercise..." rows={3} style={{width:"100%",border:"1px solid rgba(128,128,128,.1)",borderRadius:10,padding:"12px 16px",fontSize:13,fontFamily:"inherit",fontStyle:"italic",outline:"none",resize:"vertical",background:"transparent",boxSizing:"border-box",color:"var(--color-text-primary,#333)"}}/>
</div>
<div style={{marginBottom:20}}>
<label style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:"#888",display:"block",marginBottom:5}}>Notes</label>
<textarea value={no} onChange={e=>sNo(e.target.value)} placeholder="Modifications, precautions, progressions..." rows={3} style={{width:"100%",border:"1px solid rgba(128,128,128,.1)",borderRadius:10,padding:"12px 16px",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.5,background:"transparent",boxSizing:"border-box",color:"var(--color-text-primary,#333)"}}/>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
{Object.entries(TT).map(([tk,ti])=>(<div key={tk}>
<label style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:ti.c,display:"block",marginBottom:5}}>{ti.i} {ti.l}</label>
<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
{(at[tk]||[]).map(tag=><Ch key={tag} label={tag} tc={ti.c} state={(tags[tk]||[]).includes(tag)?1:0} onClick={()=>tog(tk,tag)} small/>)}
</div></div>))}
</div></div></div>)};

// ─── TAG MANAGER POPUP ───
const TagMgr=({tk,ti,tags,oc,onRen,onDel,onAdd})=>{const[nt,sN]=useState("");const[ei,sE]=useState(null);const[ev,sV]=useState("");
return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.2)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={oc}>
<div onClick={e=>e.stopPropagation()} style={{background:"var(--color-background-primary,#fff)",borderRadius:13,padding:20,width:320,maxHeight:480,overflowY:"auto",boxShadow:"0 14px 40px rgba(0,0,0,.08)"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h3 style={{margin:0,fontSize:13,fontWeight:600,color:ti.c}}>{ti.i} {ti.l}</h3><button onClick={oc} style={{border:"none",background:"none",cursor:"pointer",padding:2,color:"#999",display:"flex"}}><Ic n="x" s={13}/></button></div>
<div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:10}}>
{tags.map((tag,j)=><div key={tag} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:6,background:"rgba(128,128,128,.015)"}}>
{ei===j?<input value={ev} onChange={e=>sV(e.target.value)} autoFocus onBlur={()=>{if(ev.trim())onRen(tag,ev.trim());sE(null)}} onKeyDown={e=>{if(e.key==="Enter"){if(ev.trim())onRen(tag,ev.trim());sE(null)}}} style={{flex:1,border:"none",borderBottom:"1px solid "+ti.c,outline:"none",background:"transparent",fontSize:11,fontFamily:"inherit",color:"var(--color-text-primary,#333)"}}/>
:<span style={{flex:1,fontSize:11,color:"var(--color-text-primary,#555)"}}>{tag}</span>}
<button onClick={()=>{sE(j);sV(tag)}} style={{border:"none",background:"none",cursor:"pointer",padding:1,color:"#ccc",display:"flex"}}><Ic n="edit" s={10}/></button>
<button onClick={()=>onDel(tag)} style={{border:"none",background:"none",cursor:"pointer",padding:1,color:"#C66",display:"flex"}}><Ic n="trash" s={10}/></button>
</div>)}</div>
<div style={{display:"flex",gap:5}}><input placeholder="Add new tag..." value={nt} onChange={e=>sN(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nt.trim()){onAdd(nt.trim());sN("")}}} style={{flex:1,border:"1px solid rgba(128,128,128,.08)",borderRadius:6,padding:"6px 8px",fontSize:11,outline:"none",fontFamily:"inherit",background:"transparent",color:"var(--color-text-primary,#333)"}}/><button onClick={()=>{if(nt.trim()){onAdd(nt.trim());sN("")}}} style={{border:"none",background:ti.c,color:"#fff",borderRadius:6,padding:"6px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Add</button></div>
</div></div>};

// ─── SAVE PLAN MODAL ───
const SaveModal=({oc,os})=>{const[nm,sNm]=useState("Today's Class");const[tags,sTags]=useState([]);const[ti,sTi]=useState("");
const add=()=>{if(ti.trim()&&tags.length<3&&!tags.includes(ti.trim())){sTags([...tags,ti.trim()]);sTi("")}};
return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.2)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={oc}>
<div onClick={e=>e.stopPropagation()} style={{background:"var(--color-background-primary,#fff)",borderRadius:13,padding:20,width:360,boxShadow:"0 14px 40px rgba(0,0,0,.08)"}}>
<h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"var(--color-text-primary,#333)"}}>Save Class Plan</h3>
<input value={nm} onChange={e=>sNm(e.target.value)} placeholder="Plan name" style={{width:"100%",border:"1px solid rgba(128,128,128,.08)",borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"'Instrument Serif',Georgia,serif",fontWeight:600,outline:"none",marginBottom:12,background:"transparent",boxSizing:"border-box",color:"var(--color-text-primary,#333)"}}/>
<div style={{marginBottom:12}}>
<div style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",color:"#888",marginBottom:4}}>Tags (1-3 required)</div>
<div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:6}}>
{tags.map(t=><Ch key={t} label={t} tc="#2D5A3D" rm onRm={()=>sTags(tags.filter(x=>x!==t))}/>)}
</div>
{tags.length<3&&<div style={{display:"flex",gap:4}}>
<input value={ti} onChange={e=>sTi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="e.g. Intermediate, Mat, Core" style={{flex:1,border:"1px solid rgba(128,128,128,.08)",borderRadius:6,padding:"5px 8px",fontSize:10,outline:"none",fontFamily:"inherit",background:"transparent",color:"var(--color-text-primary,#333)"}}/>
<button onClick={add} style={{border:"1px solid rgba(45,90,61,.1)",background:"rgba(45,90,61,.03)",color:"#2D5A3D",borderRadius:6,padding:"4px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Add</button>
</div>}
</div>
<div style={{display:"flex",gap:6}}>
<button onClick={oc} style={{flex:1,padding:9,border:"1px solid rgba(128,128,128,.08)",borderRadius:8,background:"transparent",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:"#666"}}>Cancel</button>
<button onClick={()=>{if(nm.trim()&&tags.length>=1){os(nm.trim(),tags);oc()}}} disabled={tags.length<1} style={{flex:1,padding:9,border:"none",borderRadius:8,background:tags.length>=1?"#2D5A3D":"#ccc",color:"#fff",fontSize:11,fontWeight:600,cursor:tags.length>=1?"pointer":"default",fontFamily:"inherit"}}>{tags.length<1?"Need 1+ tags":"Save Plan"}</button>
</div></div></div>};

// ─── NEW SEQ MODAL ───
const NewSeqMod=({oc,os})=>{const[nm,sN]=useState("");const[fc,sF]=useState("");const[pk,sP]=useState("");
return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.2)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={oc}>
<div onClick={e=>e.stopPropagation()} style={{background:"var(--color-background-primary,#fff)",borderRadius:13,padding:20,width:340,boxShadow:"0 14px 40px rgba(0,0,0,.08)"}}>
<h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:600,fontFamily:"'Instrument Serif',Georgia,serif",color:"#5B748B",display:"flex",alignItems:"center",gap:5}}><Ic n="seq" s={15} c="#5B748B"/>New Sequence</h3>
<input placeholder="Sequence name" value={nm} onChange={e=>sN(e.target.value)} autoFocus style={{width:"100%",border:"1px solid rgba(128,128,128,.08)",borderRadius:8,padding:"9px 11px",fontSize:12,outline:"none",marginBottom:8,fontFamily:"inherit",background:"transparent",boxSizing:"border-box",color:"var(--color-text-primary,#333)"}}/>
<div style={{display:"flex",gap:6,marginBottom:8}}>
<div style={{flex:1}}><div style={{fontSize:9,color:"#5B748B",fontWeight:600,marginBottom:3}}>Focus</div><input value={fc} onChange={e=>sF(e.target.value)} placeholder="e.g. Articulation" style={{width:"100%",border:"1px solid rgba(128,128,128,.08)",borderRadius:6,padding:"5px 8px",fontSize:10,outline:"none",fontFamily:"inherit",background:"transparent",boxSizing:"border-box",color:"var(--color-text-primary,#333)"}}/></div>
<div style={{flex:1}}><div style={{fontSize:9,color:"#6B5B8B",fontWeight:600,marginBottom:3}}>Peak Exercise</div><input value={pk} onChange={e=>sP(e.target.value)} placeholder="e.g. Teaser" style={{width:"100%",border:"1px solid rgba(128,128,128,.08)",borderRadius:6,padding:"5px 8px",fontSize:10,outline:"none",fontFamily:"inherit",background:"transparent",boxSizing:"border-box",color:"var(--color-text-primary,#333)"}}/></div></div>
<div style={{display:"flex",gap:6}}><button onClick={oc} style={{flex:1,padding:8,border:"1px solid rgba(128,128,128,.08)",borderRadius:8,background:"transparent",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:"#666"}}>Cancel</button><button onClick={()=>{if(nm.trim()){os(nm.trim(),fc.trim(),pk.trim());oc()}}} style={{flex:1,padding:8,border:"none",borderRadius:8,background:"#5B748B",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Create</button></div>
</div></div>};

// ─── MAIN APP ───
export default function App(){
const[exs,sExs]=useState(IE);const[at,sAt]=useState(IT);const[seqs,sSeqs]=useState(IS);
const[qi,sQi]=useState([]);const[showVars,sSV]=useState(false);const[showAnalyze,sSA]=useState(false);
const[fs,sFs]=useState({});const[sr,sSr]=useState("");const[vm,sVm]=useState("grid");const[sort,sSort]=useState("abc");
const[mt,sMt]=useState(null);const[showEditor,sSE]=useState(null);const[showNS,sSNS]=useState(false);const[showSave,sShowSave]=useState(false);
const[sc,sSc]=useState(false);const[showQ,sShowQ]=useState(true);
const[tab,sTab]=useState("cards");const[sqSr,sSqSr]=useState("");
const[saved,sSaved]=useState([]);

const toggleF=useCallback((k,clr)=>sFs(p=>clr?{...p,[k]:0}:{...p,[k]:cyc(p[k]||0)}),[]);

const filtered=useMemo(()=>{
let r=exs;
if(sr){const l=sr.toLowerCase();r=r.filter(e=>e.n.toLowerCase().includes(l)||e.cu?.toLowerCase().includes(l)||Object.values(e.t).flat().some(t=>t.toLowerCase().includes(l)))}
const inc={},exc={};Object.entries(fs).forEach(([k,s])=>{if(s===0)return;const[t,tag]=k.split("::");if(s===1)(inc[t]=inc[t]||[]).push(tag);else(exc[t]=exc[t]||[]).push(tag)});
r=r.filter(ex=>{for(const[t,ts]of Object.entries(exc))if(ts.some(tg=>(ex.t[t]||[]).includes(tg)))return false;for(const[t,ts]of Object.entries(inc))if(!ts.some(tg=>(ex.t[t]||[]).includes(tg)))return false;return true});
if(sort==="abc")r.sort((a,b)=>a.n.localeCompare(b.n));
else if(sort==="recent")r.sort((a,b)=>b.id-a.id);
return r;
},[exs,fs,sr,sort]);

const filteredSeqs=useMemo(()=>{
let r=seqs;
if(sqSr){const l=sqSr.toLowerCase();r=r.filter(s=>s.nm.toLowerCase().includes(l)||(s.fc||"").toLowerCase().includes(l)||(s.pk||"").toLowerCase().includes(l)||(s.tags||[]).some(t=>t.toLowerCase().includes(l)))}
const inc={},exc={};Object.entries(fs).forEach(([k,s])=>{if(s===0)return;const[t,tag]=k.split("::");if(s===1)(inc[t]=inc[t]||[]).push(tag);else(exc[t]=exc[t]||[]).push(tag)});
if(Object.keys(inc).length>0||Object.keys(exc).length>0){
r=r.filter(sq=>{const allTags=sq.tags||[];for(const[,ts]of Object.entries(exc))if(ts.some(t=>allTags.includes(t)))return false;for(const[,ts]of Object.entries(inc))if(!ts.some(t=>allTags.includes(t)))return false;return true})}
if(sort==="abc")r=[...r].sort((a,b)=>a.nm.localeCompare(b.nm));
else if(sort==="recent")r=[...r].reverse();
else if(sort==="count-asc")r=[...r].sort((a,b)=>a.it.length-b.it.length);
else if(sort==="count-desc")r=[...r].sort((a,b)=>b.it.length-a.it.length);
return r;
},[seqs,sqSr,fs,sort]);

const filteredPlans=useMemo(()=>{
let r=saved;
const inc={},exc={};Object.entries(fs).forEach(([k,s])=>{if(s===0)return;const[t,tag]=k.split("::");if(s===1)(inc[t]=inc[t]||[]).push(tag);else(exc[t]=exc[t]||[]).push(tag)});
if(Object.keys(inc).length>0||Object.keys(exc).length>0){
r=r.filter(p=>{const pt=p.tags||[];for(const[,ts]of Object.entries(exc))if(ts.some(t=>pt.includes(t)))return false;for(const[,ts]of Object.entries(inc))if(!ts.some(t=>pt.includes(t)))return false;return true})}
return r;
},[saved,fs]);

const addEx=({n,t,no,cu})=>sExs(p=>[...p,{id:Math.max(...p.map(e=>e.id))+1,n,t,no,cu}]);
const upEx=u=>sExs(p=>p.map(e=>e.id===u.id?u:e));
const renTag=(tk,o,n)=>{sAt(p=>({...p,[tk]:p[tk].map(t=>t===o?n:t)}));sExs(p=>p.map(e=>({...e,t:{...e.t,[tk]:(e.t[tk]||[]).map(t=>t===o?n:t)}})))};
const delTag=(tk,tn)=>{sAt(p=>({...p,[tk]:p[tk].filter(t=>t!==tn)}));sExs(p=>p.map(e=>({...e,t:{...e.t,[tk]:(e.t[tk]||[]).filter(t=>t!==tn)}})));sFs(p=>{const n={...p};delete n[`${tk}::${tn}`];return n})};
const addTagG=(tk,tn)=>{if(!(at[tk]||[]).includes(tn))sAt(p=>({...p,[tk]:[...(p[tk]||[]),tn]}))};
const addCardQ=exId=>sQi(p=>[...p,{id:uid(),type:"card",exId}]);
const addSeqQ=seqId=>sQi(p=>[...p,{id:uid(),type:"seq",seqId}]);
const makeSeqFromGroup=grp=>{const ns={id:uid(),nm:grp.name,fc:"",pk:"",tags:[],note:"",it:grp.children.map(c=>({id:uid(),e:c.exId,v:[]}))};sSeqs(p=>[...p,ns]);sQi(p=>p.map(i=>i.id===grp.id?{id:uid(),type:"seq",seqId:ns.id}:i))};
const savePlan=(nm,tags)=>{sSaved(p=>[...p,{id:uid(),name:nm,tags,items:[...qi],date:new Date().toLocaleDateString()}]);sQi([])};

return(<div style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",fontFamily:"'DM Sans',sans-serif",background:"var(--color-background-tertiary,#FAFAF8)",color:"var(--color-text-primary,#333)"}}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Instrument+Serif&display=swap');@keyframes slideIn{from{transform:translateX(14px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(128,128,128,.08);border-radius:2px}input::placeholder,textarea::placeholder{color:#bbb}.eh:hover{opacity:.5!important}`}</style>

{/* TOP BAR */}
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",height:46,flexShrink:0,borderBottom:"1px solid rgba(128,128,128,.05)",background:"var(--color-background-primary,#fff)"}}>
<div style={{display:"flex",alignItems:"center",gap:2}}>
<Ic n="sparkle" s={17} c="#2D5A3D"/>
{[{k:"cards",l:"QUE Cards",c:"#2D5A3D",ic:"grid"},{k:"sequences",l:"Sequences",c:"#5B748B",ic:"seq"},{k:"studio",l:"Studio",c:"#8B7B5B",ic:"studio"}].map(({k,l,c,ic})=>(<button key={k} onClick={()=>sTab(k)} style={{border:"none",background:"none",cursor:"pointer",padding:"11px 10px",fontSize:11,fontFamily:"inherit",fontWeight:tab===k?600:400,color:tab===k?c:"#999",borderBottom:tab===k?`2px solid ${c}`:"2px solid transparent",marginBottom:-1,display:"flex",alignItems:"center",gap:4}}><Ic n={ic} s={12} c={tab===k?c:"#999"}/>{l}</button>))}
</div>
<div style={{display:"flex",gap:5,alignItems:"center"}}>
{qi.length>0&&<button onClick={()=>sShowSave(true)} style={{border:"1px solid rgba(45,90,61,.1)",background:"rgba(45,90,61,.03)",color:"#2D5A3D",borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}><Ic n="save" s={11} c="#2D5A3D"/>Save Plan</button>}
<button onClick={()=>sShowQ(!showQ)} style={{border:showQ?"1.5px solid #2D5A3D":"1px solid rgba(128,128,128,.1)",background:showQ?"rgba(45,90,61,.04)":"transparent",color:showQ?"#2D5A3D":"#777",borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}><Ic n="queue" s={12} c={showQ?"#2D5A3D":"#777"}/>Queue{qi.length>0&&<span style={{background:"#2D5A3D",color:"#fff",borderRadius:8,padding:"0px 5px",fontSize:9,fontWeight:700}}>{qi.length}</span>}</button>
{tab==="cards"&&<button onClick={()=>sSE({})} style={{border:"none",background:"#2D5A3D",color:"#fff",borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}><Ic n="plus" s={11} c="#fff"/>New Card</button>}
{tab==="sequences"&&<button onClick={()=>sSNS(true)} style={{border:"none",background:"#5B748B",color:"#fff",borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}><Ic n="plus" s={11} c="#fff"/>New Sequence</button>}
</div></div>

{/* BODY */}
<div style={{flex:1,display:"flex",overflow:"hidden"}}>
{/* LEFT SIDEBAR */}
<FP co={sc} ot={()=>sSc(!sc)} at={at} fs={fs} onF={toggleF} om={sMt} sr={sr} os={sSr} sort={sort} onSort={sSort}/>

{/* CENTER */}
<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

{tab==="cards"&&<>
<div style={{padding:"5px 16px",borderBottom:"1px solid rgba(128,128,128,.03)",background:"var(--color-background-primary,#fff)",fontSize:10,color:"#999",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<span>{filtered.length} QUE Cards</span>
<div style={{display:"flex",gap:2,padding:2,borderRadius:6,background:"rgba(128,128,128,.03)"}}>
{[["grid","grid"],["list","list"]].map(([m,i])=>(<button key={m} onClick={()=>sVm(m)} style={{padding:"3px 6px",border:"none",borderRadius:4,cursor:"pointer",display:"flex",background:vm===m?"var(--color-background-primary,#fff)":"transparent",boxShadow:vm===m?"0 1px 2px rgba(0,0,0,.03)":"none"}}><Ic n={i} s={11} c={vm===m?"#555":"#bbb"}/></button>))}
</div></div>
<div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
{filtered.length===0?<div style={{textAlign:"center",padding:"36px",color:"#aaa"}}><p style={{fontSize:12}}>No matches</p></div>
:<div style={{display:vm==="grid"?"grid":"flex",gridTemplateColumns:vm==="grid"?"repeat(auto-fill,minmax(195px,1fr))":undefined,flexDirection:vm==="list"?"column":undefined,gap:vm==="grid"?8:3}}>
{filtered.map((ex,i)=>(<div key={ex.id} style={{animation:`fadeIn .2s ease ${i*.015}s both`}}><QC ex={ex} vm={vm} onQ={addCardQ} onDetail={()=>sSE(ex)}/></div>))}
</div>}</div></>}

{tab==="sequences"&&<>
<div style={{padding:"5px 16px",borderBottom:"1px solid rgba(128,128,128,.03)",background:"var(--color-background-primary,#fff)",display:"flex",alignItems:"center",gap:8}}>
<div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:7,border:"1px solid rgba(128,128,128,.08)",background:"rgba(128,128,128,.015)",flex:1,maxWidth:280}}><Ic n="search" s={12} c="#aaa"/><input type="text" placeholder="Search name, focus, peak, tags..." value={sqSr} onChange={e=>sSqSr(e.target.value)} style={{border:"none",outline:"none",background:"transparent",fontSize:11,fontFamily:"inherit",width:"100%",color:"var(--color-text-primary,#333)"}}/>{sqSr&&<button onClick={()=>sSqSr("")} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex",color:"#bbb"}}><Ic n="x" s={10}/></button>}</div>
<span style={{fontSize:10,color:"#999"}}>{filteredSeqs.length} seq</span>
<div style={{marginLeft:"auto",display:"flex",gap:2,padding:2,borderRadius:6,background:"rgba(128,128,128,.03)"}}>
{[["grid","grid"],["list","list"]].map(([m,i])=>(<button key={m} onClick={()=>sVm(m)} style={{padding:"3px 6px",border:"none",borderRadius:4,cursor:"pointer",display:"flex",background:vm===m?"var(--color-background-primary,#fff)":"transparent",boxShadow:vm===m?"0 1px 2px rgba(0,0,0,.03)":"none"}}><Ic n={i} s={11} c={vm===m?"#555":"#bbb"}/></button>))}
</div>
</div>
<div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
{filteredSeqs.length===0&&<div style={{textAlign:"center",padding:"36px",color:"#aaa"}}><Ic n="seq" s={24} c="#ddd"/><p style={{fontSize:12,margin:"8px 0"}}>No sequences</p></div>}
{filteredSeqs.map(sq=><SC key={sq.id} sq={sq} exs={exs} onQ={addSeqQ} onUp={updated=>sSeqs(p=>p.map(s=>s.id===updated.id?updated:s))} onDel={id=>sSeqs(p=>p.filter(s=>s.id!==id))}/>)}
</div></>}

{tab==="studio"&&<>
<div style={{padding:"7px 16px",borderBottom:"1px solid rgba(128,128,128,.03)",background:"var(--color-background-primary,#fff)",fontSize:10,color:"#999"}}>{filteredPlans.length} saved plan{filteredPlans.length!==1?"s":""}</div>
<div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
{filteredPlans.length===0&&<div style={{textAlign:"center",padding:"36px",color:"#aaa"}}><Ic n="studio" s={24} c="#ddd"/><p style={{fontSize:12,margin:"8px 0"}}>No saved plans yet</p><p style={{fontSize:10,color:"#ccc"}}>Build a plan in The Queue and save it</p></div>}
{filteredPlans.map(p=><PlanCard key={p.id} plan={p} onLoad={plan=>{sQi(plan.items);sShowQ(true)}} onDel={id=>sSaved(p=>p.filter(x=>x.id!==id))}/>)}
</div></>}

</div>

{/* THE QUEUE */}
{showQ&&<TQ items={qi} setItems={sQi} exs={exs} seqs={seqs} showVars={showVars} setShowVars={sSV} onMakeSeq={makeSeqFromGroup} showAnalyze={showAnalyze} setShowAnalyze={sSA} onUpSeq={updated=>sSeqs(p=>p.map(s=>s.id===updated.id?updated:s))}/>}
</div>

{/* MODALS */}
{mt&&<TagMgr tk={mt} ti={TT[mt]} tags={at[mt]||[]} oc={()=>sMt(null)} onRen={(o,n)=>renTag(mt,o,n)} onDel={t=>delTag(mt,t)} onAdd={t=>addTagG(mt,t)}/>}
{showEditor!==null&&<FullEditor ex={showEditor?.id?showEditor:null} at={at} oc={()=>sSE(null)} os={d=>{if(showEditor?.id){upEx({...showEditor,...d})}else{addEx(d)}}}/>}
{showNS&&<NewSeqMod oc={()=>sSNS(false)} os={(nm,fc,pk)=>{sSeqs(p=>[...p,{id:uid(),nm,fc,pk,tags:[],note:"",it:[]}])}}/>}
{showSave&&<SaveModal oc={()=>sShowSave(false)} os={savePlan}/>}
</div>)}