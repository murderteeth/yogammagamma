import React, { forwardRef, ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  return <button ref={ref} {...props} className={`
    px-6 py-2 flex items-center justify-center
    bg-zinc-950 border-2 border-black text-zinc-400 rounded
    hover:border-green-500 hover:text-green-500
    active:border-green-700 active:text-green-700
    disabled:border-zinc-950 disabled:text-zinc-800
    hover:disabled:border-zinc-950 hover:disabled:text-zinc-800
    ${className}`}>
    {children}
  </button>
})

Button.displayName = 'Button'

export default Button