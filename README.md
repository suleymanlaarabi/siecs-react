# siecs-react

A concurrent-safe React renderer for
[siecs-ts](https://www.npmjs.com/package/siecs-ts). React builds an inert JS
tree during render; ECS entities are created and updated only during commit,
inside one deferred SIECS transaction.

```tsx
import { bind, createRoot, Entity } from "siecs-react";
import { component } from "siecs-ts";

const Position = component("Position", { x: "f32", y: "f32" });
const RPosition = bind(Position);

const root = createRoot();
root.render(
  <Entity name="Player">
    <RPosition x={0} y={0} />
  </Entity>,
);

root.unmount();
```

`Entity` accepts `name`, `disabled`, and React children. Nested entities are
linked through `ChildOf`. `bind(component)` returns a cached, strongly typed
React component and supports both data components and tags.

Use an `EntityRef` to access the entity after commit:

```tsx
import { createRef } from "react";
import { createRoot, Entity, type EntityRef } from "siecs-react";

const player = createRef<EntityRef>();
const root = createRoot();
root.render(<Entity ref={player} />);

player.current?.id;
player.current?.isAlive();
```

Suspense/Offscreen visibility maps to the SIECS `Disabled` component. Text
nodes are intentionally unsupported.
