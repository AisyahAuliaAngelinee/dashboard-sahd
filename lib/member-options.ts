export const divisions = ['Medical Service','Fire Department'] as const;
export const organizationRoles = ['SAHD'] as const;
export const memberTeams = ['Finance','Public Relation','Human Resource','Internal Affairs'] as const;
export const positions:Record<string,string[]> = {
 'Medical Service':['Deputy','Chief','Advisor','Deputy Director','Director','General Practitioner','Doctor Resident','Doctor Attending','Trainee','Medical Student'],
 'Fire Department':['Deputy','Chief','Advisor','Deputy Director','Director','Trainee','First Responder','Firefighter','Lieutenant','Captain'],
};
export function validAssignment(role:string,division:string|null,position:string|null,teams:string[]){
 return ['Admin','Member',...organizationRoles].includes(role)&&(!division||divisions.some(d=>d===division))&&(!position||position==='Trainee'||!!division&&position.split(', ').length<=10&&new Set(position.split(', ')).size===position.split(', ').length&&position.split(', ').every(p=>p!=='Trainee'&&positions[division]?.includes(p)))&&teams.length<=4&&new Set(teams).size===teams.length&&teams.every(t=>memberTeams.some(team=>team===t));
}
