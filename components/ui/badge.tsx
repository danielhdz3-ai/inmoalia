import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#2d4a3e] text-white',
        secondary: 'border-transparent bg-[#f9f6f1] text-[#6b5344]',
        outline: 'border-[#e8ddd0] text-[#6b5344]',
        gold: 'border-transparent bg-[#c9a84c] text-white',
        sale: 'border-transparent bg-[#c0392b] text-white',
        new: 'border-transparent bg-[#2d4a3e] text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
