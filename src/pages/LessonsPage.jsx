import React, { useState, useMemo, useEffect } from 'react'
import { db } from '../firebase.js'
import { collection, getDocs } from 'firebase/firestore'
import { lessons as localLessons } from '../data/lessons.js'
import LessonCard from '../components/LessonCard.jsx'
import { useNavigate } from 'react-router-dom'

export default function LessonsPage({ completedIds, startedIds, onStart, onComplete }) {
  const [search, setSearch]       = useState('')
  const [sortPrice, setSortPrice] = useState('Без')
  const [levelFilter, setLevel]   = useState('')
  const [lessons, setLessons]     = useState([])
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchLessons() {
      try {
        const snapshot = await getDocs(collection(db, 'lessons'))
        if (!snapshot.empty) setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        else setLessons(localLessons)
      } catch { setLessons(localLessons) }
      finally { setLoading(false) }
    }
    fetchLessons()
  }, [])

  const filtered = useMemo(() => {
    let result = lessons.filter(l => {
      const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase())
      const matchLevel  = !levelFilter || l.level === levelFilter
      return matchSearch && matchLevel
    })
    if (sortPrice === 'менше<більше') result = [...result].sort((a, b) => a.price - b.price)
    if (sortPrice === 'більше>менше') result = [...result].sort((a, b) => b.price - a.price)
    return result
  }, [search, sortPrice, levelFilter, lessons])

  const enLessons = filtered.filter(l => l.lang === 'en')
  const frLessons = filtered.filter(l => l.lang === 'fr')

  if (loading) return (
    <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
      <p style={{ color: '#ff7aac', fontSize: '1.3rem', fontFamily: 'Franklin Gothic Medium' }}>Завантаження уроків... 💕</p>
    </div>
  )

  return (
    <div className="container">
      <div className="filter-section">
        <div className="filter-item">
          <label>Пошук</label>
          <input type="text" placeholder="Введіть назву курсу" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-item">
          <label>Сортування за ціною</label>
          <select value={sortPrice} onChange={e => setSortPrice(e.target.value)}>
            <option value="Без">Без сортувань</option>
            <option value="менше<більше">Від дешевого до дорогого</option>
            <option value="більше>менше">Від дорогого до дешевого</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Рівень</label>
          <select value={levelFilter} onChange={e => setLevel(e.target.value)}>
            <option value="">Всі рівні</option>
            {['A0','A1','A2','B1','B2','C1'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
        </div>
        <button className="reset-btn" onClick={() => { setSearch(''); setSortPrice('Без'); setLevel('') }}>Скинути фільтри</button>
      </div>

      {filtered.length === 0 && <div className="no-results show">Нічого не знайдено 😔</div>}

      {enLessons.length > 0 && (
        <section className="practice-section">
          <h2>Курси англійської</h2>
          <div className="lessons-grid">
            {enLessons.map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} index={i}
                isCompleted={completedIds.includes(lesson.id)}
                isStarted={startedIds.includes(lesson.id)}
                onStart={onStart} onComplete={onComplete}
                onNavigateToAuth={() => navigate('/auth')} />
            ))}
          </div>
        </section>
      )}

      {frLessons.length > 0 && (
        <section className="practice-section">
          <h2>Курси французької</h2>
          <div className="lessons-grid">
            {frLessons.map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} index={i}
                isCompleted={completedIds.includes(lesson.id)}
                isStarted={startedIds.includes(lesson.id)}
                onStart={onStart} onComplete={onComplete}
                onNavigateToAuth={() => navigate('/auth')} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
