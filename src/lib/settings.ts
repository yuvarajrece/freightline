import type { SettingsMap } from "@/core/domain/models";

/** Reads one setting value; returns an empty string when the editor has not filled it in. */
export function setting(settings: SettingsMap, section: string, key: string): string {
  return settings[section]?.[key]?.trim() ?? "";
}

export function sectionSettings(settings: SettingsMap, section: string): Record<string, string> {
  return settings[section] ?? {};
}
