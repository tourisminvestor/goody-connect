export const ESG_URL='https://weq.houjiemeishi.com/H5/#/pagesA/store/store?shop_id=272&join_id=WQE741';
export const GROUP_URL='https://JJJ.houjiemeishi.com/H5/#/pagesC/fissionBuying/goodsDetailed?productId=1133&share_id=WQE775&teamfight_id=&fatherId=WQE775&join_id=WQE741';
export const defaultCard={name:'陳樂彤',englishName:'Charlotte Chan',title:'品牌合作總監',company:'好遇生活 Goody Living',bio:'讓每一次相遇，都有好事發生。\n專注品牌合作、社區共創與可持續生活，期待與你一起，把好點子變成好日常。',phone:'+852 6123 4567',whatsapp:'85261234567',email:'hello@goody.example',wechat:'GoodyLivingHK',wechatQr:'/wechat-demo.svg',avatar:'/goody.webp',location:'香港 · 觀塘',website:'https://www.youtube.com/watch?v=aqz-KE-bpKQ',videoTitle:'認識我們的好日常',videoDescription:'示範影片 · Big Buck Bunny 動畫短片',tags:'品牌合作,社區共創,可持續生活'};
export type Card=typeof defaultCard;
export type Notice={id:string;title:string;body:string;url:string;created_at:number};
export const defaultNotice:Notice={id:'welcome',title:'本週拼團任務火熱進行中',body:'好物一起分享，好事一起發生！本週拼團任務已開放，立即前往查看商品及參與詳情。',url:GROUP_URL,created_at:1788912000000};
export const eventLabels:Record<string,string>={pv:'名片瀏覽',vcard:'儲存聯絡人',whatsapp:'WhatsApp 聯絡',phone:'撥打電話',email:'發送電郵',copy:'複製資料',wechat:'微信二維碼',esg:'ESG 商城',youtube:'YouTube 外鏈',video_play:'影片播放',share:'分享名片'};
export function youtubeId(url:string){try{const u=new URL(url);if(!['youtube.com','www.youtube.com','youtu.be','m.youtube.com'].includes(u.hostname))return null;const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.split('/').pop();return id&&/^[\w-]{11}$/.test(id)?id:null}catch{return null}}
