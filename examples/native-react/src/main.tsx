import { useState } from "react";
import {
  AmbientLight,
  Bloom,
  BloomSettings,
  Camera,
  Color,
  Cuboid,
  Keyboard,
  Key,
  Position3d,
  quit,
  Rotation3d,
  run,
  setResource,
  Shadows,
  Sky,
  Static,
  Sun,
  system,
  write,
  createRoot,
  Entity,
} from "siecs-react";

function Scene() {

  return (
    <>
      <Entity name="Camera">
        <Camera fov={60} />
        <Position3d x={0} y={2} z={10} />
        <Rotation3d pitch={-0.12} yaw={0} roll={0} />
      </Entity>

      <Entity name="Floor">
        <Static />
        <Position3d x={0} y={-1.5} z={0} />
        <Cuboid width={12} height={0.3} depth={8} />
        <Color r={70} g={80} b={105} a={255} />
      </Entity>

      <Entity name="Player">
        <Position3d x={0} y={0} z={0}/>
        <Rotation3d pitch={0.2} yaw={0} roll={0} />
        <Cuboid width={2} height={2} depth={2} />
        <Color r={70} g={175} b={255} a={255} />
        <Bloom intensity={1.2} />
      </Entity>
    </>
  );
}

setResource(AmbientLight, {
  color: { r: 180, g: 195, b: 230, a: 255 },
  intensity: 0.3,
});
setResource(Shadows, { enabled: true, distance: 50 });

system({
  name: "Pilot player",
  query: {
    position: write(Position3d),
    rotation: write(Rotation3d),
    cuboid: Cuboid,
    keyboard: Keyboard,
  },
  each: ({ position, rotation, keyboard }, { deltaTime }) => {
    const x = Number(keyboard.keys[Key.D]) - Number(keyboard.keys[Key.A]);
    const z = Number(keyboard.keys[Key.S]) - Number(keyboard.keys[Key.W]);
    const turn = Number(keyboard.keys[Key.Right]) - Number(keyboard.keys[Key.Left]);

    position.x -= x * deltaTime * 3;
    position.z += z * deltaTime * 3;
    rotation.yaw += turn * deltaTime * 2;
  },
});

function main(): void {
  const root = createRoot();
  root.render(<Scene />);
  run();
}

main();
