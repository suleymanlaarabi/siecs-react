import {
  add,
  Disabled,
  Name,
  remove,
  set,
  setName,
  setPointerEvents,
} from "siecs-ts";
import type {
  ComponentInstance,
  EntityHostProps,
  EntityInstance,
  HostInstance,
} from "./host-types.js";
import { pointerMask } from "./events/mask.js";
import {
  registerInteractiveInstance,
  unregisterInteractiveInstance,
} from "./events/registry.js";

export function shallowEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (
    typeof left !== "object" ||
    left === null ||
    typeof right !== "object" ||
    right === null
  ) {
    return false;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;

  for (const key of leftKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(right, key) ||
      !Object.is(
        (left as Record<string, unknown>)[key],
        (right as Record<string, unknown>)[key],
      )
    ) {
      return false;
    }
  }

  return true;
}

export function updateEntity(
  node: EntityInstance,
  nextProps: EntityHostProps,
): void {
  const previousProps = node.props;
  node.props = nextProps;
  if (!node.mounted) return;

  const oldPointerMask = node.pointerMask;
  const nextPointerMask = pointerMask(nextProps);
  if (oldPointerMask !== nextPointerMask) {
    setPointerEvents(node.id, nextPointerMask);
    if (oldPointerMask === 0) registerInteractiveInstance(node);
    else if (nextPointerMask === 0) unregisterInteractiveInstance(node);
    node.pointerMask = nextPointerMask;
  }

  if (previousProps.name !== nextProps.name) {
    if (nextProps.name === undefined) remove(node.id, Name);
    else setName(node.id, nextProps.name);
  }

  const wasDisabled = Boolean(previousProps.disabled) || node.hidden;
  const isDisabled = Boolean(nextProps.disabled) || node.hidden;
  if (wasDisabled !== isDisabled) {
    if (isDisabled) add(node.id, Disabled);
    else remove(node.id, Disabled);
  }
}

export function updateComponent(
  node: ComponentInstance,
  nextValue: unknown,
): void {
  const previousValue = node.value;
  node.value = nextValue;
  if (
    !node.mounted ||
    node.parent === null ||
    shallowEqual(previousValue, nextValue)
  ) {
    return;
  }

  set(node.parent.id, node.component, nextValue);
}

export function hideHostInstance(node: HostInstance): void {
  if (node.kind !== "entity" || node.hidden) return;
  node.hidden = true;
  if (node.mounted && !node.props.disabled) add(node.id, Disabled);
}

export function unhideHostInstance(node: HostInstance): void {
  if (node.kind !== "entity" || !node.hidden) return;
  node.hidden = false;
  if (node.mounted && !node.props.disabled) remove(node.id, Disabled);
}
