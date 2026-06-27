import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { error?: string; label?: string; helperText?: string; }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, label, helperText, id, ...props }, ref) => {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input ref={ref} id={inputId} className={cn("w-full h-10 px-3 rounded-md border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-lego-red focus:border-transparent placeholder:text-gray-400 disabled:bg-gray-50", error ? "border-red-500" : "border-gray-300", className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
});
Input.displayName = "Input";
