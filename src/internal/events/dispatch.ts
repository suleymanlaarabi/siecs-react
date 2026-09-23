import type { PointerEventHandlers, SiecsPointerEventType } from "../../types.js";
import type { EntityInstance } from "../host-types.js";
import {
  batchedUpdates,
  discreteUpdates,
  flushSyncFromReconciler,
  flushSyncWork,
} from "../renderer/reconciler.js";
import {
  ContinuousEventPriority,
  DiscreteEventPriority,
  runWithEventContext,
  runWithSynchronousEventUpdates,
} from "../renderer/priorities.js";
import { createPointerEvent, type NativePointerPayload } from "./event.js";
import { findInteractiveInstance } from "./registry.js";

const handlerNames: Readonly<Record<SiecsPointerEventType, keyof PointerEventHandlers>> = {
  pointerenter: "onPointerEnter",
  pointerleave: "onPointerLeave",
  pointermove: "onPointerMove",
  pointerdown: "onPointerDown",
  pointerup: "onPointerUp",
  pointercancel: "onPointerCancel",
  click: "onClick",
  press: "onPress",
  wheel: "onWheel",
};

const bubbles: Readonly<Record<SiecsPointerEventType, boolean>> = {
  pointerenter: false,
  pointerleave: false,
  pointermove: true,
  pointerdown: true,
  pointerup: true,
  pointercancel: true,
  click: true,
  press: true,
  wheel: true,
};

function eventPriority(type: SiecsPointerEventType): number {
  switch (type) {
    case "pointerdown":
    case "pointerup":
    case "pointercancel":
    case "click":
    case "press":
      return DiscreteEventPriority;
    default:
      return ContinuousEventPriority;
  }
}

let pathScratch: EntityInstance[] = [];
let pathScratchInUse = false;

function propagationPath(target: EntityInstance, bubble: boolean): EntityInstance[] {
  if (!bubble) return [target];
  const path = pathScratchInUse ? [] : pathScratch;
  if (!pathScratchInUse) pathScratchInUse = true;
  path.length = 0;
  let current: EntityInstance | null = target;
  while (current !== null) {
    path.push(current);
    const parent: EntityInstance["parent"] = current.parent;
    current = parent !== null && "kind" in parent && parent.kind === "entity"
      ? parent
      : null;
  }
  return path;
}

function releasePropagationPath(path: EntityInstance[], bubble: boolean): void {
  if (bubble && path === pathScratch) {
    path.length = 0;
    pathScratchInUse = false;
  }
}

/** Dispatches an already-picked native event through the committed React tree. */
export function dispatchPointerEvent(
  type: SiecsPointerEventType,
  target: EntityInstance,
  payload: NativePointerPayload,
): void {
  if (!target.mounted) return;

  const run = () => {
    const path = propagationPath(target, bubbles[type]);
    try {
      const relatedTarget = findInteractiveInstance(payload.relatedTarget) ?? null;
      const event = createPointerEvent(type, target, relatedTarget, payload);
      const handlerName = handlerNames[type];
      for (const current of path) {
        event.setCurrentTarget(current);
        const handler = current.props[handlerName];
        if (typeof handler === "function") handler(event);
        if (event.isPropagationStopped()) break;
      }
    } finally {
      releasePropagationPath(path, bubbles[type]);
    }
  };

  const priority = eventPriority(type);
  runWithEventContext(priority, type, Number(payload.timestamp), () => {
    flushSyncFromReconciler(() => {
      // flushSyncFromReconciler temporarily sets React's own priority to
      // discrete. Restore this renderer's semantic event priority for the
      // callback and the HostConfig priority hooks.
      runWithSynchronousEventUpdates(() => {
        runWithEventContext(priority, type, Number(payload.timestamp), () => {
          if (priority === DiscreteEventPriority) discreteUpdates(run);
          else batchedUpdates(run);
        });
      });
    });
    // Native run() is a blocking loop: React cannot wait for a later task to
    // commit a state update made by an event callback.
    flushSyncWork();
    flushSyncFromReconciler();
  });
}
