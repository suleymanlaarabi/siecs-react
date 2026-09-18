import { act, createRef } from "react";
import { isAlive } from "siecs-ts";
import { expect, test } from "vitest";
import { createRoot, Entity, type EntityRef } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test("unmount kills a hierarchy and invalidates its refs", async () => {
  const parent = createRef<EntityRef>();
  const child = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => {
    root.render(
      <Entity ref={parent}>
        <Entity ref={child} />
      </Entity>,
    );
  });

  const parentHandle = parent.current!;
  const childHandle = child.current!;
  const parentId = parentHandle.id;
  const childId = childHandle.id;
  root.unmount();

  expect(isAlive(parentId)).toBe(false);
  expect(isAlive(childId)).toBe(false);
  expect(parentHandle.id).toBe(0n);
  expect(childHandle.id).toBe(0n);
  expect(parentHandle.isAlive()).toBe(false);
  expect(childHandle.isAlive()).toBe(false);
});

test("supports independent roots", async () => {
  const first = createRef<EntityRef>();
  const second = createRef<EntityRef>();
  const firstRoot = createRoot();
  const secondRoot = createRoot();

  await act(async () => {
    firstRoot.render(<Entity ref={first} />);
    secondRoot.render(<Entity ref={second} />);
  });

  const firstId = first.current!.id;
  const secondId = second.current!.id;
  firstRoot.unmount();
  expect(isAlive(firstId)).toBe(false);
  expect(isAlive(secondId)).toBe(true);

  secondRoot.unmount();
  expect(isAlive(secondId)).toBe(false);
});

test("rendering null removes the committed subtree", async () => {
  const reference = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => root.render(<Entity ref={reference} />));
  const id = reference.current!.id;
  await act(async () => root.render(null));

  expect(isAlive(id)).toBe(false);
  expect(reference.current).toBeNull();
  root.unmount();
});
