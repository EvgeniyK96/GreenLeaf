import { useEffect, useState } from 'react'
import { stickyCta } from '../content/copy'
import styles from './StickyCta.module.css'
import { wakeIsland } from '../lib/islands'

/** Мобильная липкая кнопка: появляется после hero, прячется у формы. */
export function StickyCta() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    const form = document.getElementById('zayavka')
    if (!hero || !form || typeof IntersectionObserver === 'undefined') return
    let heroVisible = true
    let formVisible = false
    const update = () => {
      const v = !heroVisible && !formVisible
      if (v) setMounted(true)
      setVisible(v)
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) heroVisible = e.isIntersecting
        if (e.target === form) formVisible = e.isIntersecting
      })
      update()
    })
    io.observe(hero)
    io.observe(form)
    return () => io.disconnect()
  }, [])

  // Монтируется при первом появлении: до этого на странице нет лишнего fixed-слоя
  if (!mounted) return null
  return (
    <div className={`${styles.bar} ${visible ? styles.on : ''}`} aria-hidden={!visible}>
      <a href="#zayavka" onClick={() => wakeIsland('zayavka')} className={styles.btn} tabIndex={visible ? 0 : -1}>
        {stickyCta}
      </a>
    </div>
  )
}
