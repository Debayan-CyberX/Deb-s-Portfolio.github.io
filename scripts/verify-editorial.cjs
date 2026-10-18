/* Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base = process.env.PORTFOLIO_URL || 'http://localhost:3000/';
const output = process.env.PORTFOLIO_TEST_OUTPUT || path.join(require('node:os').tmpdir(), 'digital-kyoto-review');
fs.mkdirSync(output, { recursive: true });
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const ids = ['aegis','trishield','inbox','tcp','drain','library'];
const report = [];
async function overflow(page, label) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), label);
}
async function openPage(browser, width, reduced = false) {
  const page = await browser.newPage({ viewport: { width, height: width >= 1000 ? 1000 : 844 }, deviceScaleFactor: 1, isMobile: width < 500, hasTouch: width < 1000, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const errors = [], missing = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) missing.push(r.url()); });
  await page.route('https://api.github.com/**', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('#pre').waitFor({ state: 'hidden', timeout: 60000 });
  return { page, errors, missing };
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    for (const width of (process.env.PORTFOLIO_SKIP_LAYOUT ? [] : [320,375,390,768,1024,1440,1920])) {
      const { page, errors, missing } = await openPage(browser, width, width === 768);
      assert.equal(await page.locator('.project-card').count(), 6);
      assert.equal(await page.locator('.project-feature').count(), 2);
      assert.equal(await page.locator('.arsenal-row').count(), 4);
      assert.equal(await page.locator('.archive-timeline > li').count(), 5);
      assert.equal(await page.locator('[data-cam]').count(), 6, 'Authored camera poses preserved');
      for (const id of ['hero','pathways','engineeringNotes','gate','lessons','playground','archive','eternity']) {
        await page.locator('#'+id).scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        await overflow(page, `${width}px overflow at ${id}`);
        if ([390,1440].includes(width)) {
          await page.waitForTimeout(350);
          await page.screenshot({ path: path.join(output, `${width}-${id}.png`) });
        }
      }
      for (const details of await page.locator('.arsenal-row').all()) {
        if (!(await details.evaluate(el => el.open))) await details.locator('summary').click();
        assert(await details.locator('.arsenal-body').isVisible());
        await overflow(page, `${width}px expanded arsenal`);
      }
      await page.locator('.source-index > summary').click();
      assert.equal(await page.locator('#githubReposGrid .github-repo-card:visible').count(), 6, 'Static sources survive API failure');
      await page.locator('.source-index > summary').click();
      for (const id of ids) {
        const opener = page.locator(`#project-${id} .project-actions [data-open-case]`);
        await opener.click();
        const dialog = page.locator(`#case-${id}`);
        await dialog.waitFor({ state: 'visible' });
        await dialog.locator('.stepper__segment').first().waitFor();
        assert.equal(await dialog.locator('.dossier-section').count(), 8);
        assert.equal(await dialog.locator('.architecture-flow li').count(), 4);
        assert.equal(await dialog.locator('.stepper__segment').count(), 4);
        await dialog.locator('.workflow-buttons button').last().click();
        assert.equal(await dialog.locator('.workflow-buttons > span').innerText(), 'STEP 2 OF 4');
        await dialog.locator('.stepper__segment').last().click();
        assert.equal(await dialog.locator('.workflow-buttons > span').innerText(), 'STEP 4 OF 4');
        assert(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth+1), 'Dossier width fits');
        if (id === 'inbox' && width === 1440) await page.screenshot({ path: path.join(output, '1440-dossier.png') });
        await page.keyboard.press('Shift+Tab');
        assert(await dialog.evaluate(el => el.contains(document.activeElement)), 'Focus stays inside native dialog');
        await page.keyboard.press('Escape');
        assert(await opener.evaluate(el => el === document.activeElement), 'Dossier restores focus');
      }
      const trigger = page.locator('#project-aegis .project-actions [data-open-case]');
      await trigger.click();
      await page.locator('#case-aegis [data-next-case]').click();
      await page.locator('#case-trishield').waitFor({ state: 'visible' });
      await page.waitForTimeout(100);
      assert(await page.evaluate(() => document.body.classList.contains('modal-open')));
      await page.keyboard.press('Escape');
      assert(await trigger.evaluate(el => el === document.activeElement), 'Next dossier retains exhibition return point');
      const menu = page.locator('.sm-toggle');
      await menu.click(); await page.waitForTimeout(800);
      assert.equal(await page.locator('.sm-panel-item').count(), 7);
      assert(await page.locator('#top').evaluate(el => el.inert));
      if (width === 390) await page.screenshot({ path: path.join(output,'390-menu.png') });
      await page.keyboard.press('Escape'); await page.waitForTimeout(350);
      assert.equal(await page.locator('#top').evaluate(el => el.inert), false);
      assert(await menu.evaluate(el => el === document.activeElement));
      await menu.click(); await page.waitForTimeout(800);
      await page.locator('.sm-panel-item').filter({ hasText: /^Archive$/ }).click();
      await page.waitForFunction(() => {
        const top = document.getElementById('archive').getBoundingClientRect().top;
        return top > -30 && top < 250;
      }, { timeout: 5000 });
      assert.equal(await page.locator('#top').evaluate(el => el.inert), false);
      const archiveTop = await page.locator('#archive').evaluate(el => el.getBoundingClientRect().top);
      assert(archiveTop > -30 && archiveTop < 250, 'Menu navigates to new archive');
      if ([390,1440].includes(width)) {
        await page.locator('#identityPass').scrollIntoViewIfNeeded();
        await page.locator('.lanyard-canvas').waitFor({ timeout: 20000 });
        await page.getByRole('button',{name:'Turn pass'}).click();
        assert.equal(await page.locator('.lanyard').getAttribute('data-side'),'back');
        await page.waitForTimeout(500);
        await page.screenshot({path:path.join(output,`${width}-identity.png`)});
      }
      assert.deepEqual(errors, [], `${width}px browser errors`);
      assert.deepEqual(missing, [], `${width}px missing local assets`);
      await page.close();
      report.push({width,layout:true,dossiers:6,arsenal:4,menu:true,errors:0});
      console.log(`${width}px: responsive sections, six dossiers, stepper, focus, next project, Arsenal, source fallback, and menu passed.`);
    }
    const { page, errors, missing } = await openPage(browser,1440);
    const hide = await page.addStyleTag({content:'#gl,#fg-sky,#grain,#cursor,#vignette,#emberCanvas{visibility:hidden!important}'});
    await page.locator('#projectCollection').scrollIntoViewIfNeeded();
    await page.locator('.flex-carousel').scrollIntoViewIfNeeded();
    await page.locator('.project-collection.is-ready').waitFor({timeout:20000});
    await page.locator('.flex-carousel').hover();
    const frame = async()=>{
      const rect = await page.locator('.flex-carousel').boundingBox();
      return digest(await page.screenshot({clip:{x:rect.x+rect.width/2-60,y:Math.max(0,rect.y+rect.height/2-40),width:120,height:80}}));
    };
    const samples=[];
    for(let i=0;i<5;i++){samples.push(await frame());await page.waitForTimeout(250);}
    assert.equal(new Set(samples).size,5,'Continuous movement under hover');
    await page.getByRole('button',{name:'Pause automatic project rotation'}).click();
    await page.locator('.collection-index button').first().click();
    await page.mouse.move(0,0);
    let paused=await frame(),stable=false;
    for(let i=0;i<30;i++){await page.waitForTimeout(400);const next=await frame();if(next===paused){stable=true;break;}paused=next;}
    assert(stable,'Explicit pause settles');
    await page.getByRole('button',{name:'Start automatic project rotation'}).click();
    const a=await frame();await page.waitForTimeout(600);assert.notEqual(await frame(),a);
    await page.getByRole('button',{name:'Pause automatic project rotation'}).click();
    await page.locator('.collection-index button').first().click(); await page.waitForTimeout(700);
    await page.locator('.flex-carousel').focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
    assert.equal(await page.locator('.collection-index button[aria-pressed="true"]').innerText(),'02\nTri-Shield');
    await page.keyboard.press('Enter'); await page.locator('#case-trishield').waitFor({state:'visible'}); await page.keyboard.press('Escape');
    await hide.evaluate(el=>el.remove());
    for(const [onclick,id] of [['openCryptoModal()','cryptoModal'],['openNetworkModal()','networkModal'],['toggleCyberTerminal()','cyberTermModal'],['openTicTacToe()','tttModal'],['openCalcModal()','calcModal'],['open3DViewer()','viewer3dModal']]) {
      const opener=page.locator(`.playground-item[onclick="${onclick}"]`);await opener.click();const dialog=page.locator('#'+id);await dialog.waitFor({state:'visible'});
      assert(await dialog.evaluate(el=>el.contains(document.activeElement)));
      if(id==='cryptoModal'){
        await page.locator('#entropyInput').fill('fictional-Test-123!');assert.notEqual(await page.locator('#entropyBits').innerText(),'0.00 bits');
        await page.getByRole('button',{name:'Live Hash Inspector'}).click();await page.locator('#hashInput').fill('abc');
        await page.waitForFunction(()=>document.querySelector('#sha256Out').textContent==='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
        await page.locator('#hashInput').fill('');assert.equal(await page.locator('#sha256Out').innerText(),'-');
      }
      if(id==='networkModal'){
        for(let i=0;i<4;i++)await page.locator('[onclick="stepHandshake()"]').click();
        assert.equal(await page.locator('.wireshark-row').count(),4);
        await page.locator('[onclick="resetHandshake()"]').click();assert.equal(await page.locator('.wireshark-row').count(),0);
      }
      if(id==='cyberTermModal'){
        for(const command of ['help','projects','nmap','<img src=x onerror="window.__bad=true">']){await page.locator('#cyberTermInput').fill(command);await page.keyboard.press('Enter');}
        assert((await page.locator('#cyberTermOutput').innerText()).includes('SIMULATED OUTPUT'));
        assert.equal(await page.evaluate(()=>window.__bad),undefined);
        await page.keyboard.press('ArrowUp');assert((await page.locator('#cyberTermInput').inputValue()).startsWith('<img'));
        await page.locator('#cyberTermInput').fill('clear');await page.keyboard.press('Enter');assert.equal(await page.locator('#cyberTermOutput').innerText(),'');
      }
      if(id==='tttModal'){
        await page.locator('.ttt-cell').first().click();await page.locator('.ttt-cell').nth(1).click();await page.waitForTimeout(500);
        assert.equal(await page.locator('.ttt-cell.taken').count(),2,'Only one user move before AI replies');
        await page.selectOption('#tttMode','pvp');assert.equal(await page.locator('.ttt-cell.taken').count(),0);
      }
      if(id==='calcModal'){
        await page.keyboard.type('12+3');await page.keyboard.press('Enter');assert.equal(await page.locator('#calcCurrent').innerText(),'15');
        await page.locator('[onclick="calcClear()"]').click();await page.keyboard.type('1/0');await page.keyboard.press('Enter');assert.equal(await page.locator('#calcCurrent').innerText(),'Error');
        await page.keyboard.type('7');assert.equal(await page.locator('#calcCurrent').innerText(),'7');
      }
      await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert(await opener.evaluate(el=>el===document.activeElement));
    }
    await page.locator('.email-composer > summary').click();
    await page.locator('.draft-button').click();assert.equal(await page.locator('#form-status').innerText(),'');
    await page.locator('[name="sender"]').fill('Browser verification');await page.locator('[name="email"]').fill('test@example.com');await page.locator('[name="message"]').fill('Draft only: no message is sent by this test.');
    await page.locator('.draft-button').click();assert((await page.locator('#form-status').innerText()).includes('review and send'));assert.equal(await page.locator('[name="sender"]').inputValue(),'Browser verification');
    await page.locator('.journal-copy [onclick="openResumeModal()"]').click();await page.locator('#resumeModal').waitFor({state:'visible'});assert.equal(await page.locator('#resumeModal object').getAttribute('data'),'Debayan_Lahiry_Cybersecurity_CV.pdf');await page.keyboard.press('Escape');
    const pdf=await page.request.get(base+'Debayan_Lahiry_Cybersecurity_CV.pdf');assert.equal(digest(await pdf.body()),digest(fs.readFileSync(path.join(__dirname,'../Debayan_Lahiry_Cybersecurity_CV.pdf'))));
    await page.locator('.sm-toggle').click();await page.waitForTimeout(800);
    await page.locator('#staggered-menu-panel').getByRole('radio',{name:'Matrix',exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('debax_theme')),'matrix');
    await page.locator('#staggered-menu-panel').getByRole('radio',{name:'Sanctuary',exact:true}).click();
    const bell=page.locator('#staggered-menu-panel .bell-toggle__button');await bell.click();assert.equal(await page.evaluate(()=>window.isAudioPlaying),true);await bell.click();assert.equal(await page.evaluate(()=>window.isAudioPlaying),false);await page.keyboard.press('Escape');
    await page.locator('.flex-carousel canvas').evaluate(el=>el.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await page.waitForTimeout(300);assert.equal(await page.locator('.project-card').count(),6);
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await page.close();
    report.push({functional:true,continuousCarousel:true,labs:6,cv:true,contactDraft:true,themeAudio:true,fallback:true});
    console.log('Continuous carousel, real hash output, handshake/reset, terminal safety/history, game, calculator, inspector, email draft, exact CV, theme/audio, and WebGL fallback passed.');
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
