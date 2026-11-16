import {validReportTemplate} from './medical-report';

const documentLimit=4*1024*1024;
const textLimit=64000;
const wordNamespace='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
export const templateFileAccept='.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export function validateTemplateFile(file:Pick<File,'name'|'size'>){
 const extension=/\.([^.]+)$/.exec(file.name)?.[1].toLowerCase();
 if(!['pdf','docx','txt'].includes(extension||''))throw new Error('Gunakan file PDF, DOCX, atau TXT.');
 if(file.size<1||file.size>(extension==='txt'?textLimit:documentLimit))throw new Error('Maksimal 4 MB untuk PDF/DOCX dan 64 KB untuk TXT.');
 return extension;
}

async function readDocx(bytes:Uint8Array){
 const {unzipSync,strFromU8}=await import('fflate');
 const xml=unzipSync(bytes,{filter:file=>file.name==='word/document.xml'&&file.originalSize<=documentLimit})['word/document.xml'];
 if(!xml)throw new Error('Dokumen DOCX tidak valid atau terlalu besar.');
 const source=strFromU8(xml);
 if(/<!DOCTYPE/i.test(source))throw new Error('Dokumen DOCX tidak valid atau terlalu besar.');
 const document=new DOMParser().parseFromString(source,'application/xml');
 if(document.querySelector('parsererror')||document.documentElement.namespaceURI!==wordNamespace)throw new Error('Dokumen DOCX tidak valid atau terlalu besar.');
 return Array.from(document.getElementsByTagNameNS(wordNamespace,'p'),paragraph=>{
  const nodes=Array.from(paragraph.getElementsByTagNameNS(wordNamespace,'*'));
  return nodes.map(node=>node.localName==='t'?node.textContent:node.localName==='tab'?'\t':['br','cr'].includes(node.localName)?'\n':'').join('');
 }).join('\n');
}

async function readPdf(bytes:Uint8Array){
 const {getDocument,GlobalWorkerOptions}=await import('pdfjs-dist');
 GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString();
 const task=getDocument({data:bytes,enableXfa:false,useWasm:false});
 try{
  const pdf=await task.promise;
  if(pdf.numPages>50)throw new Error('Template PDF maksimal 50 halaman.');
  const pages:string[]=[];
  let length=0;
  for(let index=1;index<=pdf.numPages;index++){
   const page=await pdf.getPage(index);
   const {items}=await page.getTextContent();
   let line='',previousEnd:number|undefined;
   const lines:string[]=[];
   for(const item of items){
    if(!('str' in item))continue;
    const x=item.transform[4];
    const gap=previousEnd===undefined?0:x-previousEnd;
    if(line&&!/\s$/.test(line)&&!/^\s/.test(item.str)&&gap>Math.max(1,item.height*.18))line+=' ';
    line+=item.str;
    previousEnd=x+item.width;
    if(item.hasEOL){lines.push(line);line='';previousEnd=undefined;}
   }
   if(line)lines.push(line);
   const text=lines.join('\n');
   length+=text.length+2;
   if(length>textLimit)throw new Error('Teks template melebihi 64.000 karakter.');
   pages.push(text);
  }
  return pages.join('\n\n');
 }finally{await task.destroy();}
}

export async function readReportTemplate(file:File){
 const extension=validateTemplateFile(file);
 let text:string;
 if(extension==='txt')text=await file.text();
 else{
  const bytes=new Uint8Array(await file.arrayBuffer());
  text=extension==='docx'?await readDocx(bytes):await readPdf(bytes);
 }
 text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
 if(text.length>textLimit)throw new Error('Teks template melebihi 64.000 karakter.');
 if(!validReportTemplate(text))throw new Error('Template tidak berisi teks yang dapat dibaca. PDF hasil scan belum didukung.');
 return text;
}
