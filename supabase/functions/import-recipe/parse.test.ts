import { assertEquals } from 'jsr:@std/assert@1'
import { checkDraft, youtubeId } from './parse.ts'

Deno.test('youtubeId reads watch, shorts, live and youtu.be links', () => {
  assertEquals(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s'), 'dQw4w9WgXcQ')
  assertEquals(youtubeId('https://youtube.com/shorts/dQw4w9WgXcQ?si=abc'), 'dQw4w9WgXcQ')
  assertEquals(youtubeId('https://m.youtube.com/live/dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
  assertEquals(youtubeId(' https://youtu.be/dQw4w9WgXcQ '), 'dQw4w9WgXcQ')
})

Deno.test('youtubeId refuses other hosts, bad ids and non-http', () => {
  assertEquals(youtubeId('https://www.instagram.com/reel/C1abc/'), null)
  assertEquals(youtubeId('https://evil.com/watch?v=dQw4w9WgXcQ'), null)
  assertEquals(youtubeId('https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ'), null)
  assertEquals(youtubeId('https://youtu.be/short'), null)
  assertEquals(youtubeId('javascript:alert(1)'), null)
  assertEquals(youtubeId('pas un lien'), null)
})

Deno.test('checkDraft cleans and clamps the model output', () => {
  const d = checkDraft({
    title: '  Omelette \n baveuse ', servings: 2.4, prep_minutes: 0,
    ingredients: [{ name: 'Œufs', quantity: '3', grams: 150 }, { name: 'Sel', quantity: '1 pincée', grams: 0.5 }, { name: '', grams: 10 }, 'x'],
    steps: ['Battre les œufs.', '', 42, 'Cuire 3 min.'],
  })
  assertEquals(d, {
    title: 'Omelette baveuse', servings: 2, prep_minutes: null,
    ingredients: [{ name: 'Œufs', quantity: '3', grams: 150 }, { name: 'Sel', quantity: '1 pincée', grams: null }],
    steps: ['Battre les œufs.', 'Cuire 3 min.'],
  })
})

Deno.test('checkDraft: no ingredient = not a recipe; defaults otherwise', () => {
  assertEquals(checkDraft({ title: 'Vlog', ingredients: [] }), null)
  assertEquals(checkDraft(null), null)
  assertEquals(checkDraft({ ingredients: [{ name: 'Riz', grams: 9999 }] }),
    { title: 'Recette importée', servings: 2, prep_minutes: null, ingredients: [{ name: 'Riz', quantity: '', grams: null }], steps: [] })
})
