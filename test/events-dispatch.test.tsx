import { expect, test } from "vitest";
import type { EntityInstance, RootContainer } from "../src/internal/host-types.js";
import { createEntityInstance } from "../src/internal/instance.js";
import { dispatchPointerEvent } from "../src/internal/events/dispatch.js";
import type { NativePointerPayload } from "../src/internal/events/event.js";
import {
  registerInteractiveInstance,
  unregisterInteractiveInstance,
} from "../src/internal/events/registry.js";

function entity(props: EntityInstance["props"] = {}): EntityInstance {
  const instance = createEntityInstance(props);
  instance.id = BigInt(Math.floor(Math.random() * 1_000_000) + 1);
  instance.mounted = true;
  return instance;
}

function childOf(parent: EntityInstance, child: EntityInstance): void {
  child.parent = parent;
  parent.children.push(child);
}

const root: RootContainer = { children: [] };
const payload: NativePointerPayload = {
  relatedTarget: 0n,
  timestamp: 42n,
  pointerId: 7,
  pointerType: 0,
  button: 1,
  buttons: 1,
  clicks: 1,
  x: 10,
  y: 20,
  deltaX: 2,
  deltaY: 3,
  wheelX: 4,
  wheelY: 5,
  rayOriginX: 1,
  rayOriginY: 2,
  rayOriginZ: 3,
  rayDirectionX: 4,
  rayDirectionY: 5,
  rayDirectionZ: 6,
  pointX: 7,
  pointY: 8,
  pointZ: 9,
  normalX: 0,
  normalY: 1,
  normalZ: 0,
  distance: 12,
};

test("dispatches target first and bubbles with stable target/currentTarget", () => {
  const calls: string[] = [];
  const parent = entity({ onClick: (event) => {
    calls.push(`parent:${event.target.id}:${event.currentTarget.id}`);
  } });
  const target = entity({ onClick: (event) => {
    calls.push(`target:${event.target.id}:${event.currentTarget.id}`);
  } });
  parent.parent = root;
  childOf(parent, target);

  dispatchPointerEvent("click", target, payload);
  expect(calls).toEqual([
    `target:${target.id}:${target.id}`,
    `parent:${target.id}:${parent.id}`,
  ]);
});

test("stopPropagation prevents ancestor handlers", () => {
  const calls: string[] = [];
  const parent = entity({ onPress: () => calls.push("parent") });
  const target = entity({ onPress: (event) => {
    calls.push("target");
    event.stopPropagation();
  } });
  childOf(parent, target);

  dispatchPointerEvent("press", target, payload);
  expect(calls).toEqual(["target"]);
});

test("enter and leave are direct-target events", () => {
  const calls: string[] = [];
  const parent = entity({ onPointerEnter: () => calls.push("parent") });
  const target = entity({ onPointerEnter: () => calls.push("target") });
  childOf(parent, target);

  dispatchPointerEvent("pointerenter", target, payload);
  expect(calls).toEqual(["target"]);
});

test("resolves a registered relatedTarget and ignores an unmounted target", () => {
  let relatedId: bigint | null = null;
  const related = entity();
  const target = entity({ onPointerLeave: (event) => {
    relatedId = event.relatedTarget?.id ?? null;
  } });
  registerInteractiveInstance(related);
  try {
    dispatchPointerEvent("pointerleave", target, { ...payload, relatedTarget: related.id });
    expect(relatedId).toBe(related.id);

    target.mounted = false;
    dispatchPointerEvent("pointerleave", target, { ...payload, relatedTarget: related.id });
    expect(relatedId).toBe(related.id);
  } finally {
    unregisterInteractiveInstance(related);
  }
});

test("nested dispatch uses an independent propagation path", () => {
  const calls: string[] = [];
  const parent = entity({
    onClick: () => calls.push("outer-parent"),
    onPress: () => calls.push("inner-parent"),
  });
  const target = entity({ onClick: () => {
    calls.push("outer");
    dispatchPointerEvent("press", target, payload);
  }, onPress: () => calls.push("inner") });
  childOf(parent, target);

  dispatchPointerEvent("click", target, payload);
  expect(calls).toEqual(["outer", "inner", "inner-parent", "outer-parent"]);
});

test("a handler may unmount its own target during dispatch", () => {
  const calls: string[] = [];
  const parent = entity({ onClick: () => calls.push("parent") });
  const target = entity({ onClick: () => {
    target.mounted = false;
    target.id = 0n;
    calls.push("target");
  } });
  childOf(parent, target);

  expect(() => dispatchPointerEvent("click", target, payload)).not.toThrow();
  expect(calls).toEqual(["target", "parent"]);
});
