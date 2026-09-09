import {card} from '@/lib/server';
import {notFound} from 'next/navigation';
import CardView from '@/components/card-view';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const data=await card(slug);if(!data)notFound();return <CardView card={data}/>}
