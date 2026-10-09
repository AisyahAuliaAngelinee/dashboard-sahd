'use client';
import {createContext,useContext,useEffect,useState} from 'react';
type Language='id'|'en';
import {translateUiText} from '@/lib/ui-language';
type Preferences={language:Language;theme:'light'|'dark';toggleLanguage:()=>void;toggleTheme:()=>void;t:(text:string)=>string};
const Context=createContext<Preferences|null>(null);
export function PreferencesProvider({children}:{children:React.ReactNode}){
 const [language,setLanguage]=useState<Language>('en'),[theme,setTheme]=useState<'light'|'dark'>('light'),[ready,setReady]=useState(false);
 useEffect(()=>{try{setLanguage(localStorage.getItem('sahd-language')==='id'?'id':'en');setTheme(localStorage.getItem('sahd-theme')==='dark'?'dark':'light')}catch{}setReady(true)},[]);
 useEffect(()=>{if(!ready)return;document.documentElement.dataset.sahdTheme=theme;document.documentElement.lang=language;try{localStorage.setItem('sahd-theme',theme);localStorage.setItem('sahd-language',language)}catch{}},[theme,language,ready]);
 useEffect(()=>()=>{delete document.documentElement.dataset.sahdTheme},[]);
 return <Context.Provider value={{language,theme,toggleLanguage:()=>setLanguage(l=>l==='en'?'id':'en'),toggleTheme:()=>setTheme(value=>value==='light'?'dark':'light'),t:text=>translateUiText(text,language)}}>{children}</Context.Provider>;
}
export function usePreferences(){const value=useContext(Context);if(!value)throw new Error('Missing preferences provider');return value}
export function PageTitle({children}:{children:string}){const {t}=usePreferences();return <>{t(children)}</>}

export function useOptionalPreferences(){return useContext(Context)}
