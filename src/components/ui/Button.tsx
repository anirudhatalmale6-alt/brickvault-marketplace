"use client";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "icon";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; }
const variantStyles: Record<Variant, string> = {
  primary: "bg-lego-red text-white hover:bg-red-700 shadow-sm",
  secondary: "bg-lego-blue text-white hover:bg-blue-700 shadow-sm",
  outline: "border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-lego-green text-white hover:bg-green-700",
};
const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-md", md: "h-10 px-4 text-sm rounded-md",
  lg: "h-12 px-6 text-base rounded-lg", icon: "h-10 w-10 rounded-md",
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading}
      className={cn("inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lego-red disabled:opacity-50 disabled:cursor-not-allowed", variantStyles[variant], sizeStyles[size], className)} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
