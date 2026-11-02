import { useState } from 'react';
import { BookOpen, Camera, ChevronDown, MapPin, PawPrint, Settings, Smile, Sparkles, Trophy, Users, X } from 'lucide-react';
import { followerTier } from '../game/social';

type HudProps = { points: number; earned: number; tokens: number; followers: number; cardCount: number; zoneName: string; nextGoal?:string; onLeaderboard: () => void; onAlbum: () => void; onSettings: () => void; onCamera:()=>void; onEmotes:()=>void; onPet:()=>void };
export function Hud({points,earned,tokens,followers,cardCount,zoneName,nextGoal,onLeaderboard,onAlbum,onSettings,onCamera,onEmotes,onPet}:HudProps){
 const [toolsOpen,setToolsOpen]=useState(false);
 const tier=followerTier(followers);
 return <header className="dream-hud studio-hud">
  <div className="hud-top"><div className="hud-location"><span className="hud-eyebrow">HAIR & MAKEUP</span><span className="hud-zone"><MapPin size={13}/>{zoneName}</span></div><div className="hud-wallet" aria-label={`${points} style points available`}><Sparkles size={16}/><strong>{points.toLocaleString()}</strong><span>STYLE<br/>POINTS</span></div></div>
  <div className="studio-toolbar"><button type="button" className="studio-collection" onClick={onAlbum} aria-label={`Open collection, ${cardCount} of 8 discovered`}><BookOpen size={18}/><span><strong>{cardCount}<small> / 8</small></strong><em>Collection</em></span></button><button type="button" className="studio-camera" onClick={onCamera} aria-label="Open camera and DreamFeed"><Camera size={18}/><span>Camera & feed</span></button><button type="button" className="studio-more" aria-label={toolsOpen?'Close studio tools':'Open studio tools'} aria-expanded={toolsOpen} aria-controls="studio-tools" onClick={()=>setToolsOpen(open=>!open)}>{toolsOpen?<X size={18}/>:<ChevronDown size={20}/>}</button></div>
  <div className="studio-goal"><span className="goal-dot"/><span><b>NEXT</b>{nextGoal||'Explore the coast and make it yours'}</span></div>
  {toolsOpen?<nav id="studio-tools" className="studio-tools" aria-label="Studio tools"><div className="studio-tools-stats"><span><Users size={13}/>{followers.toLocaleString()} followers</span><span>×{tier.multiplier.toFixed(2)} rewards</span></div><div className="studio-tools-grid"><button type="button" onClick={onEmotes}><Smile size={20}/><span>Emotes</span></button><button type="button" onClick={onPet}><PawPrint size={20}/><span>Mochi</span></button><button type="button" onClick={onLeaderboard}><Trophy size={20}/><span>Rankings</span></button><button type="button" onClick={onSettings}><Settings size={20}/><span>Settings</span></button></div><p>{earned.toLocaleString()} lifetime points · {tokens} gems this visit</p></nav>:null}
 </header>;
}
