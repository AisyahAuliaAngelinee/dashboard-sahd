'use client';
import {useRouter} from 'next/navigation';
import {List,History} from 'lucide-react';
import {usePreferences} from './preferences';
import {Button} from '@/components/animate-ui/components/buttons/button';

export function TableNavigation({onTable,disabled=false}:{onTable:()=>void;disabled?:boolean}){
 const router=useRouter();const {language}=usePreferences();
 return <div className="table-navigation"><Button type="button" variant="outline" disabled={disabled} onClick={onTable}><List size={16}/>{language==='id'?'Kembali ke Table':'Back to Table'}</Button><Button type="button" variant="ghost" disabled={disabled} onClick={()=>router.back()}><History size={16}/>{language==='id'?'Sebelumnya':'Previous Page'}</Button></div>;
}
