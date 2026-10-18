"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { SettingsSection } from "@/core/config/settings";
import type { SettingsMap } from "@/core/domain/models";
import { cn } from "@/lib/utils";
import { DynamicForm } from "./DynamicForm";

interface SettingsEditorProps {
  sections: SettingsSection[];
  values: SettingsMap;
}

export function SettingsEditor({ sections, values }: SettingsEditorProps) {
  const [activeKey, setActiveKey] = useState(sections[0]?.key ?? "");
  const active = sections.find((section) => section.key === activeKey) ?? sections[0];
  if (!active) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
      <div role="tablist" aria-label="Settings groups" aria-orientation="vertical" className="flex gap-1 overflow-x-auto lg:flex-col">
        {sections.map((section) => (
          <button
            key={section.key}
            id={`tab-${section.key}`}
            role="tab"
            type="button"
            aria-selected={section.key === active.key}
            aria-controls={`panel-${section.key}`}
            onClick={() => setActiveKey(section.key)}
            className={cn(
              "rounded-lg px-3.5 py-2.5 text-left text-sm font-medium whitespace-nowrap transition-colors",
              section.key === active.key ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100",
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div
        id={`panel-${active.key}`}
        role="tabpanel"
        aria-labelledby={`tab-${active.key}`}
        className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8"
      >
        <h2 className="text-xl font-semibold">{active.label}</h2>
        <p className="mt-1 mb-6 text-ink-600">{active.description}</p>
        <DynamicForm
          key={active.key}
          fields={active.fields}
          initial={values[active.key] ?? {}}
          submitLabel="Save settings"
          onSubmit={(next) => saveSettingsAction(active.key, next as Record<string, string>)}
        />
      </div>
    </div>
  );
}
