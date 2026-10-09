import {LocalizedView} from '@/components/portal/localized-view';
import Announcements from '@/components/portal/announcements';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <LocalizedView>{<Announcements id={id}/>}</LocalizedView>}
