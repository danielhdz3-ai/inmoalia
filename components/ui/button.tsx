import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[#2d4a3e] text-white hover:bg-[#1e3329] focus-visible:ring-[#2d4a3e] shadow-sm hover:shadow-md',
        secondary:
          'bg-[#f9f6f1] text-[#2a2a2a] border border-[#e8ddd0] hover:bg-[#e8ddd0] focus-visible:ring-[#a08c7a]',
        outline:
          'border border-[#2d4a3e] text-[#2d4a3e] bg-transparent hover:bg-[#2d4a3e] hover:text-white focus-visible:ring-[#2d4a3e]',
        ghost:
          'bg-transparent text-[#2a2a2a] hover:bg-[#f9f6f1] focus-visible:ring-[#a08c7a]',
        destructive:
          'bg-[#c0392b] text-white hover:bg-[#a93226] focus-visible:ring-[#c0392b]',
        gold:
          'bg-[#c9a84c] text-white hover:bg-[#b8972e] focus-visible:ring-[#c9a84c] shadow-sm',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-13 px-8 text-base',
        xl: 'h-14 px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
