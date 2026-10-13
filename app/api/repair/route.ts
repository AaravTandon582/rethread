import {env} from 'cloudflare:workers';
import {reserveGeneration} from '@/lib/generation-budget';
import {z} from 'zod';
import {generationPrompt,patchDimensions,validRegion} from '@/lib/repair-engine';
export const dynamic='force-dynamic';
const schema=z.object({image:z.string().max(6500000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),region:z.object({x:z.number(),y:z.number(),w:z.number(),h:z.number()}).refine(validRegion),pattern:z.enum(['daisy','sashiko','cross']),color:z.enum(['sage green','indigo blue','terracotta']),tearWidth:z.number().min(5).max(120),tearHeight:z.number().min(5).max(120),margin:z.number().min(5).max(20)}).strict();
const headers={'Cache-Control':'no-store'};
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return Response.json({error:'Use the studio to generate a repair.'},{status:403,headers});
 try{
  if(Number(request.headers.get('content-length'))>7000000)return Response.json({error:'Image is too large.'},{status:413,headers});
  const text=await request.text();if(text.length>7000000)return Response.json({error:'Image is too large.'},{status:413,headers});
  let json;try{json=JSON.parse(text);}catch{return Response.json({error:'Invalid request.'},{status:400,headers});}
  const parsed=schema.safeParse(json);if(!parsed.success)return Response.json({error:'Check your image, repair region, and measurements.'},{status:400,headers});
  const apiKey=env.GEMINI_API_KEY?.trim();
  if(!apiKey || !env.DB)return Response.json({error:'Image generation is temporarily unavailable. Please try again later.'},{status:503,headers});
  if(!await reserveGeneration(env.DB))return Response.json({error:'The shared demo generation limit has been reached. Please try later; the daily allowance resets at midnight UTC.'},{status:429,headers:{...headers,'Retry-After':'60'}});
  const {image,region,pattern,color,tearWidth,tearHeight,margin}=parsed.data;const d=patchDimensions(tearWidth,tearHeight,margin);const match=image.match(/^data:(image\/[a-z]+);base64,(.+)$/)!;
  const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify({contents:[{parts:[{text:generationPrompt(pattern,region,color,d.width,d.height)},{inlineData:{mimeType:match[1],data:match[2]}}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}}),signal:AbortSignal.timeout(110000)});
  if(!response.ok){const status=response.status;return Response.json({error:status===429?'Image generation is temporarily at capacity. Please try again later.':status===401||status===403?'The image service is temporarily unavailable. Please try again later.':'The image provider could not complete the repair. Please try again.',providerStatus:status},{status:status===429?429:502,headers});}
  const payload=await response.json() as {candidates?:{content?:{parts?:{inlineData?:{mimeType:string;data:string}}[]}}[]};
  const result=payload.candidates?.[0]?.content?.parts?.find(p=>p.inlineData?.mimeType.startsWith('image/'))?.inlineData;
  if(!result||!['image/png','image/jpeg','image/webp'].includes(result.mimeType)||result.data.length>20000000)return Response.json({error:'The model returned no usable image. Try a clearer photo and a larger repair region.'},{status:502,headers});
  return Response.json({image:`data:${result.mimeType};base64,${result.data}`,model:'gemini-3.1-flash-image'},{headers});
 }catch(error){return Response.json({error:error instanceof Error&&/timeout|abort/i.test(error.name)?'Generation timed out. Your original photo is safe; try again.':'Generation failed. Please try again.'},{status:502,headers});}
}
