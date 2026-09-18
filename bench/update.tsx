import { act } from "react";
import { component } from "siecs-ts";
import { afterAll, beforeAll, test } from "vitest";
import { bind, createRoot, Entity } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const Position = component("BenchUpdatePosition", { x: "f32", y: "f32" });
const RPosition = bind(Position);
const root = createRoot();
let value = 0;

function tree(x: number) {
  return Array.from({ length: 10_000 }, (_, index) => (
    <Entity key={index}>
      <RPosition x={x} y={index} />
    </Entity>
  ));
}

beforeAll(async () => {
  await act(async () => root.render(tree(value)));
});

afterAll(() => root.unmount());

test("update 10,000 entities without component changes", async ({ bench }) => {
  await bench("update 10,000 entities without component changes", async () => {
    await act(async () => root.render(tree(value)));
  }).run();
});

test("update one component on 10,000 entities", async ({ bench }) => {
  await bench("update one component on 10,000 entities", async () => {
    value = value === 0 ? 1 : 0;
    await act(async () => root.render(tree(value)));
  }).run();
});
