import pairs from './ui-translations.json';
export type UiLanguage='id'|'en';
const english=new Map<string,string>(),indonesian=new Map<string,string>(),englishFolded=new Map<string,string>(),indonesianFolded=new Map<string,string>();
for(const [en,id] of pairs){english.set(en.trim(),en.trim());english.set(id.trim(),en.trim());indonesian.set(en.trim(),id.trim());indonesian.set(id.trim(),id.trim());for(const source of [en,id]){englishFolded.set(source.trim().toLowerCase(),en.trim());indonesianFolded.set(source.trim().toLowerCase(),id.trim())}}
export function translateUiText(text:string,language:UiLanguage):string{
 const key=text.trim(),dictionary=language==='id'?indonesian:english;
 const exact=dictionary.get(key)||(language==='id'?indonesianFolded:englishFolded).get(key.toLowerCase());if(exact!==undefined)return text.replace(key,exact);
 if(key.includes(': ')&&(dictionary.has(key.split(': ')[0])||(language==='id'?indonesianFolded:englishFolded).has(key.split(': ')[0].toLowerCase())))return text.split(': ').map(part=>translateUiText(part,language)).join(': ');
 if(key.endsWith(' formatting'))return `${translateUiText(key.slice(0,-11),language)} ${language==='id'?'pemformatan':'formatting'}`;
 if(/^(Before Surgery|After Surgery|Sebelum Operasi|Setelah Operasi) — /.test(key))return text.split(' — ').map(part=>translateUiText(part,language)).join(' — ');
 const uiPrefix=text.match(/^(Pilih|Select|Buka consultation|Open consultation|Lepas|Remove|Action|Aksi) (.+)$/);if(uiPrefix){const labels:Record<string,[string,string]>={Pilih:['Select','Pilih'],Select:['Select','Pilih'],'Buka consultation':['Open consultation','Buka konsultasi'],'Open consultation':['Open consultation','Buka konsultasi'],Lepas:['Remove','Lepas'],Remove:['Remove','Lepas'],Action:['Action','Aksi'],Aksi:['Action','Aksi']};return `${labels[uiPrefix[1]][language==='id'?1:0]} ${uiPrefix[2]}`}
 const date=text.match(/^(\d{1,2}) (Jan|Feb|Mar|Apr|May|Mei|Jun|Jul|Aug|Agu|Sep|Oct|Okt|Nov|Dec|Des) (\d{4})(.*)$/);if(date)return `${date[1]} ${translateUiText(date[2],language)} ${date[3]}${date[4]}`;
 const match=text.match(/^(.*?)([↑↓↕])$/);if(match){const translated=translateUiText(match[1],language);if(translated!==match[1])return translated+match[2]}
 // Counts and dates remain intact; only the application-owned label is localized.
 const count=text.match(/^(\d+)\s+(members|anggota|cases|kasus)(.*)$/);if(count)return `${count[1]} ${translateUiText(count[2],language)}${translateUiText(count[3],language)}`;
 const changes:textTemplate[]=[[/^(\d+) report dipindahkan ke Trash\.$/,'$1 reports moved to Trash.'],[/^(\d+) consultation dipindahkan ke Trash\.$/,'$1 consultations moved to Trash.'],[/^(\d+) new notifications?$/,'$1 notifikasi baru'],[/^(\d+) notifikasi baru$/,'$1 new notifications']];
 for(const [pattern,replacement] of changes){if(pattern.test(text)){if(language==='en'&&replacement.endsWith('notifikasi baru'))continue;if(language==='id'&&!replacement.endsWith('notifikasi baru'))continue;return text.replace(pattern,replacement)}}
 return text;
}
type textTemplate=[RegExp,string];
