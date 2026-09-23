import { act, createRef, StrictMode } from "react";
import { component, has, PointerEvents, query } from "siecs-ts";
import { expect, test } from "vitest";
import { bind, createRoot, Entity, type EntityRef } from "../src/index.js";
import { findInteractiveInstance } from "../src/internal/events/registry.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test("StrictMode does not create abandoned ECS entities", async () => {
  const Marker = component("ReactStrictMarker", { value: "u8" });
  const RMarker = bind(Marker);
  const root = createRoot();

  await act(async () => {
    root.render(
      <StrictMode>
        <Entity>
          <RMarker value={1} />
        </Entity>
      </StrictMode>,
    );
  });

  let count = 0;
  query({ marker: Marker }).each(() => count++);
  expect(count).toBe(1);

  root.unmount();
  count = 0;
  query({ marker: Marker }).each(() => count++);
  expect(count).toBe(0);
});

test("StrictMode commits one interactive entity and cleans its registry entry", async () => {
  const ref = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => {
    root.render(
      <StrictMode>
        <Entity ref={ref} onClick={() => {}} />
      </StrictMode>,
    );
  });

  const id = ref.current!.id;
  expect(has(id, PointerEvents)).toBe(true);
  expect(findInteractiveInstance(id)?.id).toBe(id);
  root.unmount();
  expect(findInteractiveInstance(id)).toBeUndefined();
});
