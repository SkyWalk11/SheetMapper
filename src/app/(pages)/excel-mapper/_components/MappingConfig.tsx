'use client';

import { memo, useId, useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ColumnMapping, ConditionOperator, ReplaceMode, ValueCondition } from '@/lib/types/excel-mapper';

// ─── Debounce helper ──────────────────────────────────────────────────────────
// Calls `callback` with the latest `value` after `delay` ms of no changes.
// The callback ref is always fresh, so stale-closure bugs are impossible.

function useDebouncedEffect<T>(
  value: T,
  callback: (v: T) => void,
  delay: number
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => cbRef.current(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
}

// ─── MappingConfig ────────────────────────────────────────────────────────────

type MappingConfigProps = {
  mappings: ColumnMapping[];
  onChange: (index: number, mapping: ColumnMapping) => void;
  onToggleAll: (enabled: boolean) => void;
};

export const MappingConfig = ({ mappings, onChange, onToggleAll }: MappingConfigProps) => {
  const allEnabled = mappings.every((m) => m.enabled);
  const noneEnabled = mappings.every((m) => !m.enabled);

  const toggleColumn = useCallback(
    (index: number) => {
      const m = mappings[index];
      onChange(index, { ...m, enabled: !m.enabled });
    },
    [mappings, onChange]
  );

  const enabledCount = mappings.filter((m) => m.enabled).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Column Mapping</h3>
          <p className="text-xs text-zinc-400">
            {enabledCount} of {mappings.length} columns selected
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => onToggleAll(true)}
            disabled={allEnabled}
            className="text-zinc-500 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-zinc-200"
          >
            All
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <button
            onClick={() => onToggleAll(false)}
            disabled={noneEnabled}
            className="text-zinc-500 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-zinc-200"
          >
            None
          </button>
        </div>
      </div>

      {/* Column chips */}
      <div className="flex flex-wrap gap-1.5">
        {mappings.map((mapping, index) => (
          <button
            key={mapping.originalKey}
            onClick={() => toggleColumn(index)}
            className={cn(
              'rounded-md border px-2 py-1 font-mono text-xs transition-colors',
              mapping.enabled
                ? 'border-zinc-800 bg-zinc-800 text-zinc-100 dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                : 'border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-300'
            )}
          >
            {mapping.enabled && <span className="mr-1 text-[10px]">✓</span>}
            {mapping.originalKey}
          </button>
        ))}
      </div>

      {/* Per-column detail rows (only enabled columns) */}
      {mappings.some((m) => m.enabled) && (
        <div className="flex flex-col gap-2">
          {mappings.map((mapping, index) =>
            mapping.enabled ? (
              <ColumnMappingRow
                key={mapping.originalKey}
                index={index}
                mapping={mapping}
                onChange={onChange}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

// ─── ColumnMappingRow ─────────────────────────────────────────────────────────
// Memo'd so only the row whose mapping changed re-renders.
// Text inputs (newKey, defaultValue) use local state + debounce so every
// keystroke doesn't trigger applyMappings in the parent.

type ColumnMappingRowProps = {
  index: number;
  mapping: ColumnMapping;
  onChange: (index: number, mapping: ColumnMapping) => void;
};

const ColumnMappingRow = memo(({ index, mapping, onChange }: ColumnMappingRowProps) => {
  const id = useId();
  const [isExpanded, setIsExpanded] = useState(false);

  // Local text state — inputs feel instant
  const [localNewKey, setLocalNewKey] = useState(mapping.newKey);
  const [localDefault, setLocalDefault] = useState(mapping.defaultValue);

  // Keep a ref to the latest mapping so debounce callbacks aren't stale
  const mappingRef = useRef(mapping);
  mappingRef.current = mapping;

  // Sync if parent resets these values (e.g. file cleared → new mapping built)
  useEffect(() => { setLocalNewKey(mapping.newKey); }, [mapping.newKey]);
  useEffect(() => { setLocalDefault(mapping.defaultValue); }, [mapping.defaultValue]);

  // Propagate to parent 300 ms after the user stops typing
  useDebouncedEffect(localNewKey, (v) => {
    onChange(index, { ...mappingRef.current, newKey: v });
  }, 300);
  useDebouncedEffect(localDefault, (v) => {
    onChange(index, { ...mappingRef.current, defaultValue: v });
  }, 300);

  const addCondition = useCallback(() => {
    onChange(index, {
      ...mappingRef.current,
      conditions: [
        ...mappingRef.current.conditions,
        { id: crypto.randomUUID(), operator: 'equals', when: '', then: '', replaceMode: 'value' },
      ],
    });
  }, [index, onChange]);

  const updateCondition = useCallback(
    (condId: string, updated: Partial<ValueCondition>) => {
      onChange(index, {
        ...mappingRef.current,
        conditions: mappingRef.current.conditions.map((c) =>
          c.id === condId ? { ...c, ...updated } : c
        ),
      });
    },
    [index, onChange]
  );

  const removeCondition = useCallback(
    (condId: string) => {
      onChange(index, {
        ...mappingRef.current,
        conditions: mappingRef.current.conditions.filter((c) => c.id !== condId),
      });
    },
    [index, onChange]
  );

  const outputKey = localNewKey.trim() || mapping.originalKey;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
          <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {mapping.originalKey}
          </span>
          <span className="text-zinc-400">→</span>
          <input
            type="text"
            placeholder={mapping.originalKey}
            value={localNewKey}
            onChange={(e) => setLocalNewKey(e.target.value)}
            className="h-7 w-36 rounded border border-zinc-200 bg-transparent px-2 text-xs font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
          />
          {localNewKey.trim() && localNewKey.trim() !== mapping.originalKey && (
            <span className="text-xs text-zinc-400">
              output:{' '}
              <span className="font-mono text-zinc-600 dark:text-zinc-300">{outputKey}</span>
            </span>
          )}
        </div>

        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          {mapping.conditions.length > 0 && (
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-zinc-700">
              {mapping.conditions.length}
            </span>
          )}
          Conditions
          <ChevronIcon expanded={isExpanded} />
        </button>
      </div>

      {/* Expanded conditions */}
      {isExpanded && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
          {mapping.conditions.length > 0 && (
            <div className="mb-3 flex flex-col gap-2">
              {mapping.conditions.map((condition, i) => (
                <ConditionRow
                  key={condition.id}
                  condition={condition}
                  index={i}
                  conditionId={condition.id}
                  onUpdate={updateCondition}
                  onRemove={removeCondition}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={addCondition}
              className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <span className="text-base leading-none">+</span> Add condition
            </button>

            {mapping.conditions.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Default:</span>
                <input
                  type="text"
                  placeholder="keep original value"
                  value={localDefault}
                  onChange={(e) => setLocalDefault(e.target.value)}
                  className="h-7 w-44 rounded border border-zinc-200 bg-transparent px-2 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
ColumnMappingRow.displayName = 'ColumnMappingRow';

// ─── ConditionRow ─────────────────────────────────────────────────────────────
// Also memo'd. Text inputs (`when`, `then`) use local state + debounce.
// The operator dropdown updates immediately since it's a single click.

type ConditionRowProps = {
  condition: ValueCondition;
  index: number;
  conditionId: string;
  onUpdate: (condId: string, updated: Partial<ValueCondition>) => void;
  onRemove: (condId: string) => void;
};

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: '=' },
  { value: 'contains', label: 'contains' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
];

const ConditionRow = memo(
  ({ condition, index, conditionId, onUpdate, onRemove }: ConditionRowProps) => {
    const [localWhen, setLocalWhen] = useState(condition.when);
    const [localThen, setLocalThen] = useState(condition.then);

    // Sync if parent resets the condition
    useEffect(() => { setLocalWhen(condition.when); }, [condition.when]);
    useEffect(() => { setLocalThen(condition.then); }, [condition.then]);

    useDebouncedEffect(localWhen, (v) => onUpdate(conditionId, { when: v }), 300);
    useDebouncedEffect(localThen, (v) => onUpdate(conditionId, { then: v }), 300);

    const handleOperator = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate(conditionId, { operator: e.target.value as ConditionOperator });
      },
      [conditionId, onUpdate]
    );

    const handleReplaceMode = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate(conditionId, { replaceMode: e.target.value as ReplaceMode });
      },
      [conditionId, onUpdate]
    );

    const handleRemove = useCallback(() => onRemove(conditionId), [conditionId, onRemove]);

    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="w-5 text-right text-zinc-400">{index + 1}.</span>
        <span className="text-zinc-400">When</span>

        <select
          value={condition.operator}
          onChange={handleOperator}
          className="h-7 rounded border border-zinc-200 bg-transparent px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="value"
          value={localWhen}
          onChange={(e) => setLocalWhen(e.target.value)}
          className="h-7 w-28 rounded border border-zinc-200 bg-transparent px-2 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
        />

        {/* Replace-mode selector */}
        <select
          value={condition.replaceMode}
          onChange={handleReplaceMode}
          title={
            condition.replaceMode === 'match'
              ? 'Replace only the matched portion; surrounding text is kept'
              : 'Replace the entire cell value'
          }
          className="h-7 rounded border border-zinc-200 bg-transparent px-1.5 text-xs text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
        >
          <option value="value">→ replace value</option>
          <option value="match">→ replace match</option>
        </select>

        <input
          type="text"
          placeholder={condition.replaceMode === 'match' ? 'replacement' : 'new value'}
          value={localThen}
          onChange={(e) => setLocalThen(e.target.value)}
          className="h-7 w-28 rounded border border-zinc-200 bg-transparent px-2 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
        />

        <button
          onClick={handleRemove}
          className="ml-auto text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400"
          aria-label="Remove condition"
        >
          ✕
        </button>
      </div>
    );
  }
);
ConditionRow.displayName = 'ConditionRow';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={cn('transition-transform', expanded && 'rotate-180')}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
