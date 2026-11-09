import { nav } from '../content/site'
import { owner } from '../content/owner'
import { LeafMark } from './LeafMark'
import ui from './ui.module.css'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`${ui.container} ${styles.inner}`}>
        <a href="#top" className={styles.brand}>
          <LeafMark />
          <span className={styles.brandText}>
            <span className={styles.brandName}>GreenLeaf Family</span>
            <span className={styles.brandSub}>страница партнёра {owner.nameGenitive}</span>
          </span>
        </a>
        <nav aria-label="Разделы страницы" className={styles.nav}>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#zayavka" className={`${ui.btn} ${ui.primary} ${ui.small} ${styles.cta}`}>
          Написать
        </a>
      </div>
    </header>
  )
}
