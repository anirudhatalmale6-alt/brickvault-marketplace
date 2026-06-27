import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { error?: string; label?: string; }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, label, id, ...props }, ref) => {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea ref={ref} id={inputId} className={cn("w-full min-h-[100px] px-3 py-2 rounded-md border bg-white text-sm resize-y focus:outline-none focus:ring-2 focus:ring-lego-red focus:border-transparent", error ? "border-red-500" : "border-gray-300", className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Textarea.displayName = "Textarea";
