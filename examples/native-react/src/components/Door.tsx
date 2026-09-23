import { Color, Cuboid, Entity, Position3d } from "siecs-react";
import { Black, Brown } from "../colors";

type DoorProps = {
  width?: number;
  height?: number;
};

function DoorHandle({ x }: { x: number }) {

  return (
    <Entity>
      <Position3d x={x} y={0} z={0.14} />
      <Cuboid width={0.1} height={0.16} depth={0.1} />
      <Black />
    </Entity>
  );
}

export function Door({ width = 1.2, height = 2.1 }: DoorProps) {
  return (
    <Entity name="Door">
      <Entity>
        <Position3d x={0} y={0} z={0} />
        <Cuboid width={width + 0.2} height={height + 0.14} depth={0.16} />
        <Color r={211} g={194} b={163} a={255} />
      </Entity>
      <Entity>
        <Position3d x={0} y={0} z={0.07} />
        <Cuboid width={width} height={height} depth={0.12} />
        <Brown />
      </Entity>
      <Entity>
        <Position3d x={0} y={height * 0.24} z={0.14} />
        <Cuboid width={width * 0.72} height={height * 0.3} depth={0.035} />
        <Color r={112} g={57} b={26} a={255} />
      </Entity>
      <DoorHandle x={width * 0.36} />
    </Entity>
  );
}
