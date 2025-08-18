import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const captionVariants = cva(
  "text-muted-foreground",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
      },
      variant: {
        default: "text-muted-foreground",
        subtle: "text-muted-foreground/70",
        primary: "text-primary/70",
        destructive: "text-destructive/70",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      uppercase: {
        true: "uppercase tracking-wider",
        false: "",
      },
    },
    defaultVariants: {
      size: "sm",
      variant: "default",
      weight: "normal",
      align: "left",
      uppercase: false,
    },
  }
);

export interface CaptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof captionVariants> {
  as?: "p" | "span" | "div" | "caption";
}

const Caption = React.forwardRef<HTMLParagraphElement, CaptionProps>(
  ({ className, size, variant, weight, align, uppercase, as = "p", ...props }, ref) => {
    const Comp = as;
    
    return (
      <Comp
        className={cn(captionVariants({ size, variant, weight, align, uppercase, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Caption.displayName = "Caption";

export { Caption, captionVariants };