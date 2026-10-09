'use client';
import {LocalizedView} from '@/components/portal/localized-view';

import {useState} from 'react';
import {CalendarDays} from 'lucide-react';
import type {DateRange} from 'react-day-picker';
import {Calendar} from '@/components/ui/calendar';
import {Button} from '@/components/ui/button';
import {Popover,PopoverContent,PopoverTrigger,PopoverTitle} from '@/components/ui/popover';
const parse=(s:string)=>s?new Date(`${s}T12:00:00`):undefined;
const serialize=(d:Date|undefined)=>d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';
export default function ReportDateRange({from,to,onChange,label:accessibleLabel='Filter rentang tanggal report'}:{from:string;to:string;onChange:(from:string,to:string)=>void;label?:string}){
 const [open,setOpen]=useState(false);const range:DateRange|undefined=from?{from:parse(from),to:parse(to)}:undefined;
 const label=(d:Date)=>d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
 return <LocalizedView>{<Popover open={open} onOpenChange={setOpen}><PopoverTrigger render={<Button variant="outline" className="report-range-trigger" aria-label={accessibleLabel}/>}><CalendarDays size={15}/>{range?.from?`${label(range.from)}${range.to?' – '+label(range.to):' – Pilih akhir'}`:'Pilih rentang tanggal'}</PopoverTrigger><PopoverContent align="start" className="portal report-date-popover"><PopoverTitle className="sr-only">{accessibleLabel}</PopoverTitle><Calendar mode="range" defaultMonth={range?.from} selected={range} onSelect={value=>onChange(serialize(value?.from),serialize(value?.to))} numberOfMonths={2}/><div className="report-date-footer"><span>Tanggal berdasarkan WIB</span><Button variant="link" onClick={()=>onChange('','')}>Clear</Button><Button variant="outline" onClick={()=>setOpen(false)}>Selesai</Button></div></PopoverContent></Popover>}</LocalizedView>
}
