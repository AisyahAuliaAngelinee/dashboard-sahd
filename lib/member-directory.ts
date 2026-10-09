import type {Profile} from './portal-data';
export type MemberSortKey='name'|'role'|'division'|'position'|'teams';
export const assignmentValue=(value?:string)=>!value||['Belum ditetapkan','Belum Ditentukan'].includes(value)?'':value;
export function sortMembers(members:Profile[],key:MemberSortKey,direction:'asc'|'desc'){
 const value=(member:Profile)=>key==='teams'?(member.teams||[]).slice().sort().join(', '):assignmentValue(member[key]);
 return [...members].sort((a,b)=>{const left=value(a),right=value(b);if(!left&&!right)return a.id.localeCompare(b.id);if(!left)return 1;if(!right)return -1;return (direction==='asc'?1:-1)*left.localeCompare(right,undefined,{sensitivity:'base'})||a.id.localeCompare(b.id)});
}
export function accountAccess(profile:Pick<Profile,'role'|'accessRole'>){return profile.accessRole||(profile.role==='Admin'?'Admin':'Member')}

export function canManageMembers(profile:Pick<Profile,'role'|'accessRole'>){return ['Admin','Superadmin'].includes(accountAccess(profile))}

export function canEditMember(actor:Profile,target:Profile){return accountAccess(actor)==='Superadmin'||accountAccess(actor)==='Admin'&&actor.id!==target.id&&accountAccess(target)!=='Superadmin'}
export function canRemoveMember(actor:Profile,target:Profile,members:Profile[]){return canEditMember(actor,target)&&(accountAccess(target)!=='Superadmin'||members.some(m=>m.id!==target.id&&accountAccess(m)==='Superadmin'))}
