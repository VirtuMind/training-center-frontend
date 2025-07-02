import * as React from "react"

import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const ProgressComponent = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <div
          className="absolute left-0 top-0 h-4 bg-primary transition-all"
          style={{ width: `${((value || 0) / (max || 1)) * 100}%` }}
        />
      </div>
    )
  },
)
ProgressComponent.displayName = "Progress"

export { ProgressComponent, ProgressComponent as Progress }
