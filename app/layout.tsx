import type { Metadata } from 'next';
import './globals.css';
import AppExperience from '@/components/runtime/app-experience';
export const metadata: Metadata = { title: 'Executive RP Medical Center — Care Beyond Duty', icons: { icon: '/sahd-logo.webp', apple: '/push-icon-192.png' }, description: 'Professional medical care for every story in Los Santos and Sandy Shores. Executive RP Medical Center.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {return <html lang="en"><body><AppExperience>{children}</AppExperience></body></html>}
