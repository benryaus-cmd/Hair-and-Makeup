import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, LockKeyhole, Sparkles, X } from 'lucide-react';
import { COLLECTOR_CARDS } from '@/game/card-collection';

type CardAlbumProps={collected:number[];onClose:()=>void};
export function CardAlbum({collected,onClose}:CardAlbumProps){
 const [unavailable,setUnavailable]=useState<number[]>([]);
 const [selected,setSelected]=useState<number|null>(null);
 const card=selected===null?null:COLLECTOR_CARDS[selected];
 const found=card?collected.includes(card.id):false;
 const unavailableArt=(id:number)=>setUnavailable(previous=>previous.includes(id)?previous:[...previous,id]);
 return <section className="studio-album" role="dialog" aria-modal="true" aria-labelledby="album-title">
  <header><div><span className="studio-eyebrow">THE COASTAL COLLECTION</span><h2 id="album-title">{card?card.title:'The style edit'}</h2><p>{card?`${card.rarity} · No. ${String(card.id+1).padStart(2,'0')}`:`${collected.length} of 8 stories discovered`}</p></div><button type="button" className="panel-close" onClick={onClose} aria-label="Close collector card album"><X size={20}/></button></header>
  {card?<div className="album-detail"><button type="button" className="album-back" onClick={()=>setSelected(null)}><ArrowLeft size={16}/>All discoveries</button>{found?<><div className="album-full-art">{unavailable.includes(card.id)?<div className="card-art-placeholder"><Sparkles size={40} strokeWidth={1}/><span>THE STYLE EDIT</span><strong>{card.title}</strong></div>:<img src={card.image} alt={`${card.title} collector card`} onError={()=>unavailableArt(card.id)}/>}</div><p>{card.story}</p><span className="album-saved"><BookOpen size={14}/>Saved in your collection</span></>:<div className="album-clue-card"><span className="album-clue-mark"><Sparkles size={40} strokeWidth={1}/></span><span className="studio-eyebrow">FOLLOW THE SPARKLE</span><h3>{card.location}</h3><p>{card.clue}</p><button type="button" onClick={onClose}>Let’s find it<ArrowRight size={17}/></button></div>}</div>:<>
   <div className="album-progress" role="progressbar" aria-label="Collection progress" aria-valuemin={0} aria-valuemax={8} aria-valuenow={collected.length}><i style={{width:`${collected.length/8*100}%`}}/></div><p className="album-instruction">Eight hidden stories. Tap a missing card for a clue.</p>
   <div className="studio-album-grid">{COLLECTOR_CARDS.map(item=>{const owned=collected.includes(item.id);return <button type="button" key={item.id} className={`album-tile ${owned?'is-collected':''}`} onClick={()=>setSelected(item.id)} aria-label={owned?`View ${item.title}`:`Find card ${item.id+1}, ${item.location}: show clue`}><div className="album-tile-art">{owned?(unavailable.includes(item.id)?<div className="card-art-placeholder"><Sparkles size={30} strokeWidth={1}/><span>{item.rarity}</span></div>:<img src={item.image} alt={item.title} loading="lazy" onError={()=>unavailableArt(item.id)}/>):<><span className="album-missing-number">{String(item.id+1).padStart(2,'0')}</span><LockKeyhole size={20} strokeWidth={1.4}/></>}<span className="album-tile-number">{String(item.id+1).padStart(2,'0')}</span></div><strong>{owned?item.title:'A story to discover'}</strong><span>{owned?item.rarity:item.location}<ArrowRight size={12}/></span></button>;})}</div>
  </>}
 </section>;
}
