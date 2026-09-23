import { act, createRef } from "react";
import { has, PointerEventMask, PointerEvents, query } from "siecs-ts";
import { expect, test } from "vitest";
import { createRoot, Entity, type EntityRef } from "../src/index.js";
import { findInteractiveInstance, interactiveInstanceCount } from "../src/internal/events/registry.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function maskOf(id: bigint): number | undefined {
  let mask: number | undefined;
  query({ pointerEvents: PointerEvents }).each((row) => {
    if (row.entity.entity === id) mask = row.pointerEvents.mask;
  });
  return mask;
}

test("only interactive entities receive native PointerEvents and registry entries", async () => {
  const inert = createRef<EntityRef>();
  const interactive = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => root.render(
    <>
      <Entity ref={inert} />
      <Entity ref={interactive} onClick={() => {}} />
    </>,
  ));

  expect(has(inert.current!.id, PointerEvents)).toBe(false);
  expect(maskOf(interactive.current!.id)).toBe(PointerEventMask.Click);
  expect(findInteractiveInstance(interactive.current!.id)).toBeDefined();
  expect(interactiveInstanceCount()).toBeGreaterThan(0);
  root.unmount();
});

test("callback replacement keeps its native mask while event kinds change it", async () => {
  const ref = createRef<EntityRef>();
  const root = createRoot();
  const first = () => {};
  const second = () => {};

  await act(async () => root.render(<Entity ref={ref} onClick={first} />));
  const id = ref.current!.id;
  const instance = findInteractiveInstance(id)!;
  expect(instance.pointerMask).toBe(PointerEventMask.Click);

  await act(async () => root.render(<Entity ref={ref} onClick={second} />));
  expect(findInteractiveInstance(id)).toBe(instance);
  expect(instance.props.onClick).toBe(second);
  expect(maskOf(id)).toBe(PointerEventMask.Click);

  await act(async () => root.render(<Entity ref={ref} onClick={second} onPress={() => {}} />));
  expect(maskOf(id)).toBe(PointerEventMask.Click | PointerEventMask.Press);

  await act(async () => root.render(<Entity ref={ref} />));
  expect(has(id, PointerEvents)).toBe(false);
  expect(findInteractiveInstance(id)).toBeUndefined();
  root.unmount();
});
