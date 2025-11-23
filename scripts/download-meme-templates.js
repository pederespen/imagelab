#!/usr/bin/env node

/**
 * Download meme template images from imgflip
 * Run: node scripts/download-meme-templates.js
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const MEME_TEMPLATES = [
  { id: 'drake', url: 'https://i.imgflip.com/30b1gx.jpg' },
  { id: 'distracted-boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
  { id: 'two-buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
  { id: 'change-my-mind', url: 'https://i.imgflip.com/24y43o.jpg' },
  { id: 'expanding-brain', url: 'https://i.imgflip.com/1jwhww.jpg' },
  { id: 'woman-yelling-at-cat', url: 'https://i.imgflip.com/345v97.jpg' },
  { id: 'surprised-pikachu', url: 'https://i.imgflip.com/1hij2h.jpg' },
  { id: 'is-this-a-pigeon', url: 'https://i.imgflip.com/1o00in.jpg' },
  { id: 'running-away-balloon', url: 'https://i.imgflip.com/261o3j.jpg' },
  { id: 'left-exit-12', url: 'https://i.imgflip.com/22bdq6.jpg' },
  { id: 'disaster-girl', url: 'https://i.imgflip.com/23ls.jpg' },
  { id: 'hide-the-pain-harold', url: 'https://i.imgflip.com/gk5el.jpg' },
  { id: 'success-kid', url: 'https://i.imgflip.com/1bhk.jpg' },
  { id: 'mocking-spongebob', url: 'https://i.imgflip.com/1otk96.jpg' },
  { id: 'scroll-of-truth', url: 'https://i.imgflip.com/21tqf4.jpg' },
  { id: 'batman-slapping-robin', url: 'https://i.imgflip.com/9ehk.jpg' },
  { id: 'boardroom-meeting', url: 'https://i.imgflip.com/m78d.jpg' },
  { id: 'spiderman-pointing', url: 'https://i.imgflip.com/2sp4zl.jpg' },
  { id: 'they-are-the-same-picture', url: 'https://i.imgflip.com/1c1uej.jpg' },
]

const OUTPUT_DIR = path.join(__dirname, '../public/memes')

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)

    https
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`))
          return
        }

        response.pipe(file)

        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
      .on('error', err => {
        fs.unlink(filepath, () => {}) // Delete the file on error
        reject(err)
      })
  })
}

async function downloadAll() {
  console.log(`📥 Downloading ${MEME_TEMPLATES.length} meme templates...\n`)

  let succeeded = 0
  let failed = 0

  for (const template of MEME_TEMPLATES) {
    const filepath = path.join(OUTPUT_DIR, `${template.id}.jpg`)

    try {
      await downloadImage(template.url, filepath)
      console.log(`✅ ${template.id}.jpg`)
      succeeded++
    } catch (error) {
      console.error(`❌ ${template.id}.jpg - ${error.message}`)
      failed++
    }
  }

  console.log(`\n🎉 Done! ${succeeded} succeeded, ${failed} failed`)
  console.log(`📁 Images saved to: ${OUTPUT_DIR}`)
  console.log('\n💡 Next steps:')
  console.log('1. Enable Template Creator Mode in the meme generator')
  console.log('2. Load each template and position the text')
  console.log('3. Click "Save Config" to get the template configuration')
  console.log('4. Update lib/types/meme.ts with the new configs')
}

downloadAll().catch(console.error)
