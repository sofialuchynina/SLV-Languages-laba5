import React, { useState, useEffect } from 'react'
import { db } from '../firebase.js'
import { collection, getDocs } from 'firebase/firestore'
import { lessons as localLessons, LEVEL_ORDER } from '../data/lessons.js'
import ProgressChart from '../components/ProgressChart.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function useLessons() {
  const [lessons, setLessons] = useState([])
  useEffect(() => {
    async function fetch() {
      try {
        const snapshot = await getDocs(collection(db, 'lessons'))
        if (!snapshot.empty) setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        else setLessons(localLessons)
      } catch { setLessons(localLessons) }
    }
    fetch()
  }, [])
  return lessons
}

function StudyTimer() {
  const [seconds, setSeconds] = useState(() => {
    const today = new Date().toDateString()
    if (localStorage.getItem('studyDate') === today) return parseInt(localStorage.getItem('studyTime') || '0')
    localStorage.setItem('studyDate', today); localStorage.setItem('studyTime', '0'); return 0
  })
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => { const next = s + 1; localStorage.setItem('studyTime', String(next)); return next })
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60
  return (
    <div className="timer-card">
      <h3>Час навчання сьогодні</h3>
      <div id="study-timer">{(h > 0 ? h + ' год ' : '') + (m > 0 ? m + ' хв ' : '') + s + ' сек'}</div>
    </div>
  )
}

export default function ProgressPage({ completedIds, startedIds, onUncomplete, onUnstart, onNavigate, serverUrl }) {
  const [view, setView] = useState('main')
  const lessons = useLessons()
  const { user } = useAuth()
  const [serverLessons, setServerLessons] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loadingServer, setLoadingServer] = useState(false)

  async function fetchFromServer() {
    if (!user || !serverUrl) return
    setLoadingServer(true)
    try {
      let url = `${serverUrl}/api/completed/${user.uid}`
      const params = []
      if (dateFrom) params.push(`from=${dateFrom}`)
      if (dateTo)   params.push(`to=${dateTo}`)
      if (params.length) url += '?' + params.join('&')
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) setServerLessons(data.lessons)
    } catch (err) { console.error(err) }
    finally { setLoadingServer(false) }
  }


  if (view === 'completed') return <CompletedView ids={completedIds} lessons={lessons} onBack={() => setView('main')} onUncomplete={onUncomplete} onNavigate={onNavigate} />
  if (view === 'started')   return <StartedView   ids={startedIds}   lessons={lessons} onBack={() => setView('main')} onUnstart={onUnstart}     onNavigate={onNavigate} />

  return (
    <div className="container">
      <StudyTimer />
      <section className="progress-section">
        <h2 className="level-header">Ваш профіль студента</h2>
        <ProgressChart completedIds={completedIds} startedIds={startedIds} lessons={lessons} />
        <ChipList title="Пройдені курси:"  ids={completedIds} lessons={lessons} emoji="💟" chipStyle={{}} />
        <ChipList title="Розпочаті курси:" ids={startedIds}   lessons={lessons} emoji="👀" chipStyle={{ background: '#ffc0cb', color: '#000' }} />

        <div className="server-filter-card">
          <h3>📅 Пройдені уроки за датою</h3>
          <div className="server-filter-row">
            <div className="filter-item">
              <label>Від</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="filter-item">
              <label>До</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <button className="reset-btn" onClick={fetchFromServer} disabled={loadingServer}>
              {loadingServer ? 'Завантаження...' : 'Показати'}
            </button>
          </div>
          {serverLessons.length === 0
            ? <p className="empty-msg" style={{ marginTop: 12 }}>Немає пройдених уроків за цей період</p>
            : <div className="completed-badge-row" style={{ marginTop: 12 }}>
                {serverLessons.map((l, i) => (
                  <span key={i} className="completed-chip server-completed-chip">
                    💟 {l.lessonLevel} — {l.lessonTitle}
                    <span className="chip-date">{l.completedAt ? new Date(l.completedAt).toLocaleDateString('uk-UA') : ''}</span>
                  </span>
                ))}
              </div>
          }
        </div>

        <button className="view-completed-btn" onClick={() => setView('completed')}>💟 Переглянути пройдені курси</button>
        <button className="view-completed-btn" style={{ marginTop: 10 }} onClick={() => setView('started')}>👀 Переглянути розпочаті курси</button>
      </section>
    </div>
  )
}

function ChipList({ title, ids, lessons, emoji, chipStyle }) {
  const chips = ids.map(id => lessons.find(l => l.id === id)).filter(Boolean)
  return (
    <div className="completed-list">
      <h3>{title}</h3>
      <div className="completed-badge-row">
        {chips.length === 0 ? <span className="empty-msg">Ще нічого немає</span>
          : chips.map(l => <span key={l.id} className="completed-chip" style={chipStyle}>{emoji} {l.level} — {l.title}</span>)}
      </div>
    </div>
  )
}

function CompletedView({ ids, lessons, onBack, onUncomplete, onNavigate }) {
  const items = ids.map(id => lessons.find(l => l.id === id)).filter(Boolean)
  return (
    <div className="container">
      <button className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onBack}>← Назад до прогресу</button>
      <h2 className="page-title">Пройдені курси</h2>
      <p className="page-subtitle">{items.length === 0 ? 'Тут відображатимуться курси, які ви відзначили як пройдені' : `Пройдено ${items.length} курс(ів)`}</p>
      {items.length === 0
        ? <div className="empty-state"><span className="emoji">📚</span><p>У вас поки немає пройдених курсів</p><button onClick={() => onNavigate('lessons')} className="start-btn">Перейти до уроків</button></div>
        : <div className="completed-page-grid">{items.map(l => (
            <div key={l.id} className="completed-course-card show">
              <span className="checkmark">💟</span>
              <div className="badge">{l.level}</div>
              <h3>{l.title}</h3>
              <p className="lang-tag">{l.lang === 'en' ? 'Англійська' : 'Французька'}</p>
              <button className="cancel-btn" onClick={() => onUncomplete(l.id)}>✕ Скасувати як пройдений</button>
            </div>
          ))}</div>
      }
    </div>
  )
}

function StartedView({ ids, lessons, onBack, onUnstart, onNavigate }) {
  const items = ids.map(id => lessons.find(l => l.id === id)).filter(Boolean)
  return (
    <div className="container">
      <button className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onBack}>← Назад до прогресу</button>
      <h2 className="page-title">Розпочаті курси</h2>
      <p className="page-subtitle">{items.length === 0 ? 'Тут відображатимуться курси, які ви розпочали' : `Розпочато ${items.length} курс(ів)`}</p>
      {items.length === 0
        ? <div className="empty-state"><span className="emoji">🚀</span><p>У вас поки немає розпочатих курсів</p><button onClick={() => onNavigate('lessons')} className="start-btn">Перейти до уроків</button></div>
        : <div className="completed-page-grid">{items.map(l => (
            <div key={l.id} className="completed-course-card show" style={{ borderColor: '#9400D3', boxShadow: '6px 6px 0 #9400D3' }}>
              <span className="checkmark">👀</span>
              <div className="badge" style={{ background: '#9400D3' }}>{l.level}</div>
              <h3 style={{ color: '#9400D3' }}>{l.title}</h3>
              <p className="lang-tag">{l.lang === 'en' ? 'Англійська' : 'Французька'}</p>
              <button className="cancel-btn cancel-btn--pink" onClick={() => onUnstart(l.id)}>✕ Скасувати як розпочатий</button>
            </div>
          ))}</div>
      }
    </div>
  )
}