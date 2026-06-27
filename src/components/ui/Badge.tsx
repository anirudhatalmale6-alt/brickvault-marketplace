import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
type Variant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { variant?: Variant; }
const variants: Record<Variant, string> = { default: "bg-gray-100 text-gray-800", primary: "bg-lego-red text-white", success: "bg-green-100 text-green-800", warning: "bg-yellow-100 text-yellow-900", danger: "bg-red-100 text-red-800", info: "bg-blue-100 text-blue-800", outline: "border border-gray-300 text-gray-700 bg-white" };
export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)} {...props} />;
}
