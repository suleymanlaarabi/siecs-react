import { act } from "react";
import { component } from "siecs-ts";
import { test } from "vitest";
import { bind, createRoot, Entity } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const Marker = component("BenchUnmountMarker");
const RMarker = bind(Marker);

for (const count of [1_000, 10_000, 100_000]) {
  test(`unmount a ${count} entity subtree`, async ({ bench }) => {
    await bench(`unmount a ${count} entity subtree`, async () => {
      const root = createRoot();
      await act(async () => {
        root.render(
          <Entity>
            {Array.from({ length: count }, (_, index) => (
              <Entity key={index}>
                <RMarker />
              </Entity>
            ))}
          </Entity>,
        );
      });
      root.unmount();
    }).run();
  });
}
