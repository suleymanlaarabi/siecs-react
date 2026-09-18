import { createRef, type RefObject } from "react";
import { bind, createRoot, Entity, type EntityRef } from "siecs-react";
import {
  AmbientLight,
  Bloom,
  BloomSettings,
  Camera,
  Color,
  Cuboid,
  fini,
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
} from "siecs-ts";

const RCamera = bind(Camera);
const RColor = bind(Color);
const RCuboid = bind(Cuboid);
const RPosition3d = bind(Position3d);
const RRotation3d = bind(Rotation3d);
const RStatic = bind(Static);
const RBloom = bind(Bloom);

function Scene({ player }: { player: RefObject<EntityRef | null> }) {
  return (
    <>
      <Entity name="Camera">
        <RCamera fov={60} />
        <RPosition3d x={0} y={2} z={10} />
        <RRotation3d pitch={-0.12} yaw={0} roll={0} />
      </Entity>

      <Entity name="Floor">
        <RStatic />
        <RPosition3d x={0} y={-1.5} z={0} />
        <RCuboid width={12} height={0.3} depth={8} />
        <RColor r={70} g={80} b={105} a={255} />
      </Entity>

      <Entity ref={player} name="Player">
        <RPosition3d x={0} y={0} z={0} />
        <RRotation3d pitch={0.2} yaw={0} roll={0} />
        <RCuboid width={2} height={2} depth={2} />
        <RColor r={70} g={175} b={255} a={255} />
        <RBloom intensity={1.2} />
      </Entity>
    </>
  );
}

function configureRenderer(): void {
  setResource(Sky, { color: { r: 13, g: 18, b: 32, a: 255 } });
  setResource(AmbientLight, {
    color: { r: 180, g: 195, b: 230, a: 255 },
    intensity: 0.3,
  });
  setResource(Sun, {
    x: -0.6,
    y: -1,
    z: -0.4,
    color: { r: 255, g: 240, b: 215, a: 255 },
    intensity: 1.5,
  });
  setResource(BloomSettings, { enabled: true, threshold: 0.8, intensity: 0.5 });
  setResource(Shadows, { enabled: true, distance: 50 });
}

function installPlayerSystem(): void {
  system({
    name: "Pilot player",
    query: {
      position: write(Position3d),
      rotation: write(Rotation3d),
      cuboid: Cuboid,
      keyboard: Keyboard,
    },
    each: ({ position, rotation, keyboard }, { deltaTime }) => {
      if (keyboard.keys[Key.Q]) quit();

      const x = Number(keyboard.keys[Key.D]) - Number(keyboard.keys[Key.A]);
      const z = Number(keyboard.keys[Key.S]) - Number(keyboard.keys[Key.W]);
      const turn = Number(keyboard.keys[Key.Right]) - Number(keyboard.keys[Key.Left]);

      position.x -= x * deltaTime * 3;
      position.z += z * deltaTime * 3;
      rotation.yaw += turn * deltaTime * 2;
    },
  });
}

function nextTurn(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function waitForCommit(ref: RefObject<EntityRef | null>): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt++) {
    if (ref.current !== null) return;
    await nextTurn();
  }
  throw new Error("The React scene was not committed before the native loop started.");
}

async function main(): Promise<void> {
  configureRenderer();

  const player = createRef<EntityRef>();
  const root = createRoot();
  let nativeLoopStarted = false;

  try {
    root.render(<Scene player={player} />);
    await waitForCommit(player);
    installPlayerSystem();

    nativeLoopStarted = true;
    run();
  } finally {
    // run() finalizes siecs-ts. Once it has started, native entities no longer
    // exist, so React must not attempt a later unmount against that runtime.
    if (!nativeLoopStarted) root.unmount();
    fini();
  }
}

void main();
