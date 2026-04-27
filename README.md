# Excel / CSV Mapper

A browser-based tool for importing Excel or CSV files, transforming their structure, and exporting clean data — no server, no uploads, everything runs locally in your browser.

## What it does

### 1. Import
Drop or select any `.xlsx`, `.xls`, or `.csv` file. The original data is previewed immediately (first 5 rows). Excel date serials (e.g. `45554`) are automatically converted to readable dates (`19/09/2024`).

### 2. Row Filters
Filter which rows flow into the output before any transformation happens.

- Pick a column, choose an operator, and enter a value
- Operators: `=` `≠` `contains` `not contains` `starts with` `ends with` `is empty` `is not empty` `>` `<` `≥` `≤`
- Combine multiple conditions with **AND** or **OR** logic
- A live counter shows how many rows match (e.g. "47 of 200 rows match")

### 3. Column Mapping
Control which columns appear in the output and how they are named and transformed.

- **Enable / disable columns** via chip selector — disabled columns are excluded from the output entirely
- **Rename** any column to a new key name
- **Value conditions** — per-column if/then rules:
  - Match by: equals, contains, starts with, ends with
  - Replace mode: **replace value** (swap entire cell) or **replace match** (swap only the matched portion, keep surrounding text)
  - Stack multiple conditions; first match wins
  - **Default value** — fallback when no condition matches (leave blank to keep the original value)

### 4. Column Groups
Derive new columns from existing mapped columns.

- **Sum** — add numeric columns together into one output column
- **Concat** — join string columns with a custom separator (e.g. space, comma, dash)
- Live formula preview shows exactly what will be computed (e.g. `full_name = first " " + last`)

### 5. Live Preview
The mapped result updates as you type — shows the first 50 rows after all transformations are applied (filter → map → group).

### 6. Export
A floating button exports the **full dataset** (all matching rows, not just the preview):

| Format | Button |
|--------|--------|
| CSV    | ↓ CSV  |
| JSON   | ↓ JSON |
| Excel (.xlsx) | ↓ Excel |

---

## How to use

1. Open the app at `http://localhost:3000/excel-mapper`
2. Upload your file using the drop zone or file picker
3. *(Optional)* Add row filters to narrow down which rows you want
4. Use the column mapping section to rename columns and set value transformation rules
5. *(Optional)* Add column groups to compute derived columns
6. Watch the mapped result update live
7. Click **↓ CSV**, **↓ JSON**, or **↓ Excel** to download the full transformed output
8. Click **✕ Clear** in the top-right to start over with a new file

---

## Benefits

- **No data leaves your machine** — everything is processed in the browser using the [xlsx](https://github.com/SheetJS/sheetjs) library
- **Non-destructive** — your original file is never modified
- **Fast** — preview is limited to 50 rows for instant feedback; full export runs at download time
- **Flexible output** — rename keys for API payloads, clean values for imports, sum/concat columns for reporting
- **Dark mode** — respects your system preference, toggleable via the AppBar

---

## Development

```bash
pnpm dev      # Start dev server at http://localhost:3000
pnpm build    # Production build
pnpm lint     # ESLint
```

Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.
