"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateWorld } from "@/app/actions/worlds";
import { MissingPrimaryImageActions } from "@/components/generate-cover/MissingPrimaryImageActions";
import type { World } from "@/types/world";

type WorldCoverHeroProps = {
  world: World;
  coverUrl: string | null;
};

export function WorldCoverHero({ world, coverUrl }: WorldCoverHeroProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const uploadInputId = `world-cover-${world.id}`;

  function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("world_id", world.id);
    formData.set("name", world.name);
    formData.set("description", world.description ?? "");
    formData.set("is_public", world.is_public ? "true" : "false");
    formData.set("cover", file);

    startTransition(async () => {
      await updateWorld({}, formData);
      router.refresh();
    });
  }

  return (
    <MissingPrimaryImageActions
      placeholderCopy="Add a cover — show what this world looks like"
      hint="Main world image"
      hasImage={Boolean(coverUrl)}
      uploadInputId={uploadInputId}
      onUploadChange={handleReplace}
      uploadPending={pending}
      uploadLabel="Upload"
      replaceLabel="Replace image"
      showSkip={false}
    >
      {coverUrl ? (
        <div className="relative aspect-[21/9] bg-[var(--studio-empty-fill)] sm:aspect-[3/1]">
          <Image
            src={coverUrl}
            alt={world.name}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      ) : null}
    </MissingPrimaryImageActions>
  );
}
