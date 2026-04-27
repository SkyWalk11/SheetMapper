export type ConditionOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith';

/** 'value' — replace the entire cell value with `then`.
 *  'match' — replace only the matched portion; the rest of the string is kept. */
export type ReplaceMode = 'value' | 'match';

export type ValueCondition = {
  id: string;
  operator: ConditionOperator;
  when: string;
  then: string;
  replaceMode: ReplaceMode;
};

export type ColumnMapping = {
  originalKey: string;
  newKey: string;
  enabled: boolean;
  conditions: ValueCondition[];
  /** Used when no condition matches. Empty string means "keep original value". */
  defaultValue: string;
};

export type ImportedData = {
  fileName: string;
  columns: string[];
  rows: Record<string, unknown>[];
};

export type GroupOperation = 'sum' | 'concat';

// ─── Row filters ──────────────────────────────────────────────────────────────

export type FilterOperator =
  | 'equals' | 'notEquals'
  | 'contains' | 'notContains'
  | 'startsWith' | 'endsWith'
  | 'gt' | 'lt' | 'gte' | 'lte'
  | 'isEmpty' | 'isNotEmpty';

export type FilterCondition = {
  id: string;
  /** originalKey of the column to test */
  column: string;
  operator: FilterOperator;
  /** Comparison value (ignored for isEmpty / isNotEmpty) */
  value: string;
};

export type FilterLogic = 'and' | 'or';

export type RowFilter = {
  conditions: FilterCondition[];
  logic: FilterLogic;
};

export type ColumnGroup = {
  id: string;
  /** Output column name */
  name: string;
  operation: GroupOperation;
  /** Mapped column names to include */
  columns: string[];
  /** Used only when operation = 'concat' */
  separator: string;
};
