import { act, createRef } from "react";
import {
  component,
  Disabled,
  getName,
  has,
  Name,
  observer,
  OnSet,
  query,
} from "siecs-ts";
import { expect, test } from "vitest";
import { bind, createRoot, Entity, type EntityRef } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test("updates and removes a component without replacing its entity", async () => {
  const Position = component("ReactUpdatePosition", { x: "f32", y: "f32" });
  const RPosition = bind(Position);
  const reference = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => {
    root.render(
      <Entity ref={reference}>
        <RPosition x={1} y={2} />
      </Entity>,
    );
  });
  const id = reference.current!.id;

  await act(async () => {
    root.render(
      <Entity ref={reference}>
        <RPosition x={2} y={2} />
      </Entity>,
    );
  });

  expect(reference.current!.id).toBe(id);
  let x = 0;
  query({ position: Position }).each((row) => {
    if (row.entity.entity === id) x = row.position.x;
  });
  expect(x).toBe(2);

  await act(async () => {
    root.render(<Entity ref={reference} />);
  });
  expect(reference.current!.id).toBe(id);
  expect(has(id, Position)).toBe(false);
  root.unmount();
});

test("does not set shallow-equal component values again", async () => {
  const Value = component("ReactStableValue", { value: "i32" });
  const RValue = bind(Value);
  const root = createRoot();
  let sets = 0;
  observer(OnSet, { value: Value }, () => sets++);

  await act(async () => {
    root.render(
      <Entity>
        <RValue value={7} />
      </Entity>,
    );
  });
  expect(sets).toBe(1);

  await act(async () => {
    root.render(
      <Entity>
        <RValue value={7} />
      </Entity>,
    );
  });
  expect(sets).toBe(1);
  root.unmount();
});

test("diffs name and disabled entity props", async () => {
  const reference = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => {
    root.render(<Entity ref={reference} name="Before" />);
  });
  const id = reference.current!.id;
  expect(getName(id)).toBe("Before");
  expect(has(id, Disabled)).toBe(false);

  await act(async () => {
    root.render(<Entity ref={reference} disabled />);
  });
  expect(reference.current!.id).toBe(id);
  expect(has(id, Name)).toBe(false);
  expect(has(id, Disabled)).toBe(true);

  await act(async () => {
    root.render(<Entity ref={reference} disabled={false} name="After" />);
  });
  expect(getName(id)).toBe("After");
  expect(has(id, Disabled)).toBe(false);
  root.unmount();
});
