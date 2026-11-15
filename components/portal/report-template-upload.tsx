'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogTitle,DialogTrigger} from '@/components/ui/dialog';
import {LocalizedView} from './localized-view';

export function ReportTemplateUpload({onApply,disabled,hasFormat=true,hint}:{onApply:(template:string)=>void;disabled?:boolean;hasFormat?:boolean;hint:string}){
 const [open,setOpen]=useState(false),[file,setFile]=useState<File>(),[stage,setStage]=useState(0),[reading,setReading]=useState(false),[error,setError]=useState('');
 function changeOpen(value:boolean){if(reading)return;setOpen(value);if(!value){setFile(undefined);setStage(0);setError('')}}
 async function apply(){
  if(!file||disabled)return;
  if(!file.name.toLowerCase().endsWith('.txt')||file.size>64000){setError('Gunakan template .txt maksimal 64 KB.');return}
  setReading(true);setError('');
  try{
   const template=await file.text();
   if(!template.trim()||template.includes('\0'))throw new Error('Template harus berisi teks.');
   onApply(template);setOpen(false);setFile(undefined);setStage(0);
  }catch(e){setError(e instanceof Error?e.message:'Template tidak dapat dibaca.')}
  finally{setReading(false)}
 }
 return <LocalizedView><Dialog open={open} onOpenChange={changeOpen}>
  <DialogTrigger asChild><Button type="button" variant="outline" className="report-template-trigger" disabled={disabled}>Upload Template</Button></DialogTrigger>
  <DialogContent>
   <DialogTitle>{stage===0?'Upload Template':stage===1?'Ganti format preview?':'Konfirmasi terakhir'}</DialogTitle>
   <DialogDescription>{stage===0?'Pilih file .txt maksimal 64 KB.':stage===1?'Template akan mengganti format preview yang ada.':'Terapkan template ke draft report sekarang?'}</DialogDescription>
   {stage===0&&<label>File template<input type="file" accept=".txt,text/plain" disabled={reading} onChange={e=>{setFile(e.target.files?.[0]);setError('')}}/><small className="muted">{hint}</small></label>}
   {error&&<p role="alert">{error}</p>}
   <DialogFooter>
    <Button type="button" variant="outline" disabled={reading} onClick={()=>changeOpen(false)}>Cancel</Button>
    <Button type="button" disabled={!file||disabled||reading} onClick={()=>{if(hasFormat&&stage<2)setStage(stage+1);else void apply()}}>{reading?'Membaca template…':stage===2||!hasFormat?'Terapkan template':'Continue'}</Button>
   </DialogFooter>
  </DialogContent>
 </Dialog></LocalizedView>;
}
