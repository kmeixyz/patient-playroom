import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']})
const context=await browser.newContext({viewport:{width:1440,height:1000}})
const page=await context.newPage()
await page.goto('http://127.0.0.1:5173/')
const results=[]
for(const name of ['Sky Dash','Orbit Pop','Maze Quest','Match Club','Merge 128','Three in a Row','Word Scout','Hidden Friends','Room Explorer','Beat Garden']){
  await page.getByRole('button',{name:`Play ${name}`,exact:true}).click();await page.getByRole('button',{name:'Start playing',exact:true}).click()
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
  results.push({name,issues:audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))}))})
  await page.getByRole('button',{name:'All games',exact:true}).click()
}
await page.setViewportSize({width:320,height:800});await page.evaluate(()=>document.documentElement.style.fontSize='200%')
const overflow=await page.locator('body *').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().right>innerWidth+1).map(n=>({tag:n.tagName,cls:n.className,right:n.getBoundingClientRect().right,width:n.getBoundingClientRect().width})))
await fs.writeFile('artifacts/accessibility-audit.json',JSON.stringify({results,overflow},null,2));console.log(JSON.stringify({results,overflow},null,2));await browser.close()
