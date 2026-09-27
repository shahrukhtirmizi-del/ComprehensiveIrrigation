import { serviceOptions } from "./services";

export type QuoteInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  propertyType: "Residential" | "Commercial";
  service: string;
};

export type QuoteErrors = Partial<Record<keyof QuoteInput, string>>;

export const emptyQuote: QuoteInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  zip: "",
  propertyType: "Residential",
  service: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared by the browser form and the API route so both enforce identical rules. */
export function validateQuote(v: QuoteInput): QuoteErrors {
  const e: QuoteErrors = {};
  if (!v.firstName.trim()) e.firstName = "Please enter your first name.";
  else if (v.firstName.trim().length > 60) e.firstName = "That name is a little long.";
  if (!v.lastName.trim()) e.lastName = "Please enter your last name.";
  else if (v.lastName.trim().length > 60) e.lastName = "That name is a little long.";
  if (!v.email.trim()) e.email = "We need an email to send your quote.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That email doesn't look quite right.";
  const digits = v.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (!digits) e.phone = "Please add a phone number.";
  else if (digits.length !== 10) e.phone = "Enter a 10-digit US phone number.";
  if (!v.address.trim()) e.address = "Where's the property?";
  else if (v.address.trim().length < 5) e.address = "Please enter the full street address.";
  if (!/^\d{5}$/.test(v.zip.trim())) e.zip = "Enter a 5-digit ZIP code.";
  if (v.propertyType !== "Residential" && v.propertyType !== "Commercial") e.propertyType = "Choose a property type.";
  if (!v.service) e.service = "Choose the service you need.";
  else if (!serviceOptions.includes(v.service)) e.service = "Choose a service from the list.";
  return e;
}

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
