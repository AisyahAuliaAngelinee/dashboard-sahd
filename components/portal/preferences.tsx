'use client';
import {createContext,useContext,useEffect,useState} from 'react';
type Language='id'|'en';
const translations:Record<string,string>={
 'Account Settings':'Pengaturan Akun','General':'Umum','Members':'Anggota','General Information':'Informasi Umum','Role & Division':'Role & Divisi','Position':'Jabatan','Team':'Team','Display Name':'Nama Tampilan','Change Profile Photo':'Ubah Foto Profil','Notification Preferences':'Preferensi Notifikasi','Save Changes':'Simpan Perubahan','Workspace Members':'Anggota Workspace','Division':'Divisi','Search Members':'Cari Anggota','Unassigned':'Belum Ditentukan','Your Workspace Profile':'Profil Workspace Anda','Manage your profile, preferences, and member directory.':'Kelola profil, preferensi, dan direktori anggota.','Your profile is visible to your team.':'Profil yang ditampilkan kepada tim Anda.','Assignments are managed by an admin.':'Role, divisi, jabatan, dan team ditetapkan oleh admin.','Show popups for new notifications. Your inbox remains available.':'Tampilkan popup notifikasi baru. Inbox tetap tersedia.','All registered workspace accounts.':'Seluruh akun yang terdaftar di workspace.','No matching members.':'Tidak ada anggota yang sesuai.','Account Method':'Metode Akun','You':'Anda',
 'Dashboard':'Dashboard','Patient Consent':'Persetujuan Pasien','Case Assistant':'Asisten Kasus','Consultation':'Konsultasi','Announcement':'Pengumuman','Trash':'Sampah','Reports':'Laporan','Workspace':'Workspace','Surgery Report':'Laporan Operasi','Psychiatrist Report':'Laporan Psikiatri','Forensics Report':'Laporan Forensik','Pharmacy Report':'Laporan Farmasi','Big Fire Report':'Laporan Kebakaran Besar','Logout':'Keluar','Search anything…':'Cari sesuatu…','Notification':'Notifikasi','Mark all as read':'Tandai Semua Dibaca','All':'Semua','Mentioned':'Mention','Appointments':'Janji Temu','No Notifications':'Belum Ada Notifikasi','View Details':'Lihat Detail','Create Patient Consent':'Buat Persetujuan Pasien','Create Surgery Report':'Buat Laporan Operasi','Create Consultation':'Buat Konsultasi','Create Announcement':'Buat Pengumuman','Admin Panel':'Panel Admin',
};
type Preferences={language:Language;theme:'light'|'dark';toggleLanguage:()=>void;toggleTheme:()=>void;t:(text:string)=>string};
const Context=createContext<Preferences|null>(null);
export function PreferencesProvider({children}:{children:React.ReactNode}){
 const [language,setLanguage]=useState<Language>('en'),[theme,setTheme]=useState<'light'|'dark'>('light'),[ready,setReady]=useState(false);
 useEffect(()=>{try{setLanguage(localStorage.getItem('sahd-language')==='id'?'id':'en');setTheme(localStorage.getItem('sahd-theme')==='dark'?'dark':'light')}catch{}setReady(true)},[]);
 useEffect(()=>{if(!ready)return;document.documentElement.dataset.sahdTheme=theme;document.documentElement.lang=language;try{localStorage.setItem('sahd-theme',theme);localStorage.setItem('sahd-language',language)}catch{}},[theme,language,ready]);
 useEffect(()=>()=>{delete document.documentElement.dataset.sahdTheme},[]);
 return <Context.Provider value={{language,theme,toggleLanguage:()=>setLanguage(l=>l==='en'?'id':'en'),toggleTheme:()=>setTheme(value=>value==='light'?'dark':'light'),t:text=>language==='id'?translations[text]||text:text}}>{children}</Context.Provider>;
}
export function usePreferences(){const value=useContext(Context);if(!value)throw new Error('Missing preferences provider');return value}
export function PageTitle({children}:{children:string}){const {t}=usePreferences();return <>{t(children)}</>}
