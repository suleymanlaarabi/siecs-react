import { PointerEventMask } from "siecs-ts";
import type { EntityHostProps } from "../host-types.js";

/** Returns the native interaction bits required by committed Entity props. */
export function pointerMask(props: EntityHostProps): number {
  let mask = 0;
  if (typeof props.onPointerEnter === "function") mask |= PointerEventMask.Enter;
  if (typeof props.onPointerLeave === "function") mask |= PointerEventMask.Leave;
  if (typeof props.onPointerMove === "function") mask |= PointerEventMask.Move;
  if (typeof props.onPointerDown === "function") mask |= PointerEventMask.Down;
  if (typeof props.onPointerUp === "function") mask |= PointerEventMask.Up;
  if (typeof props.onPointerCancel === "function") mask |= PointerEventMask.Cancel;
  if (typeof props.onClick === "function") mask |= PointerEventMask.Click;
  if (typeof props.onPress === "function") mask |= PointerEventMask.Press;
  if (typeof props.onWheel === "function") mask |= PointerEventMask.Wheel;
  return mask;
}
