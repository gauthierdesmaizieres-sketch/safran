// S20 fiches nutrition : depuis le profil, et depuis la table nutritionnelle d'un aliment.
import { a11y, cleanupUsers, expect, loginAs, newUser, test } from './helpers.js'

test.beforeEach(async ({ page }) => loginAs(page, await newUser('learn')))

test('S20-H1 profile -> list -> sheet with sources', async ({ page }) => {
  await page.goto('/#/profile')
  await page.getByRole('button', { name: 'Lire les fiches' }).click()
  await expect(page.getByRole('heading', { name: 'Comprendre la nutrition' })).toBeVisible()
  await a11y(page)
  await page.getByRole('link', { name: /Lipides et acides gras/ }).click()
  await expect(page.getByRole('heading', { name: 'Lipides et acides gras', level: 1 })).toBeVisible()
  await expect(page.getByRole('table')).toContainText('500 mg/jour')
  await expect(page.getByRole('link', { name: /Hooper L\./ })).toHaveAttribute('href', /doi\.org/)
  await a11y(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('S20-H2 a nutrient in the food table opens its sheet', async ({ page }) => {
  await page.goto('/#/add/lunch')
  await page.getByRole('searchbox', { name: 'Rechercher un aliment' }).fill('riz')
  await page.getByRole('button', { name: /Riz blanc cuit/ }).click()
  await page.getByRole('table').getByRole('link', { name: 'Fibres' }).click()
  await expect(page.getByRole('heading', { name: 'Fibres alimentaires', level: 1 })).toBeVisible()
})

test('S20-E1 unknown sheet', async ({ page }) => {
  await page.goto('/#/learn/nope')
  await expect(page.getByRole('alert')).toContainText("Cette fiche n'existe pas.")
})

test.afterAll(cleanupUsers)
