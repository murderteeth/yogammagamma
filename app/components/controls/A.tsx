import React, { forwardRef, AnchorHTMLAttributes } from 'react'

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  className?: string
}

const A = forwardRef<HTMLAnchorElement, AnchorProps>(({ className, children, ...props }, ref) => (
  <a ref={ref} {...props} className={`
  decoration-2 decoration-dashed decoration-black underline underline-offset-4
  hover:text-green-500 hover:decoration-green-500
  active:text-green-700 active:decoration-green-700
  ${className}`}>
    {children}
  </a>
))

A.displayName = 'A'

export default A