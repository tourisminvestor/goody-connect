import {NextRequest,NextResponse} from 'next/server';
import {card,db,hash,latest,role,setting,vcard} from '@/lib/server';
import {defaultCard,eventLabels,youtubeId} from '@/lib/model';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function visitor(req:NextRequest){return hash(setting('VISITOR_SALT')+'|'+(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'local')+'|'+req.headers.get('user-agent'))}
async function event(req:NextRequest,kind:string){await db().prepare('INSERT INTO events (id,slug,kind,visitor,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),'charlotte',kind,await visitor(req),Date.now()).run()}
export async function GET(req:NextRequest){const path=req.nextUrl.pathname.replace('/api/','');
 if(path==='vcard'){const c=await card();await event(req,'vcard');return new NextResponse(vcard(c!),{headers:{'Content-Type':'text/vcard; charset=utf-8','Content-Disposition':'attachment; filename="charlotte.vcf"','Cache-Control':'no-store'}})}
 const who=await role();if(!who)return json({error:'請先登入'},401);
 if(path==='me'){const [c,n]=await Promise.all([card(),latest()]);return json({role:who,card:c,notice:n})}
 if(path==='notices'&&who==='publisher')return json({notices:(await db().prepare('SELECT * FROM notices ORDER BY created_at DESC LIMIT 30').all()).results});
 if(path==='stats'&&who==='owner'){
 const [all,uv,trend]=await Promise.all([db().prepare('SELECT kind,COUNT(*) count FROM events GROUP BY kind').all(),db().prepare("SELECT COUNT(DISTINCT visitor) count FROM events WHERE kind='pv'").first<{count:number}>(),db().prepare("SELECT date(created_at/1000,'unixepoch','+8 hours') day,COUNT(*) pv,COUNT(DISTINCT visitor) uv FROM events WHERE kind='pv' AND created_at>? GROUP BY day ORDER BY day").bind(Date.now()-8*86400000).all()]);
 return json({counts:all.results,uv:uv?.count||0,trend:trend.results,updatedAt:Date.now()})}
 return json({error:'找不到此頁'},404);
}
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==req.nextUrl.origin)return json({error:'請從本站提交'},403);
 const path=req.nextUrl.pathname.replace('/api/','');
 if(Number(req.headers.get('content-length'))>1200000)return json({error:'資料太大'},413);
 let body:Record<string,any>;try{const parsed=await req.json();if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw 0;body=parsed as Record<string,any>}catch{return json({error:'資料格式錯誤'},400)}
 if(path==='login'){
 const key=await visitor(req),now=Date.now();
 await db().prepare('INSERT INTO attempts (key,count,reset) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset<? THEN 1 ELSE count+1 END, reset=CASE WHEN reset<? THEN ? ELSE reset END').bind(key,now+600000,now,now,now+600000).run();
 const a=await db().prepare('SELECT count FROM attempts WHERE key=?').bind(key).first<{count:number}>();if((a?.count||0)>15)return json({error:'嘗試次數過多，請十分鐘後再試'},429);
 const who=body.role==='publisher'?'publisher':'owner',expected=setting(who==='owner'?'OWNER_PASSWORD':'PUBLISHER_PASSWORD');
 if(!expected||body.username!==(who==='owner'?'charlotte':'publisher')||typeof body.password!=='string'||await hash(body.password)!==await hash(expected))return json({error:'帳戶或密碼不正確'},401);
 const token=crypto.randomUUID()+crypto.randomUUID();await db().prepare('INSERT INTO sessions (token,role,expires) VALUES (?,?,?)').bind(await hash(token),who,now+86400000).run();
 const response=json({ok:true});response.cookies.set('goody_session',token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:86400});return response;
 }
 if(path==='event'){if(!Object.hasOwn(eventLabels,body.kind)||body.kind==='vcard')return json({error:'不支援此事件'},400);await event(req,body.kind);return json({ok:true})}
 const who=await role();if(!who)return json({error:'登入已逾時，請重新登入'},401);
 if(path==='logout'){const t=req.cookies.get('goody_session')?.value;if(t)await db().prepare('DELETE FROM sessions WHERE token=?').bind(await hash(t)).run();const r=json({ok:true});r.cookies.delete('goody_session');return r}
 if(path==='card'&&who==='owner'){
 const clean:Record<string,string>={};for(const k of Object.keys(defaultCard)){if(typeof body[k]!=='string')return json({error:'請填妥名片資料'},400);clean[k]=body[k].trim();if(clean[k].length>(['avatar','wechatQr'].includes(k)?700000:2000))return json({error:'內容超出長度限制'},400)}
 if(!clean.name||!clean.title||!clean.company||!/^\+?[\d\s()-]{6,24}$/.test(clean.phone)||!/^\d{6,16}$/.test(clean.whatsapp)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)||!youtubeId(clean.website))return json({error:'請檢查姓名、電話、電郵及 YouTube 連結'},400);
 for(const k of ['avatar','wechatQr'])if(!['/goody.webp','/wechat-demo.svg'].includes(clean[k])&&!/^data:image\/(png|jpeg|webp);base64,/.test(clean[k]))return json({error:'請使用上傳圖片'},400);
 await db().prepare('INSERT INTO cards (slug,data,updated_at) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind('charlotte',JSON.stringify(clean),Date.now()).run();return json({ok:true})}
 if(path==='notices'&&who==='publisher'){
 if(typeof body.title!=='string'||!body.title.trim()||body.title.length>100||typeof body.body!=='string'||!body.body.trim()||body.body.length>2000)return json({error:'請填寫公告標題及內容'},400);
 let url;try{url=new URL(body.url);if(url.protocol!=='https:')throw 0}catch{return json({error:'請輸入有效 HTTPS 連結'},400)}
 await db().prepare('INSERT INTO notices (id,title,body,url,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),body.title.trim(),body.body.trim(),url.href,Date.now()).run();return json({ok:true})}
 return json({error:'沒有此操作權限'},403);
}
