import {createServer} from 'vite';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
// Test-only renderer fault injection; production code has no test interface.
const probe={name:'studio-boot-fault',enforce:'pre',transform(code,id){
 if(!id.endsWith('/src/game/create-game.ts'))return;
 return code.replace('  if (!view) return noop;',`  if (!view) return noop;
 const record={disposed:false,lastFrame:null};(window.__studioViews??=[]).push(record);
 const originalDispose=view.dispose;view.dispose=()=>{record.disposed=true;originalDispose()};
 const originalLoop=view.renderer.setAnimationLoop.bind(view.renderer);view.renderer.setAnimationLoop=callback=>{record.lastFrame=callback;originalLoop(callback)};
 if(window.__studioViews.length===1)view.renderer.compileAsync=()=>{throw Error('injected synchronous compiler failure')};`);
}};
const server=await createServer({mode:'production',plugins:[probe],server:{host:'127.0.0.1',port:0,watch:{ignored:['**/*']}}});
await server.listen();
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:360,height:640},isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('barbie-ultimate-dreamland:preferences-v1',JSON.stringify({quality:'low',music:false,effects:false,sparkles:false,reducedMotion:true,sensitivity:1})));
try{
 await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`);
 await page.getByRole('button',{name:'Use lighter graphics'}).waitFor({timeout:120000});
 assert.equal(await page.locator('.studio-hud').count(),0);
 await page.getByRole('button',{name:'Use lighter graphics'}).click();
 await page.waitForSelector('.studio-hud',{timeout:120000});
 const state=await page.evaluate(()=>({views:window.__studioViews.map(v=>({disposed:v.disposed,stopped:v.lastFrame===null})),canvases:document.querySelectorAll('.game-view canvas').length}));
 assert.deepEqual(state.views,[{disposed:true,stopped:true},{disposed:false,stopped:false}]);
 assert.equal(state.canvases,1);assert.deepEqual(errors,[]);
 await mkdir('.test-output',{recursive:true});
 await writeFile('.test-output/studio-boot-failure-report.json',JSON.stringify({passed:true,...state,errors},null,2));
 console.log('PASS synchronous compiler failure exposes recovery; retry disposes old RAF/view and creates one playable canvas');
}finally{await browser.close();await server.close();}
