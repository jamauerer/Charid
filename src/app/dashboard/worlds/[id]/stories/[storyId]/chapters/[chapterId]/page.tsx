import { redirect, notFound } from "next/navigation";
import { getChapterById } from "@/app/actions/chapters";
import { getStoryProjectContext } from "@/app/actions/projects";
import { getStoryById } from "@/app/actions/stories";
import { getWorldById } from "@/app/actions/worlds";
import { ChapterEditorForm } from "@/app/dashboard/ChapterEditorForm";
import { CreatorContextTrail } from "@/components/studio/CreatorContextTrail";

type ChapterEditorPageProps = {
  params: Promise<{ id: string; storyId: string; chapterId: string }>;
};

export default async function ChapterEditorPage({
  params,
}: ChapterEditorPageProps) {
  const { id: worldId, storyId, chapterId } = await params;

  const { world, error: worldError } = await getWorldById(worldId);
  if (worldError === "You must be logged in.") {
    redirect("/login");
  }
  if (!world) {
    notFound();
  }

  const { story, error: storyError } = await getStoryById(worldId, storyId);
  if (!story) {
    notFound();
  }
  if (storyError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-[var(--status-info-text)]">
        {storyError}
      </div>
    );
  }

  const { chapter, error: chapterError } = await getChapterById(
    storyId,
    chapterId
  );
  if (!chapter) {
    notFound();
  }
  if (chapterError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-[var(--status-info-text)]">
        {chapterError}
      </div>
    );
  }

  const { project: projectContext } = await getStoryProjectContext(
    storyId,
    worldId
  );

  const storyHref = `/dashboard/worlds/${worldId}/stories/${storyId}`;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CreatorContextTrail
        className="mb-6"
        project={
          projectContext
            ? {
                label: projectContext.title,
                href: `/dashboard/projects/${projectContext.id}`,
              }
            : null
        }
        story={{ label: story.title, href: storyHref }}
        current={{ label: chapter.title }}
        world={{
          label: world.name,
          href: `/dashboard/worlds/${worldId}`,
        }}
      />

      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--brand-text-secondary)]">
          {chapter.title}
        </h1>
      </div>

      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6">
        <ChapterEditorForm
          chapter={chapter}
          storyId={storyId}
          worldId={worldId}
        />
      </div>
    </div>
  );
}
