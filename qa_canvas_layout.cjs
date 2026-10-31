const fs = require('fs'); const vm = require('vm'); const path = require('path');
const ROOT=__dirname; const src=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
function segment(a,b){const i=src.indexOf(a),j=src.indexOf(b,i);if(i<0||j<0)throw Error('segment missing');return src.slice(i,j)}
const context={console,Intl,Math,String,Array};vm.createContext(context);
vm.runInContext(segment('function canvasGraphemes','function drawRoundedRect')+segment('function wrapCanvasText','function drawCenterLines'),context);
class MockCtx{constructor(){this.font='400 16px Arial'}measureText(value){const m=this.font.match(/(\d+(?:\.\d+)?)px/);const size=m?+m[1]:16;let width=0;for(const ch of Array.from(String(value))){width+=(/[\u0900-\u097F]/.test(ch)?size:ch===' '?size*.28:size*.52)}return {width}}}
const ctx=new MockCtx(); const samples=[
 'Wishing you a birthday filled with laughter, love, and beautiful surprises. '.repeat(4),
 'आपके जीवन में खुशियाँ, प्रेम और समृद्धि आए। हर दिन मुस्कान और सफलता से भरा रहे। '.repeat(3),
 'A'.repeat(180),
 'प्रिय मित्र के लिए एक बेहद खूबसूरत शुभकामना संदेश '.repeat(8)
];
const result=[];
for(const text of samples){const lines=context.wrapCanvasText(ctx,text,800,'400 20px Arial');const max=Math.max(0,...lines.map(x=>ctx.measureText(x).width));result.push({chars:text.length,lines:lines.length,maxLineWidth:Math.round(max),withinSafeWidth:max<=800});}
const fitted=context.fitCanvasLine(ctx,'With love, '+('VeryLongSenderName '.repeat(5)),800,'"Dancing Script", cursive',36,16,'500');
ctx.font=`500 ${fitted.size}px "Dancing Script", cursive`;
result.push({signatureFit:Math.round(ctx.measureText(fitted.text).width),signatureSize:fitted.size,withinSafeWidth:ctx.measureText(fitted.text).width<=800});
console.log(JSON.stringify(result,null,2)); if(result.some(x=>x.withinSafeWidth===false))process.exit(1);
