import type {Region} from './repair-engine';
export function loadImage(src:string):Promise<HTMLImageElement> {return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('This image could not be decoded. Try a JPEG or PNG.'));im.src=src;});}
export async function normalizeImage(file:File) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG, or WebP photograph.');
  if(file.size>12*1024*1024) throw new Error('Choose an image smaller than 12 MB.');
  const url=URL.createObjectURL(file);
  try{const im=await loadImage(url);const scale=Math.min(1,1280/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);const ctx=c.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.9);}finally{URL.revokeObjectURL(url);}
}
export async function imageData(src:string){if(src.startsWith('data:'))return src;const blob=await(await fetch(src)).blob();return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(blob);});}
export async function svgToPngData(svg:string){const image=await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('This browser could not prepare the stitch reference.');ctx.drawImage(image,0,0);return canvas.toDataURL('image/png');}
export async function composePlanPreview(original:string,planImage:string,region:Region){const [source,plan]=await Promise.all([loadImage(original),loadImage(planImage)]);const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('This browser could not prepare the repair preview.');ctx.drawImage(source,0,0);ctx.save();ctx.globalAlpha=.86;ctx.drawImage(plan,Math.round(region.x*source.width),Math.round(region.y*source.height),Math.max(1,Math.round(region.w*source.width)),Math.max(1,Math.round(region.h*source.height)));ctx.restore();return canvas.toDataURL('image/png');}
export async function compositeRepair(original:string,generated:string,region:Region){
 const [a,b]=await Promise.all([loadImage(original),loadImage(generated)]);
 const c=document.createElement('canvas');c.width=a.width;c.height=a.height;const ctx=c.getContext('2d')!;ctx.drawImage(a,0,0);
 const base=ctx.getImageData(0,0,c.width,c.height);const g=document.createElement('canvas');g.width=c.width;g.height=c.height;const gx=g.getContext('2d')!;gx.drawImage(b,0,0,c.width,c.height);const edited=gx.getImageData(0,0,c.width,c.height);
 const x0=Math.floor(region.x*c.width),y0=Math.floor(region.y*c.height),x1=Math.ceil((region.x+region.w)*c.width),y1=Math.ceil((region.y+region.h)*c.height);
 let diff=0,count=0;
 for(let y=y0;y<Math.min(y1,c.height);y++) for(let x=x0;x<Math.min(x1,c.width);x++){
   const i=(y*c.width+x)*4;const edge=Math.min(x-x0,y-y0,x1-1-x,y1-1-y);const alpha=Math.min(1,edge/5);
   if(edge<5){for(let k=0;k<3;k++)diff+=Math.abs(base.data[i+k]-edited.data[i+k]);count+=3;}
   for(let k=0;k<3;k++)base.data[i+k]=Math.round(base.data[i+k]*(1-alpha)+edited.data[i+k]*alpha);
 }
 ctx.putImageData(base,0,0);
 return {image:c.toDataURL('image/png'),boundaryDifference:count?Math.round(diff/count/255*100):0,preservedPercent:Math.round((1-(x1-x0)*(y1-y0)/(c.width*c.height))*100)};
}
export function download(content:string,name:string,type='image/svg+xml'){const url=content.startsWith('data:')?content:URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();if(!url.startsWith('data:'))setTimeout(()=>URL.revokeObjectURL(url),1000);}
