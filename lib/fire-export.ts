import {fireReportText,type FireDraft} from './fire-report';
export async function exportFireReport(draft:FireDraft,kind:'pdf'|'docx'){
 const text=fireReportText(draft);let blob:Blob;
 if(kind==='docx'){const {Document,Packer,Paragraph,TextRun}=await import('docx');blob=await Packer.toBlob(new Document({sections:[{children:text.split('\n').map((line,i)=>new Paragraph({children:[new TextRun({text:line,font:'Arial',size:i===0?26:22,bold:i===0})],spacing:{after:100}}))}]}))}
 else {const {jsPDF}=await import('jspdf');const doc=new jsPDF();doc.setFont('helvetica');doc.setFontSize(11);let y=20;for(const line of text.split('\n')){for(const wrapped of doc.splitTextToSize(line||' ',170)){if(y>275){doc.addPage();y=20}doc.text(wrapped,20,y);y+=6}}blob=doc.output('blob')}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`SAHD-Big-Fire-${draft.location.replace(/[^\p{L}\p{N}-]/gu,'-').slice(0,60)||'draft'}.${kind}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
