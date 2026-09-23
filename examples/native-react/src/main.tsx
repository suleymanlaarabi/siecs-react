import {
  AmbientLight,
  Camera,
  Color,
  Cuboid,
  Cylinder,
  Entity,
  Position3d,
  Rotation3d,
  Shadows,
  Sphere,
  createRoot,
  run,
  setResource,
} from "siecs-react";
import { Building } from "./components/Building";
import { CameraController } from "./components/CameraController";
import { Park } from "./components/Park";
import { TrafficLight } from "./components/TrafficLight";

type Point = { x: number; z: number };
type CityColor = { r: number; g: number; b: number };

// Number of streets on each axis. Change this to resize the city.
const SIZE = 64;
const BLOCK_SPACING = 18;
const STREET_WIDTH = 5.4;
const STREET_LENGTH = BLOCK_SPACING - STREET_WIDTH;
const ROAD_Y = -1.3;
const PAVEMENT_Y = -1.16;
const STREETS = Array.from(
  { length: SIZE },
  (_, index) => (index - (SIZE - 1) / 2) * BLOCK_SPACING,
);
const BLOCKS = STREETS.slice(0, -1).map(
  (street, index) => (street + STREETS[index + 1]) / 2,
);
const GROUND_SIZE = (SIZE - 1) * BLOCK_SPACING + STREET_WIDTH + 70;

const asphalt = { r: 43, g: 47, b: 52 };
const paving = { r: 151, g: 153, b: 149 };
const white = { r: 233, g: 230, b: 216 };
const yellow = { r: 237, g: 205, b: 111 };
const facades = [
  { r: 155, g: 133, b: 108 },
  { r: 178, g: 163, b: 136 },
  { r: 130, g: 145, b: 154 },
  { r: 184, g: 145, b: 121 },
  { r: 147, g: 154, b: 129 },
];

function Box({ x, y, z, width, height, depth, color }: Point & {
  y: number;
  width: number;
  height: number;
  depth: number;
  color: CityColor;
}) {
  return (
    <Entity>
      <Position3d x={x} y={y} z={z} />
      <Cuboid width={width} height={height} depth={depth} />
      <Color {...color} a={255} />
    </Entity>
  );
}

function StreetSection({ x, z, direction }: Point & { direction: "x" | "z" }) {
  const horizontal = direction === "x";
  return (
    <Entity name="Street section">
      <Box x={x} y={ROAD_Y} z={z}
        width={horizontal ? STREET_LENGTH : STREET_WIDTH} height={0.08}
        depth={horizontal ? STREET_WIDTH : STREET_LENGTH} color={asphalt} />
      {[-4, 0, 4].map((offset) => (
        <Box key={`lane-${offset}`}
          x={x + (horizontal ? offset : 0)} y={ROAD_Y + 0.052}
          z={z + (horizontal ? 0 : offset)}
          width={horizontal ? 1.45 : 0.09} height={0.018}
          depth={horizontal ? 0.09 : 1.45} color={yellow} />
      ))}
      {[-1, 1].map((side) => (
        <Box key={`edge-${side}`}
          x={x + (horizontal ? 0 : side * 2.42)} y={ROAD_Y + 0.052}
          z={z + (horizontal ? side * 2.42 : 0)}
          width={horizontal ? STREET_LENGTH - 0.3 : 0.065} height={0.018}
          depth={horizontal ? 0.065 : STREET_LENGTH - 0.3} color={white} />
      ))}
    </Entity>
  );
}

function Crosswalk({ x, z, direction }: Point & { direction: "x" | "z" }) {
  const horizontal = direction === "x";
  return (
    <Entity name="Pedestrian crossing">
      {Array.from({ length: 8 }, (_, index) => (index - 3.5) * 0.55).map((offset) => (
        <Box key={offset}
          x={x + (horizontal ? 0 : offset)} y={ROAD_Y + 0.055}
          z={z + (horizontal ? offset : 0)}
          width={horizontal ? 0.72 : 0.34} height={0.02}
          depth={horizontal ? 0.34 : 0.72} color={white} />
      ))}
    </Entity>
  );
}

function SignalizedIntersection({ x, z }: Point) {
  const crossing = STREET_WIDTH / 2 + 0.72;
  const light = STREET_WIDTH / 2 + 0.55;
  return (
    <Entity name="Signalized intersection">
      <Crosswalk x={x - crossing} z={z} direction="x" />
      <Crosswalk x={x + crossing} z={z} direction="x" />
      <Crosswalk x={x} z={z - crossing} direction="z" />
      <Crosswalk x={x} z={z + crossing} direction="z" />
      {[
        { sideX: -1, sideZ: -1, yaw: Math.PI, active: "green" as const },
        { sideX: 1, sideZ: -1, yaw: Math.PI / 2, active: "red" as const },
        { sideX: -1, sideZ: 1, yaw: -Math.PI / 2, active: "red" as const },
        { sideX: 1, sideZ: 1, yaw: 0, active: "green" as const },
      ].map(({ sideX, sideZ, yaw, active }) => (
        <Entity key={`${sideX}-${sideZ}`}>
          <Position3d x={x + sideX * light} y={PAVEMENT_Y} z={z + sideZ * light} />
          <Rotation3d pitch={0} yaw={yaw} roll={0} />
          <TrafficLight active={active} />
        </Entity>
      ))}
    </Entity>
  );
}

