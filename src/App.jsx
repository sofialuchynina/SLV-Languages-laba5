import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import LessonsPage from './pages/LessonsPage.jsx'
import ProgressPage from './pages/ProgressPage.jsx'
import PracticePage from './components/PracticePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import { db } from './firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function AppInner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [completedIds, setCompleted] = useState([])
  const [startedIds, setStarted]     = useState([])

  // Завантаження прогресу з Firestore при логіні
  useEffect(() => {
    if (!user) { setCompleted([]); setStarted([]); return }
    async function loadProgress() {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          setCompleted(snap.data().completedIds || [])
          setStarted(snap.data().startedIds || [])
        }
      } catch (err) { console.error(err) }
    }
    loadProgress()
  }, [user])

  async function saveProgress(completed, started) {
    if (!user) return
    try {
      await setDoc(doc(db, 'users', user.uid), {
        completedIds: completed,
        startedIds: started,
        email: user.email
      })
    } catch (err) { console.error(err) }
  }

  function handleStart(id) {
    if (startedIds.includes(id)) return
    const newStarted = [...startedIds, id]
    setStarted(newStarted)
    saveProgress(completedIds, newStarted)
  }

  // HTTP POST на сервер при завершенні уроку
  async function handleComplete(id, lessonData) {
    const newCompleted = completedIds.includes(id) ? completedIds : [...completedIds, id]
    const newStarted = startedIds.filter(s => s !== id)
    setCompleted(newCompleted)
    setStarted(newStarted)
    saveProgress(newCompleted, newStarted)

    if (user) {
      try {
        await fetch(`${SERVER_URL}/api/completed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid, lessonId: id,
            lessonTitle: lessonData?.title || '',
            lessonLevel: lessonData?.level || '',
            lessonLang:  lessonData?.lang  || '',
          })
        })
      } catch (err) { console.error(err) }
    }
  }

  function handleUncomplete(id) {
    const newCompleted = completedIds.filter(c => c !== id)
    setCompleted(newCompleted)
    saveProgress(newCompleted, startedIds)
  }

  function handleUnstart(id) {
    const newStarted = startedIds.filter(s => s !== id)
    setStarted(newStarted)
    saveProgress(completedIds, newStarted)
  }

  function handleSignOut() {
    setCompleted([]); setStarted([])
    navigate('/')
  }

  const isHome = location.pathname === '/'

  return (
    <div>
      <Header
        variant={isHome ? 'home' : 'inner'}
        currentPage={location.pathname}
        onNavigate={(page) => navigate(page === 'home' ? '/' : '/' + page)}
        onSignOut={handleSignOut}
      />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lessons" element={
            <LessonsPage completedIds={completedIds} startedIds={startedIds}
              onStart={handleStart} onComplete={handleComplete} />
          } />
          <Route path="/progress" element={
            user
              ? <ProgressPage completedIds={completedIds} startedIds={startedIds}
                  onUncomplete={handleUncomplete} onUnstart={handleUnstart}
                  onNavigate={(page) => navigate('/' + page)} serverUrl={SERVER_URL} />
              : <AuthPage />
          } />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  )
}
