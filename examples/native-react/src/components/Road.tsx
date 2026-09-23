import { Color, Cuboid, Entity, Position3d } from "siecs-react";

type Position = { x: number; y: number; z: number };

type RoadProps = {
  position: Position;
  length?: number;
  width?: number;
  direction?: "x" | "z";
};

export function Road({
  position,
  length = 28,
  width = 5,
  direction = "x",
}: RoadProps) {
  const alongX = direction === "x";
  const dashCount = Math.floor(length / 2.4);
  const dashes = Array.from(
    { length: dashCount },
    (_, index) => (index - (dashCount - 1) / 2) * 2.4,
  ).filter((x) => Math.abs(x) > 1.8);
  const stripeCount = Math.ceil((width - 0.5) / 0.48);
  const crossings = Array.from(
    { length: stripeCount },
    (_, index) => (index - (stripeCount - 1) / 2) * 0.48,
  );

  return (
    <Entity name="Road">
      <Position3d x={position.x} y={position.y} z={position.z} />

      <Entity>
        <Position3d x={0} y={0} z={0} />
        <Cuboid
          width={alongX ? length : width}
          height={0.08}
          depth={alongX ? width : length}
        />
        <Color r={43} g={47} b={52} a={255} />
      </Entity>

      {dashes.map((x) => (
        <Entity key={`dash-${x}`}>
          <Position3d x={alongX ? x : 0} y={0.052} z={alongX ? 0 : x} />
          <Cuboid
            width={alongX ? 1.1 : 0.09}
            height={0.02}
            depth={alongX ? 0.09 : 1.1}
          />
          <Color r={235} g={225} b={190} a={255} />
        </Entity>
      ))}

      {[-1, 1].map((side) => (
        <Entity key={`edge-${side}`}>
          <Position3d
            x={alongX ? 0 : side * (width / 2 - 0.24)}
            y={0.052}
            z={alongX ? side * (width / 2 - 0.24) : 0}
          />
          <Cuboid
            width={alongX ? length - 0.4 : 0.07}
            height={0.02}
            depth={alongX ? 0.07 : length - 0.4}
          />
          <Color r={235} g={225} b={190} a={255} />
        </Entity>
      ))}

      {crossings.map((offset) => (
        <Entity key={`crossing-${offset}`}>
          <Position3d
            x={alongX ? 0 : offset}
            y={0.054}
            z={alongX ? offset : 0}
          />
          <Cuboid
            width={alongX ? (width / 1.5) - 0.8 : 0.2}
            height={0.025}
            depth={alongX ? 0.2 : width - 0.8}
          />
          <Color r={238} g={235} b={220} a={255} />
        </Entity>
      ))}

      {[-1, 1].map((side) => (
        <Entity key={`sidewalk-${side}`}>
          <Position3d
            x={alongX ? 0 : side * (width / 2 + 0.5)}
            y={0.04}
            z={alongX ? side * (width / 2 + 0.5) : 0}
          />
          <Cuboid
            width={alongX ? length : 1}
            height={0.18}
            depth={alongX ? 1 : length}
          />
          <Color r={151} g={153} b={149} a={255} />
        </Entity>
      ))}
    </Entity>
  );
}
