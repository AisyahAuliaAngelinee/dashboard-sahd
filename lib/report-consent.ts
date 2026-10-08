import type {MedicalDraft,ConsentLink} from './medical-report';
export function syncConsentLinks(draft:MedicalDraft,links:ConsentLink[]):MedicalDraft {
 const old=draft.consentLinks||[];
 const paths=old.map(l=>`/share/consent/${l.token}`);
 let preview=draft.preview.split('\n').filter(line=>line!=='PATIENT CONSENT'&&!paths.some(path=>line.includes(path))).join('\n').trimEnd();
 let html=draft.previewHtml;
 if(html){for(const path of paths){const escaped=path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');html=html.replace(new RegExp(`<p[^>]*>(?:(?!</p>)[\\s\\S])*${escaped}(?:(?!</p>)[\\s\\S])*</p>`,'g'),'')}html=html.replace(/<p[^>]*>PATIENT CONSENT<\/p>/g,'')}
 if(links.length){const text=['PATIENT CONSENT',...links.map(l=>`${l.name} : /share/consent/${l.token}`)].join('\n');preview+='\n'+text;if(html){const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');html+=text.split('\n').map(line=>`<p>${escape(line)}</p>`).join('')}}
 return {...draft,consentLinks:links,preview,previewHtml:html};
}

// Match complete names; ignore casing and repeated whitespace, never partial names.
export function matchingConsentLinks(patientName:string,rows:import('./consent-list').ConsentRow[]):ConsentLink[]{
 const normalize=(name:string)=>name.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
 const name=normalize(patientName);
 if(!name)return [];
 return rows.filter(row=>!row.deleted_at&&normalize(row.data.patientName)===name)
  .sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||'')||a.id.localeCompare(b.id))
  .map(row=>({id:row.id,token:row.share_token,name:row.data.patientName}));
}
