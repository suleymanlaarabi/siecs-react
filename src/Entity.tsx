import { createElement, forwardRef } from "react";
import { ENTITY_TYPE } from "./internal/host-types.js";
import type { EntityProps, EntityRef } from "./types.js";

export const Entity = forwardRef<EntityRef, EntityProps>(
  function Entity(props, ref) {
    return createElement(ENTITY_TYPE, { ...props, ref });
  },
);
