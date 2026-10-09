import type {Profile} from './portal-data';
export type MemberSortKey='name'|'role'|'division'|'position'|'teams';
export const assignmentValue=(value?:string)=>!value||['Belum ditetapkan','Belum Ditentukan'].includes(value)?'':value;
export function sortMembers(members:Profile[],key:MemberSortKey,direction:'asc'|'desc'){
 const value=(member:Profile)=>key==='teams'?(member.teams||[]).slice().sort().join(', '):assignmentValue(member[key]);
 return [...members].sort((a,b)=>{const left=value(a),right=value(b);if(!left&&!right)return a.id.localeCompare(b.id);if(!left)return 1;if(!right)return -1;return (direction==='asc'?1:-1)*left.localeCompare(right,undefined,{sensitivity:'base'})||a.id.localeCompare(b.id)});
}
export function accountAccess(profile:Pick<Profile,'role'>){return profile.role==='Admin'?'Admin':'Member'}
