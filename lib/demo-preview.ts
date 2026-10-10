import type {Profile} from './portal-data';
export const demoPreviews=[
 {id:'trainee',label:'Member · Trainee',accessRole:'Member',division:'Medical Service',position:'Trainee'},
 {id:'ms',label:'Member · Medical Service',accessRole:'Member',division:'Medical Service',position:'General Practitioner'},
 {id:'fd',label:'Member · Fire Department',accessRole:'Member',division:'Fire Department',position:'Firefighter'},
 {id:'admin-ms',label:'Admin · Medical Service',accessRole:'Admin',division:'Medical Service',position:'Doctor Resident'},
 {id:'admin-fd',label:'Admin · Fire Department',accessRole:'Admin',division:'Fire Department',position:'Captain'},
 {id:'superadmin',label:'Superadmin',accessRole:'Superadmin',division:'Medical Service',position:'Director'},
] as const;
export function demoPreviewProfile(profile:Profile,mode:'live'|'demo',id:string):Profile{const preset=demoPreviews.find(p=>p.id===id);return mode==='demo'&&preset?{...profile,accessRole:preset.accessRole,role:'SAHD',division:preset.division,position:preset.position}:profile}
