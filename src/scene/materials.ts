import * as THREE from 'three';
let seed=8173;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function surface(kind:'metal'|'concrete'|'paper'){
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;
 ctx.fillStyle=kind==='metal'?'#546057':kind==='paper'?'#baac85':'#424940';ctx.fillRect(0,0,512,512);
 for(let i=0;i<18000;i++){const x=rand()*512,y=rand()*512,r=rand();ctx.fillStyle=kind==='metal'?(r>.65?`rgba(84,44,24,${rand()*.65})`:`rgba(9,16,13,${rand()*.2})`):kind==='paper'?`rgba(60,40,18,${rand()*.11})`:`rgba(9,16,14,${rand()*.24})`;const size=kind==='metal'?rand()*7:rand()*4;ctx.fillRect(x,y,size,size*(rand()*2+.3));}
 if(kind==='metal')for(let i=0;i<95;i++){const x=rand()*512,y=rand()*512;ctx.strokeStyle=`rgba(23,21,14,${rand()*.3})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*4,y+rand()*95);ctx.stroke();}
 if(kind==='concrete'){for(let i=0;i<26;i++){ctx.fillStyle='rgba(13,29,20,.14)';ctx.fillRect(rand()*512,0,rand()*30,512);}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
export const metalMap=surface('metal'),concreteMap=surface('concrete'),paperMap=surface('paper');
export const iron=new THREE.MeshStandardMaterial({map:metalMap,color:'#85998b',metalness:.72,roughness:.7,bumpMap:metalMap,bumpScale:.028});
export const darkIron=new THREE.MeshStandardMaterial({map:metalMap,color:'#303d35',metalness:.8,roughness:.64,bumpMap:metalMap,bumpScale:.04});
export const brass=new THREE.MeshStandardMaterial({color:'#98805a',metalness:.82,roughness:.42,map:metalMap});
export const rust=new THREE.MeshStandardMaterial({color:'#6e4028',metalness:.5,roughness:.95,map:metalMap});
export const boltMaterial=new THREE.MeshStandardMaterial({color:'#7d8275',metalness:.85,roughness:.5});
export function labelTexture(text:string,width=768,height=256,color='#c6bc96',bg='#222e25',size=39){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);ctx.strokeStyle='#726b4a';ctx.lineWidth=3;ctx.strokeRect(8,8,width-16,height-16);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`${size}px "Courier New", monospace`;const lines=text.split('\n');lines.forEach((line,i)=>ctx.fillText(line,width/2,height/2+(i-(lines.length-1)/2)*size*1.45));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}

export function gaugeTexture(label:string){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;ctx.fillStyle='#b9b493';ctx.fillRect(0,0,512,512);ctx.fillStyle='#252c24';ctx.textAlign='center';for(let i=0;i<=40;i++){const a=(.75+i/40*1.5)*Math.PI;const x=Math.cos(a),y=Math.sin(a);ctx.lineWidth=i%5===0?5:2;ctx.beginPath();ctx.moveTo(256+x*184,256+y*184);ctx.lineTo(256+x*(i%5===0?157:170),256+y*(i%5===0?157:170));ctx.strokeStyle='#303528';ctx.stroke();if(i%5===0){ctx.font='24px monospace';ctx.fillText(String(i/5),256+x*134,264+y*134);}}
 ctx.font='22px monospace';ctx.fillText(label,256,318);ctx.font='16px monospace';ctx.fillText('kgf / cm²',256,347);ctx.fillText('B.M. · 1976',256,382);for(let i=0;i<1700;i++){ctx.fillStyle=`rgba(45,38,16,${Math.random()*.12})`;ctx.fillRect(Math.random()*512,Math.random()*512,Math.random()*4,1);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
