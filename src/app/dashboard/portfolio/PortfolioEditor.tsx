"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  type ProfileActionState,
} from "@/app/actions/profile";
import { PortfolioPreview } from "@/components/portfolio/PortfolioPreview";
import { PublicPortfolioAccess } from "@/components/portfolio/PublicPortfolioAccess";
import { inputClassName } from "@/components/CharacterFormFields";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import type { Profile } from "@/types/profile";
import { sanitizeUsername } from "@/types/profile";
import { dsAlertWarning, dsAlertError, dsAlertSuccess, dsBtnPrimary } from "@/lib/design-system";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: ProfileActionState = {};

type PortfolioEditorProps = {
  initialProfile: Profile;
  initialAvatarUrl: string | null;
};

export function PortfolioEditor({
  initialProfile,
  initialAvatarUrl,
}: PortfolioEditorProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  const [profile, setProfile] = useState(initialProfile);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const publicUrl = getPortfolioPublicUrl(profile.username);
  const hasUnsavedVisibility = isPublic !== profile.is_public;
  const hasUnsavedUsername = username !== profile.username;

  useEffect(() => {
    if (state.success && state.profile) {
      setProfile(state.profile);
      setUsername(state.profile.username);
      setDisplayName(state.profile.display_name ?? "");
      setBio(state.profile.bio ?? "");
      setIsPublic(state.profile.is_public);
      if (state.avatarUrl !== undefined) {
        setAvatarUrl(state.avatarUrl);
      }
      setAvatarPreview(null);
      formRef.current?.reset();
      setJustSaved(true);
      router.refresh();
    }
  }, [state.success, state.profile, state.avatarUrl, router]);

  useEffect(() => {
    if (!justSaved) return;
    const timer = window.setTimeout(() => setJustSaved(false), 3000);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 border-b border-[var(--brand-border)] pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Portfolio
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Edit your workspace below. Use public presentation to see and share
          what visitors experience.
        </p>
      </div>

      <PublicPortfolioAccess
        username={profile.username}
        isPublic={profile.is_public}
        hasUnsavedVisibility={hasUnsavedVisibility}
        copied={copied}
        onCopyLink={handleCopyLink}
      />

      {hasUnsavedUsername && (
        <p className={`mb-4 ${dsAlertWarning}`}>
          Save to update your public URL to{" "}
          <span className="font-medium">{getPortfolioPublicUrl(username)}</span>.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <form ref={formRef} action={formAction} className="space-y-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-secondary)]">
            Workspace
          </p>
          <fieldset className="space-y-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
              Profile
            </legend>

            <div>
              <label htmlFor="username" className={labelClassName}>
                Username
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--brand-text-secondary)]">@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(sanitizeUsername(e.target.value))
                  }
                  maxLength={30}
                  className={inputClassName}
                  placeholder="yourname"
                />
              </div>
              <p className="mt-1.5 text-xs text-[var(--brand-text-secondary)]">
                3–30 characters: a-z, 0-9, -, _
              </p>
            </div>

            <div>
              <label htmlFor="display_name" className={labelClassName}>
                Display Name
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClassName}
                placeholder="Your display name"
              />
            </div>

            <div>
              <label htmlFor="bio" className={labelClassName}>
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={inputClassName}
                placeholder="Tell visitors about your creative work..."
              />
            </div>

            <div>
              <span className={labelClassName}>Avatar</span>
              <div className="mb-3 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]">
                  {(avatarPreview ?? avatarUrl) ? (
                    <Image
                      src={avatarPreview ?? avatarUrl!}
                      alt="Avatar preview"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[var(--brand-text-secondary)]">
                      {(displayName || profile.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="w-full text-sm text-[var(--brand-text-secondary)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--tag-primary-bg)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--brand-accent)]"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
              Visibility
            </legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5 transition hover:bg-[var(--brand-surface-elevated)]">
              <input
                type="radio"
                name="is_public"
                value="true"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="accent-[var(--brand-accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--brand-text-secondary)]">
                  Public
                </span>
                <span className="block text-xs text-[var(--brand-text-secondary)]">
                  Anyone with your link can view your portfolio
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5 transition hover:bg-[var(--brand-surface-elevated)]">
              <input
                type="radio"
                name="is_public"
                value="false"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="accent-[var(--brand-accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--brand-text-secondary)]">
                  Private
                </span>
                <span className="block text-xs text-[var(--brand-text-secondary)]">
                  Your portfolio page is hidden from visitors
                </span>
              </span>
            </label>
          </fieldset>

          <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
            <p className={labelClassName}>Share URL</p>
            <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
              Updates when you save a new username. Use the public presentation
              section above to view or copy your live link.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 truncate rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm text-[var(--brand-text-secondary)]">
                {publicUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--foreground)]"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          {state.error && (
            <p className={dsAlertError}>{state.error}</p>
          )}
          {state.success && (
            <p className={dsAlertSuccess}>Portfolio saved.</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className={`${dsBtnPrimary} px-5 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {pending ? "Saving..." : justSaved ? "Saved ✓" : "Save Portfolio"}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-secondary)]">
            Workspace preview
          </p>
          <PortfolioPreview
          profile={{ ...profile, username: username || profile.username }}
          avatarUrl={avatarUrl}
          avatarPreview={avatarPreview}
          displayName={displayName}
          bio={bio}
          isPublic={isPublic}
        />
        </div>
      </div>
    </div>
  );
}
