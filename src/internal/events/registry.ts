import type { EntityInstance } from "../host-types.js";
import { ensurePointerBridge } from "./bridge.js";

// This is deliberately a lookup table, never an interaction or hit-test index.
const interactiveInstances = new Map<bigint, EntityInstance>();

export function registerInteractiveInstance(instance: EntityInstance): void {
  interactiveInstances.set(instance.id, instance);
  ensurePointerBridge();
}

export function unregisterInteractiveInstance(instance: EntityInstance): void {
  interactiveInstances.delete(instance.id);
}

export function findInteractiveInstance(entityId: bigint): EntityInstance | undefined {
  return interactiveInstances.get(entityId);
}

/** Internal diagnostic used by lifecycle tests. */
export function interactiveInstanceCount(): number {
  return interactiveInstances.size;
}
