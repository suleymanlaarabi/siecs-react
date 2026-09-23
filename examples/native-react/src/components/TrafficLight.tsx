import {
  Bloom,
  Color,
  Cuboid,
  Cylinder,
  Entity,
  Position3d,
  Sphere,
} from "siecs-react";

type SignalColor = { r: number; g: number; b: number };

function Signal({ color, y, lit }: { color: SignalColor; y: number; lit: boolean }) {
  return (
    <Entity>
      <Position3d x={0} y={y} z={0.14} />
      <Sphere radius={0.055} />
      <Color
        r={lit ? color.r : Math.round(color.r * 0.16)}
        g={lit ? color.g : Math.round(color.g * 0.16)}
        b={lit ? color.b : Math.round(color.b * 0.16)}
        a={255}
      />
      {lit ? <Bloom intensity={0.9} /> : null}
    </Entity>
  );
}

function Visor({ y }: { y: number }) {
  return (
    <Entity>
      <Position3d x={0} y={y} z={0.15} />
      <Cuboid width={0.26} height={0.035} depth={0.1} />
      <Color r={18} g={20} b={24} a={255} />
    </Entity>
  );
}

export function TrafficLight({ active = "red" }: { active?: "red" | "green" }) {
  return (
    <Entity name="Traffic light">
      {/* Weighted foot and post */}
      <Entity>
        <Position3d x={0} y={0.035} z={0} />
        <Cylinder radius={0.13} height={0.07} />
        <Color r={35} g={38} b={43} a={255} />
      </Entity>
      <Entity>
        <Position3d x={0} y={0.37} z={0} />
        <Cylinder radius={0.045} height={0.62} />
        <Color r={75} g={79} b={84} a={255} />
      </Entity>

      {/* Enclosure */}
      <Entity>
        <Position3d x={0} y={0.9} z={0} />
        <Cuboid width={0.31} height={0.65} depth={0.22} />
        <Color r={24} g={27} b={32} a={255} />
      </Entity>
      <Entity>
        <Position3d x={0} y={0.9} z={0.12} />
        <Cuboid width={0.26} height={0.65} depth={0.025} />
        <Color r={8} g={10} b={13} a={255} />
      </Entity>

      {/* Red, amber, and green signal lenses */}
      <Signal color={{ r: 255, g: 35, b: 25 }} y={1.14} lit={active === "red"} />
      <Signal color={{ r: 255, g: 177, b: 18 }} y={0.95} lit={false} />
      <Signal color={{ r: 35, g: 230, b: 75 }} y={0.73} lit={active === "green"} />
      <Visor y={1.22} />
      <Visor y={1.05} />
      <Visor y={0.85} />
    </Entity>
  );
}
