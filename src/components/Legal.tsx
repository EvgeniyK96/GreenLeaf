import { legal } from '../content/copy'
import { owner } from '../content/owner'
import { site } from '../content/site'
import { LeafMark } from './LeafMark'
import { Ph } from './Ph'
import ui from './ui.module.css'
import styles from './Legal.module.css'

export function Legal() {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.brand}>
          <LeafMark size={36} />
          <p>
            Страница партнёра GreenLeaf Family
            <br />
            {owner.name}
          </p>
        </div>
        <div className={styles.text}>
          <p>{legal.text}</p>
          <p>
            {legal.ownerLabel} <Ph value={owner.legalName} fallback="данные уточняются" />
          </p>
        </div>
        <div className={styles.cols}>
          <div>
            <p className={styles.colTitle}>{legal.companyTitle}</p>
            <ul>
              <li>
                <a href={site.company.phoneHref}>{site.company.phone}</a>
              </li>
              <li>
                <a href={`mailto:${site.company.email}`}>{site.company.email}</a>
              </li>
              <li>
                <a href={site.company.siteUrl} target="_blank" rel="noopener">
                  {site.company.site}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className={styles.colTitle}>Документы</p>
            <ul>
              <li>
                <a href={site.planPdf} target="_blank" rel="noopener">
                  {legal.planLink}
                </a>
              </li>
              <li>
                <a href={site.privacyUrl}>{legal.privacyLink}</a>
              </li>
              <li>
                <a href={site.consentUrl}>{legal.consentLink}</a>
              </li>
            </ul>
          </div>
        </div>
        <a href="#top" className={styles.top}>
          {legal.toTop}
        </a>
      </div>
    </footer>
  )
}
