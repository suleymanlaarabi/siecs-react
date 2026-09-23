import { useState } from "react";

export function usePointer() {
  const [state, setState] = useState<"enter" | "leave" | "down" | "up">(
    "leave",
  );

  return [
    state,
    {
      onPointerEnter: () => setState("enter"),
      onPointerLeave: () => setState("leave"),
      onPointerDown: () => setState("down"),
      onPointerUp: () => setState("up"),
    },
  ] as const;
}
