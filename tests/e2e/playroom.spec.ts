import {test,expect,type Page} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'
const games=[['bubbles','Bubble Pop',120],['sky','Sky Dash',75],['maze','Maze Quest',180],['matching','Match Club',180],['tictactoe','Three in a Row',120],['pattern','Pattern Parade',180],['garden','Pocket Garden',120],['cafe','Critter Café',120],['studio','Silly Studio',120]]as const
async function start(page:Page,name:string){await page.getByRole('button',{name:`Play ${name}`,exact:true}).click();await page.getByRole('button',{name:'Start playing',exact:true}).click();await expect(page.locator('.game-surface')).toBeVisible()}
async function stats(page:Page,id:string){return page.evaluate(id=>JSON.parse(localStorage.getItem('mvp.pilot.v1')||'{}').games?.[id],id)}
test.beforeEach(async({page})=>{await page.goto('/')})
test('all game screens have accessible controls and no browser runtime errors',async({page})=>{
  test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
  for(const[,name]of games){await start(page,name);const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(results.violations,`${name} accessibility`).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} overflow`).toBe(true);await page.getByRole('button',{name:'All games',exact:true}).click()}
  expect(errors).toEqual([])
})
test('Escape pauses play and keyboard focus enters the pause panel',async({page})=>{await start(page,'Maze Quest');await page.keyboard.press('Escape');await expect(page.getByRole('region',{name:'Game paused'})).toBeFocused();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Keep playing'})).toBeFocused()})
test('narrow phone and zoomed text stay usable',async({page})=>{await page.setViewportSize({width:320,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await start(page,'Critter Café');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'All games',exact:true}).click();await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)})

test('library, categories, silence, artwork and responsive layout',async({page},info)=>{
  await expect(page).toHaveTitle(/Patient Playroom/);await expect(page.getByRole('button',{name:'Turn sound on'})).toBeVisible();await expect(page.locator('.game-card')).toHaveCount(9)
  await page.getByRole('button',{name:'3D adventures',exact:true}).click();await expect(page.locator('.game-card')).toHaveCount(1)
  await page.getByRole('button',{name:'Chill zone',exact:true}).click();await expect(page.locator('.game-card')).toHaveCount(4)
  await page.getByRole('button',{name:'All games',exact:true}).click()
  await page.evaluate(()=>document.fonts.ready);await expect.poll(()=>page.locator('img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0))).toBe(true)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations).toEqual([])
  await fs.mkdir('artifacts',{recursive:true});await page.screenshot({path:`artifacts/${info.project.name}-library.png`,fullPage:true})
})
for(const[id,name,seconds]of games){test(`${name}: start, pause, resume, bounded round, no auto replay`,async({page})=>{
  await page.clock.install();await page.reload();await start(page,name)
  await page.clock.fastForward(5000);await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.getByRole('region',{name:'Game paused'})).toBeVisible();const before=await page.locator('.round-time').textContent()
  await page.clock.fastForward(30000);expect(await page.locator('.round-time').textContent()).toBe(before);await expect(page.locator('.game-surface')).toHaveAttribute('inert','')
  await page.getByRole('button',{name:'Keep playing'}).click();await page.clock.fastForward((seconds+1)*1000);await expect(page.locator('.round-result')).toBeVisible();await expect(page.getByRole('button',{name:'Start playing',exact:true})).toHaveCount(0);expect((await stats(page,id)).finishes).toBe(1)
  await page.clock.fastForward(180000);expect((await stats(page,id)).finishes).toBe(1);await expect(page.locator('.game-surface')).toHaveCount(0)
})}
test('appointment exits immediately, cuts sound, and does not count completion',async({page})=>{
  await page.getByRole('button',{name:'Turn sound on'}).click();await start(page,'Sky Dash');await page.getByRole('button',{name:'My appointment',exact:true}).first().click();await expect(page.getByRole('heading',{name:'Go do your thing.'})).toBeVisible();await expect(page.locator('canvas')).toHaveCount(0);await expect(page.getByRole('button',{name:'Turn sound on'})).toBeVisible();expect((await stats(page,'sky')).finishes).toBe(0)
})
test('maze can be solved, cannot walk through a wall, and hints work',async({page},info)=>{
  await start(page,'Maze Quest');const board=page.locator('.maze-board');await board.focus();await page.keyboard.press('ArrowUp');await expect(page.locator('.maze-tile.player')).toHaveAttribute('data-y','1')
  await page.getByRole('button',{name:'Hint',exact:true}).click();await expect(page.locator('.maze-tile.hint')).toHaveCount(1)
  await page.screenshot({path:`artifacts/${info.project.name}-maze.png`,fullPage:true})
  const steps=await board.evaluate(el=>{const open=new Set([...el.querySelectorAll('[data-wall="false"]')].map(n=>`${(n as HTMLElement).dataset.x},${(n as HTMLElement).dataset.y}`));const queue=[{x:1,y:1,path:[]as string[]}],seen=new Set(['1,1']);for(let n=0;n<queue.length;n++){const a=queue[n]!;if(a.x===9&&a.y===9)return a.path;for(const[dx,dy,key]of[[0,-1,'ArrowUp'],[0,1,'ArrowDown'],[-1,0,'ArrowLeft'],[1,0,'ArrowRight']]as const){const x=a.x+dx,y=a.y+dy,k=`${x},${y}`;if(open.has(k)&&!seen.has(k)){seen.add(k);queue.push({x,y,path:[...a.path,key]})}}}throw Error('No path')})
  await board.focus();for(const key of steps)await page.keyboard.press(key);await expect(page.getByRole('heading',{name:'You found your way. Quest complete.'})).toBeVisible();expect((await stats(page,'maze')).finishes).toBe(1)
})
test('memory mismatches lock, pause retains them, and all pairs can be completed',async({page})=>{
  await page.clock.install();await page.reload();await page.getByRole('button',{name:'Play Match Club',exact:true}).click();await page.getByRole('button',{name:'Big match 6 pairs'}).click();await page.getByRole('button',{name:'Start playing',exact:true}).click();const cards=page.locator('.memory-card'),known:Record<string,number[]>={}
  for(let i=0;i<12;i+=2){for(const index of [i,i+1]){await cards.nth(index).click();const label=(await cards.nth(index).getAttribute('aria-label'))!;const kind=label.split(': ')[1]!.split(',')[0]!;(known[kind]??=[]).push(index)}if(await cards.nth(i).evaluate(el=>!el.classList.contains('matched'))){await expect(cards.nth((i+2)%12)).toBeDisabled();if(i===0){await page.getByRole('button',{name:'Pause',exact:true}).click();await page.clock.fastForward(2000);await page.getByRole('button',{name:'Keep playing'}).click();await expect(cards.nth(i)).toHaveClass(/open/)}await page.clock.fastForward(950)}}
  for(const indices of Object.values(known)){if(await page.locator('.round-result').count())break;if(await cards.nth(indices[0]!).isEnabled()){await cards.nth(indices[0]!).click();await cards.nth(indices[1]!).click()}}
  await expect(page.getByRole('heading',{name:'All six pairs. A perfect match.'})).toBeVisible();expect((await stats(page,'matching')).finishes).toBe(1)
})
test('tic tac toe two-player win and thinking pauses correctly',async({page})=>{
  await start(page,'Three in a Row');await page.getByRole('button',{name:'Two players',exact:true}).click();for(const i of[0,3,1,4,2])await page.getByRole('button',{name:`Empty square ${i+1}`,exact:true}).click();await expect(page.getByRole('heading',{name:'You made three in a row.'})).toBeVisible();expect((await stats(page,'tictactoe')).finishes).toBe(1)
  await page.getByRole('button',{name:'All games',exact:true}).first().click();await page.clock.install();await page.reload();await start(page,'Three in a Row');await page.getByRole('button',{name:'Empty square 1',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();await page.clock.fastForward(2000);await expect(page.locator('.ttt-board button.mark-o')).toHaveCount(0);await page.getByRole('button',{name:'Keep playing'}).click();await page.clock.fastForward(600);await expect(page.locator('.ttt-board button.mark-o')).toHaveCount(1)
})
test('critter cafe teaches picture matching with no penalty for trying',async({page})=>{
  await start(page,'Critter Café');
  const order=page.locator('.cafe-order');
  const firstLabel=(await order.getAttribute('aria-label'))!;
  const wanted=firstLabel.match(/wants a (\w+)/)?.[1];
  const wrong=['apple','banana','strawberry'].find(food=>food!==wanted)!;
  await page.getByRole('button',{name:`Serve ${wrong}`,exact:true}).click();
  await expect(page.locator('.cafe-game .mini-game-feedback')).toContainText(/would like a/);
  for(let i=0;i<6;i++){
    const label=(await order.getAttribute('aria-label'))!;
    const food=label.match(/wants a (\w+)/)?.[1];
    expect(food).toBeTruthy();
    await page.getByRole('button',{name:`Serve ${food}`,exact:true}).click();
    await page.getByRole('button',{name:i<5?'Next friend':'All done',exact:true}).click();
  }
  await expect(page.getByRole('heading',{name:'Six happy friends. Lovely serving!'})).toBeVisible();
})
test('silly studio makes a keepsake through three simple choices',async({page})=>{
  await start(page,'Silly Studio');
  await page.getByRole('button',{name:'Bunny',exact:true}).click(); await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Party hat',exact:true}).click(); await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Outer space',exact:true}).click(); await page.getByRole('button',{name:'Meet my friend',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Meet your bunny!'})).toBeVisible(); await page.getByRole('button',{name:'All done',exact:true}).click();
  await expect(page.getByRole('heading',{name:'A little imagination. A wonderful new friend.'})).toBeVisible();
  await expect(page.locator('.result-art').getByRole('img',{name:'bunny wearing a party hat in outer space'})).toBeVisible();
})
test('3D renders, sky steering and jump work',async({page},info)=>{
  await start(page,'Sky Dash');await expect(page.locator('canvas')).toHaveCount(1);await expect(page.getByText(/3D isn’t available/)).toHaveCount(0);await page.getByRole('button',{name:'Steer right',exact:true}).click();await expect(page.locator('.lane-labels .current')).toHaveText('Right');await page.getByRole('button',{name:'Jump',exact:false}).click();await expect(page.getByRole('button',{name:/Airtime/})).toBeVisible();await page.screenshot({path:`artifacts/${info.project.name}-sky.png`,fullPage:true})
})
test('flat fallback remains playable when WebGL is unavailable',async({page})=>{await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){if(type==='webgl2'||type==='webgl'||type==='experimental-webgl')return null;return Reflect.apply(original,this,[type,...args])}as typeof original});await page.reload();await start(page,'Sky Dash');await expect(page.getByText(/same game in flat view/)).toBeVisible();await page.getByRole('button',{name:'Steer left',exact:true}).click();await expect(page.locator('.lane-labels .current')).toHaveText('Left')})
test('hidden-tab pause, device motion preference and storage failure',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.locator('html')).toHaveAttribute('data-quiet','true');await expect(page.getByRole('button',{name:'Less motion',exact:true})).toHaveCount(0);await start(page,'Maze Quest');await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await expect(page.getByRole('region',{name:'Game paused'})).toBeVisible();await page.getByRole('button',{name:'My appointment',exact:true}).first().click();await page.getByRole('button',{name:'Back to the playroom',exact:false}).click();await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Storage disabled','QuotaExceededError')};Storage.prototype.getItem=()=>{throw new DOMException('Storage disabled','SecurityError')}});await page.reload();await start(page,'Maze Quest');await expect(page.locator('.maze-board')).toBeVisible()
})
