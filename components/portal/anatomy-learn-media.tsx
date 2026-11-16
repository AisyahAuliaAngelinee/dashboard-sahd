'use client';

import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Info,Layers3,Minus,Plus,RotateCcw,Search,Star,Tags,X} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {usePreferences} from './preferences';

export type AnatomySelection={model:'male'|'female';focus:string};

const systems:Record<string,{system:string;structures:string[]}>={
 digestive:{system:'digestive',structures:['Stomach','Liver','Gallbladder','Pancreas','Duodenum','Small intestine','Large intestine']},
 respiratory:{system:'respiratory',structures:['Trachea','Right lung','Left lung']},
 lymphoid:{system:'lymphatic',structures:['Spleen','Thymus']},
};

export function AnatomyVisualize({subject,title,initialModel,onExplore}:{subject:string;title:string;initialModel:AnatomySelection['model'];onExplore:(selection:AnatomySelection)=>void}){
 const {t,language}=usePreferences();
 const [model,setModel]=useState(initialModel),[structure,setStructure]=useState('');
 const [visibility,setVisibility]=useState(true),[context,setContext]=useState(false);
 const [inspector,setInspector]=useState<{open:boolean;name?:string;description:string;count:number;hidden:number;isolated:boolean}>();
 const [explode,setExplode]=useState(0);
 const frame=useRef<HTMLIFrameElement>(null);
 const {system,structures}=systems[subject];
 const focus=structure||system;
 const source='/human-atlas/index.html?'+new URLSearchParams({lesson:'1',model,focus,system,context:String(context)});
 function send(action:string,value?:number){
  frame.current?.contentWindow?.postMessage({type:'sahd-anatomy-lesson',action,value},window.location.origin);
 }
 useEffect(()=>{
  frame.current?.contentWindow?.postMessage({type:'sahd-anatomy-language',language},window.location.origin);
 },[language]);
 useEffect(()=>{
  function receive(event:MessageEvent){
   if(event.origin===location.origin&&event.source===frame.current?.contentWindow&&event.data?.type==='sahd-anatomy-inspector')setInspector(event.data);
  }
  window.addEventListener('message',receive);
  return ()=>window.removeEventListener('message',receive);
 },[]);
 function clearViewerStatus(){setInspector(undefined);setExplode(0);}
 function changeFocus(name:string){if(name!==structure){setStructure(name);clearViewerStatus();}}
 return <div className="anatomy-learn-media">
  <h3>{t('Visualize')}</h3>
  <p>{language==='id'?`Jelajahi ${title} dalam 3D. Putar, perbesar, dan pilih struktur anatomi.`:`Explore the ${title} in 3D. Rotate, zoom and select anatomical structures.`}</p>
  <div className="anatomy-lesson-viewer">
   <div className="anatomy-media-toolbar">
    <label>{t('Model')}<select value={model} onChange={event=>{clearViewerStatus();setModel(event.target.value==='female'?'female':'male')}}><option value="male">{t('Male reference')}</option><option value="female">{t('Female anatomy')}</option></select></label>
    <label>{t('Focus anatomy')}<select value={structure} onChange={event=>changeFocus(event.target.value)}><option value="">{t('Complete system')}</option>{structures.map(name=><option key={name} value={name}>{t(name)}</option>)}</select></label>
    <button type="button" aria-pressed={visibility} onClick={()=>setVisibility(!visibility)}><Layers3 size={17}/>{t('Visibility')} <small>{inspector?.hidden??0} {language==='id'?'tersembunyi':'hidden'}</small></button>
    <button type="button" aria-pressed={!!inspector?.open} onClick={()=>send('inspect')}><Info size={17}/>{t('Inspect')}</button>
    <button type="button" className="anatomy-media-link" onClick={()=>onExplore({model,focus})}>{t('Open in Explore')}<ArrowUpRight size={16}/></button>
   </div>
   <div className="anatomy-lesson-layout" data-visibility={visibility} data-inspect={!!inspector?.open}>
    {visibility&&<aside className="anatomy-lesson-visibility">
     <div><strong>{t('Visibility')}</strong><button type="button" aria-label={t('Close')} onClick={()=>setVisibility(false)}><X size={16}/></button></div>
     <label><input type="checkbox" checked={context} onChange={event=>{clearViewerStatus();setContext(event.target.checked)}}/>{t('Surrounding context')}</label>
     <p>{t('Structures')}</p>
     <button type="button" aria-pressed={!structure} onClick={()=>changeFocus('')}>{t('Complete system')}</button>
     {structures.map(name=><button key={name} type="button" aria-pressed={name===structure} onClick={()=>changeFocus(name)}>{t(name)}</button>)}
     <button type="button" disabled={!inspector?.hidden} onClick={()=>send('restore')}>{t('Restore all hidden')}</button>
    </aside>}
    <div className="anatomy-lesson-stage">
    <iframe ref={frame} src={source} title={`${title} 3D`} onLoad={()=>frame.current?.contentWindow?.postMessage({type:'sahd-anatomy-language',language},window.location.origin)}/>
    <div className="anatomy-lesson-explode">
     <label>{language==='id'?'Urai anatomi':t('Explode anatomy')} <output>{explode}%</output>
      <input type="range" min={0} max={30} value={explode} onChange={event=>{const value=Number(event.target.value);setExplode(value);send('explode',value/100)}}/>
     </label>
     <button type="button" onClick={()=>{setExplode(0);send('reset')}}><RotateCcw size={16}/>{t('Reset')}</button>
    </div>
    </div>
    {inspector?.open&&<aside className="anatomy-lesson-inspect anatomy-lesson-visibility" aria-label={t('Inspect')}>
     <div><strong>{t('Inspect')}</strong><button type="button" aria-label={t('Close')} onClick={()=>send('inspect')}><X size={16}/></button></div>
     <small>{inspector.isolated?t('Isolated anatomy'):t('Structures')}</small>
     <h4>{inspector.name}</h4>
     <p>{inspector.description}</p>
     <small>{inspector.count} {t('Selected pieces')}</small>
     <button type="button" disabled={!inspector.count} onClick={()=>send('hide')}>{t('Hide selected')}</button>
     <button type="button" disabled={!inspector.count} onClick={()=>{setExplode(0);send('isolate')}}>{t(inspector.isolated?'Show surrounding anatomy':'Isolate structure')}</button>
     <button type="button" onClick={()=>send('clear')}>{t('Clear selection')}</button>
    </aside>}
   </div>
  </div>
 </div>;
}

