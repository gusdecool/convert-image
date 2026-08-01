import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { Tooltip } from './tooltip'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  disabledReason?: string
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  id?: string
}

export function Select({ value, onValueChange, options, id }: SelectProps): React.JSX.Element {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        id={id}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
      >
        <RadixSelect.Value />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-slate-500" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => {
              const item = (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm outline-none data-[disabled]:cursor-not-allowed data-[disabled]:text-slate-300 data-[highlighted]:bg-blue-50"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <Check className="size-4 text-blue-600" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              )
              return option.disabled && option.disabledReason ? (
                <Tooltip key={option.value} label={option.disabledReason}>
                  <div>{item}</div>
                </Tooltip>
              ) : (
                item
              )
            })}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
