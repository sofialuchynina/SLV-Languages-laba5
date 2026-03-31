import express from 'express'
import cors from 'cors'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const require = createRequire(import.meta.url)

// Firebase Admin — ключі з serviceAccountKey.json
const serviceAccount = require('./serviceAccountKey.json')
initializeApp({ credential: cert(serviceAccount) })

const db = getFirestore()
const app = express()
app.use(cors())
app.use(express.json())

// HTTP GET — пройдені уроки з фільтрацією по даті
app.get('/api/completed/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { from, to } = req.query
    console.log('GET /api/completed', userId, from, to) // ← додали
    
    let query = db.collection('completedLessons').where('userId', '==', userId)
    if (from) query = query.where('completedAt', '>=', new Date(from))
    if (to)   query = query.where('completedAt', '<=', new Date(to))
    query = query.orderBy('completedAt', 'desc')
    
    const snapshot = await query.get()
    console.log('snapshot size:', snapshot.size) // ← додали
    
    const lessons = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data(),
      completedAt: doc.data().completedAt?.toDate()?.toISOString() || null
    }))
    res.json({ success: true, lessons })
  } catch (err) {
    console.error('GET error:', err.message) // ← додали
    res.status(500).json({ success: false, error: err.message })
  }
})

// HTTP POST — зберегти пройдений урок з датою
app.post('/api/completed', async (req, res) => {
  try {
    const { userId, lessonId, lessonTitle, lessonLevel, lessonLang } = req.body
    if (!userId || !lessonId) return res.status(400).json({ success: false, error: 'userId і lessonId обовязкові' })
    const existing = await db.collection('completedLessons').where('userId', '==', userId).where('lessonId', '==', lessonId).get()
    if (!existing.empty) return res.json({ success: true, alreadyExists: true })
    const docRef = await db.collection('completedLessons').add({
      userId, lessonId,
      lessonTitle: lessonTitle || '',
      lessonLevel: lessonLevel || '',
      lessonLang:  lessonLang  || '',
      completedAt: new Date(),
    })
    res.json({ success: true, id: docRef.id })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Хостинг статичних файлів React після npm run build
const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`))
