import type {Profile} from './portal-data';
import {accountAccess} from './member-directory';
import type {ConsultationRow} from './consultation';
export function permissions(profile:Profile){
 const access=accountAccess(profile),superadmin=access==='Superadmin',admin=access==='Admin';
 const trainee=!superadmin&&!admin&&(profile.position==='Trainee'||!['Medical Service','Fire Department'].includes(profile.division));
 return {superadmin,admin,trainee,medicalWrite:true,fireWrite:true,consentWrite:true,announcementWrite:true,consultationFull:true,trashAll:superadmin};
}
export function canApproveConsultation(profile:Profile,_row:ConsultationRow){return permissions(profile).consultationFull}
export function canDeleteConsultation(profile:Profile,row:ConsultationRow){return permissions(profile).consultationFull||row.created_by===profile.id}
