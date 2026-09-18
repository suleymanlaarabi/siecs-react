import { component } from "siecs-ts";
import { expect, test } from "vitest";
import { bind } from "../src/index.js";

const Position = component("ReactTypesPosition", { x: "f32", y: "f32" });
const RPosition = bind(Position);

test("bind caches component types", () => {
  expect(bind(Position)).toBe(RPosition);
});

function typeContracts() {
  const valid = <RPosition x={1} y={2} />;
  // @ts-expect-error x must be a number
  const invalid = <RPosition x="bad" y={2} />;
  return [valid, invalid];
}

void typeContracts;
