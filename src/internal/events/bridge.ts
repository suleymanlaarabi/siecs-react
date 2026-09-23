import {
  Click,
  filter,
  PointerCancel,
  PointerDown,
  PointerEnter,
  PointerEvents,
  PointerLeave,
  PointerMove,
  PointerUp,
  Press,
  Wheel,
  observer,
  type Event,
  type PointerEventData,
} from "siecs-ts";
import type { SiecsPointerEventType } from "../../types.js";
import { dispatchPointerEvent } from "./dispatch.js";
import { findInteractiveInstance } from "./registry.js";

let initialized = false;

function install(
  type: SiecsPointerEventType,
  nativeEvent: Event<PointerEventData>,
): void {
  observer(nativeEvent, { interactive: filter(PointerEvents) }, (_row, payload) => {
    const target = findInteractiveInstance(payload.target);
    if (target) dispatchPointerEvent(type, target, payload);
  });
}

/** Installs the nine world-wide SIECS observers on first interactive mount. */
export function ensurePointerBridge(): void {
  if (initialized) return;
  initialized = true;
  install("pointerenter", PointerEnter);
  install("pointerleave", PointerLeave);
  install("pointermove", PointerMove);
  install("pointerdown", PointerDown);
  install("pointerup", PointerUp);
  install("pointercancel", PointerCancel);
  install("click", Click);
  install("press", Press);
  install("wheel", Wheel);
}

export function isPointerBridgeInitialized(): boolean {
  return initialized;
}
