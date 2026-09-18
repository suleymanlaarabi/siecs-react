import { isAlive } from "siecs-ts";
import type {
  ComponentHostProps,
  ComponentInstance,
  EntityHostProps,
  EntityInstance,
  RootContainer,
} from "./host-types.js";

export function createRootContainer(): RootContainer {
  return { children: [] };
}

export function createEntityInstance(props: EntityHostProps): EntityInstance {
  return {
    kind: "entity",
    id: 0n,
    mounted: false,
    parent: null,
    children: [],
    props,
    hidden: false,
    isAlive() {
      return this.mounted && isAlive(this.id);
    },
  };
}

export function createComponentInstance(
  props: ComponentHostProps,
): ComponentInstance {
  return {
    kind: "component",
    component: props.component,
    value: props.value,
    parent: null,
    mounted: false,
  };
}
