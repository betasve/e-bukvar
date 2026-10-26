import { expect, test, type Page } from '@playwright/test'
import { startWithNewProfile } from './helpers'

/** Answers the current exercise correctly using the E2E data attributes, then waits for the next one. */
async function solveOne(page: Page) {
  const ex = page.getByTestId('exercise')
  const kind = (await ex.getAttribute('data-kind'))!
  const answer = (await ex.getAttribute('data-answer'))!
  const index = (await ex.getAttribute('data-index'))!
  if (kind === 'watch-blend') {
    await page.getByTestId('next').click()
  } else if (kind === 'build-word') {
    for (const s of answer.split('-')) await page.locator(`[data-tile="${s}"]:not([disabled])`).first().click()
  } else {
    await page.locator(`[data-option="${answer}"]`).click()
  }
  await page.waitForFunction(
    (i) => document.querySelector('[data-testid="exercise"]')?.getAttribute('data-index') !== i,
    index,
  )
}

async function openStop(page: Page, stopId: string) {
  await page.getByTestId(`stop-${stopId}`).click()
  await expect(page.getByTestId('exercise')).toBeVisible()
}

// A full lesson plays every prompt, "Браво!" and sticker clip in real time (~35 s).
const FULL_LESSON_MS = 120_000

test('complete r1-s1 → sticker shown → r1-s2 unlocked', async ({ page }) => {
  test.setTimeout(FULL_LESSON_MS)
  await startWithNewProfile(page)
  await openStop(page, 'r1-s1')
  while (!(await page.getByTestId('lesson-done').isVisible())) await solveOne(page)
  await expect(page.locator('[data-earned]')).not.toHaveCount(0)
  await page.getByTestId('done-back').click()
  await expect(page.getByTestId('stop-r1-s1')).toHaveAttribute('data-status', 'done')
  await expect(page.getByTestId('stop-r1-s2')).toHaveAttribute('data-status', 'open')
})

test('progress survives reload mid-lesson', async ({ page }) => {
  await startWithNewProfile(page)
  await openStop(page, 'r1-s1')
  for (let i = 0; i < 3; i++) await solveOne(page) // hear-letter, print-hand, hear-letter: all first try
  await expect(page.getByTestId('meter')).toHaveAttribute('data-value', '3')
  await page.reload()
  await page.getByTestId('start').click()
  await page.getByRole('button', { name: /Мария/ }).click()
  await expect(page.getByTestId('stop-r1-s1')).toHaveAttribute('data-status', 'open')
  await expect(page.getByTestId('stop-r1-s2')).toHaveAttribute('data-status', 'locked')
  await openStop(page, 'r1-s1')
  await expect(page.getByTestId('meter')).toHaveAttribute('data-value', '3')
})

test('wrong answer twice reveals the correct option', async ({ page }) => {
  await startWithNewProfile(page)
  await openStop(page, 'r1-s1')
  const answer = (await page.getByTestId('exercise').getAttribute('data-answer'))!
  const wrong = page.locator(`[data-option]:not([data-option="${answer}"])`).first()
  await wrong.click()
  await wrong.click()
  await expect(page.locator(`[data-option="${answer}"]`)).toHaveClass(/reveal/)
})

test('handwritten letters are primer images in the same case as the printed letter', async ({ page }) => {
  test.setTimeout(FULL_LESSON_MS)
  await startWithNewProfile(page)
  await openStop(page, 'r1-s1') // a capitals stop
  let checked = 0
  while (!(await page.getByTestId('lesson-done').isVisible())) {
    if ((await page.getByTestId('exercise').getAttribute('data-kind')) === 'print-hand') {
      for (const img of await page.locator('img.hand').all()) {
        const letter = (await img.getAttribute('alt'))!
        expect(letter).toBe(letter.toUpperCase())
        const box = (await img.boundingBox())!
        const button = await img.evaluate((el) => el.closest('button')?.getBoundingClientRect().width ?? Infinity)
        expect(box.width, `${letter} fits its button`).toBeLessThanOrEqual(button)
        expect(await img.getAttribute('src')).toMatch(/hand\/[0-9A-F]{4}\.svg$/)
        expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
        checked++
      }
    }
    await solveOne(page)
  }
  expect(checked).toBeGreaterThan(0)
})

test('words to read are split into syllables', async ({ page }) => {
  test.setTimeout(FULL_LESSON_MS)
  await startWithNewProfile(page)
  await openStop(page, 'r1-s1')
  let checked = 0
  while (!(await page.getByTestId('lesson-done').isVisible())) {
    const ex = page.getByTestId('exercise')
    if ((await ex.getAttribute('data-kind')) === 'read-match') {
      const shown = (await page.getByTestId('read-word').textContent())!.trim()
      expect(shown).toBe('МА-МА')
      checked++
    }
    await solveOne(page)
  }
  expect(checked).toBeGreaterThan(0)
})

test('all options are within the viewport', async ({ page }) => {
  test.setTimeout(FULL_LESSON_MS)
  await startWithNewProfile(page)
  await openStop(page, 'r1-s1')
  const viewport = page.viewportSize()!
  while (!(await page.getByTestId('lesson-done').isVisible())) {
    for (const el of await page.locator('[data-option], [data-tile]').all()) {
      const box = (await el.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
    }
    await solveOne(page)
  }
})