function Roundabout({ x, z }: Point) {
  return (
    <Entity name="Roundabout">
      <Entity>
        <Position3d x={x} y={ROAD_Y} z={z} />
        <Cylinder radius={3.75} height={0.08} />
        <Color {...asphalt} a={255} />
      </Entity>
      <Entity>
        <Position3d x={x} y={ROAD_Y + 0.14} z={z} />
        <Cylinder radius={1.55} height={0.22} />
        <Color {...paving} a={255} />
      </Entity>
      <Entity>
        <Position3d x={x} y={ROAD_Y + 0.27} z={z} />
        <Cylinder radius={1.4} height={0.06} />
        <Color r={75} g={127} b={68} a={255} />
      </Entity>
      <Entity>
        <Position3d x={x} y={ROAD_Y + 0.62} z={z} />
        <Cylinder radius={0.54} height={0.68} />
        <Color r={176} g={166} b={144} a={255} />
      </Entity>
      <Entity>
        <Position3d x={x} y={ROAD_Y + 1.12} z={z} />
        <Sphere radius={0.4} />
        <Color r={96} g={157} b={181} a={255} />
      </Entity>
    </Entity>
  );
}

const centerStreet = Math.floor(SIZE / 2);
const roundabouts = new Set(
  [
    [centerStreet, centerStreet],
    [centerStreet - 2, centerStreet],
    [centerStreet + 2, centerStreet],
    [centerStreet, centerStreet + 2],
  ]
    .filter(([column, row]) => column >= 0 && column < SIZE && row >= 0 && row < SIZE)
    .map(([column, row]) => `${STREETS[column]},${STREETS[row]}`),
);

function Intersection({ x, z, column, row }: Point & { column: number; row: number }) {
  const isRoundabout = roundabouts.has(`${x},${z}`);
  const hasSignals = !isRoundabout && column % 2 === 1 && row % 2 === 1;
  return (
    <Entity name="Intersection">
      <Box x={x} y={ROAD_Y} z={z}
        width={STREET_WIDTH} height={0.08} depth={STREET_WIDTH} color={asphalt} />
      {isRoundabout ? <Roundabout x={x} z={z} /> : null}
      {hasSignals ? <SignalizedIntersection x={x} z={z} /> : null}
    </Entity>
  );
}

function CityBlock({ x, z, column, row }: Point & { column: number; row: number }) {
  const isPark = (column * 5 + row * 7) % 11 === 0;
  const parcel = BLOCK_SPACING - STREET_WIDTH;
  const plots = [
    { x: -3.2, z: -3.35 }, { x: 3.2, z: -3.35 },
    { x: -3.2, z: 3.35 }, { x: 3.2, z: 3.35 },
  ];
  const plotCount = (column + row) % 3 === 0 ? 4 : 3;
  const downtown = Math.max(0, 3 - Math.floor(Math.max(Math.abs(x), Math.abs(z)) / BLOCK_SPACING));
  return (
    <Entity name={isPark ? "Park block" : "City block"}>
      <Box x={x} y={PAVEMENT_Y - 0.09} z={z}
        width={parcel} height={0.18} depth={parcel} color={paving} />
      {isPark ? (
        <Park position={{ x, y: PAVEMENT_Y, z }} width={10.2} depth={10.2} />
      ) : plots.slice(0, plotCount).map((plot, index) => (
        <Entity key={index}>
          <Position3d x={x + plot.x} y={PAVEMENT_Y} z={z + plot.z} />
          <Rotation3d pitch={0} yaw={plot.z < 0 ? Math.PI : 0} roll={0} />
          <Building
            position={{ x: 0, y: 0, z: 0 }}
            floors={2 + downtown + ((column * 7 + row * 3 + index * 5) % 3)}
            facade={facades[(column * 3 + row * 5 + index) % facades.length]}
          />
        </Entity>
      ))}
    </Entity>
  );
}

function City() {
  return (
    <Entity name="City">
      {STREETS.flatMap((z, row) => STREETS.map((x, column) => (
        <Intersection key={`intersection-${column}-${row}`}
          x={x} z={z} column={column} row={row} />
      )))}
      {STREETS.flatMap((z, row) => BLOCKS.map((x, column) => (
        <StreetSection key={`east-west-${column}-${row}`}
          x={x} z={z} direction="x" />
      )))}
      {BLOCKS.flatMap((z, row) => STREETS.map((x, column) => (
        <StreetSection key={`north-south-${column}-${row}`}
          x={x} z={z} direction="z" />
      )))}
      {BLOCKS.flatMap((z, row) => BLOCKS.map((x, column) => (
        <CityBlock key={`block-${column}-${row}`}
          x={x} z={z} column={column} row={row} />
      )))}
    </Entity>
  );
}

function Scene() {
  return (
    <>
      <Entity name="Camera">
        <CameraController />
        <Camera fov={70} />
        <Position3d x={17} y={23} z={43} />
        <Rotation3d pitch={-0.4} yaw={0.35} roll={0} />
      </Entity>
      <Entity name="Floor">
        <Position3d x={0} y={-1.5} z={0} />
        <Cuboid width={GROUND_SIZE} height={0.3} depth={GROUND_SIZE} />
        <Color r={70} g={80} b={105} a={255} />
      </Entity>
      <City />
    </>
  );
}

setResource(AmbientLight, {
  color: { r: 180, g: 195, b: 230, a: 255 },
  intensity: 0.45,
});
setResource(Shadows, { enabled: true, distance: 65 });

function main(): void {
  const root = createRoot();
  root.render(<Scene />);
  run();
}

main();
