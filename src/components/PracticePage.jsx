import React, { useState, useEffect, useRef } from 'react'

const QUESTIONS = [
  { id: 1, text: 'Оберіть правильний варіант: "I saw ___ elephant at the zoo."', options: ['a', 'an', 'the'], correct: 1 },
  { id: 2, text: 'Яке слово означає "велосипед" англійською?', options: ['bicycle', 'vehicle', 'scooter'], correct: 0 },
  { id: 3, text: 'Оберіть правильну форму: "She ___ to school every day."', options: ['go', 'goes', 'going'], correct: 1 },
]

function QuizBox() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t) }, [])

  const q = QUESTIONS[current]

  function handleAnswer(idx) {
    if (selected !== null) return
    setSelected(idx)
    if (idx === q.correct) setScore(s => s + 1)
    setTimeout(() => {
      if (current + 1 < QUESTIONS.length) { setCurrent(c => c + 1); setSelected(null) }
      else setFinished(true)
    }, 900)
  }

  function restart() { setCurrent(0); setSelected(null); setScore(0); setFinished(false) }

  return (
    <div className={'quiz-container' + (show ? ' show' : '')}>
      <h3>Тест на знання граматики</h3>
      {finished ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: '1.2rem', color: '#ff7aac', fontWeight: 'bold' }}>
            Результат: {score} / {QUESTIONS.length}
          </p>
          <button className="start-btn" style={{ marginTop: 10 }} onClick={restart}>Пройти знову</button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: '#888' }}>Питання {current + 1} з {QUESTIONS.length}</p>
          <p>{q.text}</p>
          <div className="quiz-options">
            {q.options.map((opt, i) => {
              let bg = '#fff', border = '2px solid #000'
              if (selected !== null) {
                if (i === q.correct) { bg = '#d4edda'; border = '2px solid #28a745' }
                else if (i === selected) { bg = '#f8d7da'; border = '2px solid #dc3545' }
              }
              return (
                <label key={i} className="option-item"
                  style={{ background: bg, border, borderRadius: 8, padding: '8px 12px', cursor: selected !== null ? 'default' : 'pointer', transition: 'all 0.3s' }}
                  onClick={() => handleAnswer(i)}>
                  {opt}
                </label>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

const INITIAL_MESSAGES = [
  { from: 'bot', text: 'Hello! What is your name?' },
  { from: 'user', text: 'My name is Sofia.' },
  { from: 'bot', text: 'Nice to meet you, Sofia! Where are you from?' },
]

const BOT_REPLIES = [
  "That's interesting! Can you tell me more?",
  "Great! How do you say that in Ukrainian?",
  "Well done! Your English is improving!",
  "Interesting! Let's practice more vocabulary.",
  "Nice! Can you make a sentence with that word?",
]

function ChatBot() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [show, setShow] = useState(false)
  const chatRef = useRef(null)

  useEffect(() => { const t = setTimeout(() => setShow(true), 600); return () => clearTimeout(t) }, [])
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)]
      setMessages(prev => [...prev, { from: 'bot', text: reply }])
    }, 700)
  }

  return (
    <div className={'bot-container' + (show ? ' show' : '')}>
      <h3>Діалог з чат-ботом</h3>
      <div className="chat-box" ref={chatRef}>
        {messages.map((msg, i) => (
          <div key={i} className={'msg show ' + (msg.from === 'bot' ? 'bot' : 'user')}>
            {msg.from === 'bot' ? 'Bot: ' : 'You: '}{msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input type="text" placeholder="Введіть відповідь..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default function PracticePage() {
  return (
    <div className="container">
      <section className="practice-section">
        <h2>Інтерактивні вправи</h2>
        <div className="practice-layout">
          <QuizBox />
          <ChatBot />
        </div>
      </section>
    </div>
  )
}
