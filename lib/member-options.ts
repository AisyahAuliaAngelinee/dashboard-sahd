export const divisions = ['Medical Service','Fire Department'] as const;
export const organizationRoles = ['SAHD','Deputy','Chief','Advisor','Deputy Director','Director','Medical Student'] as const;
export const memberTeams = ['Finance','Public Relation','Human Resource','Internal Affairs'] as const;
export const positions:Record<string,string[]> = {
 'Medical Service':['General Practitioner','Doctor Resident','Doctor Attending','Trainee','Medical Student'],
 'Fire Department':['Trainee','First Responder','Firefighter','Lieutenant','Captain'],
};
export function validAssignment(role:string,division:string|null,position:string|null,teams:string[]){
 return ['Admin','Member',...organizationRoles].includes(role)&&(!division||divisions.some(d=>d===division))&&(!position||position==='Trainee'||!!division&&positions[division]?.includes(position))&&teams.length<=4&&new Set(teams).size===teams.length&&teams.every(t=>memberTeams.some(team=>team===t));
}
