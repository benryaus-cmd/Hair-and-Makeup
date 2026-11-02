import {createServer} from 'vite';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const server=await createServer({mode:'production',server:{host:'127.0.0.1',port:0,watch:{ignored:['**/*']}}});await server.listen();
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:360,height:360},deviceScaleFactor:2,userAgent:'Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/142.0.0.0 Mobile Safari/537.36',isMobile:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/tests/poster-ink-fixture.html`);await page.waitForFunction(()=>window.posterInk);
 const first=await page.evaluate(()=>window.posterInk.measure());console.log(first);
 assert(first.antialias&&first.samples>0,'Android path requests a multisampled drawing buffer');assert(first.left>0,'lit contour remains readable');assert(first.right>=first.left*1.5,'shadow contour has visibly greater pixel width');
 await page.evaluate(()=>window.posterInk.rotate());const rotated=await page.evaluate(()=>window.posterInk.measure());assert(Math.abs(first.right-rotated.right)<=1,'weight follows world light rather than mesh face indexing');assert.deepEqual(errors,[]);
 const fringe=await page.evaluate(()=>window.posterInk.fringeProbe());assert.equal(fringe.white,0,'rough backlit cylinder must not develop a white specular seam');assert.deepEqual(errors,[]);
 await mkdir('.test-output',{recursive:true});await page.screenshot({path:'.test-output/poster-ink-fixture.png'});await writeFile('.test-output/poster-ink-report.json',JSON.stringify({first,rotated,fringe,errors},null,2));
 console.log('PASS Android MSAA, lit/shadow pixel widths and rotated contour stability and grazing specular fringe');
}finally{await browser.close();await server.close();}
