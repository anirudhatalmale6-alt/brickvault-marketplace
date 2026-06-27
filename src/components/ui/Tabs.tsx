"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
type TabsContextValue = { value: string; onChange: (v: string) => void };
const TabsContext = createContext<TabsContextValue>({ value: "", onChange: () => {} });
export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) { const [value, setValue] = useState(defaultValue); return <TabsContext.Provider value={{ value, onChange: setValue }}><div>{children}</div></TabsContext.Provider>; }
export function TabsList({ children }: { children: ReactNode }) { return <div className="flex gap-1 border-b border-gray-200 mb-4">{children}</div>; }
export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) { const ctx = useContext(TabsContext); return <button onClick={() => ctx.onChange(value)} className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", ctx.value === value ? "border-lego-red text-lego-red" : "border-transparent text-gray-600 hover:text-gray-900")}>{children}</button>; }
export function TabsContent({ value, children }: { value: string; children: ReactNode }) { const ctx = useContext(TabsContext); if (ctx.value !== value) return null; return <div>{children}</div>; }
