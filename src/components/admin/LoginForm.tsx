"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

export default function LoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {from && <input type="hidden" name="from" value={from} />}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-paper/60"
        >
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
          className="w-full rounded-[3px] border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper outline-none transition-colors focus:border-gold"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-paper/60"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-[3px] border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper outline-none transition-colors focus:border-gold"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[3px] border border-gold bg-gold px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {pending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
