import { serviceCategories } from "./services";

export const quoteServices = [
  "Irrigation Repair",
  "Irrigation Installation",
  "Lawn Care",
  "Specialized Services",
  "Not Sure",
] as const;
export type QuoteService = (typeof quoteServices)[number];

export const contactMethods = ["Phone call", "Text message", "Email"] as const;
export type ContactMethod = (typeof contactMethods)[number];

export type QuoteInput = {
  name: string;
  phone: string;
  email: string;
  address: string;
  service: QuoteService | "";
  contactMethod: ContactMethod;
  message: string;
};

export type QuoteErrors = Partial<Record<keyof QuoteInput, string>>;

export const emptyQuote: QuoteInput = {
  name: "",
  phone: "",
  email: "",
  address: "",
  service: "",
  contactMethod: "Phone call",
  message: "",
};

export const MESSAGE_MAX = 1000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared by the browser form and the API route so both enforce identical rules. */
export function validateQuote(v: QuoteInput): QuoteErrors {
  const e: QuoteErrors = {};
  const name = v.name.trim();
  if (!name) e.name = "Please enter your name.";
  else if (name.length < 2) e.name = "Please enter your full name.";
  else if (name.length > 80) e.name = "That name is a little long.";
  const digits = v.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (!digits) e.phone = "Please add a phone number.";
  else if (digits.length !== 10) e.phone = "Enter a 10-digit US phone number.";
  if (!v.email.trim()) e.email = "We need an email to send your quote.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That email doesn't look quite right.";
  if (!v.address.trim()) e.address = "Where's the property?";
  else if (v.address.trim().length < 6) e.address = "Please enter the full service address.";
  if (!v.service) e.service = "Choose the service you need.";
  else if (!quoteServices.includes(v.service)) e.service = "Choose a service from the list.";
  if (!contactMethods.includes(v.contactMethod)) e.contactMethod = "Choose how we should reach you.";
  if (v.message.length > MESSAGE_MAX) e.message = `Please keep your message under ${MESSAGE_MAX} characters.`;
  return e;
}

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Map a specific service named elsewhere on the site (e.g. "Palm Tree Care") onto the form's dropdown. */
export function toQuoteService(name: string): QuoteService {
  if ((quoteServices as readonly string[]).includes(name)) return name as QuoteService;
  if (/install/i.test(name)) return "Irrigation Installation";
  const category = serviceCategories.find((c) => c.services.some((s) => s.name === name))?.id;
  if (category === "irrigation") return "Irrigation Repair";
  if (category === "lawn") return "Lawn Care";
  if (category === "specialized") return "Specialized Services";
  return "Not Sure";
}
