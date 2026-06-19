export type ImagePickerOriginLabel = "Uploaded" | "Generated" | "Assigned";

export type ImagePickerItem = {
  id: string;
  url: string | null;
  /** Primary display name — caption or role label */
  title: string;
  /** Slot roles this image is already assigned to */
  slotLabels: string[];
  originLabel: ImagePickerOriginLabel;
  createdAt: string;
  /** Higher = shown first when assigning to a target slot */
  priorityScore: number;
};

export type ImagePickerContext = {
  entityLabel: string;
  targetSlotLabel: string;
  targetSlotRole: string;
};
