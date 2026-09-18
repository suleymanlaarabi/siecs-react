import { act, createRef } from "react";
import { expect, test } from "vitest";
import { createRoot, Entity, type EntityRef } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test("exposes the host entity instance through refs", async () => {
  const reference = createRef<EntityRef>();
  const root = createRoot();

  await act(async () => {
    root.render(<Entity ref={reference} />);
  });

  const handle = reference.current!;
  expect(typeof handle.id).toBe("bigint");
  expect(handle.isAlive()).toBe(true);

  root.unmount();
  expect(reference.current).toBeNull();
  expect(handle.id).toBe(0n);
  expect(handle.isAlive()).toBe(false);
});
