"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { SELECT_SERVICE_EVENT } from "@/components/ui/QuoteLink";

const Arrow = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);

/**
 * The site-wide CTA: pill button whose arrow slides out and a fresh one slides in on hover.
 * `service` preselects that service in the quote form when the button leads there.
 */
export function ArrowButton({
  children,
  href,
  light = false,
  className = "",
  service,
  onClick,
}: {
  children: ReactNode;
  href: string;
  light?: boolean;
  className?: string;
  service?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const external = /^(tel:|mailto:|https?:)/.test(href);
  const classes = `arrow-btn${light ? " light" : ""}${className ? ` ${className}` : ""}`;
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (service) window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: service }));
    onClick?.(event);
  };
  const content = (
    <>
      <span className="arrow-wrap">
        <Arrow className="a1" />
        <Arrow className="a2" />
      </span>
      {children}
    </>
  );

  if (external) {
    return (
      <a href={href} className={classes} onClick={handleClick}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={handleClick}>
      {content}
    </Link>
  );
}

export default ArrowButton;
