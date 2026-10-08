import Consultations from '@/components/portal/consultations';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Consultations detailId={id}/>}
