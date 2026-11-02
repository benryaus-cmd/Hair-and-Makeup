import test from 'node:test';
import assert from 'node:assert/strict';
import { initialStartup, startupReducer, ARRIVAL_DURATION_MS } from '../src/ui/startup-model.ts';

test('startup waits for genuine ready, then arrives before handing over input', () => {
 let state = startupReducer(initialStartup, {type:'boot',status:{phase:'building',progress:.4,label:'Building the coast'}});
 assert.equal(state.phase,'loading');
 state = startupReducer(state,{type:'boot',status:{phase:'shaders',progress:.95,label:'Warming shaders'}});
 assert.equal(state.phase,'loading');
 state = startupReducer(state,{type:'boot',status:{phase:'ready',progress:1,label:'Ready'}});
 assert.equal(state.phase,'arrival');
 assert.equal(ARRIVAL_DURATION_MS,7000);
 assert.equal(startupReducer(state,{type:'finish'}).phase,'playing');
});
test('reduced motion bypasses arrival only after ready', () => {
 assert.equal(startupReducer(initialStartup,{type:'finish'}).phase,'loading');
 assert.equal(startupReducer(initialStartup,{type:'boot',status:{phase:'ready',progress:1,label:'Ready'},skipArrival:true}).phase,'playing');
});
test('late status cannot rewind startup or dismiss an error, retry resets progress', () => {
 const ready = startupReducer(initialStartup,{type:'boot',status:{phase:'ready',progress:1,label:'Ready'}});
 assert.equal(startupReducer(ready,{type:'boot',status:{phase:'building',progress:.1,label:'Old callback'}}).phase,'arrival');
 const failed = startupReducer(ready,{type:'error',message:'WebGL unavailable'});
 assert.equal(startupReducer(failed,{type:'finish'}).phase,'error');
 assert.equal(startupReducer(failed,{type:'boot',status:{phase:'ready',progress:1,label:'Late'}}).phase,'error');
 assert.deepEqual(startupReducer(failed,{type:'retry'}),initialStartup);
});
test('boot progress is finite, monotonic and clamped', () => {
 let state = startupReducer(initialStartup,{type:'boot',status:{phase:'building',progress:.6,label:'Building'}});
 state = startupReducer(state,{type:'boot',status:{phase:'building',progress:.2,label:'Building'}});
 assert.equal(state.progress,.6);
 state = startupReducer(state,{type:'boot',status:{phase:'shaders',progress:NaN,label:'Shaders'}});
 assert.equal(state.progress,.6);
 assert.equal(startupReducer(state,{type:'boot',status:{phase:'shaders',progress:4,label:'Shaders'}}).progress,1);
});
