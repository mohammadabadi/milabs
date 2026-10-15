/**
 * Verifies that every locale file has exactly the same keys and that no
 * value is empty. Run with: npm run check:locales
 */
import { readFile } from 'node:fs/promises'

const files = { en: 'i18n/locales/en.json', fa: 'i18n/locales/fa.json' }
const flat = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]],
  )

const data = {}
for (const [code, path] of Object.entries(files)) {
  data[code] = new Map(flat(JSON.parse(await readFile(path, 'utf8'))))
}

let problems = 0
const [base, ...rest] = Object.keys(data)
for (const code of rest) {
  for (const key of data[base].keys()) if (!data[code].has(key)) { console.log(`✗ ${code} missing ${key}`); problems++ }
  for (const key of data[code].keys()) if (!data[base].has(key)) { console.log(`✗ ${base} missing ${key}`); problems++ }
}
for (const [code, map] of Object.entries(data)) {
  for (const [key, value] of map) if (typeof value === 'string' && !value.trim()) { console.log(`✗ ${code} empty ${key}`); problems++ }
}
console.log(problems ? `${problems} problem(s)` : `✓ ${data[base].size} keys, identical across ${Object.keys(data).join(', ')}`)
process.exit(problems ? 1 : 0)
