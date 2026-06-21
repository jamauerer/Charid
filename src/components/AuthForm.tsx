"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/actions/auth";
import {
  PASSWORD_REQUIREMENTS,
  checkPasswordRequirements,
} from "@/lib/password-policy";
import { dsAlertError, dsBtnPrimary, dsInput } from "@/lib/design-system";

type AuthFormProps = {
  action: (
    prevState: AuthActionState,
    formData: FormData
  ) => Promise<AuthActionState>;
  submitLabel: string;
  showConfirmPassword?: boolean;
  alternateHref: string;
  alternateLabel: string;
};

const initialState: AuthActionState = {};

function RequirementLine({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <li
      className={`flex items-center gap-2 text-xs ${
        met ? "text-[var(--status-success-text)]" : "text-neutral-500"
      }`}
    >
      <span aria-hidden>{met ? "✓" : "○"}</span>
      {label}
    </li>
  );
}

export function AuthForm({
  action,
  submitLabel,
  showConfirmPassword = false,
  alternateHref,
  alternateLabel,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [password, setPassword] = useState("");
  const checks = useMemo(
    () => checkPasswordRequirements(password),
    [password]
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={dsInput}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-900">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={
            showConfirmPassword ? "new-password" : "current-password"
          }
          required
          minLength={showConfirmPassword ? 8 : undefined}
          value={showConfirmPassword ? password : undefined}
          onChange={
            showConfirmPassword
              ? (event) => setPassword(event.target.value)
              : undefined
          }
          className={dsInput}
        />

        {showConfirmPassword && (
          <ul className="mt-2 space-y-1 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] p-3">
            {PASSWORD_REQUIREMENTS.map((requirement) => (
              <RequirementLine
                key={requirement.id}
                met={checks[requirement.id]}
                label={requirement.label}
              />
            ))}
          </ul>
        )}
      </div>

      {showConfirmPassword && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-neutral-900"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={dsInput}
          />
        </div>
      )}

      {state.error && (
        <p className={`whitespace-pre-line ${dsAlertError}`}>{state.error}</p>
      )}

      <button type="submit" disabled={pending} className={`w-full ${dsBtnPrimary}`}>
        {pending ? "Please wait..." : submitLabel}
      </button>

      <p className="text-center text-sm text-neutral-600">
        <Link href={alternateHref} className="font-medium text-[var(--brand-accent)] hover:text-[var(--brand-accent)]">
          {alternateLabel}
        </Link>
      </p>
    </form>
  );
}
