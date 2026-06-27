"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { Package } from "lucide-react";
export function LoginForm() {
  const router = useRouter(); const sb = createClient(); const [error, setError] = useState<string|null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(z.object({ email: z.string().email(), password: z.string().min(6) })) });
  async function onSubmit(v: any) { setError(null); const { error } = await sb.auth.signInWithPassword(v); if (error) { setError(error.message); return; } router.push("/dashboard"); }
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center"><div className="flex justify-center mb-4"><div className="w-12 h-12 bg-lego-red rounded-lg flex items-center justify-center"><Package className="h-7 w-7 text-white" /></div></div><CardTitle className="text-2xl">Welcome back</CardTitle></CardHeader>
      <CardContent><form onSubmit={handleSubmit(onSubmit)} className="space-y-4">{error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}<Input label="Email" type="email" error={errors.email?.message} {...register("email")} /><Input label="Password" type="password" error={errors.password?.message} {...register("password")} /><Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button><p className="text-center text-sm text-gray-600">No account? <Link href="/register" className="text-lego-red font-medium">Register</Link></p></form></CardContent>
    </Card>
  );
}
