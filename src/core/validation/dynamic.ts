import { z } from "zod";
import type { FieldConfig } from "../config/resources";

const blankToNull = (value: unknown): unknown =>
  value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value;

function baseSchema(field: FieldConfig): z.ZodTypeAny {
  switch (field.type) {
    case "number": {
      let schema = z.number({ invalid_type_error: "Enter a number" });
      if (field.min !== undefined) schema = schema.min(field.min);
      if (field.max !== undefined) schema = schema.max(field.max);
      return schema;
    }
    case "boolean":
      return z.boolean();
    case "tags":
      return z.array(z.string().trim().min(1).max(120)).max(30);
    case "relation":
      return z.string().uuid("Choose an option");
    case "datetime":
      return z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time");
    case "select": {
      const values = (field.options ?? []).map((option) => option.value);
      return values.length > 0
        ? z.string().refine((value) => values.includes(value), "Choose a valid option")
        : z.string();
    }
    case "url":
      return z.string().trim().url("Enter a full URL starting with https://").max(300);
    case "textarea":
    case "text":
    default: {
      let schema = z.string().trim();
      if (field.maxLength) schema = schema.max(field.maxLength);
      if (field.pattern) schema = schema.regex(new RegExp(field.pattern), field.patternMessage ?? "Invalid format");
      return schema;
    }
  }
}

/** Builds a zod schema for one field, honouring required/optional semantics. */
export function fieldSchema(field: FieldConfig): z.ZodTypeAny {
  const normalise = (value: unknown): unknown =>
    field.transform === "uppercase" && typeof value === "string" ? value.trim().toUpperCase() : value;
  const base = baseSchema(field);

  if (field.type === "boolean") return base;
  if (field.type === "tags") return z.preprocess((v) => v ?? [], base);

  if (field.required) {
    if (field.type === "number") {
      return z.preprocess((v) => (v === "" || v === null ? undefined : v), base);
    }
    if (field.type === "text" || field.type === "textarea" || field.type === "url") {
      return z.preprocess((v) => normalise(typeof v === "string" ? v : ""), (base as z.ZodString).min(1, "This field is required"));
    }
    return base;
  }

  return z.preprocess((value) => blankToNull(normalise(value)), base.nullable());
}

/** Builds an object schema from a list of field configs. */
export function buildObjectSchema(fields: FieldConfig[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) shape[field.name] = fieldSchema(field);
  return z.object(shape);
}

/** Settings values are always strings; empty strings are allowed. */
export function buildSettingsSchema(fields: FieldConfig[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    let schema = z.string().trim();
    if (field.maxLength) schema = schema.max(field.maxLength);
    if (field.type === "url") {
      shape[field.name] = z.union([z.literal(""), z.string().trim().url("Enter a full URL starting with https://")]);
    } else {
      shape[field.name] = field.required ? schema.min(1, "This field is required") : schema;
    }
  }
  return z.object(shape);
}
