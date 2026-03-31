import React, { useEffect } from 'react'
import { db } from '../firebase.js'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'

const lessonsData = [
  { title: "Beginner",           level: "A0", price: 150, lang: "en", desc: "Старт для тих, хто тільки починає знайомство з англійською",         text: "", audio: "" },
  { title: "Elementary",         level: "A1", price: 250, lang: "en", desc: "Допоможе закласти фундамент для подальшого навчання",                 text: "Граматика: To Be, Present Simple.", audio: "" },
  { title: "Pre-Intermediate",   level: "A2", price: 300, lang: "en", desc: "Зроби перші кроки у вивченні англійської",                            text: "Минулі часи та лексика подорожей.", audio: "" },
  { title: "Intermediate",       level: "B1", price: 400, lang: "en", desc: "Говори сміливо та впевнено",                                          text: "Стратегії ведення дискусії.", audio: "" },
  { title: "Upper-Intermediate", level: "B2", price: 450, lang: "en", desc: "Дізнайся true English не з чуток",                                    text: "Ідіоми та фразові дієслова.", audio: "" },
  { title: "Advanced",           level: "C1", price: 600, lang: "en", desc: "Високий рівень відкриває нові горизонти",                             text: "Академічне письмо та складна граматика.", audio: "" },
  { title: "Débutant",           level: "A1", price: 150, lang: "fr", desc: "Базові фрази для повсякденного спілкування французькою",              text: "Основні вирази та вітання.", audio: "" },
  { title: "Élémentaire",        level: "A2", price: 250, lang: "fr", desc: "Прості діалоги та опис знайомих ситуацій",                            text: "Ідіоми та фразові дієслова.", audio: "" },
  { title: "Intermédiaire",      level: "B1", price: 450, lang: "fr", desc: "Розмови на знайомі теми та письмові тексти середньої складності",     text: "Ідіоми та фразові дієслова.", audio: "" },
]

const ADVANTAGES = [
  { title: 'Центр міста',            desc: 'вул. Ірини Калинець, 9 неподалік від Львівської Політехніки' },
  { title: 'Зручний графік',         desc: 'Заняття відбуваються кожного дня, в зручний для студентів час' },
  { title: 'Практика',               desc: 'Speaking-Clubs з носіями англійської та французької мов' },
  { title: 'Бізнес навчання',        desc: 'Корпоративне навчання (співробітників компаній) з виїздом' },
  { title: 'Гарантія',               desc: 'По завершенню курсу — видається сертифікат' },
  { title: 'Фінансово доступний',    desc: '-5% на весь період навчання для родин' },
  { title: 'Система лояльності',     desc: 'Для постійних студентів сума за навчання НІКОЛИ не змінюється' },
  { title: 'Якість',                 desc: 'Викладачі регулярно підвищують кваліфікацію закордоном' },
  { title: 'Безкоштовне тестування', desc: 'Допоможемо визначити рівень володіння мовою' },
]

export default function HomePage() {
  useEffect(() => {
    async function autoSeed() {
      try {
        const snapshot = await getDocs(collection(db, 'lessons'))
        if (snapshot.empty || snapshot.docs.length < 9) {
          for (const d of snapshot.docs) await deleteDoc(doc(db, 'lessons', d.id))
          for (const lesson of lessonsData) await addDoc(collection(db, 'lessons'), lesson)
        }
      } catch (err) { console.error(err) }
    }
    autoSeed()
  }, [])

  return (
    <section>
      <h2><br />Наші переваги 💕</h2>
      <ul className="advantages">
        {ADVANTAGES.map((a, i) => (
          <li key={i}><strong>{a.title}</strong><span>{a.desc}</span></li>
        ))}
      </ul>
      <div className="sots">
        <h3>Підписуйтесь на наші соцмережі та пишіть нам у месенджерах</h3>
        <a href="https://www.instagram.com/sonnlxx/"><img src="instagram.jpg" alt="instagram" /></a>
        <a href="https://t.me/+08fNa4BvVtM4YjFi"><img src="telegram.jpg" alt="telegram" /></a>
      </div>
    </section>
  )
}
