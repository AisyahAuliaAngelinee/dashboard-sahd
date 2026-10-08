export type GeminiPart={text?:string;thought?:boolean;inlineData?:{mimeType:string;data:string}};
export async function geminiGenerate(model:string,prompt:string,generationConfig:Record<string,unknown>){
 const key=process.env.GEMINI_API_KEY;if(!key)throw new Error('Admin perlu mengisi GEMINI_API_KEY di server.');
 const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig}),signal:AbortSignal.timeout(50000)});
 if(!response.ok)throw new Error(response.status===429?'Kuota Gemini tercapai. Coba kembali nanti.':'Gemini gagal memproses permintaan. Periksa API key, akses model, dan konfigurasi akun.');
 const result=await response.json();const candidate=result.candidates?.[0];if(candidate?.finishReason&&candidate.finishReason!=='STOP')throw new Error('Gemini tidak menyelesaikan hasil. Ubah uraian kasus atau coba kembali.');
 const parts:GeminiPart[]=candidate?.content?.parts||[];if(!parts.length)throw new Error('Gemini tidak mengembalikan hasil.');return parts;
}
export function parseSuggestion(parts:GeminiPart[]){const text=parts.filter(p=>!p.thought).map(p=>p.text||'').join('');const data=JSON.parse(text);if(typeof data.title!=='string'||!data.title.trim()||data.title.length>200||typeof data.narrative!=='string'||!data.narrative.trim()||data.narrative.length>10000)throw new Error('Format rekomendasi Gemini tidak valid.');return {title:data.title.trim(),narrative:data.narrative.trim()};}
