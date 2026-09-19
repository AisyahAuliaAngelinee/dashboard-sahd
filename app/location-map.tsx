'use client';
import {useState} from 'react';
import {Plus, Minus, MapPin, ExternalLink} from 'lucide-react';
const maps=[{src:'/los-santos-map.png',width:1450,height:1799,x:880,y:785,w:760,h:510,street:'San Andreas Avenue',city:'Los Santos'},{src:'/blaine-county-map.jpg',width:1920,height:1321,x:1240,y:828,w:580,h:390,street:'Alhambra Drive',city:'Sandy Shores'}];
export default function LocationMap({location}:{location:number}){
 const [zoom,setZoom]=useState(1);const m=maps[location];const w=m.w/zoom,h=m.h/zoom;
 return <div className="gta-map"><div className="gta-map-canvas"><svg role="img" aria-label={`GTA V street map around ${m.street}, ${m.city}`} viewBox={`${m.x-w/2} ${m.y-h/2} ${w} ${h}`} preserveAspectRatio="xMidYMid slice"><image href={m.src} width={m.width} height={m.height}/></svg><div className="map-address"><MapPin size={17}/><span>{m.street}<small>{m.city} · GTA V</small></span></div><div className="map-controls"><button aria-label="Zoom in map" disabled={zoom>=2} onClick={()=>setZoom(Math.min(2,zoom+.25))}><Plus size={17}/></button><button aria-label="Zoom out map" disabled={zoom<=.75} onClick={()=>setZoom(Math.max(.75,zoom-.25))}><Minus size={17}/></button></div><a className="map-expand" href={m.src} target="_blank" rel="noreferrer">Full map <ExternalLink size={12}/></a></div><div className="map-credit"><span>Street area · Exact entrance not marked</span><a href="https://www.gtabase.com/grand-theft-auto-v/map-locations/" target="_blank" rel="noreferrer">Map: GTA Base ↗</a></div></div>
}
