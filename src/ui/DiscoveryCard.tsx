import { useState } from 'react';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { COLLECTOR_CARDS, collectorReward, collectionMilestone } from '@/game/card-collection';

type Props={id:number;collectedCount?:number;onClose:()=>void;onAlbum:()=>void};
export function DiscoveryCard({id,collectedCount=1,onClose,onAlbum}:Props){
 const card=COLLECTOR_CARDS[id];
 const [artUnavailable,setArtUnavailable]=useState(false);
 if(!card)return null;
 return <section className="discovery-screen studio-discovery" role="dialog" aria-modal="true" aria-labelledby="discovery-title">
  <div className="discovery-heading"><span className="studio-eyebrow">THE COASTAL COLLECTION</span><h1 id="discovery-title">A beautiful little find.</h1></div>
  <div className="discovery-card is-revealed"><span className="discovery-rarity"><Sparkles size={12}/>{card.rarity}<b>No. {String(id+1).padStart(2,'0')}</b></span><div className="discovery-art">{artUnavailable?<div className="card-art-placeholder"><Sparkles size={40} strokeWidth={1}/><span>THE STYLE EDIT</span><strong>{card.title}</strong></div>:<img src={card.image} alt={card.title} onError={()=>setArtUnavailable(true)}/>}</div><div className="discovery-description"><h2>{card.title}</h2><p>{card.story}</p><span>{card.location}</span></div></div>
  <p className="discovery-reward"><Sparkles size={14}/><strong>+{collectorReward(id)} style points</strong> · {collectedCount}/8 collected</p>
  {collectionMilestone(collectedCount)>0?<p className="discovery-milestone" role="status">{collectedCount===8?"The complete collection!":"Halfway to the full edit!"} +{collectionMilestone(collectedCount)} bonus points</p>:null}
  <div className="discovery-actions"><button type="button" onClick={onClose}>Keep exploring<ArrowRight size={17}/></button><button type="button" onClick={onAlbum}><BookOpen size={16}/>View collection</button></div>
 </section>;
}
