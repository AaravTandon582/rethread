import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const folder=await mkdtemp(join(tmpdir(),'rethread-api-'));
const path=join(folder,'route.mjs');
const serverKey='fixture-server-secret-not-real';
globalThis.__rethreadEnv={GEMINI_API_KEY:serverKey,DB:{prepare:()=>({bind:()=>({first:async()=>({day:'fixture'})})})}};
await build({entryPoints:['app/api/repair/route.ts'],bundle:true,platform:'node',format:'esm',outfile:path,plugins:[{name:'test-worker-env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'worker-env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__rethreadEnv;',loader:'js'}));}}]});
const {POST}=await import(path);
const input={image:'data:image/png;base64,aGVsbG8=',planImage:'data:image/png;base64,aGVsbG8=',plan:{region:{x:.2,y:.3,w:.4,h:.3},pattern:'daisy',color:'sage green',tearWidthMm:40,tearHeightMm:28,marginMm:10}};
function request(body=input,origin='https://studio.test'){return new Request('https://studio.test/api/repair',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});}
test('rejects cross-origin and invalid regions without provider calls',async()=>{assert.equal((await POST(request(input,'https://elsewhere.test'))).status,403);assert.equal((await POST(request({...input,plan:{...input.plan,region:{x:.99,y:.2,w:.3,h:.3}}}))).status,400);});
test('model request uses garment and stitch reference and keeps the key out of response',async()=>{const previous=globalThis.fetch;globalThis.fetch=async(url,options)=>{assert.match(url,/generativelanguage.googleapis.com/);assert.equal(options.headers['x-goog-api-key'],serverKey);const body=JSON.parse(options.body);assert.match(body.contents[0].parts[0].text,/60 by 48 mm/);assert.equal(body.contents[0].parts.length,3);assert.deepEqual(body.contents[0].parts.slice(1).map(part=>part.inlineData.mimeType),['image/png','image/png']);return Response.json({candidates:[{content:{parts:[{inlineData:{mimeType:'image/png',data:'aGVsbG8='}}]}}]});};try{const response=await POST(request());assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');const body=await response.json();assert.equal(body.image,'data:image/png;base64,aGVsbG8=');assert.ok(!JSON.stringify(body).includes(serverKey));}finally{globalThis.fetch=previous;}});
test('maps provider quota and empty-image failures to actionable errors',async()=>{const previous=globalThis.fetch;try{globalThis.fetch=async()=>new Response('provider secret diagnostics',{status:429});let response=await POST(request());assert.equal(response.status,429);assert.match((await response.json()).error,/capacity/);globalThis.fetch=async()=>Response.json({candidates:[]});response=await POST(request());assert.equal(response.status,502);assert.match((await response.json()).error,/no usable image/);}finally{globalThis.fetch=previous;}});
test('rejects browser-supplied keys and never invokes Google without server configuration',async()=>{
 assert.equal((await POST(request({...input,apiKey:'attacker-supplied-key'}))).status,400);
 delete globalThis.__rethreadEnv.GEMINI_API_KEY;
 try{assert.equal((await POST(request())).status,503);}finally{globalThis.__rethreadEnv.GEMINI_API_KEY=serverKey;}
});
test('shared budget exhaustion prevents provider calls',async()=>{
 const db=globalThis.__rethreadEnv.DB;const previous=globalThis.fetch;
 globalThis.__rethreadEnv.DB={prepare:()=>({bind:()=>({first:async()=>null})})};
 globalThis.fetch=async()=>{throw new Error('Provider must not be called');};
 try{const response=await POST(request());assert.equal(response.status,429);assert.match((await response.json()).error,/shared demo/);}finally{globalThis.__rethreadEnv.DB=db;globalThis.fetch=previous;}
});
test.after(async()=>{await rm(folder,{recursive:true,force:true});});
