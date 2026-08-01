import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

export function TooltipProvider({ children }: { children: ReactNode }): React.JSX.Element {
  return <RadixTooltip.Provider delayDuration={150}>{children}</RadixTooltip.Provider>
}

export function Tooltip({ label, children }: { label: ReactNode; children: ReactNode }): React.JSX.Element {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="top"
          sideOffset={6}
          className="z-50 max-w-64 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
        >
          {label}
          <RadixTooltip.Arrow className="fill-slate-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
