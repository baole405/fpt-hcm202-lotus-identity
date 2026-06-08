import fs from 'node:fs/promises'
import path from 'node:path'

import { buildQuestionBankPayload } from '../lib/suggested-questions.mjs'

const ROOT = process.cwd()
const CONTENT_FILE = path.resolve(ROOT, 'noidung.md')
const OUTPUT_DIR = path.resolve(ROOT, 'data')
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'question-bank.json')

async function main() {
  const content = await fs.readFile(CONTENT_FILE, 'utf8')
  const payload = buildQuestionBankPayload(content)

  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8')

  console.log(`Saved ${payload.questions.length} reusable questions to data/question-bank.json`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})