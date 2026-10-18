import { z } from "zod";
import { ValidationError } from "../domain/errors";
import { NOTE_ENTITY_TYPES, SHIPMENT_STATUSES } from "../domain/models";

const blankToNull = (value: unknown): unknown =>
  value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value;

const optionalText = (max: number) => z.preprocess(blankToNull, z.string().trim().max(max).nullable());

const optionalPositiveNumber = z.preprocess(
  (value) => {
    const v = blankToNull(value);
    return v === null ? null : Number(v);
  },
  z.number().positive("Enter a number greater than zero").max(10_000_000).nullable(),
);

const optionalDate = z.preprocess(
  blankToNull,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date format YYYY-MM-DD")
    .nullable(),
);

const phone = z
  .string()
  .trim()
  .min(6, "Enter a valid phone number")
  .max(30)
  .regex(/^[0-9+()\-\s]+$/, "Use digits, spaces, + or - only");

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);

export const quoteSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email,
  phone,
  company: optionalText(120),
  service_label: optionalText(120),
  origin: z.string().trim().min(2, "Enter the pickup city").max(120),
  destination: z.string().trim().min(2, "Enter the delivery city").max(120),
  cargo_type: optionalText(120),
  weight_kg: optionalPositiveNumber,
  pickup_date: optionalDate,
  message: optionalText(2000),
});

export const contactSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email,
  phone: z.preprocess(blankToNull, phone.nullable()),
  subject: optionalText(160),
  message: z.string().trim().min(5, "Write at least a few words").max(4000),
});

export const subscribeSchema = z.object({ email });

export const trackSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Enter the full tracking code")
    .max(24)
    .regex(/^[A-Za-z0-9-]+$/, "Tracking codes use letters, numbers and dashes only"),
});

export const noteSchema = z.object({
  entity_type: z.enum(NOTE_ENTITY_TYPES),
  entity_id: z.preprocess(blankToNull, z.string().uuid().nullable()),
  title: z.string().trim().max(160).default(""),
  body: z.string().trim().min(1, "Write something first").max(8000),
  pinned: z.boolean().default(false),
});

export const shipmentEventSchema = z.object({
  shipment_id: z.string().uuid(),
  status: z.enum(SHIPMENT_STATUSES),
  location: z.string().trim().min(2, "Enter a location").max(160),
  description: optionalText(400),
  occurred_at: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time"),
});

/** Parses unknown input or throws a ValidationError carrying per-field messages. */
export function parseOrThrow<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as unknown as Record<string, string[]>;
    throw new ValidationError(undefined, fieldErrors);
  }
  return result.data as z.output<S>;
}
