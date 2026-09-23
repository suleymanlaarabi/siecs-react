import { act, createRef } from "react";
import { component, isAlive, query } from "siecs-ts";
import { expect, test } from "vitest";
import { bind, createRoot, Entity, type EntityRef } from "../src/index.js";
import { hostConfig } from "../src/internal/renderer/host-config.js";
import {
  COMPONENT_TYPE,
  ENTITY_TYPE,
} from "../src/internal/host-types.js";
import { destroyEntity, mountEntity } from "../src/internal/mount.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test("mounts an entity and its component during commit", async () => {
  const Position = component("ReactMountPosition", { x: "f32", y: "f32" });
  const RPosition = bind(Position);
  const reference = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => {
    root.render(
      <Entity ref={reference} name="Player">
        <RPosition x={1} y={2} />
      </Entity>,
    );
  });

  const id = reference.current?.id ?? 0n;
  expect(isAlive(id)).toBe(true);

  let value: { x: number; y: number } | undefined;
  query({ position: Position }).each((row) => {
    if (row.entity.entity === id) {
      value = { x: row.position.x, y: row.position.y };
    }
  });
  expect(value).toEqual({ x: 1, y: 2 });

  root.unmount();
  expect(isAlive(id)).toBe(false);
});

test("rejects text nodes with a clear renderer error", () => {
  expect(() => hostConfig.createTextInstance()).toThrow(
    "siecs-react does not support text nodes.",
  );
});

test("builds an inert host tree before mount", () => {
  const Marker = component("ReactInertMarker", { value: "u8" });
  const entity = hostConfig.createInstance(ENTITY_TYPE, {});
  const marker = hostConfig.createInstance(COMPONENT_TYPE, {
    component: Marker,
    value: { value: 1 },
  });

  hostConfig.appendInitialChild(entity, marker);
  expect(entity.kind).toBe("entity");
  if (entity.kind !== "entity") throw new Error("expected entity instance");
  expect(entity.id).toBe(0n);
  expect(entity.mounted).toBe(false);

  let count = 0;
  query({ marker: Marker }).each(() => count++);
  expect(count).toBe(0);

  mountEntity(entity);
  query({ marker: Marker }).each(() => count++);
  expect(count).toBe(1);
  destroyEntity(entity);
});
