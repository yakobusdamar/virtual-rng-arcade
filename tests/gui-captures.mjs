// Capture settled screenshots of modals/tables for the QA record.
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const shot = (name) => page.screenshot({ path: `docs/bmad/qa/screenshots/${name}.png` })

await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' })
await page.getByTestId('reel-machine').waitFor()

// Bank simulator, fully settled
await page.getByTestId('add-sim-coins').click()
await page.getByTestId('topup-amount').waitFor()
await page.waitForTimeout(600)
await shot('14-topup-settled')
await page.keyboard.press('Escape')
await page.waitForTimeout(400)

// Odds table
await page.getByTestId('mode-challenge').click()
await page.getByTestId('odds-toggle').click()
await page.getByTestId('odds-table').waitFor()
await page.getByTestId('odds-table').scrollIntoViewIfNeeded()
await page.waitForTimeout(300)
await shot('15-odds-table-settled')

// Lab results
await page.getByTestId('nav-lab').click()
await page.getByTestId('explorer-run').waitFor()
await page.getByTestId('explorer-run').click()
await page.getByTestId('explorer-results').waitFor({ timeout: 15_000 })
await page.waitForTimeout(500)
await shot('16-lab-results')
await page.keyboard.press('Escape')
await page.waitForTimeout(400)

// Achievements + reset confirm
await page.getByTestId('nav-achievements').click()
await page.getByTestId('achievement-count').waitFor()
await page.waitForTimeout(500)
await shot('17-achievements')
await page.keyboard.press('Escape')
await page.waitForTimeout(400)
await page.getByTestId('nav-info').click()
await page.getByTestId('info-reset').waitFor()
await page.getByTestId('info-reset').click()
await page.getByTestId('reset-confirm').waitFor()
await page.waitForTimeout(500)
await shot('18-reset-confirm')

await browser.close()
console.log('captured')
