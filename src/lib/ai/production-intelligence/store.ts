import type { ProductionIntelligenceBundle } from "@/types/ai/production-intelligence";

const globalForPi = globalThis as unknown as {
  productionIntelligenceStore?: {
    snapshots: ProductionIntelligenceBundle[];
    maxSnapshots: number;
  };
};

function getStore() {
  if (!globalForPi.productionIntelligenceStore) {
    globalForPi.productionIntelligenceStore = {
      snapshots: [],
      maxSnapshots: 25,
    };
  }
  return globalForPi.productionIntelligenceStore;
}

export function saveProductionIntelligenceSnapshot(bundle: ProductionIntelligenceBundle): void {
  const store = getStore();
  store.snapshots.unshift(bundle);
  if (store.snapshots.length > store.maxSnapshots) {
    store.snapshots.length = store.maxSnapshots;
  }
}

export function listProductionIntelligenceSnapshots(): ProductionIntelligenceBundle[] {
  return [...getStore().snapshots];
}

export function getLatestProductionIntelligenceSnapshot(): ProductionIntelligenceBundle | null {
  return getStore().snapshots[0] ?? null;
}
