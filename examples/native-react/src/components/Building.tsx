import { Color, Cuboid, Entity, Position3d } from "siecs-react";
import { Door } from "./Door";
import { Window } from "./Window";

type Position = { x: number; y: number; z: number };

type BuildingProps = {
  position: Position;
  floors: number;
  facade?: { r: number; g: number; b: number };
};

const width = 4.2;
const depth = 2.6;
const floorHeight = 2.55;

export function Building({
  position,
  floors,
  facade = { r: 155, g: 133, b: 108 },
}: BuildingProps) {
  const floorCount = Math.max(1, Math.floor(floors));
  const height = floorCount * floorHeight;
  const front = depth / 2 + 0.06;

  return (
    <Entity name={`Building (${floorCount} ${floorCount === 1 ? "floor" : "floors"})`}>
      <Position3d x={position.x} y={position.y} z={position.z} />

      <Entity>
        <Position3d x={0} y={height / 2} z={0} />
        <Cuboid width={width} height={height} depth={depth} />
        <Color {...facade} a={255} />
      </Entity>

      {Array.from({ length: floorCount }, (_, floor) => {
        const floorBottom = floor * floorHeight;
        const windowY = floorBottom + 1.38;

        return (
          <Entity key={floor} name={`Floor ${floor + 1}`}>
            {floor === 0 ? (
              <>
                <Entity>
                  <Position3d x={0} y={1.05} z={front} />
                  <Door width={1.28} height={2.1} />
                </Entity>
                <Entity>
                  <Position3d x={-1.42} y={windowY} z={front} />
                  <Window width={0.78} height={1.05} />
                </Entity>
                <Entity>
                  <Position3d x={1.42} y={windowY} z={front} />
                  <Window width={0.78} height={1.05} />
                </Entity>
              </>
            ) : (
              <>
                <Entity>
                  <Position3d x={-1.15} y={windowY} z={front} />
                  <Window />
                </Entity>
                <Entity>
                  <Position3d x={1.15} y={windowY} z={front} />
                  <Window />
                </Entity>
              </>
            )}
            <Entity>
              <Position3d x={0} y={floorBottom + floorHeight} z={0} />
              <Cuboid width={width + 0.12} height={0.12} depth={depth + 0.12} />
              <Color
                r={Math.round(facade.r * 0.8)}
                g={Math.round(facade.g * 0.8)}
                b={Math.round(facade.b * 0.8)}
                a={255}
              />
            </Entity>
          </Entity>
        );
      })}

      <Entity>
        <Position3d x={0} y={height + 0.12} z={0} />
        <Cuboid width={width + 0.36} height={0.24} depth={depth + 0.36} />
        <Color
          r={Math.round(facade.r * 0.7)}
          g={Math.round(facade.g * 0.7)}
          b={Math.round(facade.b * 0.7)}
          a={255}
        />
      </Entity>
    </Entity>
  );
}
