"use client";

import { useEffect, useState } from "react";
import { set, unset, type ArrayOfObjectsInputProps } from "sanity";
import { rowText, setRowText, type LabelRow } from "./labelRows";

type Control = { field: string; label: string; options: { value: string; text: string }[] };
type Section = { slice: string; controls: Control[] };

const edge = "1px solid color-mix(in srgb, currentColor 25%, transparent)";
const muted = { opacity: 0.65, fontSize: 12 } as const;

function Line({ name, text, placeholder, disabled, onType }: { name: string; text: string; placeholder: string; disabled: boolean; onType: (text: string) => void }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 8, alignItems: "center" }}>
      <span style={{ overflowWrap: "anywhere" }}>{name}</span>
      <input
        type="text"
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onType(event.target.value)}
        style={{ font: "inherit", color: "inherit", background: "transparent", border: edge, borderRadius: 3, padding: "6px 8px", width: "100%", boxSizing: "border-box" }}
      />
    </label>
  );
}

/**
 * The Filter labels page. One section per catalogue slice, named in a heading; in it the slice's controls, each with the options that slice holds.
 * Each line shows the automatic wording as its placeholder. Typing a wording stores one row, emptying the line removes it. A row has no slice, so a
 * control or option that several slices share shows the same wording in each section. The list comes from the shop's own read, so it is what the shop will show.
 */
export function FilterLabelsInput(props: ArrayOfObjectsInputProps) {
  const rows = (props.value ?? []) as unknown as LabelRow[];
  const [sections, setSections] = useState<Section[] | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    let current = true;
    fetch("/api/filter-labels-map", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((list: Section[]) => {
        if (current) setSections(list);
      })
      .catch((error: Error) => {
        if (current) setProblem(error.message);
      });
    return () => {
      current = false;
    };
  }, []);

  const write = (field: string, value: string, text: string) => {
    const next = setRowText(rows, field, value, text);
    props.onChange(next.length ? set(next) : unset());
  };

  if (problem) return <div role="alert">Could not read the options ({problem}). Reload the page.</div>;
  if (!sections) return <div>Reading the options…</div>;
  if (!sections.some((section) => section.controls.length)) return <div>The picklist has no controls yet.</div>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {sections.map((section) => (
        <section key={section.slice} style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, paddingBottom: 6, borderBottom: edge, fontSize: 16, fontWeight: 600, textTransform: "capitalize" }}>
            {section.slice.replace(/-/g, " ")}
            <span style={{ ...muted, fontWeight: 400, textTransform: "none" }}> · {section.controls.length} controls</span>
          </h3>
          {section.controls.map((control) => {
            const changed = ["", ...control.options.map((option) => option.value)].filter((value) => rowText(rows, control.field, value).trim()).length;
            return (
              <details key={control.field} style={{ border: edge, borderRadius: 3, padding: "8px 12px" }}>
                <summary style={{ cursor: "pointer" }}>
                  <strong>{rowText(rows, control.field, "") || control.label}</strong>
                  <span style={muted}>
                    {" "}
                    {control.field} · {control.options.length} options{changed ? ` · ${changed} changed` : ""}
                  </span>
                </summary>
                <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                  <Line
                    name="Control name"
                    text={rowText(rows, control.field, "")}
                    placeholder={control.label}
                    disabled={!!props.readOnly}
                    onType={(text) => write(control.field, "", text)}
                  />
                  {control.options.map((option) => (
                    <Line
                      key={option.value}
                      name={option.value}
                      text={rowText(rows, control.field, option.value)}
                      placeholder={option.text}
                      disabled={!!props.readOnly}
                      onType={(text) => write(control.field, option.value, text)}
                    />
                  ))}
                </div>
              </details>
            );
          })}
        </section>
      ))}
    </div>
  );
}
