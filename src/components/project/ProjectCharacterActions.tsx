"use client";

import { useRouter } from "next/navigation";
import { CharacterPickerModal } from "@/components/dashboard/CharacterPickerModal";
import { ContextualCharacterCreateModal } from "@/components/dashboard/ContextualCharacterCreateModal";

type ProjectCharacterActionsProps = {
  projectId: string;
  excludeCharacterIds?: string[];
};

export function ProjectCharacterActions({
  projectId,
  excludeCharacterIds = [],
}: ProjectCharacterActionsProps) {
  const router = useRouter();

  function handleRefresh() {
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <ContextualCharacterCreateModal
        projectId={projectId}
        triggerLabel="Add Character"
        onComplete={handleRefresh}
      />
      <CharacterPickerModal
        mode="project"
        projectId={projectId}
        excludeCharacterIds={excludeCharacterIds}
        onComplete={handleRefresh}
      />
    </div>
  );
}
