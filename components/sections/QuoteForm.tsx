"use client";

import { useEffect, useRef, useState } from "react";
import {
  MESSAGE_MAX,
  contactMethods,
  emptyQuote,
  formatPhone,
  quoteServices,
  toQuoteService,
  validateQuote,
  type QuoteErrors,
  type QuoteInput,
} from "@/lib/quote";
import { business } from "@/lib/site";
import { SELECT_SERVICE_EVENT } from "@/components/ui/QuoteLink";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ArrowRightIcon, CheckIcon, ClockIcon, MailIcon, PhoneIcon, ShieldIcon } from "@/components/ui/Icons";

type Status = "idle" | "submitting" | "success" | "error";

function Field({
  id,
  label,
  optional,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-sm font-bold text-charcoal">
        {label}
        {optional && <span className="text-xs font-semibold text-stone">Optional</span>}
      </label>
      {children}
      <p
        id={`${id}-error`}
        className={`mt-1.5 min-h-[1.25rem] text-[0.82rem] font-semibold text-[#b4533d] transition-opacity ${error ? "opacity-100" : "opacity-0"}`}
        aria-live="polite"
      >
        {error ?? ""}
      </p>
    </div>
  );
}

export function QuoteForm() {
  const [values, setValues] = useState<QuoteInput>(emptyQuote);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof QuoteInput, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submittedName, setSubmittedName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLSelectElement>(null);

  // "Quote this service" buttons elsewhere preselect the dropdown and note the specific service.
  useEffect(() => {
    const onSelect = (e: Event) => {
      const named = (e as CustomEvent<string>).detail;
      const service = toQuoteService(named);
      setValues((v) => ({
        ...v,
        service,
        message: v.message || (named !== service ? `I'm interested in: ${named}` : ""),
      }));
      setErrors((err) => ({ ...err, service: undefined }));
      setStatus((s) => (s === "success" ? "idle" : s));
      if (serviceRef.current) {
        gsap.fromTo(
          serviceRef.current,
          { boxShadow: "0 0 0 0px rgb(201 168 118 / 0.6)" },
          { boxShadow: "0 0 0 8px rgb(201 168 118 / 0)", duration: 1.2, delay: 1.2 },
        );
      }
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, []);

  useEffect(() => {
    if (status !== "success" || !thanksRef.current) return;
    thanksRef.current.focus({ preventScroll: true });
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.from(thanksRef.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" })
      .from(thanksRef.current.querySelector("[data-check]"), { scale: 0, rotate: -90, duration: 0.7, ease: "back.out(2)" }, 0.1)
      .from(thanksRef.current.querySelectorAll("[data-thanks-line]"), { opacity: 0, y: 14, stagger: 0.1, duration: 0.5 }, 0.3);
    return () => {
      tl.kill();
    };
  }, [status]);

  const update = <K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key] || errors[key]) setErrors((e) => ({ ...e, [key]: validateQuote(next)[key] }));
  };

  const blur = (key: keyof QuoteInput) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((e) => ({ ...e, [key]: validateQuote(values)[key] }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateQuote(values);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const website = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.errors) {
          setErrors(data.errors);
          setStatus("idle");
          return;
        }
        throw new Error("Request failed");
      }
      setSubmittedName(values.name.trim().split(/\s+/)[0] ?? "");
      setValues(emptyQuote);
      setTouched({});
      setErrors({});
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const aria = (key: keyof QuoteInput) => ({
    name: key,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": `${key}-error`,
    onBlur: () => blur(key),
  });

  const infoCards = [
    {
      href: business.phoneHref,
      icon: <PhoneIcon className="h-5 w-5" />,
      label: "Call",
      value: business.phone,
    },
    {
      href: `mailto:${business.email}`,
      icon: <MailIcon className="h-5 w-5" />,
      label: "Email",
      value: business.email,
    },
  ];

  return (
    <section id="quote" aria-labelledby="quote-title" className="bg-parchment py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Info cards — alongside the form, not instead of it */}
          <div className="min-w-0 lg:col-span-5">
            <p className="eyebrow" data-reveal>
              Free Quote
            </p>
            <h2 id="quote-title" data-split className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] text-charcoal">
              Tell us about your <em className="text-forest">property.</em>
            </h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-stone" data-reveal>
              A few details and we&apos;ll get back to you with a no-obligation quote. Prefer to talk? We pick up the
              phone.
            </p>

            <ul className="mt-9 space-y-3">
              {infoCards.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="group flex items-center gap-4 rounded-[1.25rem] bg-white p-4 shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-white">{c.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-stone">{c.label}</span>
                      <span className="block font-display text-[0.95rem] text-charcoal [overflow-wrap:anywhere] sm:text-lg">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-4 rounded-[1.25rem] bg-white p-4 shadow-[var(--shadow-soft)]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mist text-forest">
                  <ClockIcon className="h-5 w-5" />
                </span>
                <span className="text-sm leading-relaxed text-ink">
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-stone">Hours</span>
                  Mon–Fri 7:00 AM–5:00 PM
                  <br />
                  Sat 7:00 AM–3:00 PM
                </span>
              </li>
              <li className="flex items-start gap-4 rounded-[1.25rem] bg-white p-4 shadow-[var(--shadow-soft)]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mist text-forest">
                  <ShieldIcon className="h-5 w-5" />
                </span>
                <span className="text-sm leading-relaxed text-ink">
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-stone">Licensed &amp; insured</span>
                  License {business.license} · Official Grounds Guys Partner
                </span>
              </li>
            </ul>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <div className="rounded-[2rem] bg-white p-6 shadow-[var(--shadow-lift)] sm:p-9 md:p-11">
              {status === "success" ? (
                <div ref={thanksRef} tabIndex={-1} className="py-10 text-center outline-none md:py-16" role="status">
                  <span data-check className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-forest text-white shadow-[var(--shadow-glow)]">
                    <CheckIcon className="h-9 w-9" />
                  </span>
                  <h3 data-thanks-line className="mt-7 font-display text-[2.4rem] leading-tight text-charcoal">
                    Thank you{submittedName ? `, ${submittedName}` : ""}.
                  </h3>
                  <p data-thanks-line className="mx-auto mt-3 max-w-md text-[1.02rem] leading-relaxed text-stone">
                    Your quote request is in. We&apos;ll be in touch shortly — usually within one business day. Need us
                    sooner? Call{" "}
                    <a href={business.phoneHref} className="font-bold text-forest">
                      {business.phone}
                    </a>
                    .
                  </p>
                  <button data-thanks-line type="button" onClick={() => setStatus("idle")} className="btn btn-outline-dark mt-8">
                    Request another quote
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="quote-note" className="relative">
                  <h3 className="mb-6 font-display text-2xl text-charcoal">Request your free quote</h3>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <Field id="name" label="Name" error={errors.name} className="sm:col-span-2">
                      <input id="name" type="text" autoComplete="name" className="field" value={values.name} onChange={(e) => update("name", e.target.value)} {...aria("name")} />
                    </Field>
                    <Field id="phone" label="Phone" error={errors.phone}>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel-national"
                        inputMode="tel"
                        placeholder="(321) 555-0123"
                        className="field"
                        value={values.phone}
                        onChange={(e) => update("phone", formatPhone(e.target.value))}
                        {...aria("phone")}
                      />
                    </Field>
                    <Field id="email" label="Email" error={errors.email}>
                      <input id="email" type="email" autoComplete="email" inputMode="email" className="field" value={values.email} onChange={(e) => update("email", e.target.value)} {...aria("email")} />
                    </Field>
                    <Field id="address" label="Service Address" error={errors.address} className="sm:col-span-2">
                      <input
                        id="address"
                        type="text"
                        autoComplete="street-address"
                        placeholder="Street, city, ZIP"
                        className="field"
                        value={values.address}
                        onChange={(e) => update("address", e.target.value)}
                        {...aria("address")}
                      />
                    </Field>
                    <Field id="service" label="Service Needed" error={errors.service} className="sm:col-span-2">
                      <div className="relative">
                        <select
                          ref={serviceRef}
                          id="service"
                          className="field appearance-none pr-12"
                          value={values.service}
                          onChange={(e) => update("service", e.target.value as QuoteInput["service"])}
                          {...aria("service")}
                        >
                          <option value="" disabled>
                            Choose a service…
                          </option>
                          {quoteServices.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </Field>
                  </div>

                  <fieldset className="mb-5" aria-describedby="contactMethod-error">
                    <legend className="mb-2 block text-sm font-bold text-charcoal">Preferred Contact Method</legend>
                    <div className="grid grid-cols-3 gap-1.5 rounded-full bg-parchment p-1.5">
                      {contactMethods.map((m) => (
                        <label
                          key={m}
                          className={`relative cursor-pointer rounded-full px-2 py-3 text-center text-[0.82rem] font-bold transition-all duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sand sm:text-sm ${
                            values.contactMethod === m ? "bg-white text-charcoal shadow-[var(--shadow-soft)]" : "text-stone hover:text-charcoal"
                          }`}
                        >
                          <input
                            type="radio"
                            name="contactMethod"
                            value={m}
                            checked={values.contactMethod === m}
                            onChange={() => update("contactMethod", m)}
                            className="sr-only"
                          />
                          {m}
                        </label>
                      ))}
                    </div>
                    <p id="contactMethod-error" className="sr-only" aria-live="polite">
                      {errors.contactMethod ?? ""}
                    </p>
                  </fieldset>

                  <Field id="message" label="Message" optional error={errors.message}>
                    <textarea
                      id="message"
                      rows={4}
                      maxLength={MESSAGE_MAX}
                      placeholder="Anything we should know — zones acting up, a leak you've spotted, best time to visit…"
                      className="field resize-y"
                      value={values.message}
                      onChange={(e) => update("message", e.target.value)}
                      {...aria("message")}
                    />
                  </Field>

                  {/* Honeypot — leave empty. */}
                  <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  {status === "error" && (
                    <p role="alert" className="mb-4 rounded-2xl bg-[#b4533d]/10 p-4 text-sm font-semibold text-[#8f3f2d]">
                      Something went wrong sending your request. Please try again, or call us at{" "}
                      <a href={business.phoneHref} className="underline">
                        {business.phone}
                      </a>
                      .
                    </p>
                  )}

                  <div className="mt-2 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p id="quote-note" className="text-xs leading-relaxed text-stone sm:max-w-[16rem]">
                      No obligation. We&apos;ll only use your details to respond to this request. See our{" "}
                      <a href="/privacy" className="underline underline-offset-2">
                        Privacy Policy
                      </a>
                      .
                    </p>
                    <button type="submit" className="btn btn-primary !px-8 !py-[1.1rem] text-base" disabled={status === "submitting"}>
                      {status === "submitting" ? "Sending…" : "Get My Free Quote"}
                      {status !== "submitting" && <ArrowRightIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
