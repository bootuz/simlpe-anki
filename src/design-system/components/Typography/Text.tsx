import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva(
  "leading-normal",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        secondary: "text-secondary-foreground",
        destructive: "text-destructive",
        success: "text-green-600",
        warning: "text-yellow-600",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      },
      truncate: {
        true: "truncate",
        false: "",
      },
    },
    defaultVariants: {
      size: "base",
      variant: "default",
      weight: "normal",
      align: "left",
      truncate: false,
    },
  }
);

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label";
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, variant, weight, align, truncate, as = "p", ...props }, ref) => {
    const Comp = as;
    
    return (
      <Comp
        className={cn(textVariants({ size, variant, weight, align, truncate, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Text.displayName = "Text";

export { Text, textVariants };