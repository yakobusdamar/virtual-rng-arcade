// Capture the win-tier presentation by staging outcomes via the QA hook.
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const shot = (name) => page.screenshot({ path: `docs/bmad/qa/screenshots/${name}.png` })

const stage = (outcome) =>
  page.evaluate((o) => {
    const store = window.__vrng
    store.setState({ spinning: false, pendingOutcome: null, lastOutcome: o })
  }, outcome)

await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' })
await page.getByTestId('reel-machine').waitFor()
await page.evaluate(() => window.__vrng.setState({ simCoins: 50_000, funPoints: 0 }))

// Tier 2: challenge MEDIUM WIN strip
await stage({
  mode: 'challenge', reels: ['lemon', 'lemon', 'clover'], category: 'MEDIUM_WIN',
  simCoinSpent: 100, simCoinReturn: 150, funPoints: 0, message: 'MENANG! Medium.', streak: 1, nonce: 901,
})
await page.waitForTimeout(450)
await shot('20-tier2-medium-win')

// Tier 3: challenge BIG WIN (rays + shake)
await stage({
  mode: 'challenge', reels: ['star', 'star', 'star'], category: 'BIG_WIN',
  simCoinSpent: 100, simCoinReturn: 400, funPoints: 0, message: 'Screenshot cepat.', streak: 2, nonce: 902,
})
await page.waitForTimeout(650)
await shot('21-tier3-big-win')

// Tier 4: JACKPOT takeover
await stage({
  mode: 'challenge', reels: ['diamond', 'diamond', 'diamond'], category: 'JACKPOT',
  simCoinSpent: 100, simCoinReturn: 2000, funPoints: 0, message: '💎💎💎 JACKPOT!', streak: 3, nonce: 903,
})
await page.waitForTimeout(900)
await shot('22-tier4-jackpot')

// Anticipation + tinted reels mid-spin (normal mode, reels 1-2 match staged)
await page.waitForTimeout(2600)
await page.evaluate(() => {
  const store = window.__vrng
  store.setState({
    spinning: true,
    pendingOutcome: {
      mode: 'challenge', reels: ['diamond', 'diamond', 'diamond'], category: 'JACKPOT',
      spent: 100, simCoinReturn: 2000, score: { funPoints: 0, isPair: false, triple: 'diamond', special: null },
    },
  })
})
await page.waitForTimeout(1500) // mid-anticipation window (1.2s-2.5s)
await shot('23-anticipation')

// Reset to a clean idle state
await page.evaluate(() => window.__vrng.setState({ spinning: false, pendingOutcome: null }))
await page.waitForTimeout(400)
await shot('24-final-idle')

await browser.close()
console.log('captured')
