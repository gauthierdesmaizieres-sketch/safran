import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DICT, t } from './i18n.js'

// Every t('…') / tn(n, '…', '…') literal in src/, so a new French string without its translation fails here.
function usedKeys(dir = 'src', keys = new Set()) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) usedKeys(p, keys)
    else if (/\.jsx?$/.test(p) && !p.includes('.test.') && !p.endsWith('i18n.js')) {
      const re = /\btn?\((?:[^,()'"]+,\s*)?(['"])((?:\\.|(?!\1).)*)\1(?:,\s*(['"])((?:\\.|(?!\3).)*)\3)?/g
      for (const m of readFileSync(p, 'utf8').matchAll(re)) {
        keys.add(m[2].replace(/\\(.)/g, '$1'))
        if (m[4]) keys.add(m[4].replace(/\\(.)/g, '$1'))
      }
    }
  }
  return keys
}
const holes = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort()

test('every UI string has a German and an English translation with the same placeholders', () => {
  const used = usedKeys()
  assert.ok(used.size > 250, `only ${used.size} keys found: the scan regex is broken`)
  for (const lang of ['de', 'en']) {
    const missing = [...used].filter(k => !(k in DICT[lang]))
    assert.deepEqual(missing, [], `${lang}: missing translations`)
    for (const k of used) assert.deepEqual(holes(DICT[lang][k]), holes(k), `${lang}: placeholders differ in "${k}"`)
  }
  assert.deepEqual(Object.keys(DICT.de).filter(k => !used.has(k)), [], 'unused translations (stale keys)')
})

test('t falls back to French and fills placeholders', () => {
  assert.equal(t('Étape {i} sur {n}', { i: 2, n: 5 }), 'Étape 2 sur 5')
  assert.equal(t('pas une clé'), 'pas une clé')
})
