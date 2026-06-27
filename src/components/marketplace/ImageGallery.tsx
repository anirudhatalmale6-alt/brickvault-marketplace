"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0); const current = images[index] ?? images[0];
  if (!images.length) return <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No images</div>;
  return (
    <div className="space-y-2">
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image src={current} alt={alt} fill className="object-contain" priority />
        {images.length > 1 && (
          <>
            <button onClick={() => setIndex((i) => (i === 0 ? images.length - 1 : i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => setIndex((i) => (i === images.length - 1 ? 0 : i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md"><ChevronRight className="h-5 w-5" /></button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{index + 1} / {images.length}</div>
          </>
        )}
      </div>
      {images.length > 1 && <div className="grid grid-cols-5 gap-2">{images.slice(0, 5).map((img, i) => (<button key={i} onClick={() => setIndex(i)} className={cn("relative aspect-square rounded-md overflow-hidden border-2", i === index ? "border-lego-red" : "border-transparent opacity-60")}><Image src={img} alt="" fill className="object-cover" /></button>))}</div>}
    </div>
  );
}
