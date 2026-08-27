"use client";

import { useActionState } from "react";
import { setWholesalePassword, type SetPasswordState } from "@/app/(site)/trade/set-password/actions";

const initialState: SetPasswordState = {};

export default function WholesaleSetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(setWholesalePassword, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          autoFocus
          className="w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
        />
        {state.fieldErrors?.password && (
          <p role="alert" className="mt-1.5 text-xs text-red-700">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
        />
        {state.fieldErrors?.confirmPassword && (
          <p role="alert" className="mt-1.5 text-xs text-red-700">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Set Password & Log In"}
      </button>
    </form>
  );
}
