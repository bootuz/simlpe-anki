import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva(
  "font-semibold tracking-tight",
  {
    variants: {
      level: {
        1: "text-4xl font-bold tracking-tight lg:text-5xl",
        2: "text-3xl font-bold tracking-tight",
        3: "text-2xl font-semibold",
        4: "text-xl font-semibold",
        5: "text-lg font-medium",
        6: "text-base font-medium tracking-wide",
      },
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        destructive: "text-destructive",
        gradient: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      level: 1,
      variant: "default",
      align: "left",
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  asChild?: boolean;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, variant, align, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : (`h${level}` as keyof JSX.IntrinsicElements);
    
    return (
      <Comp
        className={cn(headingVariants({ level, variant, align, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Heading.displayName = "Heading";

export { Heading, headingVariants };