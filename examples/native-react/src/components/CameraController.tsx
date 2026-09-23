import {
  component,
  filter,
  Keyboard,
  Key,
  Position3d,
  Rotation3d,
  system,
  write,
} from "siecs-react";

/**
 * ECS marker to put on a camera entity. The system is registered once when
 * this module loads, rather than once for every React render.
 */
export const CameraController = component("CameraController");

const moveSpeed = 8;
const rotationSpeed = 1.5;

system({
  name: "Camera controller",
  query: {
    controller: filter(CameraController),
    position: write(Position3d),
    rotation: write(Rotation3d),
    keyboard: Keyboard,
  },
  each: ({ position, rotation, keyboard }, { deltaTime }) => {
    const forward = Number(keyboard.keys[Key.S]) - Number(keyboard.keys[Key.W]);
    const strafe = Number(keyboard.keys[Key.A]) - Number(keyboard.keys[Key.D]);
    const vertical = Number(keyboard.keys[Key.E]) - Number(keyboard.keys[Key.Q]);
    const sinYaw = Math.sin(rotation.yaw);
    const cosYaw = Math.cos(rotation.yaw);
    const distance = moveSpeed * deltaTime;

    position.x += (forward * sinYaw + strafe * cosYaw) * distance;
    position.y += vertical * distance;
    position.z += (forward * cosYaw - strafe * sinYaw) * distance;

    rotation.yaw +=
      (Number(keyboard.keys[Key.Right]) - Number(keyboard.keys[Key.Left])) *
      rotationSpeed *
      deltaTime;
    rotation.pitch -=
      (Number(keyboard.keys[Key.Down]) - Number(keyboard.keys[Key.Up])) *
      rotationSpeed *
      deltaTime;
  },
});
