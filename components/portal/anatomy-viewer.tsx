'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,BookOpen} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {usePreferences} from './preferences';
import {LocalizedView} from './localized-view';
import AnatomyLearning,{anatomySubjects} from './anatomy-learning';

export default function AnatomyViewer(){
 const {language}=usePreferences();
 const [model,setModel]=useState<'male'|'female'>('male');
 const [tab,setTab]=useState<'explore'|'learn'>('explore');
 const [exploreFocus,setExploreFocus]=useState('');
 const [learnOpen,setLearnOpen]=useState(false),[subject,setSubject]=useState('digestive');
 const frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{
  const changed=(event:MessageEvent)=>{
   if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow)return;
   if(event.data?.type==='sahd-anatomy-model'&&(event.data.model==='male'||event.data.model==='female'))setModel(event.data.model);
   if(event.data?.type==='sahd-anatomy-tab'){
    if(event.data.tab==='learn')setLearnOpen(true);
   }
  };
  window.addEventListener('message',changed);
  return()=>window.removeEventListener('message',changed);
 },[]);
 function syncLanguage(){frame.current?.contentWindow?.postMessage({type:'sahd-anatomy-language',language},window.location.origin)}
 useEffect(syncLanguage,[language]);
 const url='/human-atlas/index.html?'+new URLSearchParams({portal:'1',model,focus:exploreFocus});
 return <LocalizedView>
  <main className="anatomy-full-workspace" data-view={tab}>
   {tab!=='explore'&&<div className="anatomy-full-header"><strong className="anatomy-learn-wordmark">Human Atlas</strong>
    <nav className="anatomy-section-tabs" aria-label="Anatomy workspace">
     <button type="button" onClick={()=>setTab('explore')}>Explore</button>
     <button type="button" aria-pressed={tab==='learn'} onClick={()=>setLearnOpen(true)}>Learn</button>
    </nav>
   </div>}
   <Dialog open={learnOpen} onOpenChange={setLearnOpen}>
      <DialogContent className="anatomy-learn-dialog" onCloseAutoFocus={event=>{if(tab==='explore'){event.preventDefault();frame.current?.focus()}}}>
       <p className="anatomy-dialog-brand"><BookOpen size={16}/> Human Atlas</p>
       <DialogTitle>Learn</DialogTitle>
       <DialogDescription>Choose a system to explore.</DialogDescription>
       <div className="anatomy-subject-list">
        {anatomySubjects.map(({value,label},index)=><button key={value} type="button" onClick={()=>{setSubject(value);setTab('learn');setLearnOpen(false)}}>
         <small>0{index+1}</small>
         <span><strong>{label}</strong><span className="anatomy-subject-sections"><span>General Overview</span><span>Deep Dive</span><span>How It Connects</span><span>Visualize</span><span>Gallery</span><span>Exam Cram</span><span>Study Tools</span></span></span>
         <span className="anatomy-subject-arrow"><ArrowUpRight size={18}/></span>
        </button>)}
       </div>
       <div className="anatomy-dialog-footer"><span>3 subjects</span><span><kbd>Esc</kbd> to close</span></div>
      </DialogContent>
   </Dialog>
   <div className="anatomy-full-stage" hidden={tab!=='explore'}>
    <iframe ref={frame} key={model} className="anatomy-viewer" src={url} title="Human Atlas 3D anatomy viewer" referrerPolicy="no-referrer" onLoad={syncLanguage}/>
   </div>
   {tab!=='explore'&&<div className="anatomy-full-reading"><AnatomyLearning key={tab+subject} model={model} onExplore={selection=>{setModel(selection.model);setExploreFocus(selection.focus);setTab('explore')}} initialSubject={subject} onChooseSubject={()=>setLearnOpen(true)}/></div>}
  </main>
 </LocalizedView>;
}
