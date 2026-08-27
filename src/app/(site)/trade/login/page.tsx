import type { Metadata } from "next";
import Link from "next/link";
import WholesaleLoginForm from "@/components/WholesaleLoginForm";

export const metadata: Metadata = {
  title: "Trade Login",
  robots: { index: false, follow: false },
};

export default async function TradeLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-20 md:px-10">
      <p className="mb-2 text-center font-serif text-2xl font-light text-ink">Trade Login</p>
      <p className="mb-10 text-center text-sm text-ink/60">Sign in to see your trade pricing.</p>
      <WholesaleLoginForm from={from} />
      <p className="mt-8 text-center text-sm text-ink/60">
        Don&rsquo;t have a trade account?{" "}
        <Link href="/trade/apply" className="text-gold-dark hover:underline">
          Apply here
        </Link>
      </p>
    </div>
  );
}
