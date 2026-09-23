import { act, createRef, type ReactNode, Suspense } from "react";
import { component, Disabled, has, query } from "siecs-ts";
import { expect, test } from "vitest";
import { bind, createRoot, Entity, type EntityRef } from "../src/index.js";
import { findInteractiveInstance } from "../src/internal/events/registry.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const pending = new Promise<never>(() => {});

function SuspendForever(): never {
  throw pending;
}

let hidden = false;

function Gate({ children }: { children: ReactNode }) {
  if (hidden) throw pending;
  return children;
}

test("a suspended render creates no ECS entity before commit", async () => {
  const Marker = component("ReactSuspenseMarker");
  const RMarker = bind(Marker);
  const root = createRoot();

  await act(async () => {
    root.render(
      <Suspense fallback={null}>
        <Entity>
          <RMarker />
          <SuspendForever />
        </Entity>
      </Suspense>,
    );
  });

  let count = 0;
  query({ marker: Marker }).each(() => count++);
  expect(count).toBe(0);
  root.unmount();
});

test("Suspense visibility maps to Disabled without replacing the entity", async () => {
  const reference = createRef<EntityRef>();
  const root = createRoot();
  const tree = () => (
    <Suspense fallback={null}>
      <Gate>
        <Entity ref={reference} onClick={() => {}} />
      </Gate>
    </Suspense>
  );

  hidden = false;
  await act(async () => root.render(tree()));
  const handle = reference.current!;
  const id = handle.id;
  expect(has(id, Disabled)).toBe(false);
  expect(findInteractiveInstance(id)?.id).toBe(id);

  hidden = true;
  await act(async () => root.render(tree()));
  expect(reference.current).toBeNull();
  expect(handle.id).toBe(id);
  expect(has(id, Disabled)).toBe(true);
  expect(findInteractiveInstance(id)?.id).toBe(id);

  hidden = false;
  await act(async () => root.render(tree()));
  expect(reference.current!.id).toBe(id);
  expect(has(id, Disabled)).toBe(false);
  expect(findInteractiveInstance(id)?.id).toBe(id);
  root.unmount();
});
