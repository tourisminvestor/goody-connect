import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Goody Connect 好遇・電子名片',description:'碰一碰，讓好事相遇。香港 Goody Living 電子名片。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-HK"><body>{children}</body></html>}
