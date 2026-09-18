import {
  DefaultEventPriority,
  NoEventPriority,
} from "react-reconciler/constants";

let currentPriority = NoEventPriority;

export function setCurrentUpdatePriority(priority: number): void {
  currentPriority = priority;
}

export function getCurrentUpdatePriority(): number {
  return currentPriority;
}

export function resolveUpdatePriority(): number {
  return currentPriority || DefaultEventPriority;
}
