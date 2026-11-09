import { MotionConfig } from 'motion/react'
import { Island } from './components/Island'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { FactsStrip } from './components/FactsStrip'
import { WhyNow } from './components/WhyNow'
import { Paths } from './components/Paths'
import { Calculator } from './components/Calculator'
import { Bonuses } from './components/Bonuses'
import { Scale } from './components/Scale'
import { Products } from './components/Products'
import { Packages } from './components/Packages'
import { Steps } from './components/Steps'
import { Stories } from './components/Stories'
import { Faq } from './components/Faq'
import { LeadForm } from './components/LeadForm'
import { Legal } from './components/Legal'
import { StickyCta } from './components/StickyCta'
import { LeadModal } from './components/LeadModal'

/** Порядок блоков: узнал → поверил → посчитал → понял, за что платят → страх снят → действие. */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        К содержимому
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Island id="fakty">
          <FactsStrip />
        </Island>
        <Island id="vygoda">
          <WhyNow />
        </Island>
        <Island id="puti">
          <Paths />
        </Island>
        <Island id="kalkulyator">
          <Calculator />
        </Island>
        <Island id="nachisleniya">
          <Bonuses />
        </Island>
        <Island id="podderzhka">
          <Scale />
        </Island>
        <Island id="produkciya">
          <Products />
        </Island>
        <Island id="nabory">
          <Packages />
        </Island>
        <Island id="start">
          <Steps />
        </Island>
        <Island id="istorii">
          <Stories />
        </Island>
        <Island id="voprosy">
          <Faq />
        </Island>
        <Island id="zayavka">
          <LeadForm />
        </Island>
      </main>
      <Island id="footer">
        <Legal />
      </Island>
      <StickyCta />
      <LeadModal />
    </MotionConfig>
  )
}