type Figure={id:string;title:string;category:string;description:string;tags:string[];image:string;thumbnail:string;alt:string;width:number;height:number;source:{deck?:string;slides?:number[]}};
type LabelRegion={x:number;y:number;width:number;height:number;fill:string};
type PracticeLabel={id:string;label:string;reviewStatus:string;regions:LabelRegion[]};
type PracticeFigure={figureId:string;reviewStatus:string;labels:PracticeLabel[]};
const categories={
 'anatomical-models':'Anatomical Models','anatomical-diagrams':'Anatomical Diagrams',
 histology:'Histology','physiology-diagrams':'Physiology Diagrams',
};

export function AnatomyGallery({subject,title}:{subject:string;title:string}){
 const {t,language}=usePreferences();
 const root=`/human-atlas/learn/gallery/${subject}/`;
 const [figures,setFigures]=useState<Figure[]>([]),[error,setError]=useState(false),[retry,setRetry]=useState(0);
 const [filter,setFilter]=useState('all'),[query,setQuery]=useState(''),[stars,setStars]=useState<string[]>([]);
 const [inspection,setInspection]=useState<{items:Figure[];index:number}|null>(null);
 const [practice,setPractice]=useState<PracticeFigure[]>([]);
 const opener=useRef<HTMLButtonElement>(null);
 const storageKey=`atlas-gallery-stars-${subject}`;
 useEffect(()=>{
  try{setStars(JSON.parse(localStorage.getItem(storageKey)||'[]'));}catch{setStars([]);}
 },[storageKey]);
 useEffect(()=>{
  const controller=new AbortController();
  fetch(root+'gallery.json',{signal:controller.signal}).then(response=>{
   if(!response.ok)throw Error();
   return response.json();
  }).then(data=>{if(!controller.signal.aborted)setFigures(data.items);}).catch(()=>{if(!controller.signal.aborted)setError(true);});
  return ()=>controller.abort();
 },[root,retry]);
 useEffect(()=>{
  if(subject!=='digestive')return;
  const controller=new AbortController();
  fetch(root+'label-practice.json',{signal:controller.signal}).then(response=>{
   if(!response.ok)throw Error();
   return response.json();
  }).then(data=>{if(!controller.signal.aborted)setPractice(data.figures);}).catch(()=>{});
  return ()=>controller.abort();
 },[root,subject]);
 function toggleStar(id:string){
  const next=stars.includes(id)?stars.filter(star=>star!==id):[...stars,id];
  setStars(next);
  try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{}
 }
 const matches=(figure:Figure,category:string)=>category==='all'||(category==='starred'?stars.includes(figure.id):figure.category===category);
 const shown=figures.filter(figure=>matches(figure,filter)&&[figure.title,figure.description,...figure.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 const filters=Object.entries({all:'All',...categories,starred:'Starred'});
 const category=(figure:Figure)=>t(categories[figure.category as keyof typeof categories]||figure.category);
 const figure=inspection?.items[inspection.index];
 return <div className="anatomy-learn-media">
  <h3>{language==='id'?`Galeri ${title}`:`${title} Gallery`}</h3>
  {error?<p role="alert">{t('Could not load the gallery.')} <button type="button" onClick={()=>{setError(false);setRetry(value=>value+1)}}>{t('Retry')}</button></p>:figures.length===0?<p role="status">{t('Loading…')}</p>:<>
   <p>{language==='id'?`${figures.length} model anatomi, ilustrasi, dan diagram fisiologi.`:`${figures.length} anatomical models, illustrations, and physiology diagrams.`}</p>
   <div className="anatomy-media-toolbar anatomy-gallery-toolbar">
    {filters.map(([id,label])=><button type="button" key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{id==='starred'&&<Star size={16}/>} {t(label)} <small>{figures.filter(figure=>matches(figure,id)).length}</small></button>)}
    <label className="anatomy-gallery-search"><Search size={17}/><input type="search" aria-label={t('Search figures')} placeholder={t('Search figures')+'…'} value={query} onChange={event=>setQuery(event.target.value)}/></label>
   </div>
   <div className="anatomy-gallery-grid">{shown.map(item=><article className="anatomy-figure-card" key={item.id}>
    <div className="anatomy-figure-thumb">
     {/* Static atlas thumbnails already ship optimized. */}
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={root+item.thumbnail} alt={item.alt} loading="lazy"/>
     <button type="button" aria-label={`${t('Star figure')} — ${item.title}`} aria-pressed={stars.includes(item.id)} onClick={()=>toggleStar(item.id)}><Star size={19} fill={stars.includes(item.id)?'currentColor':'none'}/></button>
    </div>
    <div className="anatomy-figure-copy"><small>{category(item)}</small><h4>{item.title}</h4><p>{item.description}</p>
     <button type="button" className="anatomy-media-link" onClick={event=>{opener.current=event.currentTarget;setInspection({items:shown,index:shown.indexOf(item)})}}>{t('Inspect figure')} <ArrowUpRight size={16}/></button>
    </div>
   </article>)}</div>
   {shown.length===0&&<p role="status">{t('No matching figures.')}</p>}
  </>}
  {figure&&inspection&&<FigureDialog figure={figure} labels={practice.find(item=>item.figureId===figure.id&&item.reviewStatus==='verified')?.labels.filter(label=>label.reviewStatus==='verified')||[]} root={root} category={category(figure)}
   index={inspection.index} total={inspection.items.length} starred={stars.includes(figure.id)}
   navigate={direction=>setInspection(current=>current&&({...current,index:Math.max(0,Math.min(current.items.length-1,current.index+direction))}))}
   onStar={()=>toggleStar(figure.id)} close={()=>setInspection(null)} opener={opener}/>}
 </div>;
}

function FigureDialog({figure,root,category,index,total,starred,labels,navigate,onStar,close,opener}:{
 figure:Figure;root:string;category:string;index:number;total:number;starred:boolean;labels:PracticeLabel[];navigate:(direction:number)=>void;
 onStar:()=>void;close:()=>void;opener:React.RefObject<HTMLButtonElement|null>;
}){
 const {t}=usePreferences();
 const [zoom,setZoom]=useState(1),[details,setDetails]=useState(true),[actual,setActual]=useState(false);
 const [practice,setPractice]=useState(false),[revealed,setRevealed]=useState<string[]>([]);
 const stage=useRef<HTMLDivElement>(null);
 const drag=useRef<{x:number;y:number;left:number;top:number}|null>(null);
 function fit(){setActual(false);setZoom(1);stage.current?.scrollTo(0,0)}
 function scale(delta:number){setZoom(value=>Math.max(1,Math.min(4,value+delta)))}
 function move(direction:number){
  if(index+direction<0||index+direction>=total)return;
  fit();setPractice(false);setRevealed([]);navigate(direction);
 }
 return <Dialog open onOpenChange={open=>{if(!open)close()}}>
  <DialogContent className="anatomy-figure-dialog" showCloseButton={false} onCloseAutoFocus={event=>{event.preventDefault();opener.current?.focus()}}
   onKeyDown={event=>{
    if(event.key==='ArrowLeft')move(-1);
    if(event.key==='ArrowRight')move(1);
    if(event.key==='+'||event.key==='=')scale(.25);
    if(event.key==='-')scale(-.25);
    if(event.key==='0')fit();
   }}>
   <DialogTitle className="sr-only">{figure.title}</DialogTitle>
   <DialogDescription className="sr-only">{figure.description}</DialogDescription>
   <div className="anatomy-figure-toolbar">
    <div><button type="button" aria-label={t('Previous figure')} disabled={index===0} onClick={()=>move(-1)}><ArrowLeft size={17}/></button><span>{index+1} / {total}</span><button type="button" aria-label={t('Next figure')} disabled={index===total-1} onClick={()=>move(1)}><ArrowRight size={17}/></button></div>
    <div><button type="button" aria-label={t('Zoom out')} disabled={zoom===1} onClick={()=>scale(-.25)}><Minus size={17}/></button><span>{Math.round(zoom*100)}%</span><button type="button" aria-label={t('Zoom in')} disabled={zoom===4} onClick={()=>scale(.25)}><Plus size={17}/></button><button type="button" onClick={fit}><RotateCcw size={16}/>{t('Fit')}</button><button type="button" aria-pressed={actual} onClick={()=>{setActual(!actual);setZoom(1)}}>1:1</button></div>
    <div>{labels.length>0&&<button type="button" aria-pressed={practice} onClick={()=>{setPractice(!practice);setRevealed([])}}><Tags size={17}/>{t('Label Practice')}</button>}<button type="button" aria-label={t('Star figure')} aria-pressed={starred} onClick={onStar}><Star size={18} fill={starred?'currentColor':'none'}/></button><button type="button" aria-pressed={details} onClick={()=>setDetails(!details)}><Info size={17}/>{t('Details')}</button><button type="button" aria-label={t('Close')} onClick={close}><X size={19}/></button></div>
   </div>
   <div ref={stage} className="anatomy-figure-stage" data-actual={actual} data-zoomed={zoom>1} onDoubleClick={()=>zoom>1||actual?fit():scale(1)}
    onPointerDown={event=>{
     if(event.pointerType==='touch'||event.button!==0||(!actual&&zoom===1))return;
     const target=event.currentTarget;
     drag.current={x:event.clientX,y:event.clientY,left:target.scrollLeft,top:target.scrollTop};
     target.setPointerCapture(event.pointerId);
    }}
    onPointerMove={event=>{const start=drag.current;if(start)event.currentTarget.scrollTo(start.left+start.x-event.clientX,start.top+start.y-event.clientY)}}
    onLostPointerCapture={()=>{drag.current=null}}>
    <div className="anatomy-figure-canvas" style={{minWidth:`${zoom*100}%`,minHeight:`${zoom*100}%`}}>
     <div className="anatomy-figure-image" style={{
      width:actual?`${figure.width*zoom}px`:`min(${zoom*98}cqw,${zoom*96*figure.width/figure.height}cqh)`,
      aspectRatio:`${figure.width} / ${figure.height}`,
     }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={root+figure.image} alt={practice?t('Identify the covered labels'):figure.alt} draggable={false}/>
      {practice&&labels.filter(label=>!revealed.includes(label.id)).flatMap(label=>label.regions.map((region,i)=><button
       key={label.id+i} type="button" aria-label={t('Reveal answer')} className="anatomy-label-cover"
       style={{left:`${region.x*100}%`,top:`${region.y*100}%`,width:`${region.width*100}%`,height:`${region.height*100}%`,background:region.fill}}
       onPointerDown={event=>event.stopPropagation()} onClick={()=>setRevealed(current=>[...current,label.id])}
      />))}
     </div>
    </div>
    {practice&&<span className="sr-only" role="status">{labels.find(label=>label.id===revealed.at(-1))?.label}</span>}
   </div>
   {details&&<div className="anatomy-figure-details"><small>{category}</small><strong>{figure.title}</strong><p>{figure.description}</p>{figure.source.deck&&<p>{t('Source')} · {figure.source.deck}{figure.source.slides?.length?` — ${t('Slide')} ${figure.source.slides.join(', ')}`:''}</p>}</div>}
  </DialogContent>
 </Dialog>;
}
