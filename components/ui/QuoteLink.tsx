"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export const SELECT_SERVICE_EVENT = "select-service";

/** Link to the quote form that optionally preselects a service in the dropdown. */
export function QuoteLink({ service, className, children }: { service?: string; className?: string; children: ReactNode }) {
  return (
    <Link
      href="/#quote"
      className={className}
      onClick={() => {
        if (service) window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: service }));
      }}
    >
      {children}
    </Link>
  );
}
