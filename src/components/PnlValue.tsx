interface PnlValueProps {
  value: number
  suffix?: string
  className?: string
}

export const PnlValue = ({ value, suffix = '', className = '' }: PnlValueProps) => {
  const isPositive = value >= 0
  const sign = isPositive ? '+' : ''

  return (
    <span className={`number ${isPositive ? 'text-[#16c784]' : 'text-[#ea3943]'} ${className}`}>
      {sign}
      {value.toFixed(2)}
      {suffix}
    </span>
  )
}
