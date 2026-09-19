import { Syringe, Brain, Activity, Bone, Fingerprint } from 'lucide-react';
export const facilities = [
 {title:'Emergency Room',sub:'Responsive. Reliable. Always ready.',tag:'01 / EMERGENCY',image:'/facilities/emergency.jpg',imageAlt:'Emergency department with treatment stretchers and privacy curtains',text:'Our emergency room is the first point of care for urgent cases. The medical team provides triage, stabilization, and observation to determine the next steps for each character.'},
 {title:'Operating Room',sub:'Precision in every procedure.',tag:'02 / SURGERY',image:'/facilities/operating.jpg',imageAlt:'Operating theatre with surgical table and overhead surgical lights',text:'A dedicated surgical suite with a sterile environment and equipment for surgical procedures. Surgeons work alongside the anesthesia team to deliver coordinated surgical roleplay.'},
 {title:'Inpatient Room',sub:'A peaceful space to recover.',tag:'03 / RECOVERY',image:'/facilities/reception.jpg',imageAlt:'Hospital reception desk and patient registration lobby',text:'Comfortable inpatient rooms for recovery and observation. Our medical team conducts regular rounds and plans follow-up care before patients return to their daily activities.'},
 {title:'Mortuary',sub:'Care with dignity and respect.',tag:'04 / FORENSIC',image:'/facilities/mortuary.jpg',imageAlt:'Autopsy room with stainless steel examination table and surgical lighting',text:'A dedicated space for mortuary care, identification, and forensic examinations. Every procedure is handled professionally, with respect for each character and their roleplay story.'}
];
export const specialists = [
 {name:'Anesthesiology',en:'Anesthesia & pain management',icon:Syringe,desc:'Manages anesthesia, monitors patients during surgery, and provides pain management throughout their care.'},
 {name:'Psychiatry',en:'Mental health & wellbeing',icon:Brain,desc:'Supports character mental health through consultations, psychological assessments, and compassionate care planning.'},
 {name:'Neurosurgery',en:'Brain, spine & nervous system',icon:Activity,desc:'Treats head and spinal injuries and nervous system conditions requiring specialist assessment and surgical care.'},
 {name:'Traumatology',en:'Injury & trauma care',icon:Bone,desc:'Focuses on accident-related injuries and physical trauma, including fractures, severe wounds, and the recovery of movement.'},
 {name:'Forensic Medicine',en:'Medical investigation & identification',icon:Fingerprint,desc:'Performs medical examinations for identification, injury documentation, and cause-of-death analysis in roleplay investigations.'}
];
