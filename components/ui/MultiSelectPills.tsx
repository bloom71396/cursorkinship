"use client";

import { useMemo, useState } from "react";

type Props = {
  options: string[];
  selected: string[];
  onChange: (nextSelected: string[]) => void;

  helperText?: string; // e.g. "Select all that apply."
  allowCustom?: boolean;
  customTitle?: string; // e.g. "Don’t see yourself? Add your own."
  customPlaceholder?: string; // e.g. "Type and press Enter"
  addButtonText?: string; // e.g. "Add"

  pillMaxLabelWidth?: number; // default 320
};

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

export default function MultiSelectPills({
  options,
  selected,
  onChange,
  helperText = "Select all that apply.",
  allowCustom = true,
  customTitle = "Don’t see yourself? Add your own.",
  customPlaceholder = "Type and press Enter",
  addButtonText = "Add",
  pillMaxLabelWidth = 320,
}: Props) {
  const [customValue, setCustomValue] = useState("");

  const displayOptions = useMemo(() => {
    const custom = selected.filter((x) => !options.includes(x));
    return [...options, ...custom];
  }, [options, selected]);

  function toggle(label: string) {
    onChange(
      selected.includes(label)
        ? selected.filter((x) => x !== label)
        : [...selected, label]
    );
  }

  function remove(label: string) {
    onChange(selected.filter((x) => x !== label));
  }

  function addCustom() {
    const v = normalize(customValue);
    if (!v) return;

    if (!selected.includes(v)) onChange([...selected, v]);
    setCustomValue("");
  }

  return (
    <div style={{ width: "100%" }}>
      {helperText ? (
        <div style={{ fontSize: 13, color: "#78716c", marginBottom: 14 }}>
          {helperText}
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {displayOptions.map((label) => {
          const active = selected.includes(label);

          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 9999,
                padding: "8px 12px",
                fontSize: 14,
                border: `1px solid ${active ? "#0f172a" : "#e7e5e4"}`,
                background: active ? "#0f172a" : "rgba(255,255,255,0.85)",
                color: active ? "white" : "#1c1917",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span
                style={{
                  maxWidth: pillMaxLabelWidth,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>

              {active ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(label);
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.18)",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                  aria-label={`Remove ${label}`}
                  title="Remove"
                >
                  ×
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {allowCustom ? (
        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid #e7e5e4",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500 }}>{customTitle}</div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder={customPlaceholder}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 16,
                border: "1px solid #e7e5e4",
                padding: "0 14px",
                fontSize: 14,
                background: "rgba(255,255,255,0.9)",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={addCustom}
              style={{
                height: 44,
                borderRadius: 16,
                padding: "0 16px",
                background: "#0f172a",
                color: "white",
                border: "1px solid #0f172a",
                cursor: "pointer",
              }}
            >
              {addButtonText}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
