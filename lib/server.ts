import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {defaultCard,defaultNotice,Card,Notice} from './model';
export function db(){return (env as unknown as {DB:D1Database}).DB}
export function setting(key:string){return (env as unknown as Record<string,string>)[key]||''}
export async function hash(s:string){const v=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(v)].map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function card(slug='charlotte'):Promise<Card|null>{if(slug!=='charlotte')return null;const r=await db().prepare('SELECT data FROM cards WHERE slug=?').bind(slug).first<{data:string}>();return r?JSON.parse(r.data):defaultCard}
export async function latest():Promise<Notice>{return await db().prepare('SELECT * FROM notices ORDER BY created_at DESC LIMIT 1').first<Notice>()||defaultNotice}
export async function role(){const t=(await cookies()).get('goody_session')?.value;if(!t)return null;return (await db().prepare('SELECT role FROM sessions WHERE token=? AND expires>?').bind(await hash(t),Date.now()).first<{role:string}>())?.role||null}
export function vcard(c:Card){const esc=(x:string)=>x.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r/g,'');return ['BEGIN:VCARD','VERSION:3.0',`N:${esc(c.name)};;;;`,`FN:${esc(c.name)}`,`ORG:${esc(c.company)}`,`TITLE:${esc(c.title)}`,`TEL;TYPE=CELL:${esc(c.phone)}`,`EMAIL:${esc(c.email)}`,`NOTE:${esc(c.bio)}`,'END:VCARD',''].join('\r\n')}
