/** Display precedence only; authorization continues to use the full assignment. */
const rank=['Trainee','Medical Student','First Responder','Firefighter','General Practitioner','Doctor Resident','Doctor Attending','Lieutenant','Captain','Deputy','Chief','Advisor','Deputy Director','Director'];
export function highestPosition(value?:string){return (value||'').split(',').map(s=>s.trim()).filter(Boolean).reduce((best,next)=>rank.indexOf(next)>rank.indexOf(best)?next:best,'')}
