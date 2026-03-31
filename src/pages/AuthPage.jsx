import React, { useState } from 'react'
import { auth } from '../firebase.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password)
      else await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use': setError('Цей email вже зареєстрований'); break
        case 'auth/invalid-email': setError('Невірний формат email'); break
        case 'auth/wrong-password':
        case 'auth/invalid-credential': setError('Невірний email або пароль'); break
        case 'auth/weak-password': setError('Пароль має бути не менше 6 символів'); break
        case 'auth/user-not-found': setError('Користувача не знайдено'); break
        default: setError('Сталася помилка. Спробуйте ще раз')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="https://cdn.sanriowiki.com/2/23/Cinnamoroll.png" alt="Cinnamoroll" className="auth-logo" />
        <h2 className="auth-title">{isLogin ? 'Вхід до SLV English' : 'Реєстрація в SLV English'}</h2>
        <div className="auth-tabs">
          <button className={'auth-tab' + (isLogin ? ' active' : '')} onClick={() => { setIsLogin(true); setError('') }}>Вхід</button>
          <button className={'auth-tab' + (!isLogin ? ' active' : '')} onClick={() => { setIsLogin(false); setError('') }}>Реєстрація</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label>Пароль</label>
            <input type="password" placeholder="Мінімум 6 символів" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Зачекайте...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
          </button>
        </form>
        <p className="auth-switch">
          {isLogin ? 'Ще немає акаунту? ' : 'Вже є акаунт? '}
          <button className="auth-switch-btn" onClick={() => { setIsLogin(!isLogin); setError('') }}>
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </button>
        </p>
      </div>
    </div>
  )
}
