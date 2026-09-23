import { act, createRef, useState } from "react";
import { Bloom as BloomComponent, has } from "siecs-ts";
import { expect, test } from "vitest";
import { Bloom, createRoot, Entity, type EntityRef } from "../src/index.js";
import { dispatchPointerEvent } from "../src/internal/events/dispatch.js";
import type { NativePointerPayload } from "../src/internal/events/event.js";
import { findInteractiveInstance } from "../src/internal/events/registry.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const payload: NativePointerPayload = {
  relatedTarget: 0n, timestamp: 0n, pointerId: 1, pointerType: 0,
  button: 0, buttons: 0, clicks: 0, x: 0, y: 0, deltaX: 0, deltaY: 0,
  wheelX: 0, wheelY: 0, rayOriginX: 0, rayOriginY: 0, rayOriginZ: 0,
  rayDirectionX: 0, rayDirectionY: 0, rayDirectionZ: 1,
  pointX: 0, pointY: 0, pointZ: 0, normalX: 0, normalY: 1, normalZ: 0,
  distance: 1,
};

test("an event setState commits while the native loop owns the thread", async () => {
  const ref = createRef<EntityRef>();
  const root = createRoot();

  function Scene() {
    const [hovered, setHovered] = useState(false);
    return (
      <Entity ref={ref} onPointerEnter={() => setHovered(true)}>
        {hovered && <Bloom intensity={1.2} />}
      </Entity>
    );
  }

  await act(async () => root.render(<Scene />));
  const id = ref.current!.id;
  expect(has(id, BloomComponent)).toBe(false);
  dispatchPointerEvent("pointerenter", findInteractiveInstance(id)!, payload);
  expect(has(id, BloomComponent)).toBe(true);
  root.unmount();
});
