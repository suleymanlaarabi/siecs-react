import {
  add,
  ChildOf,
  createEntity,
  Disabled,
  isAlive,
  kill,
  relate,
  set,
  setName,
} from "siecs-ts";
import type {
  ComponentInstance,
  EntityInstance,
  HostInstance,
} from "./host-types.js";

function mountComponent(
  node: ComponentInstance,
  parent: EntityInstance,
): void {
  set(parent.id, node.component, node.value);
  node.parent = parent;
  node.mounted = true;
}

export function mountEntity(
  node: EntityInstance,
  parent: EntityInstance | null = null,
): void {
  const pending: Array<{
    node: HostInstance;
    parent: EntityInstance | null;
  }> = [{ node, parent }];

  while (pending.length > 0) {
    const current = pending.pop()!;
    if (current.node.mounted) continue;
    if (current.node.kind === "component") {
      if (current.parent) mountComponent(current.node, current.parent);
      continue;
    }

    current.node.id = createEntity();
    current.node.mounted = true;
    current.node.parent = current.parent;

    if (current.parent) {
      relate(current.node.id, ChildOf, current.parent.id);
    }
    if (current.node.props.name !== undefined) {
      setName(current.node.id, current.node.props.name);
    }
    if (current.node.props.disabled || current.node.hidden) {
      add(current.node.id, Disabled);
    }

    for (let index = current.node.children.length - 1; index >= 0; index--) {
      const child = current.node.children[index]!;
      pending.push({ node: child, parent: current.node });
    }
  }
}

export function mountChild(
  node: HostInstance,
  parent: EntityInstance,
): void {
  if (node.mounted) return;
  if (node.kind === "component") mountComponent(node, parent);
  else mountEntity(node, parent);
}

export function markSubtreeUnmounted(node: HostInstance): void {
  const pending = [node];
  while (pending.length > 0) {
    const current = pending.pop()!;
    current.mounted = false;
    current.parent = null;
    if (current.kind === "component") continue;

    current.id = 0n;
    pending.push(...current.children);
  }
}

export function destroyEntity(node: EntityInstance): void {
  if (node.mounted && isAlive(node.id)) kill(node.id);
  markSubtreeUnmounted(node);
}
