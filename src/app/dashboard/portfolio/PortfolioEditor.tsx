"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  updateProfile,
  type ProfileActionState,
} from "@/app/actions/profile";
import { PortfolioPreview } from "@/components/portfolio/PortfolioPreview";
import { inputClassName } from "@/components/CharacterFormFields";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import type { Profile } from "@/types/profile";
import { sanitizeUsername } from "@/types/profile";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500";

const initialState: ProfileActionState = {};

type PortfolioEditorProps = {
  initialProfile: Profile;
  initialAvatarUrl: string | null;
};

export function PortfolioEditor({
  initialProfile,
  initialAvatarUrl,
}: PortfolioEditorProps) {
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

  const publicUrl = getPortfolioPublicUrl(username || profile.username);

  useEffect(() => {
    if (state.success && state.profile) {
      setProfile(state.profile);
      if (state.avatarUrl !== undefined) {
        setAvatarUrl(state.avatarUrl);
      }
      setAvatarPreview(null);
      formRef.current?.reset();
    }
  }, [state.success, state.profile, state.avatarUrl]);

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
      <div className="mb-6 border-b border-white/[0.04] pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Portfolio
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Customize your public profile and share your characters.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <form ref={formRef} action={formAction} className="space-y-6">
          <fieldset className="space-y-4 rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-violet-400/80">
              Profile
            </legend>

            <div>
              <label htmlFor="username" className={labelClassName}>
                Username
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600">@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(sanitizeUsername(e.target.value))
                  }
                  className={inputClassName}
                  placeholder="yourname"
                />
              </div>
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
                <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-zinc-900">
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
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-600">
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
                  className="w-full text-sm text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-violet-300"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-violet-400/80">
              Visibility
            </legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2.5 transition hover:bg-white/[0.03]">
              <input
                type="radio"
                name="is_public"
                value="true"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="accent-violet-500"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-200">
                  Public
                </span>
                <span className="block text-xs text-zinc-500">
                  Anyone with your link can view your portfolio
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2.5 transition hover:bg-white/[0.03]">
              <input
                type="radio"
                name="is_public"
                value="false"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="accent-violet-500"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-200">
                  Private
                </span>
                <span className="block text-xs text-zinc-500">
                  Your portfolio page is hidden from visitors
                </span>
              </span>
            </label>
          </fieldset>

          <div className="rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5">
            <p className={labelClassName}>Public URL</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 truncate rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2 text-sm text-zinc-300">
                {publicUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          {state.error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save Portfolio"}
          </button>
        </form>

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
  );
}
