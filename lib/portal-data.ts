export type Profile = { id:string; name:string; accountName?:string; role:string; division:string; position?:string; teams?:string[]; providers:string[]; avatar:string; notifications:boolean };
export type Appointment = { id:string; name:string; complaint:string; doctor:string; date:string; createdAt:string; status:string };
export type Surgery = { id:string; category:'minor'|'major'; performedAt:string; status:'completed'; final:boolean };
export type Notice = { id:string; title:string; body:string; type:'announcement'|'appointment'|'mention'; href:string; read:boolean; at:string };
export const demoProfile:Profile = {id:'demo-user',name:'Milleo Greenwood',role:'SAHD',division:'Medical Service',position:'General Practitioner',teams:['Human Resource'],providers:['Register'],avatar:'',notifications:true};
export const demoMembers:Profile[] = [demoProfile,{...demoProfile,id:'member-2',name:'Ivan B. Matter',role:'Specialist',providers:['Discord']},{...demoProfile,id:'member-3',name:'Clara Williams',role:'Pharmacist',providers:['Google']},{...demoProfile,id:'member-4',name:'James Walker',division:'Fire Department',role:'SAHD',position:'Firefighter',teams:['Internal Affairs'],providers:['Discord']},{...demoProfile,id:'member-5',name:'Avery Jordan',division:'',role:'Member',position:'',teams:[],providers:['Register']}];
export const demoAppointments:Appointment[] = [
 {id:'c-101',name:'Ryu Ji Kenedy',complaint:'Kontrol pascaoperasi tibia kiri',doctor:'Milleo Greenwood',date:'2026-10-08',createdAt:'2026-10-08T06:40:00Z',status:'Scheduled'},
 {id:'c-102',name:'Liam Anderson',complaint:'Konsultasi luka pada lengan',doctor:'Ivan B. Matter',date:'2026-10-09',createdAt:'2026-10-08T04:20:00Z',status:'Scheduled'},
 {id:'c-103',name:'Sophia Reed',complaint:'Evaluasi perawatan lanjutan',doctor:'Belum ditugaskan',date:'2026-10-10',createdAt:'2026-10-07T12:00:00Z',status:'Pending'},
 {id:'c-104',name:'Noah Bennett',complaint:'Konsultasi rutin',doctor:'Milleo Greenwood',date:'2026-10-06',createdAt:'2026-10-06T10:00:00Z',status:'Completed'},
 {id:'c-105',name:'Emily Stone',complaint:'Pemeriksaan cedera bahu',doctor:'Ivan B. Matter',date:'2026-10-12',createdAt:'2026-10-06T09:00:00Z',status:'Cancelled'},
 {id:'c-106',name:'Oliver Hayes',complaint:'Kontrol jahitan',doctor:'Milleo Greenwood',date:'2026-10-11',createdAt:'2026-10-05T10:00:00Z',status:'Scheduled'},
];
export const demoSurgeries:Surgery[] = Array.from({length:90},(_,i)=>({id:`p-${i}`,category:i%3===0?'major':'minor',performedAt:`2026-${i<22?'10':'09'}-${String(i<22?5+i%4:1+i%28).padStart(2,'0')}T${String(8+i%10).padStart(2,'0')}:00:00+07:00`,status:'completed',final:true}));
export const demoNotices:Notice[] = [
 {id:'n1',title:'Jadwal briefing tim medis',body:'Pengumuman terbaru untuk seluruh anggota SAHD.',type:'announcement',href:'/announcements/briefing',read:false,at:'8 Okt · 13.30 WIB'},
 {id:'n2',title:'Anda disebut dalam janji temu',body:'Ryu Ji Kenedy memilih Anda untuk kontrol pascaoperasi.',type:'mention',href:'/consultations/c-101',read:false,at:'8 Okt · 13.40 WIB'},
 {id:'n3',title:'Janji temu baru',body:'Liam Anderson mengajukan consultation.',type:'appointment',href:'/consultations/c-102',read:false,at:'8 Okt · 11.20 WIB'},
];
export const navigation = [
 {label:'Dashboard',href:'/dashboard',icon:'dashboard'}, {label:'Medical Service',href:'/reports/medical',icon:'report'}, {label:'Fire Department',href:'/reports/fire',icon:'fire'}, {label:'Patient Consent',href:'/patient-consents',icon:'consent'}, {label:'Case Assistant',href:'/case-assistant',icon:'assistant'}, {label:'Consultation',href:'/consultations',icon:'calendar'}, {label:'Announcement',href:'/announcements',icon:'announcement'}, {label:'Trash',href:'/trash',icon:'trash'},
];

export const reportGroups = [
 {label:'Medical Service',href:'/reports/medical',icon:'report',division:'Medical Service',children:[
  {label:'Psychiatrist Report',href:'/reports/medical/psychiatrist'},
  {label:'Surgery Report',href:'/reports/medical'},
  {label:'Forensics Report',href:'/reports/medical/forensics'},
  {label:'Pharmacy Report',href:'/reports/medical/pharmacy'},
  {label:'Visum',href:'/reports/medical/visum'},
 ]},
 {label:'Fire Department',href:'/reports/fire',icon:'fire',division:'Fire Department',children:[
  {label:'Big Fire Report',href:'/reports/fire/big-fire'},
 ]},
];
