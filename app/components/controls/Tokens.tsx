'use client'

import { useMemo } from 'react'
import { formatUnits } from 'viem'

export default function Tokens({
  amount, decimals, accuracy, padStart
}: { 
  amount: bigint, decimals: number, accuracy?: number, padStart?: number
}) {
  const formatted = useMemo(() => {
    const units = formatUnits(amount, decimals)
    const separator = Intl.NumberFormat().format(1.1).charAt(1)
    const [ whole, fraction ] = units.split(separator)
    return `${whole.padStart(padStart || 0, '0')}.${(fraction || '0'.repeat(accuracy || 2)).slice(0, accuracy || 2)}`
  }, [amount, decimals, padStart])

  return <span className="font-mono">{formatted}</span>
}
