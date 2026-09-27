"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Always the visitor's current year, even on a statically cached page. */
export function CopyrightYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => new Date().getFullYear(),
  );
  return <span suppressHydrationWarning>{year}</span>;
}
