import { validateSurfaceConfigProfileV1 } from "@/lib/canvas/validate-config-profile-v1";
import type { SurfaceConfigProfileV1 } from "@/types/canvas/config-profile-v1";

export function parseSurfaceConfigProfile(
  input: Record<string, unknown>
): SurfaceConfigProfileV1 | null {
  const result = validateSurfaceConfigProfileV1(input);
  return result.valid ? result.profile : null;
}
