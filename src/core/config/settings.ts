import type { FieldConfig } from "./resources";

/**
 * Every editable piece of website copy lives in the `site_settings` table.
 * This registry describes the admin form for each settings group.
 */
export interface SettingsSection {
  key: string;
  label: string;
  description: string;
  fields: FieldConfig[];
}

const text = (name: string, label: string, extra: Partial<FieldConfig> = {}): FieldConfig => ({
  name,
  label,
  type: "text",
  maxLength: 200,
  ...extra,
});

const area = (name: string, label: string, extra: Partial<FieldConfig> = {}): FieldConfig => ({
  name,
  label,
  type: "textarea",
  maxLength: 500,
  ...extra,
});

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    key: "brand",
    label: "Brand and contact",
    description: "Company name and the contact details shown in the header, footer and contact section.",
    fields: [
      text("name", "Company name", { required: true }),
      text("tagline", "Tagline"),
      text("phone", "Phone"),
      text("whatsapp", "WhatsApp number", { help: "Digits only with country code, e.g. 919600459889. Leave empty to hide the chat button." }),
      text("email", "Email"),
      area("address", "Address"),
      text("hours", "Working hours"),
    ],
  },
  {
    key: "hero",
    label: "Hero",
    description: "The first screen visitors see.",
    fields: [
      area("headline", "Headline", { required: true, maxLength: 160, help: "Each new line animates in separately." }),
      area("subheadline", "Sub-headline", { maxLength: 300 }),
      text("primary_cta", "Primary button label"),
      text("secondary_cta", "Secondary button label"),
      text("tracking_label", "Tracking box heading"),
      text("tracking_placeholder", "Tracking input placeholder"),
    ],
  },
  {
    key: "sections",
    label: "Section headings",
    description: "Titles and sub-titles for each section of the home page.",
    fields: [
      text("clients_title", "Client strip title"),
      text("services_title", "Services title"),
      area("services_subtitle", "Services sub-title"),
      text("stats_title", "Numbers title"),
      text("network_title", "Network title"),
      area("network_subtitle", "Network sub-title"),
      text("fleet_title", "Fleet title"),
      area("fleet_subtitle", "Fleet sub-title"),
      text("process_title", "Process title"),
      area("process_subtitle", "Process sub-title"),
      text("testimonials_title", "Testimonials title"),
      text("faq_title", "FAQ title"),
      text("quote_title", "Quote form title"),
      area("quote_subtitle", "Quote form sub-title"),
      text("contact_title", "Contact title"),
      text("newsletter_title", "Newsletter title"),
      area("newsletter_subtitle", "Newsletter sub-title"),
    ],
  },
  {
    key: "footer",
    label: "Footer",
    description: "About text and legal lines.",
    fields: [
      area("about", "About text"),
      text("legal", "Legal line"),
      text("gst", "Registration or GST number"),
    ],
  },
  {
    key: "seo",
    label: "Search and sharing",
    description: "Page title and description for Google and link previews.",
    fields: [
      text("title", "Page title", { maxLength: 70 }),
      area("description", "Meta description", { maxLength: 160 }),
    ],
  },
  {
    key: "social",
    label: "Social links",
    description: "Leave a field empty to hide that icon.",
    fields: [
      { name: "linkedin", label: "LinkedIn", type: "url" },
      { name: "instagram", label: "Instagram", type: "url" },
      { name: "youtube", label: "YouTube", type: "url" },
      { name: "x", label: "X (Twitter)", type: "url" },
    ],
  },
];
