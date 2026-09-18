import { remove } from "siecs-ts";
import type {
  EntityInstance,
  HostInstance,
  RootContainer,
} from "./host-types.js";
import { destroyEntity, markSubtreeUnmounted, mountChild, mountEntity } from "./mount.js";
import { ROOT_CHILD_ERROR } from "./renderer/constants.js";

function detach<Item>(items: Item[], item: Item): void {
  const index = items.indexOf(item);
  if (index !== -1) items.splice(index, 1);
}

function insert<Item>(items: Item[], item: Item, before?: Item): void {
  detach(items, item);
  if (before === undefined) {
    items.push(item);
    return;
  }

  const index = items.indexOf(before);
  if (index === -1) throw new Error("siecs-react received an unknown sibling.");
  items.splice(index, 0, item);
}

export function appendInitialChild(
  parent: HostInstance,
  child: HostInstance,
): void {
  if (parent.kind !== "entity") {
    throw new Error("siecs-react components cannot contain children.");
  }
  insert(parent.children, child);
  child.parent = parent;
}

export function appendChild(
  parent: EntityInstance,
  child: HostInstance,
): void {
  insert(parent.children, child);
  child.parent = parent;
  if (parent.mounted) mountChild(child, parent);
}

export function insertBefore(
  parent: EntityInstance,
  child: HostInstance,
  before: HostInstance,
): void {
  insert(parent.children, child, before);
  child.parent = parent;
  if (parent.mounted) mountChild(child, parent);
}

export function appendChildToContainer(
  container: RootContainer,
  child: HostInstance,
): void {
  if (child.kind !== "entity") {
    throw new Error(ROOT_CHILD_ERROR);
  }
  insert(container.children, child);
  child.parent = container;
  mountEntity(child);
  child.parent = container;
}

export function insertInContainerBefore(
  container: RootContainer,
  child: HostInstance,
  before: HostInstance,
): void {
  if (child.kind !== "entity" || before.kind !== "entity") {
    throw new Error(ROOT_CHILD_ERROR);
  }
  insert(container.children, child, before);
  child.parent = container;
  mountEntity(child);
  child.parent = container;
}

export function removeChild(
  parent: EntityInstance,
  child: HostInstance,
): void {
  detach(parent.children, child);
  if (child.kind === "entity") {
    destroyEntity(child);
    return;
  }

  if (parent.mounted && child.mounted) remove(parent.id, child.component);
  markSubtreeUnmounted(child);
}

export function removeChildFromContainer(
  container: RootContainer,
  child: HostInstance,
): void {
  detach(container.children, child as EntityInstance);
  if (child.kind === "entity") destroyEntity(child);
  else markSubtreeUnmounted(child);
}

export function clearContainer(container: RootContainer): void {
  for (const child of container.children) destroyEntity(child);
  container.children.length = 0;
}
