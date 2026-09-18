import { createElement, type ComponentType } from "react";
import type { Component, ComponentValue } from "siecs-ts";
import { COMPONENT_TYPE } from "./internal/host-types.js";

const bindings = new Map<number, ComponentType<unknown>>();

export function bind<ComponentTypeValue extends Component>(
  component: ComponentTypeValue,
): ComponentType<ComponentValue<ComponentTypeValue>> {
  const cached = bindings.get(component);
  if (cached) {
    return cached as ComponentType<ComponentValue<ComponentTypeValue>>;
  }

  function BoundComponent(props: ComponentValue<ComponentTypeValue>) {
    return createElement(COMPONENT_TYPE, { component, value: props });
  }

  BoundComponent.displayName = "SiecsComponent";
  bindings.set(component, BoundComponent as ComponentType<unknown>);
  return BoundComponent;
}
