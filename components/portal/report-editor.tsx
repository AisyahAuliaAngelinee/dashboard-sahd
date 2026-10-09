'use client';
import {LocalizedView} from '@/components/portal/localized-view';

import {useEffect} from 'react';
import {useEditor,EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {Bold,Italic,Underline,List,ListOrdered,Heading2,Quote,Undo,Redo,Strikethrough} from 'lucide-react';
export function textHtml(text:string){return text.split('\n').map(line=>`<p>${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`).join('')}
export default function ReportEditor({label,value,html,onChange}:{label:string;value:string;html?:string;onChange:(text:string,html:string)=>void}){
 const editor=useEditor({extensions:[StarterKit.configure({link:false})],immediatelyRender:false,content:html||textHtml(value),editorProps:{attributes:{role:'textbox','aria-label':label,'aria-multiline':'true'}},onUpdate:({editor})=>onChange(editor.getText({blockSeparator:'\n'}),editor.getHTML())});
 useEffect(()=>{if(editor&&editor.getText({blockSeparator:'\n'})!==value)editor.commands.setContent(html||textHtml(value),{emitUpdate:false})},[editor,value,html]);
 const items=[['Bold',Bold,()=>editor?.chain().focus().toggleBold().run(),'bold'],['Italic',Italic,()=>editor?.chain().focus().toggleItalic().run(),'italic'],['Underline',Underline,()=>editor?.chain().focus().toggleUnderline().run(),'underline'],['Strikethrough',Strikethrough,()=>editor?.chain().focus().toggleStrike().run(),'strike'],['Bullet list',List,()=>editor?.chain().focus().toggleBulletList().run(),'bulletList'],['Numbered list',ListOrdered,()=>editor?.chain().focus().toggleOrderedList().run(),'orderedList'],['Heading',Heading2,()=>editor?.chain().focus().toggleHeading({level:2}).run(),'heading'],['Quote',Quote,()=>editor?.chain().focus().toggleBlockquote().run(),'blockquote'],['Undo',Undo,()=>editor?.chain().focus().undo().run(),''],['Redo',Redo,()=>editor?.chain().focus().redo().run(),'']] as const;
 return <LocalizedView>{<div className="report-rich-editor"><div className="report-editor-toolbar" role="toolbar" aria-label={`${label} formatting`}>{items.map(([name,Icon,action,active])=><button key={name} type="button" aria-label={`${label}: ${name}`} title={name} aria-pressed={active?editor?.isActive(active):undefined} onClick={action}><Icon size={15}/></button>)}</div><EditorContent editor={editor}/></div>}</LocalizedView>
}
