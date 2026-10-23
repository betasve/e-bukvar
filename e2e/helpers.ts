import { expect, type Page } from '@playwright/test'

/** From a fresh browser: start → create a profile → journey. */
export async function startWithNewProfile(page: Page, name = 'Мария') {
  await page.goto('/')
  await page.getByTestId('start').click()
  await page.getByTestId('profile-new').click()
  await page.getByTestId('profile-name').fill(name)
  await page.getByTestId('avatar-1F98A').click()
  await page.getByTestId('profile-save').click()
  await expect(page.getByTestId('journey')).toBeVisible()
}
