'use client';

import { useState } from 'react';
import { DataPreview } from './DataPreview';
import { cn } from '@/lib/utils';

type MappedResultProps = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export const MappedResult = ({ columns, rows }: MappedResultProps) => {
  const [showJSON, setShowJSON] = useState(false);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-400 dark:border-zinc-700">
        Enable at least one column to see mapped results
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Mapped Result
          <span className="ml-2 font-normal text-zinc-400">(preview · first 50 rows)</span>
        </h3>
        <button
          onClick={() => setShowJSON((v) => !v)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            showJSON
              ? 'bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-800'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
          )}
        >
          {showJSON ? 'Table' : 'JSON'}
        </button>
      </div>

      {showJSON ? (
        <pre className="max-h-80 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {JSON.stringify(rows.slice(0, 10), null, 2)}
          {rows.length > 10 && `\n\n// … and ${rows.length - 10} more rows in preview`}
        </pre>
      ) : (
        <DataPreview columns={columns} rows={rows} maxRows={10} label="" />
      )}
    </div>
  );
};
