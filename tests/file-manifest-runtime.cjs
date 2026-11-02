const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const mod={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('src/dev/projectFileManifestPlugin.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(require,mod,mod.exports);
const root=fs.mkdtempSync(path.join(os.tmpdir(),'studio-manifest-'));
try{
 fs.mkdirSync(path.join(root,'.test-output/publish'),{recursive:true});fs.writeFileSync(path.join(root,'.test-output/publish/duplicate-source.json'),'not shipped');
 fs.mkdirSync(path.join(root,'src/game'),{recursive:true});fs.writeFileSync(path.join(root,'src/game/tokens.ts'),'gameplay source');
 const plugin=mod.exports.projectFileManifestPlugin();plugin.configResolved({root});const code=plugin.load('\0virtual:project-file-manifest');const manifest=JSON.parse(code.slice('export default '.length,-1));
 assert(manifest.files.some(f=>f.path==='src/game/tokens.ts'),'gameplay token file remains visible');
 assert(!manifest.files.some(f=>f.path.startsWith('.test-output/')),'diagnostic and publication copies must not inflate the shipped viewer');
 console.log('PASS file viewer excludes diagnostic copies and preserves gameplay tokens');
}finally{fs.rmSync(root,{recursive:true,force:true});}
