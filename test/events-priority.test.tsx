import { expect, test } from "vitest";
import { dispatchPointerEvent } from "../src/internal/events/dispatch.js";
import type { NativePointerPayload } from "../src/internal/events/event.js";
import { createEntityInstance } from "../src/internal/instance.js";
import {
  ContinuousEventPriority,
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  resolveEventTimeStamp,
  resolveEventType,
} from "../src/internal/renderer/priorities.js";

const payload: NativePointerPayload = {
  relatedTarget: 0n, timestamp: 123n, pointerId: 1, pointerType: 0,
  button: 1, buttons: 1, clicks: 1, x: 0, y: 0, deltaX: 0, deltaY: 0,
  wheelX: 0, wheelY: 0, rayOriginX: 0, rayOriginY: 0, rayOriginZ: 0,
  rayDirectionX: 0, rayDirectionY: 0, rayDirectionZ: 1,
  pointX: 0, pointY: 0, pointZ: 0, normalX: 0, normalY: 1, normalZ: 0,
  distance: 1,
};

test("sets and restores discrete React event context", () => {
  let type: string | null = null;
  let timestamp = -1;
  let priority = -1;
  const target = createEntityInstance({ onClick: () => {
    type = resolveEventType();
    timestamp = resolveEventTimeStamp();
    priority = getCurrentUpdatePriority();
  } });
  target.mounted = true;

  dispatchPointerEvent("click", target, payload);
  expect([type, timestamp, priority]).toEqual(["click", 123, DiscreteEventPriority]);
  expect([resolveEventType(), resolveEventTimeStamp()]).toEqual([null, -1]);
});

test("uses continuous priority for pointer movement", () => {
  let priority = -1;
  const target = createEntityInstance({ onPointerMove: () => {
    priority = getCurrentUpdatePriority();
  } });
  target.mounted = true;

  dispatchPointerEvent("pointermove", target, payload);
  expect(priority).toBe(ContinuousEventPriority);
});
