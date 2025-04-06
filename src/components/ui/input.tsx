import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn("input input-bordered w-full", className)}
      ref={ref}
      {...props}
    />
  );
});
