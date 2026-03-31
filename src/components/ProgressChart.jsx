import React, { useEffect, useState } from 'react'
import { LEVEL_ORDER } from '../data/lessons.js'

export default function ProgressChart({ completedIds, startedIds, lessons = [] }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const total = lessons.length
  const count = completedIds.length
  const percent = total > 0 ? Math.round((count / total) * 100) : 0

  const highestLesson = completedIds.reduce((best, id) => {
    const lesson = lessons.find(l => l.id === id)
    if (!lesson) return best
    const idx = LEVEL_ORDER.indexOf(lesson.level)
    if (!best || idx > LEVEL_ORDER.indexOf(best.level)) return lesson
    return best
  }, null)

  return (
    <div className={'progress-card' + (visible ? ' show' : '')}>
      <h3>
        Поточний рівень:{' '}
        <span className="highlight-text">{highestLesson ? highestLesson.level : '—'}</span>
      </h3>
      <p>
        {highestLesson
          ? `Ви успішно завершили курс "${highestLesson.title}". Продовжуйте навчання!`
          : 'Ви ще не завершили жодного курсу. Починайте навчання!'}
      </p>
      <div className="progress-box">
        <div className="label-row">
          <span>Загальний прогрес</span>
          <span>{percent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%`, transition: 'width 0.8s ease' }} />
        </div>
      </div>
      <div className="stats-row">
        {[
          { num: count,             label: 'Уроків пройдено' },
          { num: startedIds.length, label: 'Розпочато курсів' },
          { num: total,             label: 'Всього курсів' },
        ].map((item, i) => (
          <StatBubble key={i} num={item.num} label={item.label} delay={600 + i * 200} />
        ))}
      </div>
    </div>
  )
}

function StatBubble({ num, label, delay }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div className={'stat-bubble' + (show ? ' show' : '')}>
      <span className="stat-num">{num}</span>
      <span>{label}</span>
    </div>
  )
}
