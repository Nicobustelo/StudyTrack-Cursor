import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Botones "físicos" StudyTrack (spec 6.4): radio 16px (rounded-lg = --radius),
 * texto bold, sombra inferior dura tipo tecla y active con translate-y.
 * CTAs principales: usar size "lg" (52px) o "xl" (56px).
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-bold whitespace-nowrap transition-all duration-100 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_0_0_var(--st-green-dark)] hover:bg-[color-mix(in_oklab,var(--st-green),white_8%)] active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--st-green-dark)] disabled:bg-locked disabled:text-white disabled:shadow-[0_4px_0_0_#b7c1ba]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_4px_0_0_color-mix(in_oklab,var(--st-green-light),var(--st-green-dark)_28%)] hover:bg-[color-mix(in_oklab,var(--st-green-light),white_20%)] active:translate-y-[3px] active:shadow-[0_1px_0_0_color-mix(in_oklab,var(--st-green-light),var(--st-green-dark)_28%)] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
        outline:
          "border-border bg-surface text-foreground shadow-[0_4px_0_0_var(--st-border)] hover:bg-muted aria-expanded:bg-muted active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--st-border)] disabled:opacity-50 disabled:shadow-none dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground active:translate-y-px disabled:opacity-50 dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 active:translate-y-px focus-visible:border-destructive/40 focus-visible:ring-destructive/20 disabled:opacity-50 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline disabled:opacity-50",
      },
      size: {
        default:
          "h-11 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[min(var(--radius-md),12px)] px-3 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-13 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        xl: "h-14 gap-2 px-8 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-13 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      render={render}
      nativeButton={nativeButton ?? (render ? false : undefined)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
