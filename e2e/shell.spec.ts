import { expect, test } from '@playwright/test'
import { startWithNewProfile } from './helpers'

test('start → create profile → journey shows r1-s1 open and r1-s2 locked', async ({ page }) => {
  await startWithNewProfile(page)
  await expect(page.getByTestId('stop-r1-s1')).toHaveAttribute('data-status', 'open')
  await expect(page.getByTestId('stop-r1-s2')).toHaveAttribute('data-status', 'locked')
  await expect(page.getByText('Поляна')).toBeVisible()
})

test('profile and journey survive reload', async ({ page }) => {
  await startWithNewProfile(page, 'Ани')
  await page.reload()
  await page.getByTestId('start').click()
  await page.getByRole('button', { name: /Ани/ }).click()
  await expect(page.getByTestId('journey')).toBeVisible()
})

test('locked stop does not open a lesson', async ({ page }) => {
  await startWithNewProfile(page)
  await page.getByTestId('stop-r1-s2').click({ force: true })
  await expect(page.getByTestId('journey')).toBeVisible()
  await expect(page.getByTestId('lesson')).toHaveCount(0)
})

test('album shows empty slots for a new profile', async ({ page }) => {
  await startWithNewProfile(page)
  await page.getByTestId('open-album').click()
  await expect(page.getByTestId('album')).toBeVisible()
  await expect(page.locator('[data-sticker][data-collected="true"]')).toHaveCount(0)
  await expect(page.locator('[data-sticker]')).toHaveCount(63) // 20 + 1 large per region
})
