import type {
  ColumnGroup,
  ColumnMapping,
  ConditionOperator,
  FilterCondition,
  FilterOperator,
  ImportedData,
  ReplaceMode,
  RowFilter,
  ValueCondition,
} from '@/lib/types/excel-mapper';

// ─── Matching ─────────────────────────────────────────────────────────────────

const matchesCondition = (
  value: string,
  operator: ConditionOperator,
  pattern: string
): boolean => {
  const v = value.toLowerCase();
  const p = pattern.toLowerCase();
  switch (operator) {
    case 'equals':     return v === p;
    case 'contains':   return v.includes(p);
    case 'startsWith': return v.startsWith(p);
    case 'endsWith':   return v.endsWith(p);
  }
};

// ─── Replace modes ────────────────────────────────────────────────────────────

/** 'value': swap the entire cell string for `then`. */
const replaceWholeValue = (_value: string, _pattern: string, then: string): string => then;

/** 'match': replace only the matched portion; surrounding text is preserved.
 *  All occurrences are replaced (case-insensitive). */
const replaceMatchedPortion = (
  value: string,
  operator: ConditionOperator,
  pattern: string,
  then: string
): string => {
  switch (operator) {
    case 'equals':
      // Entire value IS the match → same result as replaceWholeValue
      return then;

    case 'contains': {
      // Replace every occurrence, preserve original casing of surrounding text
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return value.replace(new RegExp(escaped, 'gi'), then);
    }

    case 'startsWith': {
      // Remove/replace the prefix, keep the rest
      const prefixLen = pattern.length;
      return then + value.slice(prefixLen);
    }

    case 'endsWith': {
      // Remove/replace the suffix, keep the rest
      const suffixLen = pattern.length;
      return value.slice(0, value.length - suffixLen) + then;
    }
  }
};

const applyReplaceMode = (
  value: string,
  mode: ReplaceMode,
  operator: ConditionOperator,
  pattern: string,
  then: string
): string => {
  if (mode === 'match') return replaceMatchedPortion(value, operator, pattern, then);
  return replaceWholeValue(value, pattern, then);
};

// ─── Row filtering ────────────────────────────────────────────────────────────

const NO_VALUE_OPS: FilterOperator[] = ['isEmpty', 'isNotEmpty'];

const checkCondition = (cellValue: unknown, operator: FilterOperator, filterValue: string): boolean => {
  const str = String(cellValue ?? '').toLowerCase();
  const fv = filterValue.toLowerCase();
  const num = Number(cellValue);
  const fnum = Number(filterValue);
  const numeric = Number.isFinite(num) && Number.isFinite(fnum);

  switch (operator) {
    case 'equals':      return str === fv;
    case 'notEquals':   return str !== fv;
    case 'contains':    return str.includes(fv);
    case 'notContains': return !str.includes(fv);
    case 'startsWith':  return str.startsWith(fv);
    case 'endsWith':    return str.endsWith(fv);
    case 'isEmpty':     return str === '';
    case 'isNotEmpty':  return str !== '';
    case 'gt':          return numeric ? num > fnum : str > fv;
    case 'lt':          return numeric ? num < fnum : str < fv;
    case 'gte':         return numeric ? num >= fnum : str >= fv;
    case 'lte':         return numeric ? num <= fnum : str <= fv;
  }
};

/** Returns only rows that satisfy the filter conditions. */
export const applyFilters = (
  rows: Record<string, unknown>[],
  filter: RowFilter
): Record<string, unknown>[] => {
  const active = filter.conditions.filter(
    (c): c is FilterCondition =>
      !!c.column && (NO_VALUE_OPS.includes(c.operator) || c.value !== '')
  );
  if (active.length === 0) return rows;

  return rows.filter((row) => {
    const results = active.map((c) => checkCondition(row[c.column], c.operator, c.value));
    return filter.logic === 'and' ? results.every(Boolean) : results.some(Boolean);
  });
};

// ─── Core mapping logic ───────────────────────────────────────────────────────

const resolveValue = (
  originalValue: unknown,
  conditions: ValueCondition[],
  defaultValue: string
): unknown => {
  const strValue = String(originalValue ?? '');

  for (const condition of conditions) {
    if (condition.when === '') continue;
    if (matchesCondition(strValue, condition.operator, condition.when)) {
      return applyReplaceMode(
        strValue,
        condition.replaceMode,
        condition.operator,
        condition.when,
        condition.then
      );
    }
  }

  return defaultValue !== '' ? defaultValue : originalValue;
};

export const applyMappings = (
  rows: Record<string, unknown>[],
  mappings: ColumnMapping[]
): Record<string, unknown>[] => {
  const enabledMappings = mappings.filter((m) => m.enabled);
  return rows.map((row) => {
    const mapped: Record<string, unknown> = {};
    for (const mapping of enabledMappings) {
      const outputKey = mapping.newKey.trim() || mapping.originalKey;
      mapped[outputKey] = resolveValue(
        row[mapping.originalKey],
        mapping.conditions,
        mapping.defaultValue
      );
    }
    return mapped;
  });
};

// ─── Group aggregation ────────────────────────────────────────────────────────
// Groups operate on already-mapped rows (they see renamed column names).
// Each group appends one new column to every row.

export const applyGroups = (
  mappedRows: Record<string, unknown>[],
  groups: ColumnGroup[]
): Record<string, unknown>[] => {
  const validGroups = groups.filter((g) => g.name.trim() && g.columns.length > 0);
  if (validGroups.length === 0) return mappedRows;

  return mappedRows.map((row) => {
    const extra: Record<string, unknown> = {};
    for (const group of validGroups) {
      if (group.operation === 'sum') {
        extra[group.name] = group.columns.reduce((acc, col) => {
          const n = Number(row[col]);
          return acc + (Number.isFinite(n) ? n : 0);
        }, 0);
      } else {
        extra[group.name] = group.columns
          .map((col) => String(row[col] ?? ''))
          .filter((v) => v !== '')
          .join(group.separator);
      }
    }
    return { ...row, ...extra };
  });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const buildInitialMappings = (columns: string[]): ColumnMapping[] =>
  columns.map((col) => ({
    originalKey: col,
    newKey: '',
    enabled: true,
    conditions: [],
    defaultValue: '',
  }));

export const rowsToCSV = (rows: Record<string, unknown>[]): string => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const str = String(v ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  return [
    headers.map(escape).join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\n');
};

export const parseFile = async (file: File): Promise<ImportedData> => {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  // cellDates: true → Excel date serials (e.g. 45554) become JS Date objects
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  // Serialize Date objects → "DD/MM/YYYY" strings so they display as the user
  // typed them in Excel instead of appearing as raw serial numbers.
  const rows = raw.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, v instanceof Date ? serializeDate(v) : v])
    )
  );

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { fileName: file.name, columns, rows };
};

/** Formats a JS Date from an Excel date cell as DD/MM/YYYY. */
const serializeDate = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};
