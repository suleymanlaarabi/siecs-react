import type { PointerEventData } from "siecs-ts";
import type {
  EntityRef,
  SiecsPointerEvent,
  SiecsPointerEventType,
} from "../../types.js";

export type NativePointerPayload = Pick<
  PointerEventData,
  | "relatedTarget"
  | "timestamp"
  | "pointerId"
  | "pointerType"
  | "button"
  | "buttons"
  | "clicks"
  | "x"
  | "y"
  | "deltaX"
  | "deltaY"
  | "wheelX"
  | "wheelY"
  | "rayOriginX"
  | "rayOriginY"
  | "rayOriginZ"
  | "rayDirectionX"
  | "rayDirectionY"
  | "rayDirectionZ"
  | "pointX"
  | "pointY"
  | "pointZ"
  | "normalX"
  | "normalY"
  | "normalZ"
  | "distance"
>;

export interface MutableSiecsPointerEvent extends SiecsPointerEvent {
  setCurrentTarget(target: EntityRef): void;
}

class PointerEventSnapshot implements MutableSiecsPointerEvent {
  currentTarget: EntityRef;
  private stopped = false;

  constructor(
    readonly type: SiecsPointerEventType,
    readonly target: EntityRef,
    relatedTarget: EntityRef | null,
    payload: NativePointerPayload,
  ) {
    this.currentTarget = target;
    this.relatedTarget = relatedTarget;
    this.pointerId = payload.pointerId;
    this.pointerType = payload.pointerType;
    this.button = payload.button;
    this.buttons = payload.buttons;
    this.clicks = payload.clicks;
    this.timeStamp = Number(payload.timestamp);
    this.x = payload.x;
    this.y = payload.y;
    this.deltaX = payload.deltaX;
    this.deltaY = payload.deltaY;
    this.wheelX = payload.wheelX;
    this.wheelY = payload.wheelY;
    this.rayOriginX = payload.rayOriginX;
    this.rayOriginY = payload.rayOriginY;
    this.rayOriginZ = payload.rayOriginZ;
    this.rayDirectionX = payload.rayDirectionX;
    this.rayDirectionY = payload.rayDirectionY;
    this.rayDirectionZ = payload.rayDirectionZ;
    this.pointX = payload.pointX;
    this.pointY = payload.pointY;
    this.pointZ = payload.pointZ;
    this.normalX = payload.normalX;
    this.normalY = payload.normalY;
    this.normalZ = payload.normalZ;
    this.distance = payload.distance;
  }

  readonly relatedTarget: EntityRef | null;
  readonly pointerId: number;
  readonly pointerType: PointerEventData["pointerType"];
  readonly button: number;
  readonly buttons: number;
  readonly clicks: number;
  readonly timeStamp: number;
  readonly x: number;
  readonly y: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly wheelX: number;
  readonly wheelY: number;
  readonly rayOriginX: number;
  readonly rayOriginY: number;
  readonly rayOriginZ: number;
  readonly rayDirectionX: number;
  readonly rayDirectionY: number;
  readonly rayDirectionZ: number;
  readonly pointX: number;
  readonly pointY: number;
  readonly pointZ: number;
  readonly normalX: number;
  readonly normalY: number;
  readonly normalZ: number;
  readonly distance: number;

  setCurrentTarget(target: EntityRef): void {
    this.currentTarget = target;
  }

  stopPropagation(): void {
    this.stopped = true;
  }

  isPropagationStopped(): boolean {
    return this.stopped;
  }
}

export function createPointerEvent(
  type: SiecsPointerEventType,
  target: EntityRef,
  relatedTarget: EntityRef | null,
  payload: NativePointerPayload,
): MutableSiecsPointerEvent {
  return new PointerEventSnapshot(type, target, relatedTarget, payload);
}
