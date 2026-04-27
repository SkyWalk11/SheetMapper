'use client';

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import type { FilterCondition, FilterLogic, FilterOperator, RowFilter } from '@/lib/types/excel-mapper';

// ─── Debounce helper (same pattern as MappingConfig) ─────────────────────────

function useDebouncedEffect<T>(value: T, callback: (v: T) => void, delay: number) {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const t = setTimeout(() => cbRef.current(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
}

// ─── RowFilters ───────────────────────────────────────────────────────────────

type RowFiltersProps = {
  rowFilter: RowFilter;
  columns: string[];
  totalRows: number;
  filteredCount: number;
  onAdd: () => void;
  onUpdate: (id: string, updated: Partial<FilterCondition>) => void;
  onRemove: (id: string) => void;
  onSetLogic: (logic: FilterLogic) => void;
};

export const RowFilters = ({
  rowFilter,
  columns,
  totalRows,
  filteredCount,
  onAdd,
  onUpdate,
  onRemove,
  onSetLogic,
}: RowFiltersProps) => {
  const hasConditions = rowFilter.conditions.length > 0;
  const isFiltering = hasConditions;
  const allMatch = filteredCount === totalRows;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Row Filters</h3>
          <p className="text-xs text-zinc-400">
            {isFiltering
              ? allMatch
                ? `All ${totalRows} rows match`
                : `${filteredCount} of ${totalRows} rows match`
              : `No filters — all ${totalRows} rows included`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AND / OR toggle — only shown when there are ≥2 conditions */}
          {rowFilter.conditions.length >= 2 && (
            <div className="flex rounded-md border border-zinc-200 text-xs dark:border-zinc-700">
              {(['and', 'or'] as FilterLogic[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onSetLogic(l)}
                  className={
                    rowFilter.logic === l
                      ? 'rounded-[5px] bg-zinc-800 px-2.5 py-1 font-medium text-white dark:bg-zinc-200 dark:text-zinc-900'
                      : 'px-2.5 py-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onAdd}
            className="flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
          >
            <span className="text-sm leading-none">+</span> Add Filter
          </button>
        </div>
      </div>

      {/* Condition rows */}
      {hasConditions && (
        <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700">
          {rowFilter.conditions.map((condition, i) => (
            <FilterConditionRow
              key={condition.id}
              condition={condition}
              index={i}
              columns={columns}
              logic={rowFilter.logic}
              showLogic={i > 0 && rowFilter.conditions.length >= 2}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── FilterConditionRow ───────────────────────────────────────────────────────

const NO_VALUE_OPS: FilterOperator[] = ['isEmpty', 'isNotEmpty'];

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals',      label: '=' },
  { value: 'notEquals',   label: '≠' },
  { value: 'contains',    label: 'contains' },
  { value: 'notContains', label: 'not contains' },
  { value: 'startsWith',  label: 'starts with' },
  { value: 'endsWith',    label: 'ends with' },
  { value: 'isEmpty',     label: 'is empty' },
  { value: 'isNotEmpty',  label: 'is not empty' },
  { value: 'gt',          label: '>' },
  { value: 'lt',          label: '<' },
  { value: 'gte',         label: '≥' },
  { value: 'lte',         label: '≤' },
];

type FilterConditionRowProps = {
  condition: FilterCondition;
  index: number;
  columns: string[];
  logic: FilterLogic;
  showLogic: boolean;
  onUpdate: (id: string, updated: Partial<FilterCondition>) => void;
  onRemove: (id: string) => void;
};

const FilterConditionRow = memo(({
  condition,
  index,
  columns,
  logic,
  showLogic,
  onUpdate,
  onRemove,
}: FilterConditionRowProps) => {
  const [localValue, setLocalValue] = useState(condition.value);

  useEffect(() => { setLocalValue(condition.value); }, [condition.value]);

  useDebouncedEffect(localValue, (v) => onUpdate(condition.id, { value: v }), 300);

  const handleColumn = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onUpdate(condition.id, { column: e.target.value }),
    [condition.id, onUpdate]
  );

  const handleOperator = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      onUpdate(condition.id, { operator: e.target.value as FilterOperator }),
    [condition.id, onUpdate]
  );

  const handleRemove = useCallback(() => onRemove(condition.id), [condition.id, onRemove]);

  const hideValue = NO_VALUE_OPS.includes(condition.operator);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Logic badge / row number */}
      <span className="w-8 text-right font-medium text-zinc-400">
        {showLogic ? logic.toUpperCase() : `${index + 1}.`}
      </span>

      {/* Column selector */}
      <select
        value={condition.column}
        onChange={handleColumn}
        className="h-7 rounded border border-zinc-200 bg-transparent px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">— column —</option>
        {columns.map((col) => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>

      {/* Operator selector */}
      <select
        value={condition.operator}
        onChange={handleOperator}
        className="h-7 rounded border border-zinc-200 bg-transparent px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {/* Value input (hidden for isEmpty / isNotEmpty) */}
      {!hideValue && (
        <input
          type="text"
          placeholder="value"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="h-7 w-32 rounded border border-zinc-200 bg-transparent px-2 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
        />
      )}

      <button
        onClick={handleRemove}
        className="ml-auto text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400"
        aria-label="Remove filter"
      >
        ✕
      </button>
    </div>
  );
});
FilterConditionRow.displayName = 'FilterConditionRow';
