"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { Package } from "lucide-react";
const schema = z.object({ full_name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), role: z.enum(["buyer","seller"]), password: z.string().min(6), confirm: z.string() }).refine(d => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
export function RegisterForm() {
  const router = useRouter(); const sb = createClient(); const [error, setError] = useState<string|null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { role: "buyer" } });
  async function onSubmit(v: any) {
    setError(null);
    const { data, error } = await sb.auth.signUp({ email: v.email, password: v.password, options: { data: { full_name: v.full_name, phone: v.phone ?? null, role: v.role } } });
    if (error) { setError(error.message); return; }
    if (data.user) {
      await sb.from("profiles").upsert({ id: data.user.id, email: v.email, full_name: v.full_name, phone: v.phone ?? null, role: v.role });
      if (v.role === "seller") await sb.from("seller_whatsapp_settings").upsert({ seller_id: data.user.id });
    }
    router.push("/dashboard");
  }
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center"><div className="flex justify-center mb-4"><div className="w-12 h-12 bg-lego-red rounded-lg flex items-center justify-center"><Package className="h-7 w-7 text-white" /></div></div><CardTitle className="text-2xl">Create account</CardTitle></CardHeader>
      <CardContent><form onSubmit={handleSubmit(onSubmit)} className="space-y-4">{error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}<Input label="Full name" error={errors.full_name?.message} {...register("full_name")} /><Input label="Email" type="email" error={errors.email?.message} {...register("email")} /><Input label="Phone" type="tel" {...register("phone")} /><Select label="I want to..." options={[{value:"buyer",label:"Buy LEGO"},{value:"seller",label:"Sell LEGO"}]} {...register("role")} /><Input label="Password" type="password" error={errors.password?.message} {...register("password")} /><Input label="Confirm" type="password" error={errors.confirm?.message} {...register("confirm")} /><Button type="submit" className="w-full" loading={isSubmitting}>Create account</Button><p className="text-center text-sm text-gray-600">Have an account? <Link href="/login" className="text-lego-red font-medium">Sign in</Link></p></form></CardContent>
    </Card>
  );
}
