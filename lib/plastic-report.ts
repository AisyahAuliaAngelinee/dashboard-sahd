import {validFireAttachments,type FireAttachment} from './fire-attachments';
export type PlasticDraft={name:string;dob:string;phone:string;sex:string;bloodType:string;job:string;bp:string;hr:string;rr:string;temperature:string;spo2:string;gcs:string;condition:string;reasons:string;note:string;author:string;paymentStatus?:'paid'|'unpaid';attachments?:FireAttachment[]};
export const plasticFields=[['name','Name'],['dob','Date of Birth'],['phone','Phone Number'],['sex','Sex'],['bloodType','Blood Type'],['job','Jobs'],['bp','Blood Pressure (mmHg)'],['hr','Heart Rate (bpm)'],['rr','Respiratory Rate (x/min)'],['temperature','Temperature (°C)'],['spo2','SpO₂ (%)'],['gcs','GCS'],['condition','Condition & Allergy Confirmation'],['reasons','Reasons'],['note','Note'],['author','Best Regards']] as const;
export function freshPlasticDraft(author=''):PlasticDraft{return {name:'',dob:'',phone:'',sex:'Female',bloodType:'',job:'',bp:'',hr:'',rr:'',temperature:'',spo2:'',gcs:'',condition:'',reasons:'',note:'3 Days insurance',author,paymentStatus:'unpaid',attachments:[]}}
export function validPlasticDraft(d:unknown):d is PlasticDraft{if(!d||typeof d!=='object')return false;const v=d as PlasticDraft;return plasticFields.every(([k])=>typeof v[k]==='string'&&v[k].length<=10000)&&!!v.name.trim()&&v.name.length<=100&&!!v.condition.trim()&&!!v.reasons.trim()&&!!v.author.trim()&&(!v.dob||/^\d{2}\/\d{2}\/\d{4}$/.test(v.dob))&&['Female','Male'].includes(v.sex)&&(v.paymentStatus===undefined||['paid','unpaid'].includes(v.paymentStatus))&&(v.attachments===undefined||validFireAttachments(v.attachments))}
export function plasticText(d:PlasticDraft){const divider='---------------------------------------------------------------------------------------------------------------------';return `Patient Data
Name : ${d.name}
Date of Birth (DOB) : ${d.dob}
Phone Number : ${d.phone}
Sex : ${d.sex}
BloodType : ${d.bloodType}
Jobs : ${d.job}
${divider}

Vital Sign Condition
Blood Pressure : ${d.bp} mmHg
Heart Rate : ${d.hr} bpm
Respiratory Rate : ${d.rr} x/min
Temperature : ${d.temperature} °C
SPO2 : ${d.spo2}%
GCS : ${d.gcs}
${divider}

${d.condition}
${divider}

Reasons
${d.reasons}
${divider}

note : ${d.note}

Best regards,
${d.author}`}
