import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'ReThread — Make the tear the detail',description:'Reimagine worn clothes with generative image AI and turn your repair into a measured, printable stitch guide.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>;}
