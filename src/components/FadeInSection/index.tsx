import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface FadeInSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeInSection({ children, className, delay = 0 }: FadeInSectionProps) {
  const ref  = useRef<HTMLDivElement>(null)
  const isInView       = useInView(ref, { once: true, margin: '-6% 0px' })
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: prefersReduced ? 0 : 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: prefersReduced ? 0 : 0.52,
        delay:    prefersReduced ? 0 : delay,
        ease:     EASE_OUT_EXPO,
      }}
    >
      {children}
    </motion.div>
  )
}
