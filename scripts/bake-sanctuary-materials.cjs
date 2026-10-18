/* Cache the original scene's authored canvases. Requires a running preview. */
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const output = path.join(__dirname,'../assets/sanctuary-materials');
(async()=>{
  const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    await page.goto((process.env.PORTFOLIO_URL || 'http://localhost:3000/')+'?bake-materials=1');
    await page.waitForFunction(()=>window.__kage?.renderer && window.__materialBake, {timeout:60000});
    const materials = await page.evaluate(()=>Object.fromEntries(Object.entries(window.__materialBake).map(([key, record])=>{
      const raster = source => {
        const max = /^(grass|rock|branch):/.test(key) ? 512 : 256;
        const scale = Math.min(1,max/Math.max(source.width,source.height));
        const canvas=document.createElement('canvas');
        canvas.width=Math.round(source.width*scale);canvas.height=Math.round(source.height*scale);
        const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
        ctx.drawImage(source,0,0,canvas.width,canvas.height);
        return canvas.toDataURL('image/png').split(',')[1];
      };
      return [key, record instanceof HTMLCanvasElement ? raster(record) : Object.fromEntries(Object.entries(record).map(([slot, canvas])=>[slot,raster(canvas)]))];
    })));
    fs.mkdirSync(output,{recursive:true});
    const manifest={profile:'mobile',generated:'2026-10-18',description:'Original authored procedural materials; lossless PNG samples. Full desktop factories retained.',materials:{}};
    let bytes=0,files=0;
    const write = value => {
      const data=Buffer.from(value,'base64');const hash=createHash('sha256').update(data).digest('hex').slice(0,16);
      const name=hash+'.png';fs.writeFileSync(path.join(output,name),data);bytes+=data.length;files++;return name;
    };
    for(const [key,record]of Object.entries(materials))manifest.materials[key]=typeof record==='string'?write(record):Object.fromEntries(Object.entries(record).map(([slot,data])=>[slot,write(data)]));
    fs.writeFileSync(path.join(output,'mobile.json'),JSON.stringify(manifest,null,2)+'\n');
    console.log(`Baked ${Object.keys(materials).length} materials / ${files} maps / ${Math.round(bytes/1024)} KiB.`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
