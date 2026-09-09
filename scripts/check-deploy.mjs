import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync('wrangler.jsonc','utf8'));
const id=source.d1_databases?.find(x=>x.binding==='DB')?.database_id;
if(!id||id==='00000000-0000-4000-8000-000000000000')throw new Error('請先建立 Cloudflare D1，並在 wrangler.jsonc 填入真實 database_id。');
if(!fs.existsSync('dist/server/index.js'))throw new Error('請先執行 npm run build。');
const built=JSON.parse(fs.readFileSync('dist/server/wrangler.json','utf8'));
if(built.d1_databases?.find(x=>x.binding==='DB')?.database_id!==id)throw new Error('D1 設定已變動，請重新 npm run build。');
console.log('Cloudflare deployment configuration checked.');
