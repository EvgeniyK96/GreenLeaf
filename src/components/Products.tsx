import { products as copy } from '../content/copy'
import { productList } from '../content/products'
import { site } from '../content/site'
import { pv, rub } from '../lib/format'
import ui from './ui.module.css'
import styles from './Products.module.css'

export function Products() {
  return (
    <section id="produkciya" className={`${ui.section} ${styles.section}`} aria-labelledby="products-title">
      <div className={ui.container}>
        <h2 id="products-title" className={ui.h2} data-reveal="up">
          {copy.title}
        </h2>
        <p className={ui.lead} data-reveal="up" style={{ ['--i' as string]: 1 }}>
          {copy.lead}
        </p>
        <ul className={styles.tags}>
          {productList.map((p, i) => (
            <li key={p.name} className={styles.tag} data-reveal="scale" style={{ ['--i' as string]: i }}>
              <a href={p.sectionUrl} target="_blank" rel="noopener" className={styles.section_}>
                {p.section}
                <span className="visually-hidden"> — раздел каталога, откроется в новой вкладке</span>
              </a>
              <p className={styles.name}>
                {p.name}
                {p.isSupplement && <sup aria-hidden="true">*</sup>}
              </p>
              <p className={styles.prices}>
                <span className={styles.retail}>
                  <span className="visually-hidden">Розница </span>
                  <s>{rub(p.retail)}</s>
                </span>
                <span className={styles.partner}>
                  <span className="visually-hidden">Партнёрская цена </span>
                  {rub(p.partner)}
                </span>
              </p>
              <p className={styles.pv}>{pv(p.pv)} PV</p>
            </li>
          ))}
        </ul>
        <p className={`${ui.note} ${styles.note}`} data-reveal="fade">
          {copy.note} <span aria-hidden="true">*</span> {copy.badNote}
        </p>
        <a href={site.catalogUrl} target="_blank" rel="noopener" className={`${ui.btn} ${ui.secondary} ${styles.more}`}
          data-reveal="up"
        >
          {copy.catalogLink}
        </a>
      </div>
    </section>
  )
}
