import { Color } from "siecs-react";

const BROWN = { r: 150, g: 75, b: 0, a: 255 };
const BLACK = { r: 0, g: 0, b: 0, a: 255 };
const WHITE = { r: 255, g: 255, b: 255, a: 255 };

export function Brown() {
  return <Color {...BROWN} />;
}

export function Black() {
  return <Color {...BLACK} />;
}

export function White() {
  return <Color {...WHITE} />;
}
