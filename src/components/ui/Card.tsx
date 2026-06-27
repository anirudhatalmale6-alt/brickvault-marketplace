import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bg-white border border-gray-200 rounded-lg shadow-sm", className)} {...props} />
));
Card.displayName = "Card";
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-4 border-b border-gray-200", className)} {...props} />; }
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props} />; }
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-4", className)} {...props} />; }
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg", className)} {...props} />; }
