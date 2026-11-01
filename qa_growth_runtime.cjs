'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const listeners={},copied=[],toast={textContent:'',classList:{add(){}}};
const document={addEventListener(t,f){listeners[t]=f;},getElementById(id){return id==='growthToast'?toast:null;},createElement(){return {style:{},setAttribute(){},select(){},remove(){},value:''};},body:{appendChild(){}},execCommand(){return true;}};
const window={isSecureContext:true,clearTimeout(){},setTimeout(){return 1;}};
const navigator={clipboard:{async writeText(v){copied.push(v);}}};
const location={origin:'https://wishingasr.vercel.app',pathname:'/diwali-wishes'};
vm.runInNewContext(fs.readFileSync(__dirname+'/growth.js','utf8'),{document,window,navigator,location,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout});
(async()=>{assert.strictEqual(typeof listeners.click,'function');const sample={dataset:{copyText:'Happy Diwali!'},textContent:'Copy message',disabled:false};await listeners.click({target:{closest(s){return s==='[data-copy-text]'?sample:null;}}});assert.strictEqual(copied[0],'Happy Diwali!');assert.match(sample.textContent,/Copied/);const btn={textContent:'Copy this guide link',disabled:false};await listeners.click({target:{closest(s){return s==='.copy-page-link'?btn:null;}}});assert.strictEqual(copied[1],'https://wishingasr.vercel.app/diwali-wishes');assert.match(toast.textContent,/copied/i);console.log('PASS: copy-wish and copy-page-link helpers with confirmation feedback.');})().catch(e=>{console.error(e);process.exit(1);});
