/** Only engine readiness can leave loading; elapsed time never invents progress. */
export type StudioBootStatus = {phase:'building'|'shaders'|'ready';progress:number;label:string};
export type StartupState = {phase:'loading'|'arrival'|'playing'|'error';progress:number;label:string;error:string|null};
export type StartupAction =
 | {type:'boot';status:StudioBootStatus;skipArrival?:boolean}
 | {type:'error';message:string}
 | {type:'finish'}
 | {type:'retry'};
export const ARRIVAL_DURATION_MS = 7000;
export const initialStartup:StartupState = {phase:'loading',progress:0,label:'Opening your coastal studio',error:null};
export function startupReducer(state:StartupState,action:StartupAction):StartupState {
 if(action.type==='retry')return {...initialStartup};
 if(action.type==='error')return {...state,phase:'error',error:action.message};
 if(action.type==='finish')return state.phase==='arrival'?{...state,phase:'playing'}:state;
 if(state.phase!=='loading')return state;
 const {status}=action;
 const progress=Number.isFinite(status.progress)?Math.max(state.progress,Math.min(1,Math.max(0,status.progress))):state.progress;
 return {...state,progress:status.phase==='ready'?1:progress,label:status.label,phase:status.phase==='ready'?(action.skipArrival?'playing':'arrival'):'loading'};
}
