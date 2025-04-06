import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "btn",
          {
            "btn-primary": variant === "default",
            "btn-outline": variant === "outline",
            "btn-md": size === "default",
            "btn-sm": size === "sm",
            "btn-lg": size === "lg",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
