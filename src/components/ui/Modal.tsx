"use client";
import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
interface ModalProps { open: boolean; onClose: () => void; title?: string; children: ReactNode; size?: "sm" | "md" | "lg" | "xl"; }
const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };
export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto", sizes[size])}>
        {title && <div className="flex items-center justify-between p-4 border-b"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100"><X className="h-5 w-5" /></button></div>}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
