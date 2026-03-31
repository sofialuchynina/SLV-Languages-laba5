import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase.js'

function NavLink({ page, current, onNavigate, children }) {
  const isActive = current === '/' + page
  return (
    <li>
      <a href="#" className={'nav-link' + (isActive ? ' active' : '')}
        onClick={(e) => { e.preventDefault(); onNavigate(page) }}>
        {children}
      </a>
    </li>
  )
}

export default function Header({ variant = 'home', currentPage, onNavigate, onSignOut }) {
  const isHome = variant === 'home'
  const { user } = useAuth()

  async function handleSignOut() {
    await signOut(auth)
    onSignOut()
  }

  return (
    <header className={isHome ? 'header-home' : 'header-inner'}>
      {isHome ? (
        <>
          <img src="https://cdn.sanriowiki.com/2/23/Cinnamoroll.png" alt="Cinnamoroll" className="header-img-home" />
          <h1 className="header-title">Курси<br />іноземних мов<br />онлайн</h1>
          <p className="header-slogan">Speak. Learn. Voyage.</p>
        </>
      ) : (
        <button className="logo-btn" onClick={() => onNavigate('home')}>
          <img src="https://cdn.sanriowiki.com/2/23/Cinnamoroll.png" alt="Cinnamoroll" className="header-img-inner" />
        </button>
      )}
      <nav>
        <ul className="nav-list">
          <NavLink page="lessons"  current={currentPage} onNavigate={onNavigate}>Уроки</NavLink>
          <NavLink page="progress" current={currentPage} onNavigate={onNavigate}>Мій прогрес</NavLink>
          <NavLink page="practice" current={currentPage} onNavigate={onNavigate}>Практика</NavLink>
        </ul>
        <div className="nav-auth-row">
          {user ? (
            <>
              <span className="nav-email">👤 {user.email}</span>
              <button className="nav-signout-btn" onClick={handleSignOut}>Вийти</button>
            </>
          ) : (
            <a href="#" className={'nav-login-btn' + (currentPage === '/auth' ? ' active' : '')}
              onClick={(e) => { e.preventDefault(); onNavigate('auth') }}>
              Увійти
            </a>
          )}
        </div>
      </nav>
    </header>
  )
}
