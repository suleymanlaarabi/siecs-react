import { act, createRef } from "react";
import { test } from "vitest";
import { createRoot, Entity, type EntityRef } from "../src/index.js";
import { dispatchPointerEvent } from "../src/internal/events/dispatch.js";
import { findInteractiveInstance } from "../src/internal/events/registry.js";
import type { NativePointerPayload } from "../src/internal/events/event.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const payload: NativePointerPayload = {
  relatedTarget: 0n, timestamp: 0n, pointerId: 1, pointerType: 0,
  button: 1, buttons: 1, clicks: 1, x: 0, y: 0, deltaX: 0, deltaY: 0,
  wheelX: 0, wheelY: 0, rayOriginX: 0, rayOriginY: 0, rayOriginZ: 0,
  rayDirectionX: 0, rayDirectionY: 0, rayDirectionZ: 1,
  pointX: 0, pointY: 0, pointZ: 0, normalX: 0, normalY: 1, normalZ: 0,
  distance: 1,
};

function entities(count: number, handlers: 0 | 1 | 5) {
  return Array.from({ length: count }, (_, key) => (
    <Entity
      key={key}
      onClick={handlers >= 1 ? () => {} : undefined}
      onPointerMove={handlers === 5 ? () => {} : undefined}
      onPointerDown={handlers === 5 ? () => {} : undefined}
      onPress={handlers === 5 ? () => {} : undefined}
      onWheel={handlers === 5 ? () => {} : undefined}
    />
  ));
}

for (const handlers of [0, 1, 5] as const) {
  test(`mount 10k entities with ${handlers} pointer handlers`, async ({ bench }) => {
    await bench(`mount 10k entities with ${handlers} pointer handlers`, async () => {
      const root = createRoot();
      await act(async () => root.render(entities(10_000, handlers)));
      root.unmount();
    }).run();
  });
}

test("replace onClick closure without changing native mask", async ({ bench }) => {
  const root = createRoot();
  await act(async () => root.render(<Entity onClick={() => {}} />));
  await bench("replace onClick closure without changing native mask", async () => {
    await act(async () => root.render(<Entity onClick={() => {}} />));
  }).run();
  root.unmount();
});

test("dispatch click to direct interactive target", async ({ bench }) => {
  const root = createRoot();
  const ref = createRef<EntityRef>();
  await act(async () => root.render(<Entity ref={ref} onClick={() => {}} />));
  const target = findInteractiveInstance(ref.current!.id)!;
  await bench("dispatch click to direct interactive target", () => {
    dispatchPointerEvent("click", target, payload);
  }).run();
  root.unmount();
});
