'use client';
import {Children,cloneElement,isValidElement,useState,type ReactElement,type ReactNode,type ComponentProps} from 'react';
import {Button} from '@/components/ui/button';
import {ReportSelect} from './report-fields';
import {usePreferences} from './preferences';
/** Pagination is applied after the caller's filtering/sorting; selection remains owned by the list. */
export function PaginatedTable({children,...props}:ComponentProps<'table'>){
 const {t}=usePreferences();const [size,setSize]=useState(5),[page,setPage]=useState(1);
 const sections=Children.toArray(children);const body=sections.find(n=>isValidElement(n)&&n.type==='tbody') as ReactElement<{children:ReactNode}>|undefined;
 const rows=Children.toArray(body?.props.children).filter(isValidElement);
 const isEmpty=rows.length===1&&Children.toArray((rows[0] as ReactElement<{children:ReactNode}>).props.children).some(cell=>isValidElement(cell)&&Number((cell.props as {colSpan?:number}).colSpan)>1);
 const total=isEmpty?0:rows.length,pages=Math.max(1,Math.ceil(total/size)),current=Math.min(page,pages);
 const key=rows.map(row=>row.key).join('|');const [lastKey,setLastKey]=useState(key);if(lastKey!==key){setLastKey(key);if(page!==1)setPage(1)}
 const visible=isEmpty?rows:rows.slice((current-1)*size,current*size);
 return <><table {...props}>{sections.map(section=>section===body?cloneElement(body!,{},visible):section)}</table><div className="table-pagination"><div className="pagination-size"><span>{t('Show rows')}</span><ReportSelect label="Rows per page" value={String(size)} items={[5,25,50,100].map(n=>({value:String(n),label:String(n)}))} onChange={v=>{setSize(Number(v));setPage(1)}}/></div><span className="muted">{total?`${(current-1)*size+1}–${Math.min(current*size,total)}`:'0'} / {total}</span><div className="pagination-nav"><Button variant="outline" size="sm" disabled={current<=1} onClick={()=>setPage(current-1)}>{t('Previous')}</Button><span>{current} / {pages}</span><Button variant="outline" size="sm" disabled={current>=pages} onClick={()=>setPage(current+1)}>{t('Next')}</Button></div></div></>;
}
