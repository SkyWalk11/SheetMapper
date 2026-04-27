'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ColumnGroup, GroupOperation } from '@/lib/types/excel-mapper';

type ColumnGroupsProps = {
  groups: ColumnGroup[];
  availableColumns: string[];
  onAdd: () => void;
  onUpdate: (id: string, updated: Partial<ColumnGroup>) => void;
  onRemove: (id: string) => void;
};

export const ColumnGroups = ({
  groups,
  availableColumns,
  onAdd,
  onUpdate,
  onRemove,
}: ColumnGroupsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Column Groups</h3>
          <p className="text-xs text-zinc-400">
            Combine columns into a new output column by summing or concatenating values.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          + Add Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">
          No groups yet — click <strong>Add Group</strong> to sum numbers or join strings across columns.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <GroupRow
              key={group.id}
              group={group}
              availableColumns={availableColumns}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── GroupRow ─────────────────────────────────────────────────────────────────

type GroupRowProps = {
  group: ColumnGroup;
  availableColumns: string[];
  onUpdate: (id: string, updated: Partial<ColumnGroup>) => void;
  onRemove: (id: string) => void;
};

const GroupRow = memo(({ group, availableColumns, onUpdate, onRemove }: GroupRowProps) => {
  const [localName, setLocalName] = useState(group.name);
  const [localSeparator, setLocalSeparator] = useState(group.separator);

  const groupRef = useRef(group);
  groupRef.current = group;

  // Sync if parent resets
  useEffect(() => { setLocalName(group.name); }, [group.name]);
  useEffect(() => { setLocalSeparator(group.separator); }, [group.separator]);

  // Debounce text fields
  useDebounced(localName, (v) => onUpdate(group.id, { name: v }), 300);
  useDebounced(localSeparator, (v) => onUpdate(group.id, { separator: v }), 300);

  const handleOperation = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate(group.id, { operation: e.target.value as GroupOperation });
    },
    [group.id, onUpdate]
  );

  const toggleColumn = useCallback(
    (col: string) => {
      const current = groupRef.current.columns;
      const next = current.includes(col)
        ? current.filter((c) => c !== col)
        : [...current, col];
      onUpdate(group.id, { columns: next });
    },
    [group.id, onUpdate]
  );

  const handleRemove = useCallback(() => onRemove(group.id), [group.id, onRemove]);

  const isSum = group.operation === 'sum';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      {/* Top row: name + operation + remove */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-400">New column:</span>
        <input
          type="text"
          placeholder="column_name"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          className="h-7 w-40 rounded border border-zinc-200 bg-transparent px-2 font-mono text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
        />

        <select
          value={group.operation}
          onChange={handleOperation}
          className="h-7 rounded border border-zinc-200 bg-transparent px-1.5 text-xs text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
        >
          <option value="sum">Sum (numbers)</option>
          <option value="concat">Concat (strings)</option>
        </select>

        {!isSum && (
          <>
            <span className="text-xs text-zinc-400">separator:</span>
            <input
              type="text"
              value={localSeparator}
              onChange={(e) => setLocalSeparator(e.target.value)}
              className="h-7 w-16 rounded border border-zinc-200 bg-transparent px-2 font-mono text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
              placeholder='  " "'
            />
          </>
        )}

        <button
          onClick={handleRemove}
          className="ml-auto text-xs text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400"
          aria-label="Remove group"
        >
          ✕
        </button>
      </div>

      {/* Column picker */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-zinc-400">
          {isSum ? 'Columns to sum:' : 'Columns to join:'}
        </span>
        {availableColumns.length === 0 ? (
          <p className="text-xs text-zinc-400">No columns available — enable columns in the mapping config.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {availableColumns.map((col) => {
              const selected = group.columns.includes(col);
              return (
                <button
                  key={col}
                  onClick={() => toggleColumn(col)}
                  className={cn(
                    'rounded-md border px-2 py-1 font-mono text-xs transition-colors',
                    selected
                      ? 'border-zinc-800 bg-zinc-800 text-zinc-100 dark:border-zinc-300 dark:bg-zinc-200 dark:text-zinc-800'
                      : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-300'
                  )}
                >
                  {selected ? '✓ ' : ''}{col}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Live formula preview */}
      {group.columns.length > 0 && localName.trim() && (
        <p className="font-mono text-[11px] text-zinc-400">
          {isSum
            ? `${localName} = ${group.columns.join(' + ')}`
            : `${localName} = ${group.columns.join(` "${localSeparator}" + `)}`}
        </p>
      )}
    </div>
  );
});
GroupRow.displayName = 'GroupRow';

// ─── Debounce helper (same pattern as MappingConfig) ─────────────────────────

function useDebounced<T>(value: T, callback: (v: T) => void, delay: number) {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => cbRef.current(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
}
