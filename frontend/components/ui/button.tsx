import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/libs/utils";
import { DotsLoading } from "../icons/three-dots-loading";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default:
          "rounded-full border-none bg-primary text-neutral-900 outline-none !ring-offset-0 hover:bg-primary/90",
        destructive:
          "rounded-full border border-error text-error dark:text-neutral-50",
        outline:
          "rounded-full border border-secondary bg-transparent text-secondary !ring-0 hover:opacity-90",
        light:
          "rounded-full border border-neutral-300 bg-transparent text-neutral-600 hover:opacity-90",
        secondary: "rounded-full bg-secondary text-white hover:opacity-90",
        ghost: "rounded-full hover:opacity-85",
        link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
        pale: "rounded-full bg-thirdColor text-black hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      children,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        // disabled={isLoading}
      >
        {isLoading ? <DotsLoading className="w-5" /> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
