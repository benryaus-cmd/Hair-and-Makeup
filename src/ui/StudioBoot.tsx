import { useEffect, useState } from 'react';
import { ArrowRight, RotateCcw, Scissors, Sparkles } from 'lucide-react';
import type { StartupState } from './startup-model';

type Props={state:StartupState;onSkip:()=>void;onRetry:()=>void;onLowQuality:()=>void};
export function StudioBoot({state,onSkip,onRetry,onLowQuality}:Props){
 const [shot,setShot]=useState(0);
 useEffect(()=>{
  if(state.phase!=='arrival'){setShot(0);return;}
  const middle=setTimeout(()=>setShot(1),2300);
  const final=setTimeout(()=>setShot(2),4700);
  return()=>{clearTimeout(middle);clearTimeout(final);};
 },[state.phase]);
 const chapters=['THE FIRST LOOK','FRONT ROW','MAKE YOUR ENTRANCE'];
 if(state.phase==='playing')return null;
 if(state.phase==='arrival')return <section className="studio-arrival" aria-label="Welcome to Hair and Makeup">
  <div className="arrival-top"><span>HAIR & MAKEUP</span><span>{chapters[shot]} · 0{shot+1}</span></div>
  <div className="arrival-copy"><span className="studio-eyebrow">COLLECTION 01 · YOUR SIGNATURE</span><h1>The first<br/><em>look.</em></h1><p>Own the runway. Make your mark.</p></div>
  <button type="button" className="arrival-skip" onClick={onSkip}>Let’s explore <ArrowRight size={17}/></button>
  <div className="arrival-track" aria-hidden="true"><i/></div>
 </section>;
 return <section className="studio-boot" aria-label={state.phase==='error'?'Studio could not open':'Loading Hair and Makeup'} aria-busy={state.phase==='loading'}>
  <div className="boot-orbit" aria-hidden="true"><i/><span><Scissors size={34} strokeWidth={1.2}/></span><b><Sparkles size={20}/></b></div>
  <span className="studio-eyebrow">YOUR COASTAL CREATIVE ESCAPE</span>
  <h1>Hair <em>&</em><br/>Makeup<span>THE STUDIO</span></h1>
  {state.phase==='error'?<div className="boot-error" role="alert"><h2>Let’s try that again</h2><p>{state.error}</p><div><button type="button" onClick={onRetry}><RotateCcw size={16}/>Retry studio</button><button type="button" onClick={onLowQuality}>Use lighter graphics</button></div><small>Your saved looks and collection stay on this device.</small></div>:<div className="boot-status" role="status" aria-live="polite"><div><Sparkles size={14}/><span>{state.label}</span></div><progress max={1} value={state.progress} aria-label="Studio loading progress"/><p>Preparing the world and its finishing touches</p></div>}
  <span className="boot-footer">A fresh look. A new little story.</span>
 </section>;
}
