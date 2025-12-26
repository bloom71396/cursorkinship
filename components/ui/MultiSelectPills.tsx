"use client";

import { useMemo, useState } from "react";

type Props = {
  options: string[];
  selected: string[];
  onChange: (nextSelected: string[]) => void;
  helperText?: string;
  allowCustom?: boolean;
  customTitle?: string;
  customPlaceholder?: string;
  addButtonText?: string;
  pillMaxLabelWidth?: number;
};

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

// Constants for the new color palette
const COLOR_CHARCOAL = "#22262A";
const COLOR_GREIGE = "#B6B0AA";

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

  function addCustom() {
    const v = normalize(customValue);
    if (!v) return;
    if (!selected.includes(v)) onChange([...selected, v]);
    setCustomValue("");
  }

  const isAddDisabled = !customValue.trim();

  return (
    <div style={{ width: "100%" }}>
      {helperText && (
        <div style={{ fontSize: 13, color: "#78716C", marginBottom: 16 }}>
          {helperText}
        </div>
      )}

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
                padding: "10px 16px",
                fontSize: 14,
                // PILLS: White unpressed, Charcoal pressed
                border: `1px solid ${active ? COLOR_CHARCOAL : COLOR_GREIGE}`,
                background: active ? COLOR_CHARCOAL : "#ffffff",
                color: active ? "white" : COLOR_CHARCOAL,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ maxWidth: pillMaxLabelWidth, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {label}
              </span>
              {active && <span style={{ fontSize: 18, lineHeight: 0 }}>×</span>}
            </button>
          );
        })}
      </div>

      {allowCustom && (
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${COLOR_GREIGE}` }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: COLOR_CHARCOAL }}>{customTitle}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={customPlaceholder}
              style={{
                flex: 1, height: 48, borderRadius: 12, border: `1px solid ${COLOR_GREIGE}`,
                padding: "0 16px", fontSize: 14, background: "rgba(255,255,255,0.8)", outline: "none"
              }}
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={isAddDisabled}
              style={{
                height: 48, borderRadius: 12, padding: "0 20px", fontSize: 14, fontWeight: 500,
                // ADD BUTTON: Greige when disabled, Charcoal when enabled
                background: isAddDisabled ? COLOR_GREIGE : COLOR_CHARCOAL,
                color: isAddDisabled ? "#A8A29E" : "white",
                border: "none",
                cursor: isAddDisabled ? "default" : "pointer",
                transition: "background 0.2s"
              }}
            >
              {addButtonText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}