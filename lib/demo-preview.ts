import {divisions,positions} from './member-options';
import type {Profile} from './portal-data';
export const demoPreviews=[
 {id:'trainee',label:'Member · Trainee',accessRole:'Member',division:'Medical Service',position:'Trainee'},
 {id:'ms',label:'Member · Medical Service',accessRole:'Member',division:'Medical Service',position:'General Practitioner'},
 {id:'fd',label:'Member · Fire Department',accessRole:'Member',division:'Fire Department',position:'Firefighter'},
 {id:'admin-ms',label:'Admin · Medical Service',accessRole:'Admin',division:'Medical Service',position:'Doctor Resident'},
 {id:'admin-fd',label:'Admin · Fire Department',accessRole:'Admin',division:'Fire Department',position:'Captain'},
 {id:'superadmin',label:'Superadmin',accessRole:'Superadmin',division:'Medical Service',position:'Director'},
] as const;
export function validDemoPreview(id:string){return demoPreviews.some(p=>p.id===id)||!!readCustom(id)}
function readCustom(id:string):Pick<Profile,'role'|'accessRole'|'division'|'position'>|null{try{if(!id.startsWith('custom:'))return null;const value=JSON.parse(id.slice(7));if(!['Member','Admin','Superadmin'].includes(value.accessRole)||value.role!=='SAHD'||!divisions.includes(value.division)||!(positions[value.division]||[]).includes(value.position))return null;return {accessRole:value.accessRole,role:'SAHD',division:value.division,position:value.position}}catch{return null}}
export function customDemoPreview(profile:Profile){const id='custom:'+JSON.stringify({accessRole:profile.accessRole||'Member',role:'SAHD',division:profile.division,position:profile.position});return readCustom(id)?id:''}
export function demoPreviewProfile(profile:Profile,mode:'live'|'demo',id:string):Profile{if(mode!=='demo')return profile;const custom=readCustom(id);if(custom)return {...profile,...custom};const preset=demoPreviews.find(p=>p.id===id);return preset?{...profile,accessRole:preset.accessRole,role:'SAHD',division:preset.division,position:preset.position}:profile}
