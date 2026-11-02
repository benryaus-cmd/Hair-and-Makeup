import { ArrowUp, ChevronRight, LogOut, Shirt } from 'lucide-react';
import type { NearbySpot } from '@/game/types';

type ActionButtonsProps = { near: NearbySpot; riding: boolean; onJump: () => void; onInteract: () => void; onWardrobe: () => void };
export function ActionButtons({near,riding,onJump,onInteract,onWardrobe}:ActionButtonsProps){
 const highlighted=Boolean(near)||riding;
 return <div className="dream-actions studio-world-actions">
  {near?<button type="button" className="nearby-callout" onClick={onInteract}><span><span className="nearby-kicker">YOU’RE HERE</span><strong>{near.label}</strong><span className="nearby-hint">{near.hint}</span></span><ChevronRight size={20}/></button>:null}
  <div className="action-row"><button type="button" onClick={onWardrobe} className="world-action wardrobe-action" aria-label="Open wardrobe"><Shirt size={21}/><span>STYLE</span></button><button type="button" onClick={onJump} className="world-action jump-action" aria-label="Jump"><ArrowUp size={23}/><span>JUMP</span></button>{highlighted?<button type="button" onClick={onInteract} className="world-action interact-action interact-ready" aria-label={riding?'Hop out of vehicle':`Explore ${near?.label}`} >{riding?<LogOut size={23}/>:<ChevronRight size={25}/>}<span>{riding?'EXIT':'ENTER'}</span></button>:null}</div>
 </div>;
}
