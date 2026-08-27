"use client";

import { useActionState } from "react";
import { wholesaleLogin, type WholesaleLoginState } from "@/app/(site)/trade/login/actions";

const initialState: WholesaleLoginState = {};

export default function WholesaleLoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState(wholesaleLogin, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {from && <input type="hidden" name="from" value={from} />}

      <div>
        <label htmlFor="email" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Email
        </label>
        <input
          key={state.email ?? "initial"}
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          defaultValue={state.email}
          className="w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {pending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
