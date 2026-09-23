import { Color, Cuboid, Entity, Position3d } from "siecs-react";

type WindowProps = {
  width?: number;
  height?: number;
};

export function Window({ width = 0.82, height = 1.05 }: WindowProps) {
  const frame = 0.1;

  return (
    <Entity name="Window">
      <Entity>
        <Position3d x={0} y={0} z={0} />
        <Cuboid width={width} height={height} depth={0.1} />
        <Color r={205} g={194} b={172} a={255} />
      </Entity>
      <Entity>
        <Position3d x={0} y={0} z={0.06} />
        <Cuboid
          width={width - frame * 2}
          height={height - frame * 2}
          depth={0.035}
        />
        <Color r={63} g={145} b={174} a={255} />
      </Entity>
      <Entity>
        <Position3d x={0} y={0} z={0.09} />
        <Cuboid width={0.055} height={height - frame * 2} depth={0.04} />
        <Color r={205} g={194} b={172} a={255} />
      </Entity>
      <Entity>
        <Position3d x={0} y={0} z={0.09} />
        <Cuboid width={width - frame * 2} height={0.055} depth={0.04} />
        <Color r={205} g={194} b={172} a={255} />
      </Entity>
    </Entity>
  );
}
