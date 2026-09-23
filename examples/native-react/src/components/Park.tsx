import {
  Color,
  Cuboid,
  Cylinder,
  Entity,
  Position3d,
  Sphere,
} from "siecs-react";

type Position = { x: number; y: number; z: number };

type ParkProps = {
  position: Position;
  width?: number;
  depth?: number;
};

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <Entity name="Tree">
      <Entity>
        <Position3d x={x} y={0.72} z={z} />
        <Cylinder radius={0.14} height={1.35} />
        <Color r={104} g={68} b={39} a={255} />
      </Entity>
      <Entity>
        <Position3d x={x} y={1.72} z={z} />
        <Sphere radius={0.68} />
        <Color r={47} g={119} b={61} a={255} />
      </Entity>
      <Entity>
        <Position3d x={x - 0.36} y={1.53} z={z + 0.08} />
        <Sphere radius={0.43} />
        <Color r={58} g={137} b={69} a={255} />
      </Entity>
      <Entity>
        <Position3d x={x + 0.35} y={1.55} z={z - 0.06} />
        <Sphere radius={0.44} />
        <Color r={52} g={128} b={64} a={255} />
      </Entity>
    </Entity>
  );
}

function Bench() {
  return (
    <Entity name="Bench">
      <Entity>
        <Position3d x={0} y={0.26} z={0} />
        <Cuboid width={0.9} height={0.08} depth={0.3} />
        <Color r={132} g={83} b={43} a={255} />
      </Entity>
      <Entity>
        <Position3d x={0} y={0.4} z={-0.12} />
        <Cuboid width={0.9} height={0.34} depth={0.08} />
        <Color r={132} g={83} b={43} a={255} />
      </Entity>
      {[-0.32, 0.32].map((x) => (
        <Entity key={x}>
          <Position3d x={x} y={0.13} z={0} />
          <Cuboid width={0.08} height={0.26} depth={0.22} />
          <Color r={55} g={59} b={58} a={255} />
        </Entity>
      ))}
    </Entity>
  );
}

export function Park({
  position,
  width = 5.8,
  depth = 6.4,
}: ParkProps) {
  return (
    <Entity name="Park">
      <Position3d x={position.x} y={position.y} z={position.z} />

      <Entity>
        <Position3d x={0} y={0.04} z={0} />
        <Cuboid width={width} height={0.08} depth={depth} />
        <Color r={74} g={126} b={69} a={255} />
      </Entity>

      <Entity>
        <Position3d x={0} y={0.095} z={0} />
        <Cuboid width={1.05} height={0.035} depth={depth - 0.3} />
        <Color r={181} g={172} b={151} a={255} />
      </Entity>
      <Entity>
        <Position3d x={0} y={0.1} z={0} />
        <Cuboid width={width - 0.3} height={0.035} depth={0.9} />
        <Color r={181} g={172} b={151} a={255} />
      </Entity>

      <Tree x={-2.12} z={-2.15} />
      <Tree x={2.12} z={-2.15} />
      <Tree x={-2.12} z={2.15} />
      <Tree x={2.12} z={2.15} />

      <Entity>
        <Position3d x={0} y={0.08} z={2.1} />
        <Bench />
      </Entity>
    </Entity>
  );
}
