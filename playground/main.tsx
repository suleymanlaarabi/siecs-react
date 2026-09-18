import { bind, createRoot, Entity } from "../src/index.js";
import { component } from "siecs-ts";

const Position = component("PlaygroundPosition", {
  x: "f32",
  y: "f32",
});
const RPosition = bind(Position);

const root = createRoot();
root.render(
  <Entity name="Player">
    <RPosition x={0} y={0} />
  </Entity>,
);

globalThis.addEventListener("beforeunload", () => root.unmount());
