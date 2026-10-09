'use client';
import {Children,cloneElement,isValidElement,type ReactNode,type ReactElement} from 'react';
import {enUS,id} from 'date-fns/locale';
import {usePreferences} from './preferences';
import {translateUiText,type UiLanguage} from '@/lib/ui-language';
const contentComponents=new Set(['ConsentDocument','AnnouncementContent','Avatar']);
/** Localizes application labels declaratively. Form values and stored document content are never rewritten. */
function localize(node:ReactNode,language:UiLanguage):ReactNode{
 if(typeof node==='string')return translateUiText(node,language);
 if(Array.isArray(node))return Children.map(node,child=>localize(child,language));
 if(!isValidElement(node))return node;
 const element=node as ReactElement<Record<string,unknown>>;
 const props=element.props,componentName=typeof element.type==='function'?element.type.name:'';
 if(props['data-no-translate']||contentComponents.has(componentName))return node;
 const next:Record<string,unknown>={};
 for(const key of ['title','placeholder','aria-label','label','description'])if(typeof props[key]==='string')next[key]=translateUiText(props[key] as string,language);
 if(Array.isArray(props.items))next.items=props.items.map(item=>typeof item==='object'&&item&&'label' in item?{...item,label:typeof item.label==='string'?translateUiText(item.label,language):item.label}:item);
 if(componentName==='Calendar')next.locale=language==='id'?id:enUS;
 if(isValidElement(props.render))next.render=localize(props.render,language);
 if(props.children!==undefined)next.children=localize(props.children as ReactNode,language);
 if(props.className&&String(props.className).includes('badge')&&typeof props.children==='string'&&['Medical Service','Fire Department'].includes(props.children))next['data-division']=props.children;
 return cloneElement(element,next);
}
export function LocalizedView({children}:{children:ReactNode}){const {language}=usePreferences();return <>{localize(children,language)}</>}
