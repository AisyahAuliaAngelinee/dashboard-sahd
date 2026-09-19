'use client';
import { useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import uploadedPhotos from './gallery-photos.json';

const photos = [...uploadedPhotos, { src: '/executive-team.png', alt: 'The Executive Roleplay team gathered beneath the Vinewood sign in Los Santos' }];

export default function Gallery() {
 const dialog = useRef<HTMLDialogElement>(null);
 const trigger = useRef<HTMLButtonElement>(null);
 const titleId = useId();
 const [opened, setOpened] = useState(false);
 const [selected, setSelected] = useState(0);
 const photo = photos[selected];
 const move = (direction: number) => setSelected(current => (current + direction + photos.length) % photos.length);
 return <>
  <button ref={trigger} className="gallery-button" onClick={() => { setOpened(true); dialog.current?.showModal(); }}>Gallery</button>
  <dialog ref={dialog} className="gallery-dialog" aria-labelledby={titleId} onClose={() => { setOpened(false); trigger.current?.focus(); }} onKeyDown={event => {
   if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
  }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
   <div className="gallery-header"><div><div className="eyebrow">OUR PEOPLE. OUR STORIES.</div><h2 id={titleId}>Gallery</h2></div><button autoFocus className="gallery-close" aria-label="Close gallery" onClick={() => dialog.current?.close()}><X size={22}/></button></div>
   {opened && <>
    <figure>
     <div className="gallery-stage"><img key={photo.src} src={photo.src} alt={photo.alt}/></div>
     <figcaption className="gallery-caption"><div aria-live="polite"><strong>{photo.alt}</strong><span>Executive Roleplay · {selected + 1} / {photos.length}</span></div><div className="gallery-controls"><button aria-label="Previous photo" onClick={() => move(-1)}><ChevronLeft size={22}/></button><button aria-label="Next photo" onClick={() => move(1)}><ChevronRight size={22}/></button></div></figcaption>
    </figure>
    <div className="gallery-thumbnails" aria-label="Choose a photo">{photos.map((item, index) => <button key={item.src} aria-label={`View photo ${index + 1}: ${item.alt}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={item.src.startsWith('/gallery/') ? item.src.replace('.webp', '-thumb.webp') : item.src} alt="" loading="lazy" width={90} height={60}/></button>)}</div>
   </>}
  </dialog>
 </>;
}
