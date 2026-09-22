import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  value: string
  onChange: (val: string) => void
  onComplete?: (val: string) => void
  disabled?: boolean
  className?: string
}

export function OTPInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '')

  const handleChange = (index: number, char: string) => {
    const sanitized = char.replace(/\D/g, '')
    if (!sanitized) return

    const newDigits = [...digits]
    newDigits[index] = sanitized[sanitized.length - 1] // Take last character if multiple
    const combined = newDigits.join('').slice(0, 6)
    onChange(combined)

    if (index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (combined.length === 6 && onComplete) {
      onComplete(combined)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join(''))
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      onChange(pasted)
      const targetIndex = Math.min(pasted.length, 5)
      inputRefs.current[targetIndex]?.focus()
      if (pasted.length === 6 && onComplete) {
        onComplete(pasted)
      }
    }
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)} onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={cn(
            'w-11 h-14 rounded-xl text-center font-mono text-2xl font-bold bg-card border border-border text-foreground transition-all shadow-xs',
            'focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  )
}
