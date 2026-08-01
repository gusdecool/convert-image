import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from '@renderer/lib/cn'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
}

export function Switch({ checked, onCheckedChange, id, className }: SwitchProps): React.JSX.Element {
  return (
    <RadixSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full bg-slate-300 outline-none transition-colors data-[state=checked]:bg-blue-600',
        className
      )}
    >
      <RadixSwitch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5" />
    </RadixSwitch.Root>
  )
}
