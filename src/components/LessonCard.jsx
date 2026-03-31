import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LessonCard({ lesson, index = 0, isCompleted, isStarted, onStart, onComplete, onNavigateToAuth }) {
  const [materialsOpen, setMaterialsOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 200)
    return () => clearTimeout(timer)
  }, [index])

  const cardClass = ['lesson-card', isCompleted ? 'completed' : '', visible ? 'show' : ''].filter(Boolean).join(' ')

  function handleStart() {
    if (!user) { onNavigateToAuth(); return }
    onStart(lesson.id)
  }

  function handleComplete() {
    if (!user) { onNavigateToAuth(); return }
    onComplete(lesson.id, { title: lesson.title, level: lesson.level, lang: lesson.lang })
  }

  return (
    <article className={cardClass}>
      {isCompleted && <span className="card-checkmark">💟</span>}
      <div className="badge">{lesson.level}</div>
      <h3>{lesson.title}</h3>
      <p>{lesson.desc}</p>
      <p className="price">Ціна: {lesson.price} грн</p>

      {!isCompleted && (
        <button className={'start-btn' + (isStarted ? ' started' : '')} onClick={handleStart} disabled={isStarted}>
          {isStarted ? 'Ви розпочали курс' : 'Почати курс'}
        </button>
      )}

      <button className="materials-toggle" onClick={() => setMaterialsOpen(p => !p)}>
        {materialsOpen ? '▲ Сховати матеріали' : '▼ Переглянути матеріали'}
      </button>

      {materialsOpen && (
        <div className="popup-inner">
          <div className="media-block">
            <h4>🎬 Відео</h4>
            <video controls style={{ width: '100%' }}><source src={lesson.video} type="video/mp4" /></video>
          </div>
          <div className="media-block">
            <h4>🎧 Аудіо</h4>
            <audio controls style={{ width: '100%' }}><source src={lesson.audio} type="audio/mpeg" /></audio>
          </div>
          <div className="media-block">
            <h4>📄 Текст</h4>
            {lesson.pdf ? <a href={lesson.pdf} download>Завантажити файл</a> : <p>{lesson.text || '—'}</p>}
          </div>
        </div>
      )}

      <button className="end-btn" onClick={handleComplete} disabled={isCompleted}
        style={isCompleted ? { background: '#9400D3', cursor: 'not-allowed' } : {}}>
        {isCompleted ? '💟 Пройдено' : 'Відзначити як пройдений'}
      </button>
    </article>
  )
}
