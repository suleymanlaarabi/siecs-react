import { component } from "siecs-ts";
import { expect, test } from "vitest";
import {
  bind,
  component as reactComponent,
  entity,
  query,
  system,
  write,
} from "../src/index.js";

const Position = component("ReactTypesPosition", { x: "f32", y: "f32" });
const RPosition = bind(Position);

test("bind caches component types", () => {
  expect(bind(Position)).toBe(RPosition);
});

function typeContracts() {
  const valid = <RPosition x={1} y={2} />;
  system({
    query: { position: write(RPosition) },
    each: ({ position }) => {
      position.x += 1;
    },
  });
  // @ts-expect-error x must be a number
  const invalid = <RPosition x="bad" y={2} />;
  return [valid, invalid];
}

void typeContracts;

function facadeTypeContracts() {
  const Position = reactComponent("ReactFacadePosition", {
    x: "f32",
    y: "f32",
  });
  const player = entity().set(Position, { x: 0, y: 0 });
  const element = <Position x={1} y={2} />;

  query({ position: write(Position) }).each((row) => {
    row.position.x += 1;
    row.entity.set(Position, { x: row.position.x, y: row.position.y });
  });
  system({
    query: { position: write(Position) },
    each: ({ position }) => {
      position.y += 1;
    },
  });

  // @ts-expect-error component values stay strongly typed through the facade
  player.set(Position, { x: "bad", y: 0 });
  return element;
}

void facadeTypeContracts;
