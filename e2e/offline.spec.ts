import { expect, test } from '@playwright/test'

test('app loads and plays a lesson offline after first visit', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  // First load is not yet controlled by the service worker; wait until it is.
  await page.reload()
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

  await context.setOffline(true)
  await page.reload()
  await page.getByTestId('start').click()
  await page.getByTestId('profile-new').click()
  await page.getByTestId('profile-name').fill('Мария')
  await page.getByTestId('profile-save').click()
  // Pictures come from the cache too: the story-stop book icon actually rendered.
  const book = page.locator('img[src$="1F4D6.svg"]').first()
  await expect.poll(() => book.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  await page.getByTestId('stop-r1-s1').click()
  await expect(page.getByTestId('exercise')).toBeVisible()
})
