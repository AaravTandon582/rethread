import { validBox } from "@/lib/repair";
export const dynamic = "force-dynamic";
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:Request) {
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return json({error:"Cross-origin requests are not allowed."},403);
 if(Number(request.headers.get("content-length")||0)>8_000_000)return json({error:"Image is too large."},413);
 try {const text=await request.text();if(text.length>8_000_000)return json({error:"Image is too large."},413);const body=JSON.parse(text);
 const {image,box,style,palette,key}=body;
 if(typeof key!=="string"||key.length<15||key.length>256)return json({error:"Connect a valid Gemini API key first."},400);
 if(typeof image!=="string"||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image))return json({error:"A valid garment image is required."},400);
 if(!validBox(box)||!["botanical","sashiko","celestial"].includes(style)||!["Moss & oat","Rust & cream","Indigo & ivory"].includes(palette))return json({error:"Invalid repair region or style."},400);
 const match=image.match(/^data:([^;]+);base64,(.+)$/)!;
 const motifs:Record<string,string>={botanical:"a few simple embroidered daisies and small leaves",sashiko:"simple evenly spaced Japanese-inspired running-stitch geometric rows",celestial:"small hand-embroidered stars and a crescent moon"};
 const prompt=`Edit this exact garment photograph to visualize an achievable hand-sewn visible repair. Cover the tear with a simple woven fabric patch with ${motifs[style]}. Palette: ${palette}. Patch must be entirely inside the rectangle left ${Math.round(box.x*100)}%, top ${Math.round(box.y*100)}%, width ${Math.round(box.w*100)}%, height ${Math.round(box.h*100)}% of the image. Keep a small border of unchanged fabric inside this rectangle so compositing has a clean edge. Place running stitches inside the patch perimeter. Preserve all original pixels outside this rectangle, identical camera, lighting, perspective, garment, seams and background. Do not crop, zoom, add hands, tools, text or a second image. Return one photorealistic full-frame edited image. This is a repair concept, not a new garment.`;
 const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{parts:[{text:prompt},{inlineData:{mimeType:match[1],data:match[2]}}]}],generationConfig:{responseModalities:["TEXT","IMAGE"]}}),signal:AbortSignal.timeout(90000)});
 if(!response.ok){return json({error:response.status===429?"Google’s rate or billing limit was reached. Check your API plan and retry.":response.status===401||response.status===403?"Google rejected this key. Check its permissions and image-generation access.":"The image provider could not complete the request. Please try again."},response.status===429?429:502);}
 const data=await response.json() as {candidates?:{content?:{parts?:{inlineData?:{mimeType:string;data:string}}[]}}[]};
 const img=data.candidates?.[0]?.content?.parts?.find(p=>p.inlineData?.mimeType.startsWith("image/"))?.inlineData;
 if(!img||!/^image\/(png|jpeg|webp)$/.test(img.mimeType))return json({error:"The model returned no image. Try another photo or repair style."},422);
 return json({image:`data:${img.mimeType};base64,${img.data}`,model:"gemini-2.5-flash-image"});
 }catch(e){return json({error:e instanceof SyntaxError?"Invalid request JSON.":e instanceof Error&&e.name==="TimeoutError"?"The image provider timed out. Please retry.":"Could not generate this repair. Please try again."},e instanceof SyntaxError?400:502);}
}
