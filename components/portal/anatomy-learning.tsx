'use client';
import {Fragment,useEffect,useState} from 'react';
import {BookOpen,ChevronRight} from 'lucide-react';
import {AnatomyGallery,AnatomyVisualize,type AnatomySelection} from './anatomy-learn-media';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {ReportSelect} from './report-fields';
import {usePreferences} from './preferences';

export const anatomySubjects=[{value:'digestive',label:'Digestive System'},{value:'respiratory',label:'Respiratory System'},{value:'lymphoid',label:'Lymphoid System and Immunity'}];
const activities=['Quiz','Fill in the blank','Flashcards','Glossary'] as const;
type Quiz={id:string;stem:string;choices:{id:string;text:string}[];correctChoiceId:string;explanation:string};
type Fill={id:string;prompt:string;answer:string;acceptedAnswers:string[];hint:string;explanation:string};
type Subject={articles:{id:string;title:string;subtitle?:string;introMarkdown?:string;sections:{id:string;title:string;markdown:string}[]}[];quiz:Quiz[];fill:Fill[];flashcards:{front:string;back:string}[];glossary:{id:string;term:string;definition:string;aliases:string[]}[]};
const normalize=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').trim().replace(/\s+/g,' ');

function ReadingText({text}:{text?:string}){
 const inline=(value:string)=>value.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g).map((segment,index)=>segment.startsWith('**')?<strong key={index}>{segment.slice(2,-2)}</strong>:segment.startsWith('*')&&segment.endsWith('*')&&segment.length>2?<em key={index}>{segment.slice(1,-1)}</em>:segment);
 return <div className="anatomy-reading-text" data-no-translate>{text?.trim().split(/\n{2,}/).map((block,index)=>{
  const lines=block.split('\n');
  const list=lines.every(line=>/^\s*[-*]\s+/.test(line));
  const numbered=lines.every(line=>/^\s*\d+[.)]\s+/.test(line));
  if(list||numbered){const Tag=numbered?'ol':'ul';return <Tag key={index}>{lines.map((line,i)=><li key={i}>{inline(line.replace(/^\s*(?:[-*]|\d+[.)])\s+/,''))}</li>)}</Tag>}
  return <p key={index}>{inline(block.replace(/^#{1,6}\s+/gm,''))}</p>;
 })}</div>;
}
function StudyActivity({data,activity}:{data:Subject;activity:typeof activities[number]}){
 const {t}=usePreferences();
 const [index,setIndex]=useState(0),[choice,setChoice]=useState(''),[checked,setChecked]=useState(false),[revealed,setRevealed]=useState(false),[query,setQuery]=useState('');
 const entries=activity==='Quiz'?data.quiz:activity==='Fill in the blank'?data.fill:data.flashcards;
 const quiz=data.quiz[index],fill=data.fill[index],card=data.flashcards[index];
 const move=(next:number)=>{setIndex(next);setChoice('');setChecked(false);setRevealed(false)};
 if(activity==='Glossary'){
  const matches=data.glossary.filter(item=>[item.term,...item.aliases].some(value=>normalize(value).includes(normalize(query))));
  return <div className="anatomy-study-body">
   <input type="search" aria-label={t('Search glossary')} placeholder={t('Search glossary')} value={query} onChange={event=>setQuery(event.target.value)}/>
   <div className="anatomy-glossary"><dl>{matches.map(item=><div key={item.id}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>{!matches.length&&<p className="muted">{t('No matching terms.')}</p>}</div>
  </div>;
 }
 const correct=activity==='Quiz'?choice===quiz?.correctChoiceId:[fill?.answer,...(fill?.acceptedAnswers||[])].filter(Boolean).some(answer=>normalize(answer!)===normalize(choice));
 return <div className="anatomy-study-body">
  {activity==='Quiz'&&quiz&&<fieldset className="anatomy-quiz">
   <legend>{quiz.stem}</legend>
   {quiz.choices.map(option=><label key={option.id}><input type="radio" name="anatomy-choice" checked={choice===option.id} disabled={checked} onChange={()=>setChoice(option.id)}/><span>{option.text}</span></label>)}
  </fieldset>}
  {activity==='Fill in the blank'&&fill&&<>
   <p>{fill.prompt}</p><label>{t('Your answer')}<input value={choice} disabled={checked} onChange={event=>setChoice(event.target.value)}/></label>
   <details><summary>{t('Hint')}</summary><p>{fill.hint}</p></details>
  </>}
  {activity==='Flashcards'&&card&&<><p className="anatomy-card-front">{card.front}</p>{revealed&&<p>{card.back}</p>}<Button type="button" variant="outline" onClick={()=>setRevealed(value=>!value)}>{t(revealed?'Hide answer':'Show answer')}</Button></>}
  {activity!=='Flashcards'&&entries.length>0&&<>
   <Button type="button" disabled={!choice.trim()||checked} onClick={()=>setChecked(true)}>{t('Check answer')}</Button>
   {checked&&<div role="status" className="anatomy-study-feedback"><strong>{t(correct?'Correct':'Review the answer')}</strong><p>{activity==='Quiz'?quiz?.explanation:fill?.explanation}</p>{activity==='Fill in the blank'&&!correct&&<p>{fill?.answer}</p>}</div>}
  </>}
  {entries.length>0&&<div className="anatomy-study-pagination"><Button variant="outline" disabled={index===0} onClick={()=>move(index-1)}>{t('Previous')}</Button><span>{index+1} / {entries.length}</span><Button variant="outline" disabled={index===entries.length-1} onClick={()=>move(index+1)}>{t('Next')}</Button></div>}
 </div>;
}
const readingTabs=['General Overview','Deep Dive','How It Connects','Exam Cram'];
export default function AnatomyLearning({initialSubject,onChooseSubject,model,onExplore}:{initialSubject:string;onChooseSubject:()=>void;model:AnatomySelection['model'];onExplore:(selection:AnatomySelection)=>void}){
 const {t}=usePreferences();
 const subject=initialSubject;
 const [state,setState]=useState<{subject:string;data?:Subject;error?:boolean}>(),[articleId,setArticleId]=useState(''),[activity,setActivity]=useState<typeof activities[number]>('Quiz'),[retry,setRetry]=useState(0),[selectedSection,setSelectedSection]=useState('');
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/human-atlas/learn/'+subject+'.json',{signal:controller.signal}).then(response=>{if(!response.ok)throw Error();return response.json()}).then(data=>{if(!controller.signal.aborted)setState({subject,data})}).catch(()=>{if(!controller.signal.aborted)setState({subject,error:true})});
  return()=>controller.abort();
 },[subject,retry]);
 const data=state?.subject===subject?state.data:undefined;
 const article=data?.articles.find(item=>item.id===articleId)||data?.articles[0];
 const title=t(anatomySubjects.find(item=>item.value===subject)?.label||'Learn');
 const study=articleId==='study';
 const activeTab=['study','visualize','gallery'].includes(articleId)?articleId:article?.id;
 const studyTools=data&&<div className="anatomy-study-tools">
   <ReportSelect label={t('Activity')} value={activity} onChange={value=>setActivity(value as typeof activity)} items={activities.map(label=>({value:label,label:t(label)}))}/>
   <StudyActivity key={subject+activity} data={data} activity={activity}/>
 </div>;
 return <section className="anatomy-learning anatomy-learn-page">
  <div className="anatomy-learn-heading">
   <nav className="anatomy-learn-breadcrumb" aria-label={t('Breadcrumb')}>
    <button type="button" onClick={onChooseSubject}>{t('Learn')}</button><ChevronRight size={14} aria-hidden/><button className="anatomy-subject-switch" type="button" onClick={onChooseSubject}><BookOpen size={16}/>{t(({digestive:"Digestive",respiratory:"Respiratory",lymphoid:"Lymphoid"})[subject]||title)}<ChevronRight className="anatomy-subject-chevron" size={14}/></button>
   </nav>
   <h2>{title}</h2>
  </div>
  {data&&article?
   <Tabs className="anatomy-learn-tabs" value={activeTab} onValueChange={value=>{setArticleId(value);setSelectedSection('')}}>
    <TabsList aria-label={t('Reading')} className="anatomy-learn-tabbar">
     {data.articles.map((item,index)=><Fragment key={item.id}>
      {index===3&&<><TabsTrigger value="visualize">{t('Visualize')}</TabsTrigger><TabsTrigger value="gallery">{t('Gallery')}</TabsTrigger></>}
      <TabsTrigger value={item.id}>{t(readingTabs[index]||item.title)}</TabsTrigger>
     </Fragment>)}
     <TabsTrigger value="study">{t('Study Tools')}</TabsTrigger>
    </TabsList>
    <TabsContent value={activeTab} key={activeTab}>
     {study?<div className="anatomy-learn-study">{studyTools}</div>:activeTab==='visualize'?<AnatomyVisualize subject={subject} title={title} initialModel={model} onExplore={onExplore}/>:activeTab==='gallery'?<AnatomyGallery subject={subject} title={title}/>:<article className="anatomy-learn-article">
      <div className="anatomy-learn-intro"><h3>{t(readingTabs[data.articles.indexOf(article)]||article.title)}</h3><ReadingText text={article.introMarkdown}/></div>
      <div className="anatomy-learn-grid">
       <nav className="anatomy-learn-index" aria-label={t('On this page')}><span>{t('On this page')}</span>
        <ol>{article.sections.map((section,index)=><li key={section.id}><a href={'#learn-'+section.id} aria-current={(selectedSection?section.id===selectedSection:index===0)?'location':undefined} onClick={event=>{event.preventDefault();setSelectedSection(section.id);const heading=document.getElementById('learn-'+section.id);heading?.focus({preventScroll:true});heading?.scrollIntoView({block:'start'});}}>{section.title}</a></li>)}</ol>
       </nav>
       <div>{article.sections.map(section=><section key={section.id} className="anatomy-learn-section"><h4 id={'learn-'+section.id} tabIndex={-1}>{section.title}</h4><ReadingText text={section.markdown}/></section>)}</div>
      </div>
     </article>}
    </TabsContent>
   </Tabs>:state?.subject===subject&&state.error?<p role="alert">{t('Could not load learning content.')} <Button variant="outline" onClick={()=>{setState(undefined);setRetry(value=>value+1)}}>{t('Retry')}</Button></p>:<p role="status">{t('Loading…')}</p>}
  <p className="muted text-xs">{t('Source')}: <a href="https://github.com/PrejudiceNeutrino/human-atlas-enhanced" target="_blank" rel="noopener noreferrer">Human Atlas Enhanced</a></p>
 </section>;
}
