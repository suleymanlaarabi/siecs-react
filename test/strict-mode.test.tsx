import { act, StrictMode } from "react";
import { component, query } from "siecs-ts";
import { expect, test } from "vitest";
import { bind, createRoot, Entity } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test("StrictMode does not create abandoned ECS entities", async () => {
  const Marker = component("ReactStrictMarker");
  const RMarker = bind(Marker);
  const root = createRoot();

  await act(async () => {
    root.render(
      <StrictMode>
        <Entity>
          <RMarker />
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
