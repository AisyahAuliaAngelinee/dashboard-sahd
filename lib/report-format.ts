export type ReportRun={text:string;bold?:boolean;italic?:boolean;underline?:boolean;strike?:boolean};
// Only text and supported marks are exported; links, scripts, styles and embeds are ignored.
export function reportParagraphs(html:string):ReportRun[][]{
 const doc=new DOMParser().parseFromString(html,'text/html');const rows:ReportRun[][]=[];
 function walk(node:Node,marks:Omit<ReportRun,'text'>={}):ReportRun[]{if(node.nodeType===3)return [{text:node.textContent||'',...marks}];if(!(node instanceof Element)||['SCRIPT','STYLE','IFRAME'].includes(node.tagName))return [];if(node.tagName==='BR')return [{text:'\n',...marks}];const next={...marks,bold:marks.bold||['STRONG','B','H1','H2','H3'].includes(node.tagName),italic:marks.italic||['EM','I'].includes(node.tagName),underline:marks.underline||node.tagName==='U',strike:marks.strike||['S','DEL'].includes(node.tagName)};return Array.from(node.childNodes).flatMap(n=>walk(n,next))}
 function blocks(parent:Element){for(const el of Array.from(parent.children)){if(['UL','OL'].includes(el.tagName)){Array.from(el.children).forEach((li,i)=>{const prefix=el.tagName==='OL'?`${i+1}. `:'• ';rows.push([{text:prefix},...walk(li)])})}else if(el.tagName==='BLOCKQUOTE')blocks(el);else rows.push(walk(el))}}
 blocks(doc.body);return rows;
}
