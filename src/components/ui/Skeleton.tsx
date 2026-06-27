import { cn } from "@/lib/utils";
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} {...props} />; }
export function ListingCardSkeleton() { return (<div className="border border-gray-200 rounded-lg overflow-hidden"><Skeleton className="aspect-square w-full" /><div className="p-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-5 w-1/3" /></div></div>); }
