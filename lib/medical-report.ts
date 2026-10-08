export const patientFields=['Patient Name','Date of Birth','Contact Person','Age','Gender','Blood Type','Weight','Job / Occupation'];
export const sections=[
 {title:'ANAMNESIS',fields:['Anamnesis']},
 {title:'DEBRIEF',fields:['Physical Examination','Radiology Examination']},
 {title:'ANESTHESIA & MEDICATION',fields:['Type of Anesthesia','Anesthetic Medications','Supportive Medications','Anesthesia']},
 {title:'TREATMENT',fields:['Preoperative Preparation','Operative Procedure','Postoperative Management']},
 {title:'MONITORING',fields:['Before Surgery — BP','Before Surgery — HR','Before Surgery — RR','Before Surgery — Temperature','Before Surgery — SpO₂','Before Surgery — GCS','Preoperative Status','After Surgery — BP','After Surgery — HR','After Surgery — RR','After Surgery — Temperature','After Surgery — SpO₂','After Surgery — GCS','Postoperative Status']},
 {title:'FOLLOW UP CARE',fields:['Follow Up Care','Status']},
];
export type ConsentLink={id:string;token:string;name:string};
export type MedicalDraft={consentLinks?:ConsentLink[];caseText:string;caseHtml?:string;richFields?:Record<string,string>;previewHtml?:string;title?:string;paymentStatus?:'paid'|'unpaid';category:'minor'|'major';fields:Record<string,string>;times:Record<string,string>;preview:string;attachments?:{path:string;url?:string;name:string}[];radiology?:{path:string;url?:string;modality:string}};
export function timestamp(){return new Date().toLocaleString('en-GB',{timeZone:'Asia/Jakarta',hour12:false}).replace(',','')+' GMT+7'}
export function reportText(draft:MedicalDraft,author:string){
 const divider='='.repeat(90);const get=(key:string)=>draft.fields[key]||'';
 const lines=[`Report Created by : ${author}`,divider,...patientFields.map(f=>`${f} : ${get(f)}`),divider,'Medical Teams & Operation :',`Head Operation (Surgeon) : ${get('Head Operation (Surgeon)')}`,'Assistant Operation',...get('Assistant Operation').split('\n').filter(Boolean).map(v=>`- ${v}`),divider];
 const vitalLabels=[['BP','Blood Pressure (BP)','mmHg'],['HR','Heart Rate (HR)','x/menit'],['RR','Respiratory Rate (RR)','x/menit'],['Temperature','Temperature','°C'],['SpO₂','SpO₂','%'],['GCS','Glasgow Coma Scale (GCS)','']];
 for(const section of sections){lines.push(section.title,draft.times[section.title]||'', '');
 if(section.title==='MONITORING'){for(const phase of ['Before Surgery','After Surgery']){lines.push(phase);for(const [key,label,unit] of vitalLabels)lines.push(`${label} : ${get(`${phase} — ${key}`)}${unit?' '+unit:''}`);lines.push('',`${phase==='Before Surgery'?'Preoperative':'Postoperative'} Status: ${get(phase==='Before Surgery'?'Preoperative Status':'Postoperative Status')}`,'')}}
 else for(const field of section.fields){if(field==='Supportive Medications'&&!get(field))continue;const label=section.title==='DEBRIEF'?`DEBRIEF — ${field}`:field;lines.push(`${label} :`);if(field.includes('Medications'))lines.push(...get(field).split('\n').filter(Boolean).map(v=>`- ${v}`));else lines.push(get(field));lines.push('')}
 lines.push(divider)}if(draft.consentLinks?.length){lines.push('PATIENT CONSENT',...draft.consentLinks.map(c=>`${c.name} : /share/consent/${c.token}`),divider)}return lines.join('\n')
}
export function radiologySvg(modality:string,caseText:string){const safe=caseText.replace(/[<>&"']/g,'').slice(0,80);return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="680" viewBox="0 0 900 680"><rect width="900" height="680" fill="#101923"/><text x="36" y="50" fill="#fff" font-family="Arial" font-size="24">SAHD · ${modality} · ROLEPLAY ILLUSTRATION</text><ellipse cx="450" cy="320" rx="210" ry="220" fill="#374553" stroke="#a6b4bf" stroke-width="4"/><ellipse cx="365" cy="320" rx="65" ry="135" fill="#17232d"/><ellipse cx="535" cy="320" rx="65" ry="135" fill="#17232d"/><path d="M450 130V510M420 175H480M420 225H480M420 275H480M420 325H480M420 375H480M420 425H480" stroke="#cbd5df" stroke-width="14"/><text x="36" y="590" fill="#b6c5d2" font-family="Arial" font-size="17">Case: ${safe}</text><text x="36" y="628" fill="#f5c77b" font-family="Arial" font-size="16">Generic torso schematic · Not a scan or case-specific finding</text></svg>`}
