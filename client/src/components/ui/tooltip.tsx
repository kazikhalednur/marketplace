import * as React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

export function Tooltip({ children, ...props }: RadixTooltip.TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={200} skipDelayDuration={0}>
      <RadixTooltip.Root {...props}>{children}</RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}

export const TooltipTrigger = RadixTooltip.Trigger;

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  RadixTooltip.TooltipContentProps
>(({ className, sideOffset = 8, ...props }, ref) => (
  <RadixTooltip.Content
    ref={ref}
    sideOffset={sideOffset}
    className={
      'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95 ' +
      (className || '')
    }
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent'; 