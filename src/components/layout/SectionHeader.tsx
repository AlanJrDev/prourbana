import { SplitHeading } from '@/components/motion/SplitHeading'
import { Reveal } from '@/components/motion/Reveal'

type Props = {
  eyebrow: string
  title: readonly string[]
  lead?: string
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'dark',
}: Props) {
  return (
    <div className={`section-header section-header--${align} section-header--${tone}`}>
      <Reveal variant="fade" className="eyebrow">
        <span className="eyebrow__dot" aria-hidden="true" />
        {eyebrow}
      </Reveal>
      <SplitHeading lines={title} as="h2" className="section-header__title" />
      {lead && (
        <Reveal variant="up" delay={0.12} className="section-header__lead">
          <p>{lead}</p>
        </Reveal>
      )}
    </div>
  )
}
