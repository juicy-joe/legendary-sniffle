import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-paper">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-center font-serif text-2xl font-medium">
          Sa<span className="text-gold">Fa</span>Light
        </p>
        <p className="mb-10 text-center text-[11px] uppercase tracking-[0.2em] text-paper/50">
          Admin
        </p>
        <LoginForm from={from} />
      </div>
    </div>
  );
}
