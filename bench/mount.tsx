import { act, createElement, type ReactElement } from "react";
import { component } from "siecs-ts";
import { test } from "vitest";
import { bind, createRoot, Entity } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const Position = component("BenchMountPosition", { x: "f32", y: "f32" });
const Velocity = component("BenchMountVelocity", { x: "f32", y: "f32" });
const Health = component("BenchMountHealth", { value: "f32" });
const Selected = component("BenchMountSelected");
const RPosition = bind(Position);
const RVelocity = bind(Velocity);
const RHealth = bind(Health);
const RSelected = bind(Selected);

function flat(count: number, componentCount: 1 | 4): ReactElement[] {
  return Array.from({ length: count }, (_, index) => (
    <Entity key={index}>
      <RPosition x={index} y={index} />
      {componentCount === 4 && <RVelocity x={1} y={1} />}
      {componentCount === 4 && <RHealth value={100} />}
      {componentCount === 4 && <RSelected />}
    </Entity>
  ));
}

for (const count of [1_000, 10_000, 100_000]) {
  test(`mount ${count} entities + 1 component`, async ({ bench }) => {
    await bench(`mount ${count} entities + 1 component`, async () => {
      const root = createRoot();
      await act(async () => root.render(flat(count, 1)));
      root.unmount();
    }).run();
  });

  test(`mount ${count} entities + 4 components`, async ({ bench }) => {
    await bench(`mount ${count} entities + 4 components`, async () => {
      const root = createRoot();
      await act(async () => root.render(flat(count, 4)));
      root.unmount();
    }).run();
  });
}

test("mount a 1,000 entity deep hierarchy", async ({ bench }) => {
  await bench("mount a 1,000 entity deep hierarchy", async () => {
    let tree: ReactElement = <Entity />;
    for (let index = 0; index < 1_000; index++) {
      tree = createElement(Entity, { children: tree });
    }
    const root = createRoot();
    await act(async () => root.render(tree));
    root.unmount();
  }).run();
});

test("mount a 100,000 entity wide hierarchy", async ({ bench }) => {
  await bench("mount a 100,000 entity wide hierarchy", async () => {
    const root = createRoot();
    await act(async () => root.render(<Entity>{flat(100_000, 1)}</Entity>));
    root.unmount();
  }).run();
});
