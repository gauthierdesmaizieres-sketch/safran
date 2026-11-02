// F16 Importer une recette (lien partagé -> S16 -> S15 -> S13), F17 Liste de courses (S17). The AI is mocked.
import { a11y, admin, cleanupUsers, expect, loginAs, newUser, test } from './helpers.js'

let user
test.beforeEach(async ({ page }) => {
  user = await newUser('import')
  await loginAs(page, user)
})
test.afterAll(cleanupUsers)

const CORS = { 'Access-Control-Allow-Origin': '*' }
const DRAFT = {
  title: 'Poulet au riz express', servings: 2, prep_minutes: 20,
  ingredients: [
    { name: 'Riz blanc cuit', quantity: '300 g', grams: 300 },
    { name: 'Poulet rôti', quantity: '2 cuisses', grams: 250 },
    { name: 'Épice zzzintrouvable', quantity: '1 pincée', grams: null },
  ],
  steps: ['Cuire le riz.', 'Ajouter le poulet.'],
}

async function mockImport(page, seen = []) {
  await page.route('**/functions/v1/import-recipe', async route => {
    seen.push(route.request().postDataJSON())
    await route.fulfill({ json: { draft: DRAFT, source_url: 'https://youtu.be/dQw4w9WgXcQ' }, headers: CORS })
  })
}

test('F16-H1 shared YouTube link -> decoded -> dish with source link -> shopping list', async ({ page }) => {
  const seen = []
  await mockImport(page, seen)
  await page.goto('/?share=1&title=Recette&text=' + encodeURIComponent('Regarde https://youtu.be/dQw4w9WgXcQ'))
  await expect(page).toHaveURL(/#\/import\?link=/)
  await expect(page.getByLabel('Lien Instagram ou YouTube')).toHaveValue('https://youtu.be/dQw4w9WgXcQ')
  await a11y(page)
  await page.getByRole('button', { name: 'Décoder la recette' }).click()
  await expect(page.getByRole('heading', { name: 'Poulet au riz express' })).toBeVisible()
  await expect(page.getByLabel('Ingrédients')).toContainText('2 cuisses')
  expect(seen[0]).toMatchObject({ url: 'https://youtu.be/dQw4w9WgXcQ' })
  await a11y(page)

  await page.getByRole('button', { name: 'Créer le plat' }).click()
  await expect(page.getByLabel('Nom du plat')).toHaveValue('Poulet au riz express')
  await expect(page.getByRole('button', { name: 'Épice zzzintrouvable' })).toBeVisible() // not in the base -> chip
  await expect(page.getByLabel(/^Poids de .* en grammes$/)).toHaveCount(2)
  await a11y(page)
  await page.getByRole('button', { name: 'Enregistrer le plat' }).click()
  await expect(page.getByRole('heading', { name: 'Poulet au riz express' })).toBeVisible()
  await expect(page.getByRole('link', { name: "Voir la recette d'origine" })).toHaveAttribute('href', 'https://youtu.be/dQw4w9WgXcQ')

  await page.getByRole('button', { name: 'Ajouter à la liste de courses' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'courses' })).toContainText('2 ingrédients ajoutés aux courses')
  await page.goto('/#/shopping')
  await expect(page.getByRole('checkbox')).toHaveCount(2)
  await expect(page.getByRole('checkbox', { name: /· 300 g$/ })).toBeVisible()
  await a11y(page)
})

test('F17-H1 import straight to the list, check, add, remove checked', async ({ page }) => {
  await mockImport(page)
  await page.goto('/#/recipes')
  await page.getByRole('button', { name: 'Importer un lien' }).click()
  await page.getByLabel('Lien Instagram ou YouTube').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  await page.getByRole('button', { name: 'Décoder la recette' }).click()
  await page.getByRole('button', { name: 'Ajouter à la liste de courses' }).click()
  await expect(page.getByRole('heading', { name: 'Liste de courses' })).toBeVisible()
  await expect(page.getByRole('checkbox')).toHaveCount(3)

  await page.getByLabel('Ajouter un article').fill('Citrons')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Citrons' })).toBeVisible()
  await page.getByRole('checkbox', { name: '300 g Riz blanc cuit' }).check()
  await page.getByRole('button', { name: 'Retirer les articles cochés (1)' }).click()
  await expect(page.getByRole('checkbox')).toHaveCount(3)
  const { data } = await admin().from('shopping_items').select('text').eq('user_id', user.id)
  expect(data.map(r => r.text).sort()).toEqual(['1 pincée Épice zzzintrouvable', '2 cuisses Poulet rôti', 'Citrons'])
  await a11y(page)
})

test('F16-E1 Instagram without caption: explains to paste the text', async ({ page, allow }) => {
  allow(/status of 400/)
  await page.route('**/functions/v1/import-recipe', r => r.fulfill({ status: 400, json: { error: 'need_text' }, headers: CORS }))
  await page.goto('/#/import')
  await page.getByLabel('Lien Instagram ou YouTube').fill('https://www.instagram.com/reel/abc123/')
  await expect(page.getByLabel('Texte de la recette (obligatoire pour Instagram)')).toBeVisible()
  await page.getByRole('button', { name: 'Décoder la recette' }).click()
  await expect(page.getByRole('alert')).toContainText('copie la légende')
  await a11y(page)
})
