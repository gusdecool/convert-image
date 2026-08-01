import * as RadixSlider from '@radix-ui/react-slider'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onValueChange: (value: number) => void
  id?: string
}

export function Slider({ value, min, max, step = 1, onValueChange, id }: SliderProps): React.JSX.Element {
  return (
    <RadixSlider.Root
      id={id}
      className="relative flex h-5 w-full touch-none items-center select-none"
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([next]) => onValueChange(next)}
    >
      <RadixSlider.Track className="relative h-1.5 grow rounded-full bg-slate-200">
        <RadixSlider.Range className="absolute h-full rounded-full bg-blue-600" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block size-4 rounded-full border-2 border-blue-600 bg-white shadow outline-none" />
    </RadixSlider.Root>
  )
}
