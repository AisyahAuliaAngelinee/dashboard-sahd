'use client';
import {useState} from 'react';
import {CalendarIcon,Check,ChevronsUpDown} from 'lucide-react';
import {Calendar} from '@/components/ui/calendar';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {Command,CommandInput,CommandList,CommandEmpty,CommandGroup,CommandItem} from '@/components/ui/command';
import {Input} from '@/components/ui/input';
import {usePortal} from './provider';
import type {MedicalDraft} from '@/lib/medical-report';

export function ReportSelect({label,value,onChange,items,placeholder='Pilih',id,className=''}:{label:string;value:string;onChange:(value:string)=>void;items:{value:string;label:string}[];placeholder?:string;id?:string;className?:string}){return <Select items={items} value={value||null} onValueChange={v=>onChange(v||'')}><SelectTrigger id={id} aria-label={label} className={`report-select-trigger ${className}`}><SelectValue placeholder={placeholder}/></SelectTrigger><SelectContent alignItemWithTrigger={false} align="start" className="report-select-popup"><SelectGroup>{items.map(item=><SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent></Select>}

export function ReportDatePicker({label,value,onChange,withTime=false,allowFuture=false}:{label:string;value:string;onChange:(value:string)=>void;withTime?:boolean;allowFuture?:boolean}){
 const [open,setOpen]=useState(false);
 const match=value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
 const date=match?new Date(Number(match[3]),Number(match[2])-1,Number(match[1])):undefined;
 const time=value.match(/\d{2}:\d{2}(?::\d{2})?/)?.[0]||'00:00:00';
 function changeDate(d:Date|undefined){if(!d)return;const day=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;onChange(withTime?`${day} ${time} GMT+7`:day);if(!withTime)setOpen(false)}
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger render={<Button variant="outline" className="report-date-trigger" data-empty={!value}/>} aria-label={label}><CalendarIcon size={16}/><span>{value||'Pilih tanggal'}</span></PopoverTrigger><PopoverContent className="report-calendar-popup w-auto p-0" align="start"><Calendar mode="single" selected={date} defaultMonth={date} onSelect={changeDate} captionLayout="dropdown" startMonth={new Date(1900,0)} endMonth={new Date((withTime||allowFuture)?2100:new Date().getFullYear(),11)} disabled={withTime||allowFuture?undefined:{after:new Date()}}/>{withTime&&<div className="report-time-picker"><label>Waktu (GMT+7)<Input aria-label={`Jam ${label}`} type="time" step={1} value={time} onInput={e=>{if(e.currentTarget.value){const day=value.split(' ')[0];onChange(`${day} ${e.currentTarget.value.length===5?e.currentTarget.value+':00':e.currentTarget.value} GMT+7`)}}}/></label><button type="button" className="report-secondary" onClick={()=>setOpen(false)}>Selesai</button></div>}</PopoverContent></Popover>
}
export function PatientField({name,draft,onChange}:{name:string;draft:MedicalDraft;onChange:(key:string,value:string)=>void}){
 const value=draft.fields[name]||'';
 if(name==='Date of Birth')return <ReportDatePicker label={name} value={value} onChange={v=>onChange(name,v)}/>;
 if(name==='Gender')return <ReportSelect label={name} value={value||'Men'} onChange={v=>onChange(name,v)} items={['Men','Woman'].map(value=>({value,label:value}))}/>;
 if(name==='Weight'){const match=value.match(/^([\d.]+)\s*(KG|Gram)?$/i);return <div className="report-weight"><input aria-label="Weight" type="number" min={0} step="any" value={match?.[1]||''} onChange={e=>onChange(name,e.target.value?`${e.target.value} ${match?.[2]||'KG'}`:'')}/><ReportSelect label="Weight unit" className="report-weight-unit" value={match?.[2]||'KG'} onChange={v=>onChange(name,`${match?.[1]||'0'} ${v}`)} items={['KG','Gram'].map(value=>({value,label:value}))}/></div>}
 return <input aria-label={name} type={name==='Age'?'number':'text'} min={name==='Age'?0:undefined} step={name==='Age'?1:undefined} value={value} onChange={e=>onChange(name,e.target.value)}/>;
}
export function MedicalTeamFields({draft,onChange}:{draft:MedicalDraft;onChange:(key:string,value:string)=>void}){
 const {members}=usePortal();const [open,setOpen]=useState(false);const head=draft.fields['Head Operation (Surgeon)']||'';const assistants=(draft.fields['Assistant Operation']||'').split('\n').filter(Boolean);
 return <><label>Head Operation (Surgeon)<ReportSelect label="Head Operation (Surgeon)" placeholder="Pilih member" value={head} onChange={v=>onChange('Head Operation (Surgeon)',v)} items={[...(!head||members.some(m=>m.name===head)?[]:[{value:head,label:head}]),...members.map(m=>({value:m.name,label:m.name}))]}/></label><div className="report-team-assistants"><span>Assistant Operation</span><Popover open={open} onOpenChange={setOpen}><PopoverTrigger className="report-assistant-trigger" aria-label="Pilih Assistant Operation"><span className="report-assistant-badges">{assistants.length?assistants.map(name=><span className="report-member-badge" key={name}>{name}</span>):<span className="muted">Pilih assistant…</span>}</span><ChevronsUpDown size={16}/></PopoverTrigger><PopoverContent className="report-member-popup" align="start"><Command><CommandInput placeholder="Search user…" aria-label="Cari assistant"/><CommandList><CommandEmpty>Member tidak ditemukan.</CommandEmpty><CommandGroup>{members.map(member=><CommandItem key={member.id} value={member.name+' '+member.id} onSelect={()=>onChange('Assistant Operation',assistants.includes(member.name)?assistants.filter(n=>n!==member.name).join('\n'):[...assistants,member.name].join('\n'))}><span className="report-member-check">{assistants.includes(member.name)&&<Check size={16}/>}</span><span>{member.name}</span></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover><small className="muted">Cari dan pilih beberapa member. Klik nama yang dipilih untuk membatalkan.</small></div></>;
}
export const narrativeFields=new Set(['Anesthetic Medications','Supportive Medications','Anamnesis','Physical Examination','Radiology Examination','Anesthesia','Preoperative Preparation','Operative Procedure','Postoperative Management','Preoperative Status','Postoperative Status','Follow Up Care','Status']);
