import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import './SectionHeading.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface SectionHeadingProps {
  number: string
  title: string
}

export function SectionHeading({ number, title }: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className="section-heading"
      initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: prefersReduced ? 0 : 0.5, ease: EASE }}
    >
      <span className="section-heading__eyebrow">{number}</span>
      <h2 className="section-heading__title">{title}</h2>
    </motion.div>
  )
}
