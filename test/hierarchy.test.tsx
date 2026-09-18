import { act, createRef } from "react";
import { ChildOf, getName, target } from "siecs-ts";
import { expect, test } from "vitest";
import { createRoot, Entity, type EntityRef } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test("maps nested entities to ChildOf relations", async () => {
  const parent = createRef<EntityRef>();
  const child = createRef<EntityRef>();
  const grandchild = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => {
    root.render(
      <Entity ref={parent} name="A">
        <Entity ref={child} name="B">
          <Entity ref={grandchild} name="C" />
        </Entity>
      </Entity>,
    );
  });

  expect(target(child.current!.id, ChildOf)).toBe(parent.current!.id);
  expect(target(grandchild.current!.id, ChildOf)).toBe(child.current!.id);
  expect(getName(parent.current!.id)).toBe("A");
  expect(getName(child.current!.id)).toBe("B");
  root.unmount();
});

test("reorders keyed siblings without changing entity ids", async () => {
  const first = createRef<EntityRef>();
  const second = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => {
    root.render(
      <>
        <Entity key="a" ref={first} />
        <Entity key="b" ref={second} />
      </>,
    );
  });
  const firstId = first.current!.id;
  const secondId = second.current!.id;

  await act(async () => {
    root.render(
      <>
        <Entity key="b" ref={second} />
        <Entity key="a" ref={first} />
      </>,
    );
  });

  expect(first.current!.id).toBe(firstId);
  expect(second.current!.id).toBe(secondId);
  root.unmount();
});
