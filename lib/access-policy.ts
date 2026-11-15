import type {Profile} from './portal-data';
import {accountAccess} from './member-directory';
import type {ConsultationRow} from './consultation';
export function permissions(profile:Profile){
 const access=accountAccess(profile),superadmin=access==='Superadmin',admin=access==='Admin';
 const trainee=!superadmin&&!admin&&(profile.position==='Trainee'||!['Medical Service','Fire Department'].includes(profile.division));
 return {superadmin,admin,trainee,medicalWrite:profile.division==='Medical Service',fireWrite:profile.division==='Fire Department',consentWrite:true,announcementWrite:true,consultationFull:true,trashAll:superadmin};
}
export function canApproveConsultation(profile:Profile,row:ConsultationRow){const p=permissions(profile);if(p.superadmin||p.admin)return true;return !!(row.mentions?.users?.includes(profile.id)||row.mentions?.roles?.includes(profile.role)||row.mentions?.divisions?.includes(profile.division)||!!profile.position&&profile.position.split(',').some(p=>row.mentions?.positions?.includes(p.trim())))}
export function canDeleteConsultation(profile:Profile,row:ConsultationRow){return permissions(profile).consultationFull||row.created_by===profile.id}
