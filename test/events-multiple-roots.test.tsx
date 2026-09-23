import { act, createRef } from "react";
import { expect, test } from "vitest";
import { createRoot, Entity, type EntityRef } from "../src/index.js";
import { findInteractiveInstance } from "../src/internal/events/registry.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test("a shared registry keeps interactive entities from independent roots", async () => {
  const a = createRef<EntityRef>();
  const b = createRef<EntityRef>();
  const first = createRoot();
  const second = createRoot();

  await act(async () => first.render(<Entity ref={a} onClick={() => {}} />));
  await act(async () => second.render(<Entity ref={b} onPress={() => {}} />));
  const aId = a.current!.id;
  const bId = b.current!.id;
  expect(aId).not.toBe(bId);
  expect(findInteractiveInstance(aId)?.id).toBe(aId);
  expect(findInteractiveInstance(bId)?.id).toBe(bId);

  first.unmount();
  expect(findInteractiveInstance(aId)).toBeUndefined();
  expect(findInteractiveInstance(bId)?.id).toBe(bId);
  second.unmount();
});
