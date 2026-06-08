import fs from 'node:fs/promises'
import path from 'node:path'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

const EMBEDDING_MODEL = 'gemini-embedding-2-preview'
const ROOT = process.cwd()
const PRIMARY_CONTENT_FILE = path.resolve(ROOT, 'noidung.md')
const PDF_FILE = path.resolve(ROOT, 'GIAO_TRINH.pdf')
const OPTIONAL_DOCS_DIR = path.resolve(ROOT, 'docs')
const OUTPUT_DIR = path.resolve(ROOT, 'data')
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'embeddings.json')
const ENV_FILE = path.resolve(ROOT, '.env')
const SUPPORTED_EXTENSIONS = new Set(['.md', '.txt', '.pdf'])

async function loadEnvFile() {
  try {
    const raw = await fs.readFile(ENV_FILE, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim()
      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch {
    // Ignore missing .env and let the normal API-key validation fail with a clear message.
  }
}

function getApiKey() {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set')
  }

  return apiKey
}

function normalizeText(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function chunkText(text, chunkSize = 1400, overlap = 220) {
  const normalized = normalizeText(text)
  const chunks = []
  let start = 0

  while (start < normalized.length) {
    const end = Math.min(normalized.length, start + chunkSize)
    const slice = normalized.slice(start, end).trim()
    if (slice.length > 0) {
      chunks.push(slice)
    }

    if (end >= normalized.length) break
    start = Math.max(end - overlap, start + 1)
  }

  return chunks
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function extractPdfText(filePath) {
  try {
    console.log(`\n📄 Extracting text from PDF: ${path.basename(filePath)}`)
    
    // Set up pdfjs worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${path.resolve('./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')}`
    
    const buffer = await fs.readFile(filePath)
    const uint8Array = new Uint8Array(buffer)
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise
    
    let fullText = ''
    console.log(`📖 PDF has ${pdf.numPages} pages. Extracting text...`)
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        process.stdout.write(`\r  Processing page ${pageNum}/${pdf.numPages}...`)
        
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item) => item.str).join(' ')
        fullText += pageText + '\n'
        
      } catch (pageError) {
        console.error(`\n⚠️ Page ${pageNum}: ${pageError.message}`)
      }
    }
    
    console.log(`\n✅ PDF text extraction completed. Extracted ${fullText.length} characters from ${pdf.numPages} pages.\n`)
    return fullText.trim()
    
  } catch (error) {
    console.error(`\n❌ Failed to extract PDF text ${filePath}:`, error.message)
    return ''
  }
}

async function collectDocs(dirPath) {
  const documents = []
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      documents.push(...(await collectDocs(fullPath)))
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      console.log(`Skipping unsupported file: ${path.relative(ROOT, fullPath)}`)
      continue
    }

    let content = ''
    if (extension === '.pdf') {
      content = await extractPdfText(fullPath)
    } else {
      content = await fs.readFile(fullPath, 'utf8')
    }

    if (content.trim().length > 0) {
      documents.push({
        source: path.relative(ROOT, fullPath).replace(/\\/g, '/'),
        text: content,
      })
    }
  }

  return documents
}

async function collectSources() {
  const sources = []
  console.log(`\n📂 Looking for content sources...`)
  console.log(`  PDF (Primary): ${PDF_FILE}\n`)

  // Skip noidung.md - focus on PDF OCR as primary source
  // if (await pathExists(PRIMARY_CONTENT_FILE)) {
  //   console.log(`✅ Found noidung.md`)
  //   sources.push({
  //     source: 'noidung.md',
  //     text: await fs.readFile(PRIMARY_CONTENT_FILE, 'utf8'),
  //   })
  // }

  if (await pathExists(PDF_FILE)) {
    console.log(`✅ Found PDF file`)
    const pdfText = await extractPdfText(PDF_FILE)
    console.log(`📊 Extracted text length: ${pdfText.trim().length} characters`)
    if (pdfText.trim().length > 0) {
      console.log(`✅ Adding PDF to sources`)
      sources.push({
        source: path.basename(PDF_FILE),
        text: pdfText,
      })
    } else {
      console.log(`⚠️ PDF text extraction returned empty`)
    }
  } else {
    console.log(`❌ PDF file not found at: ${PDF_FILE}`)
  }

  if (await pathExists(OPTIONAL_DOCS_DIR)) {
    console.log(`✅ Found docs/ folder`)
    sources.push(...(await collectDocs(OPTIONAL_DOCS_DIR)))
  }

  if (sources.length === 0) {
    throw new Error('No input content found. Expected PDF file or supported files inside docs/.')
  }

  console.log(`✅ Found ${sources.length} content source(s)`)
  return sources
}

async function embedText(text) {
  const apiKey = getApiKey()
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
      }),
    },
  )

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(JSON.stringify(payload))
  }

  const values = payload?.embedding?.values
  if (!Array.isArray(values)) {
    throw new Error('Embedding response is missing vector values')
  }

  return values
}

async function main() {
  await loadEnvFile()
  const sources = await collectSources()
  const chunks = sources.flatMap((document) =>
    chunkText(document.text).map((text, index) => ({
      id: `${document.source}::${index + 1}`,
      source: document.source,
      text,
    })),
  )

  if (chunks.length === 0) {
    throw new Error('No chunks were generated from the available sources.')
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  
  // Load existing embeddings if file exists
  let embeddedItems = []
  try {
    const existingContent = await fs.readFile(OUTPUT_FILE, 'utf8')
    embeddedItems = JSON.parse(existingContent)
    console.log(`\n📂 Found existing ${embeddedItems.length} embeddings. Resuming from chunk ${embeddedItems.length + 1}...\n`)
  } catch {
    console.log(`\n📝 Starting fresh embedding generation...\n`)
  }

  // Track which chunks have been embedded
  const embeddedIds = new Set(embeddedItems.map(item => item.id))

  for (const [index, chunk] of chunks.entries()) {
    // Skip already embedded chunks
    if (embeddedIds.has(chunk.id)) {
      process.stdout.write(`\r⏭️ Skipping ${index + 1}/${chunks.length}: ${chunk.id}`)
      continue
    }

    process.stdout.write(`\r⏳ Embedding ${index + 1}/${chunks.length}: ${chunk.id}`)
    
    try {
      const embedding = await embedText(chunk.text)
      embeddedItems.push({
        ...chunk,
        embedding,
      })
      embeddedIds.add(chunk.id)

      // Save progress every 10 embeddings
      if (embeddedItems.length % 10 === 0) {
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(embeddedItems, null, 2), 'utf8')
        process.stdout.write(` ✅ (saved ${embeddedItems.length})`)
      }
    } catch (error) {
      console.error(`\n❌ Error embedding chunk ${index + 1}:`, error instanceof Error ? error.message : error)
      // Save progress before exiting
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(embeddedItems, null, 2), 'utf8')
      console.log(`\n💾 Saved ${embeddedItems.length} embeddings before exit`)
      throw error
    }
  }

  // Final save
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(embeddedItems, null, 2), 'utf8')
  console.log(`\n\n✅ Completed! Saved ${embeddedItems.length} embeddings to ${path.relative(ROOT, OUTPUT_FILE)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})